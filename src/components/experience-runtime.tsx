"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { publicUrl, retreat } from "@/config/retreat";
import { track } from "@/lib/analytics";
import { live, storyState, useStory } from "@/lib/story-state";
import { soundscape } from "@/lib/soundscape";
import { Arrow } from "@/components/marks";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Scroll-driven storytelling. Each `[data-progress]` element receives `--p` (0..1) while it
 * passes through the viewport; CSS turns that number into motion. Native scroll is never
 * hijacked: the only pause is the intentional "hold to be silent" moment.
 */
export function ExperienceRuntime({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [pastHero, setPastHero] = useState(false);
  const sound = useStory((state) => state.sound);
  const registration = publicUrl(retreat.registrationUrl);

  useEffect(() => {
    const root = stage.current!;
    const html = document.documentElement;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const tracked = [...root.querySelectorAll<HTMLElement>("[data-progress]")];
    const themed = [...root.querySelectorAll<HTMLElement>("[data-theme]")];
    const marquees = [...root.querySelectorAll<HTMLElement>("[data-marquee]")];
    const noise = root.querySelector<HTMLElement>("#ruido");
    const heart = root.querySelector<HTMLElement>("[data-heart]");
    const heartScene = root.querySelector<HTMLElement>("#corazon");
    const light = root.querySelector<HTMLElement>("[data-flashlight]");
    const timeline = root.querySelector<HTMLElement>("[data-timeline]");
    const notifications =
      noise?.querySelectorAll("[data-notification]").length ?? 0;
    const visible = new Set<Element>();
    let frame = 0;
    let lastY = scrollY;
    let lastTime = performance.now();
    let velocity = 0;
    let offsets = marquees.map(() => 0);
    let shown = 0;
    let beatPhase = 0;
    let pointerAt = 0;
    let lastTheme = "";
    let lastPast = false;

    const measure = () => {
      if (timeline) {
        const track = timeline.querySelector<HTMLElement>("[data-track]");
        if (track)
          timeline.style.setProperty(
            "--dist",
            Math.max(0, track.scrollWidth - innerWidth) + "px",
          );
      }
      offsets = marquees.map(() => 0);
    };

    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min(64, now - lastTime) / 1000;
      lastTime = now;
      const y = scrollY;
      const vh = innerHeight;
      // Smoothed scroll speed in viewports per second: the noise reacts to how fast you scroll.
      const instant = Math.abs(y - lastY) / vh / Math.max(dt, 0.001);
      velocity += (Math.min(instant, 6) - velocity) * 0.12;
      lastY = y;
      html.style.setProperty(
        "--page",
        String(clamp(y / Math.max(1, document.body.scrollHeight - vh))),
      );
      for (const element of tracked) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > vh * 2) continue;
        const span =
          element.dataset.progress === "pin"
            ? rect.height - vh
            : rect.height + vh;
        const start =
          element.dataset.progress === "pin" ? -rect.top : vh - rect.top;
        const p = clamp(start / Math.max(1, span));
        element.style.setProperty("--p", p.toFixed(4));
        element.dataset.p = p.toFixed(3);
      }

      // Header theme: whichever scene sits under the header.
      const probe = themed.find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top <= 36 && rect.bottom > 36;
      });
      const nextTheme = probe?.dataset.theme || "light";
      if (nextTheme !== lastTheme) {
        lastTheme = nextTheme;
        setTheme(nextTheme as "light" | "dark");
      }
      const past = y > vh * 0.6;
      if (past !== lastPast) {
        lastPast = past;
        setPastHero(past);
      }

      const reduced = motion.matches;
      // Marquee words speed up with scroll velocity.
      if (!reduced)
        marquees.forEach((marquee, index) => {
          if (!visible.has(marquee)) return;
          const direction = index % 2 ? 1 : -1;
          const width = marquee.scrollWidth / 2 || 1;
          offsets[index] =
            (offsets[index] + direction * (40 + velocity * 520) * dt) % width;
          const x = direction < 0 ? offsets[index] : offsets[index] - width;
          marquee.style.transform = `translate3d(${x}px,0,0) skewX(${(-velocity * 6 * direction).toFixed(2)}deg)`;
        });

      // Noise: notifications pile up and ping.
      let noiseLevel = 0;
      if (noise) {
        const p = Number(noise.dataset.p || 0);
        noise.style.setProperty("--v", clamp(velocity / 3).toFixed(3));
        const count = Math.floor(p * (notifications + 1.5));
        if (count > shown && visible.has(noise)) soundscape.ping();
        shown = count;
        if (visible.has(noise)) noiseLevel = 0.25 + 0.75 * p;
      }
      const state = storyState.get();
      if (!state.silenced && y < vh * 0.8)
        noiseLevel = Math.max(noiseLevel, 0.15);
      if (!state.silenced && live.hold > 0)
        noiseLevel = Math.max(0.05, 0.6 * (1 - live.hold));
      const calm = state.silenced ? 1 : live.hold;
      soundscape.setMix(state.silenced ? 0 : noiseLevel, calm);

      // Restless heart that slows down as the quote completes.
      if (heart && heartScene && visible.has(heartScene)) {
        const p = Number(heartScene.dataset.p || 0);
        const bpm = 118 - 66 * p;
        beatPhase += (bpm / 60) * dt;
        if (beatPhase >= 1) {
          beatPhase -= 1;
          soundscape.beat(1 - p * 0.5);
        }
        // "Lub-dub": a strong beat followed by a softer echo.
        const echo =
          beatPhase > 0.2 ? 0.6 * Math.exp(-(beatPhase - 0.2) * 11) : 0;
        const pulse = reduced ? 0 : Math.exp(-beatPhase * 9) + echo;
        heart.style.setProperty("--beat", pulse.toFixed(3));
      }

      // The encounter light drifts by itself until the visitor moves it.
      if (light && visible.has(light) && now - pointerAt > 2500) {
        const t = now / 1000;
        light.style.setProperty(
          "--x",
          (50 + Math.sin(t * 0.5) * 22).toFixed(2) + "%",
        );
        light.style.setProperty(
          "--y",
          (48 + Math.cos(t * 0.37) * 16).toFixed(2) + "%",
        );
      }

      const animating =
        (!reduced && marquees.some((marquee) => visible.has(marquee))) ||
        (heartScene && visible.has(heartScene)) ||
        (light && visible.has(light)) ||
        velocity > 0.01;
      if (animating) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        schedule();
      },
      { rootMargin: "10% 0px" },
    );
    [...marquees, noise, heartScene, light].forEach(
      (element) => element && observer.observe(element),
    );

    // Entrance reveals.
    const reveals = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            reveals.unobserve(entry.target);
          }
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    root
      .querySelectorAll("[data-reveal]")
      .forEach((element) => reveals.observe(element));

    // Anonymous, aggregate funnel: which scenes people reach.
    const seen = new Set<string>();
    const scenes = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting && !seen.has(id)) {
            seen.add(id);
            track("scene_view", { escena: id });
          }
        }),
      { threshold: 0.35 },
    );
    root
      .querySelectorAll("[data-scene]")
      .forEach((element) => scenes.observe(element));

    const onPointer = (event: PointerEvent) => {
      if (!light) return;
      const rect = light.getBoundingClientRect();
      pointerAt = performance.now();
      light.style.setProperty(
        "--x",
        ((event.clientX - rect.left) / rect.width) * 100 + "%",
      );
      light.style.setProperty(
        "--y",
        ((event.clientY - rect.top) / rect.height) * 100 + "%",
      );
    };
    light?.addEventListener("pointermove", onPointer);
    light?.addEventListener("pointerdown", onPointer);

    // Deep links to scenes after the silence open it directly.
    const openFromHash = () => {
      const target =
        location.hash.length > 1
          ? document.getElementById(location.hash.slice(1))
          : null;
      if (target?.closest(".after-silence") && !storyState.get().silenced) {
        storyState.openSilence();
        requestAnimationFrame(() =>
          target.scrollIntoView({ behavior: "instant" }),
        );
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);

    const onResize = () => {
      measure();
      schedule();
    };
    measure();
    void document.fonts?.ready.then(onResize);
    const unsubscribe = storyState.subscribe(() =>
      requestAnimationFrame(onResize),
    );
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reveals.disconnect();
      scenes.disconnect();
      unsubscribe();
      light?.removeEventListener("pointermove", onPointer);
      light?.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  function toggleSound() {
    if (sound) {
      soundscape.disable();
      storyState.setSound(false);
    } else if (soundscape.enable()) {
      storyState.setSound(true);
      track("sound_on");
    }
  }

  return (
    <div className="experience">
      <header
        className={
          "site-header" +
          (theme === "dark" ? " header-dark" : "") +
          (pastHero ? " is-past-hero" : "")
        }
      >
        <a className="wordmark" href="#inicio">
          casiciaco<span>#{retreat.edition}</span>
        </a>
        <div className="header-actions">
          <button
            type="button"
            className="sound-toggle"
            aria-pressed={sound}
            onClick={toggleSound}
          >
            <span className="sound-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>{sound ? "Sonido" : "Con sonido"}</span>
          </button>
          {registration && (
            <a
              className="header-cta"
              href={registration}
              tabIndex={pastHero ? 0 : -1}
              aria-hidden={!pastHero}
              onClick={() => track("registration_click", { desde: "header" })}
            >
              Anotarme <Arrow direction="up-right" />
            </a>
          )}
        </div>
        <span className="page-progress" aria-hidden="true" />
      </header>
      <main id="recorrido" ref={stage} tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
