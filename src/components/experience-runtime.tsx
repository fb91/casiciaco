"use client";
import { useEffect, useState } from "react";
import { retreat } from "@/config/retreat";
import { clarityAllowed, normalizeOrigin } from "@/lib/analytics";
import { Arrow } from "./marks";

export function ExperienceRuntime() {
  const [chapter, setChapter] = useState("LA INQUIETUD");
  const [progress, setProgress] = useState(0);
  const [light, setLight] = useState(false);
  useEffect(() => {
    const sections = [
      ...document.querySelectorAll<HTMLElement>("[data-scene]"),
    ];
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-seen");
        }),
      { threshold: 0.15 },
    );
    const focus = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            setChapter(el.dataset.chapter || "LA INQUIETUD");
            setLight(el.dataset.tone === "light");
            setProgress((sections.indexOf(el) + 1) / sections.length);
          }
        }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((el) => {
      reveal.observe(el);
      focus.observe(el);
    });
    return () => {
      reveal.disconnect();
      focus.disconnect();
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
    script.src = `https://www.clarity.ms/tag/${retreat.analytics.projectId}`;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);
  return (
    <>
      <header className={`site-header ${light ? "ink-dark" : "ink-light"}`}>
        <a
          href="#inicio"
          className="wordmark"
          aria-label="Casiciaco 45, volver al inicio"
        >
          CASICIACO<span> / 45</span>
        </a>
        <a href="#invitacion" className="header-link">
          La invitación <Arrow direction="up-right" />
        </a>
      </header>
      <div
        className={`journey-status ${light ? "ink-dark" : "ink-light"}`}
        aria-hidden="true"
      >
        <span>{chapter}</span>
        <div className="progress-track">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </>
  );
}
