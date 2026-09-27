"use client";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { retreat } from "@/config/retreat";
import { clarityAllowed, normalizeOrigin } from "@/lib/analytics";

/** Enhance the server-rendered story into a button-operated, one-screen deck. */
export function ExperienceRuntime({
  children,
  total,
}: {
  children: ReactNode;
  total: number;
}) {
  const stage = useRef<HTMLElement>(null);
  const [step, setStep] = useState(1);
  const [light, setLight] = useState(true);

  useLayoutEffect(() => {
    const root = stage.current!;
    const slides = [...root.querySelectorAll<HTMLElement>("[data-scene]")];
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let busy = false;
    let alive = true;
    let revision = 0;
    let animations: Animation[] = [];
    let preloadFrame = 0;
    const reset = () =>
      slides.forEach((slide, index) => {
        const active = index === current;
        slide.classList.toggle("is-active", active);
        slide.classList.remove("is-outgoing");
        slide.inert = !active;
        slide.setAttribute("aria-hidden", String(!active));
      });
    const focusHeading = () =>
      slides[current]
        .querySelector<HTMLElement>("h1, h2")
        ?.focus({ preventScroll: true });
    const go = (
      id: string,
      historyMode: "push" | "none" = "push",
      focus = true,
    ) => {
      const next = slides.findIndex((slide) => slide.id === id);
      if (
        next < 0 ||
        (next === current && slides[next].classList.contains("is-active"))
      )
        return;
      const token = ++revision;
      animations.forEach((animation) => animation.cancel());
      const previous = slides[current];
      const direction = next > current ? 1 : -1;
      current = next;
      reset();
      setStep(next + 1);
      setLight(slides[next].dataset.theme === "light");
      if (historyMode === "push") history.pushState(null, "", "#" + id);
      document.querySelectorAll("video").forEach((video) => video.pause());
      if (!motion.matches && previous !== slides[next]) {
        busy = true;
        root.setAttribute("aria-busy", "true");
        previous.classList.add("is-outgoing");
        const timing = {
          duration: 620,
          easing: "cubic-bezier(.65,0,.2,1)",
          fill: "both" as const,
        };
        animations = [
          previous.animate(
            [
              { transform: "translateY(0)" },
              { transform: `translateY(${-100 * direction}%)` },
            ],
            timing,
          ),
          slides[next].animate(
            [
              { transform: `translateY(${100 * direction}%)` },
              { transform: "translateY(0)" },
            ],
            timing,
          ),
        ];
        Promise.allSettled(
          animations.map((animation) => animation.finished),
        ).then(() => {
          if (!alive || revision !== token) return;
          previous.classList.remove("is-outgoing");
          animations.forEach((animation) => animation.cancel());
          busy = false;
          root.removeAttribute("aria-busy");
          if (focus) focusHeading();
        });
      } else {
        busy = false;
        root.removeAttribute("aria-busy");
        if (focus) focusHeading();
      }
      // Decode the next image ahead of its CTA transition, without fetching offsite assets.
      cancelAnimationFrame(preloadFrame);
      preloadFrame = requestAnimationFrame(() => {
        slides[next + 1]?.querySelectorAll("img").forEach((image) => {
          image.loading = "eager";
          void image.decode().catch(() => {});
        });
      });
    };
    reset();
    document.documentElement.dataset.guided = "true";
    window.scrollTo(0, 0);
    const initialize = requestAnimationFrame(() => {
      const id = location.hash.slice(1);
      if (id) go(id, "none", false);
    });
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>(
        "[data-next]",
      );
      if (!link || !root.contains(link)) return;
      event.preventDefault();
      if (busy || link.closest("[data-scene]") !== slides[current]) return;
      go(link.dataset.next!);
    };
    const onHistory = () => go(location.hash.slice(1) || slides[0].id, "none");
    const blockWheel = (event: WheelEvent) => {
      // Dialogs may contain long practical information. They never advance the story.
      if (!event.ctrlKey && !(event.target as Element).closest("dialog"))
        event.preventDefault();
    };
    const onMotionChange = () => {
      if (motion.matches) animations.forEach((animation) => animation.finish());
    };
    root.addEventListener("click", onClick);
    root.addEventListener("wheel", blockWheel, { passive: false });
    window.addEventListener("popstate", onHistory);
    window.addEventListener("hashchange", onHistory);
    motion.addEventListener("change", onMotionChange);
    return () => {
      alive = false;
      revision++;
      animations.forEach((animation) => animation.cancel());
      cancelAnimationFrame(initialize);
      cancelAnimationFrame(preloadFrame);
      delete document.documentElement.dataset.guided;
      slides.forEach((slide) => {
        slide.inert = false;
        slide.removeAttribute("aria-hidden");
        slide.classList.remove("is-active", "is-outgoing");
      });
      root.removeEventListener("click", onClick);
      root.removeEventListener("wheel", blockWheel);
      window.removeEventListener("popstate", onHistory);
      window.removeEventListener("hashchange", onHistory);
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);

  useEffect(() => {
    if (!clarityAllowed()) return;
    const stub: NonNullable<Window["clarity"]> = (...args) => {
      (stub.q ||= []).push(args);
    };
    window.clarity ||= stub;
    window.clarity(
      "set",
      "origen",
      normalizeOrigin(new URLSearchParams(location.search).get("ref")),
    );
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.clarity.ms/tag/" + retreat.analytics.projectId;
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <div className="experience">
      <header className={"site-header" + (light ? " header-light" : "")}>
        <span className="wordmark">
          casiciaco<span>#{retreat.edition}</span>
        </span>
        <span
          className="step-counter"
          aria-label={`Pantalla ${step} de ${total}`}
        >
          <strong>{String(step).padStart(2, "0")}</strong>
          <span>/ {String(total).padStart(2, "0")}</span>
        </span>
        <div className="step-track" aria-hidden="true">
          <span style={{ width: `${(step / total) * 100}%` }} />
        </div>
      </header>
      <main id="recorrido" ref={stage} className="slide-stage" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
