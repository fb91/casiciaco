"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { retreat } from "@/config/retreat";
import { track } from "@/lib/analytics";
import { live, storyState, useStory } from "@/lib/story-state";
import { soundscape } from "@/lib/soundscape";
import { Arrow } from "@/components/marks";
import { RegistrationLink } from "@/components/interactions";

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
  const started = useStory((state) => state.started);
  const sound = useStory((state) => state.sound);
  const audible = useStory((state) => state.audible);

  useEffect(() => {
    const root = stage.current!;
    const html = document.documentElement;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const tracked = [...root.querySelectorAll<HTMLElement>("[data-progress]")];
    const themed = [...root.querySelectorAll<HTMLElement>("[data-theme]")];
    const marquees = [...root.querySelectorAll<HTMLElement>("[data-marquee]")];
    const noise = root.querySelector<HTMLElement>("#ruido");
    const silence = root.querySelector<HTMLElement>("#silencio");
    // Scroll progress at which each notification arrives.
    const arrivals = [
      ...(noise?.querySelectorAll<HTMLElement>("[data-notification]") ?? []),
    ].map((element) => Number(element.dataset.at));
    const visible = new Set<Element>();
    let frame = 0;
    let lastY = scrollY;
    let lastTime = performance.now();
    let velocity = 0;
    let offsets = marquees.map(() => 0);
    let shown = 0;
    let lastTheme = "";
    let lastPast = false;

    // Until «Tocá para empezar» the page stays at the very top.
    if (!storyState.get().started && !location.hash) scrollTo(0, 0);

    const measure = () => {
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
      // The end of the noise turns dark, ready for the silence.
      const nextTheme =
        probe === noise && Number(noise?.dataset.p) > 0.74
          ? "dark"
          : probe?.dataset.theme || "light";
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
        const count = arrivals.filter((at) => p >= at).length;
        if (count > shown && visible.has(noise)) soundscape.ping();
        shown = count;
        // Louder, brighter and buzzier as the notifications pile up (and when scrolling fast).
        if (visible.has(noise))
          noiseLevel = Math.min(1, 0.3 + 0.7 * p ** 1.3 + velocity * 0.08);
      }
      const state = storyState.get();
      if (!state.silenced && y < vh * 0.8)
        noiseLevel = Math.max(noiseLevel, 0.2);
      // The noise stays on while the question waits, until the visitor holds.
      if (silence && visible.has(silence))
        noiseLevel = Math.max(noiseLevel, 0.85);
      // Holding, and everything after the silence, is real silence: volume zero.
      // Holding fades the noise little by little (the buzz goes first, then the murmur);
      // after the silence it is gone for good.
      if (state.silenced) soundscape.setLevel(0);
      else soundscape.setLevel(noiseLevel * (1 - live.hold) ** 1.4);

      const animating =
        (!reduced && marquees.some((marquee) => visible.has(marquee))) ||
        (silence && visible.has(silence)) ||
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
    [...marquees, noise, silence].forEach(
      (element) => element && observer.observe(element),
    );

    // Entrance reveals. Elements that enter together appear one after another.
    const reveals = new IntersectionObserver(
      (entries) => {
        let order = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          element.style.setProperty("--d", order++ * 110 + "ms");
          element.classList.add("is-in");
          reveals.unobserve(element);
        });
      },
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

    // Deep links start the story; the ones after the silence open it directly.
    const openFromHash = () => {
      const target =
        location.hash.length > 1
          ? document.getElementById(location.hash.slice(1))
          : null;
      if (target && target.id !== "inicio") storyState.start();
      if (target?.closest(".after-silence") && !storyState.get().silenced) {
        storyState.openSilence();
        requestAnimationFrame(() =>
          target.scrollIntoView({ behavior: "instant" }),
        );
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);

    // Measuring pinned scenes changes the page height after the browser already jumped
    // to a deep link (#compartir, #invitacion…): keep that anchor until the visitor moves.
    let visitorMoved = false;
    const moved = () => {
      visitorMoved = true;
    };
    const keepAnchor = () => {
      if (visitorMoved || location.hash.length < 2) return;
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({ behavior: "instant" });
    };
    // Keyboard users who tab past the start button start the story too.
    const onFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        !storyState.get().started &&
        target?.closest?.("main") &&
        !target.closest("#inicio")
      )
        storyState.start();
    };
    document.addEventListener("focusin", onFocus);

    const intents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    intents.forEach((name) =>
      window.addEventListener(name, moved, { passive: true, once: true }),
    );

    // In the noise, if the visitor stops scrolling for 3 seconds, a nudge invites them on.
    let lastMove = performance.now();
    const moving = () => {
      lastMove = performance.now();
      noise?.removeAttribute("data-idle");
    };
    const idle = window.setInterval(() => {
      if (!noise) return;
      const rect = noise.getBoundingClientRect();
      const inside =
        storyState.get().started &&
        rect.top <= 1 &&
        rect.bottom >= innerHeight - 1;
      noise.toggleAttribute(
        "data-idle",
        inside && performance.now() - lastMove > 3000,
      );
    }, 400);
    window.addEventListener("scroll", moving, { passive: true });

    const onResize = () => {
      measure();
      keepAnchor();
      schedule();
    };
    measure();
    keepAnchor();
    void document.fonts?.ready.then(onResize);
    // After the silence, the calm loop.
    const syncCalm = () => soundscape.setCalm(storyState.get().silenced);
    syncCalm();
    const unsubscribe = storyState.subscribe(() => {
      syncCalm();
      requestAnimationFrame(onResize);
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reveals.disconnect();
      scenes.disconnect();
      unsubscribe();
      window.removeEventListener("hashchange", openFromHash);
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", moving);
      clearInterval(idle);
      window.removeEventListener("resize", onResize);
      intents.forEach((name) => window.removeEventListener(name, moved));
    };
  }, []);

  // «Tocá para empezar» turns the sound on. Browsers only let it play after a tap or key
  // press, so a visitor who already started (e.g. after reloading) unlocks it with the
  // next gesture.
  useEffect(() => {
    soundscape.listen((running) => storyState.setAudible(running));
    const unlock = () => {
      const { started, sound } = storyState.get();
      if (started && sound && !soundscape.running) soundscape.enable();
    };
    unlock();
    const events = [
      "pointerdown",
      "pointerup",
      "keydown",
      "touchend",
      "click",
    ] as const;
    events.forEach((name) =>
      window.addEventListener(name, unlock, { capture: true, passive: true }),
    );
    return () =>
      events.forEach((name) =>
        window.removeEventListener(name, unlock, { capture: true }),
      );
  }, []);

  function toggleSound() {
    // While waiting for the first gesture, this very tap is the one that turns it on.
    if (sound && !audible) {
      soundscape.enable();
    } else if (sound) {
      soundscape.disable();
      storyState.setSound(false);
      track("sound_off");
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
          <span className="brand-chip">
            <Image
              src="/images/jar-logo.webp"
              alt={retreat.organization.short}
              width={720}
              height={493}
              sizes="64px"
              preload
            />
          </span>
          casiciaco<span className="edition">#{retreat.edition}</span>
        </a>
        <div className="header-actions">
          {/* Appears once «Tocá para empezar» has turned the sound on. */}
          {started && (
            <button
              type="button"
              className={
                "sound-toggle" + (sound && !audible ? " is-waiting" : "")
              }
              aria-pressed={sound}
              onClick={toggleSound}
            >
              <span className="sound-bars" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span>
                {!sound
                  ? "Activar sonido"
                  : audible
                    ? "Sonido"
                    : "Tocá para escuchar"}
              </span>
            </button>
          )}
          <RegistrationLink
            from="header"
            className="header-cta"
            hidden={!pastHero}
          >
            Anotarme <Arrow direction="up-right" />
          </RegistrationLink>
        </div>
        <span className="page-progress" aria-hidden="true" />
      </header>
      <main id="recorrido" ref={stage} tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
