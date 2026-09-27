"use client";
import { useEffect, useRef, useState } from "react";
import { retreat } from "@/config/retreat";
import { clarityAllowed, normalizeOrigin } from "@/lib/analytics";
import { Arrow } from "./marks";

type Chapter = { id: string; label: string };
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function ExperienceRuntime() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = [
      ...document.querySelectorAll<HTMLElement>("[data-scene]"),
    ];
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let mounted = true;
    const update = () => {
      frame = 0;
      const height = innerHeight;
      let current = 0;
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= height * 0.45) current = index;
        if (rect.top < height * 1.3 && rect.bottom > -height * 0.3) {
          const travel = clamp(
            -rect.top / Math.max(rect.height - height, height * 0.5),
          );
          section.style.setProperty(
            "--scene-progress",
            motion.matches ? "0" : travel.toFixed(4),
          );
          section.style.setProperty(
            "--arrival",
            motion.matches
              ? "1"
              : clamp((height - rect.top) / (height * 0.8)).toFixed(4),
          );
          section.classList.add("is-seen");
        }
      });
      if (current !== activeRef.current) {
        activeRef.current = current;
        setActive(current);
      }
      const total = document.documentElement.scrollHeight - height;
      if (progress.current)
        progress.current.style.transform =
          "scaleX(" + (total > 0 ? clamp(scrollY / total) : 1) + ")";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const initialize = requestAnimationFrame(() => {
      setChapters(
        sections.map((section) => ({
          id: section.id,
          label: section.dataset.chapter || "",
        })),
      );
      update();
    });
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    document.fonts.ready.then(() => {
      if (mounted) schedule();
    });
    return () => {
      mounted = false;
      cancelAnimationFrame(initialize);
      cancelAnimationFrame(frame);
      resize.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
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

  function goTo(index: number) {
    const chapter = chapters[index];
    if (!chapter) return;
    document
      .getElementById(chapter.id)
      ?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    history.replaceState(null, "", "#" + chapter.id);
  }
  const last = active === chapters.length - 1;
  return (
    <>
      <header className="site-header">
        <a
          href="#inicio"
          className="wordmark"
          aria-label="Casiciaco 45, volver al inicio"
        >
          CASICIACO<span> / 45</span>
        </a>
        <a href="#invitacion" className="header-link">
          La invitación
          <Arrow direction="up-right" />
        </a>
      </header>
      {chapters.length > 0 && (
        <nav className="journey-nav" aria-label="Navegar el recorrido">
          <button
            type="button"
            className="journey-previous"
            aria-label="Capítulo anterior"
            disabled={active === 0}
            onClick={() => goTo(active - 1)}
          >
            <Arrow />
          </button>
          <div className="journey-location">
            <span className="journey-count">
              {String(active + 1).padStart(2, "0")}
              <span> / {String(chapters.length).padStart(2, "0")}</span>
            </span>
            <span className="journey-label">{chapters[active]?.label}</span>
          </div>
          <button
            type="button"
            className="journey-next"
            aria-label={
              last ? "Volver al primer capítulo" : "Capítulo siguiente"
            }
            onClick={() => goTo(last ? 0 : active + 1)}
          >
            <span>{last ? "Inicio" : "Seguir"}</span>
            <Arrow />
          </button>
        </nav>
      )}
      <div className="reading-progress" aria-hidden="true">
        <div ref={progress} />
      </div>
    </>
  );
}
