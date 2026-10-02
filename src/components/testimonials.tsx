"use client";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  testimonialMeta,
  testimonials,
  type Testimonial,
} from "@/config/testimonials";
import { track } from "@/lib/analytics";
import { Arrow } from "./marks";

type Vars = CSSProperties & Record<`--${string}`, string | number>;
const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Reading time for a text story: about a third of a second per word. */
const readingTime = (text: string) =>
  Math.min(18000, Math.max(6500, text.split(/\s+/).length * 330));

function Avatar({ item, size }: { item: Testimonial; size: number }) {
  return (
    <span className="avatar" style={{ "--size": size + "px" } as Vars}>
      <Image src={item.avatar} alt="" width={size} height={size} unoptimized />
    </span>
  );
}
function ExampleBadge({ item }: { item: Testimonial }) {
  return item.placeholder ? (
    <span className="example-badge">Ejemplo</span>
  ) : null;
}

/**
 * Instagram-like stories: swipe sideways or tap the left/right side to move, press and
 * hold to pause. Text stories advance after their reading time, videos when they end.
 */
function Stories({
  items,
  start = 0,
  modal = false,
  onClose,
}: {
  items: Testimonial[];
  start?: number;
  modal?: boolean;
  onClose?: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const fills = useRef<(HTMLElement | null)[]>([]);
  const elapsed = useRef(0);
  const current = useRef(start);
  const holdTimer = useRef(0);
  const wasHeld = useRef(false);
  const [index, setIndex] = useState(start);
  const [inView, setInView] = useState(modal);
  const [seen, setSeen] = useState(modal);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [muted, setMuted] = useState(false);
  const item = items[index];
  const last = items.length - 1;

  const select = useCallback((next: number) => {
    current.current = next;
    elapsed.current = 0;
    fills.current[next]?.style.setProperty("--fill", "0");
    setIndex(next);
  }, []);
  const goTo = useCallback(
    (next: number) => {
      const element = strip.current;
      if (!element) return;
      const target = Math.min(last, Math.max(0, next));
      element.scrollTo({
        left: target * element.clientWidth,
        behavior: reducedMotion() ? "auto" : "smooth",
      });
      select(target);
    },
    [last, select],
  );
  const advance = useCallback(() => {
    if (current.current < last) goTo(current.current + 1);
    else if (modal) onClose?.();
    else setPaused(true);
  }, [goTo, last, modal, onClose]);

  // Swipes are native horizontal scroll: the story is the one it settles on.
  useEffect(() => {
    const element = strip.current;
    if (!element) return;
    let timeout = 0;
    const settle = () => {
      const next = Math.round(
        element.scrollLeft / Math.max(1, element.clientWidth),
      );
      if (next !== current.current && next >= 0 && next <= last) {
        select(next);
        setPaused(false);
      }
    };
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(settle, 120);
    };
    // Keeps the current story in place when the size changes, and opens on the requested
    // one as soon as the strip has a size (a dialog has none until it is shown).
    const resize = new ResizeObserver(() => {
      element.scrollLeft = current.current * element.clientWidth;
    });
    element.addEventListener("scroll", onScroll, { passive: true });
    resize.observe(element);
    return () => {
      clearTimeout(timeout);
      element.removeEventListener("scroll", onScroll);
      resize.disconnect();
    };
  }, [last, select]);

  // Inline stories only run while most of them is on screen.
  useEffect(() => {
    if (modal || !root.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.6 },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [modal]);

  // Progress bar of the current story; text stories advance on their own.
  useEffect(() => {
    const story = items[index];
    const fill = fills.current[index];
    const auto = !reducedMotion();
    let frame = 0;
    let before = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(100, now - before);
      before = now;
      let value: number;
      if (story.kind === "video") {
        const video = videos.current[index];
        value = video?.duration ? video.currentTime / video.duration : 0;
      } else if (!auto) {
        value = 1;
      } else {
        if (inView && !paused && !held && !document.hidden)
          elapsed.current += dt;
        value = elapsed.current / readingTime(story.text);
        if (value >= 1) {
          fill?.style.setProperty("--fill", "1");
          if (!paused) advance();
          return;
        }
      }
      fill?.style.setProperty("--fill", Math.min(1, value).toFixed(4));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [index, inView, paused, held, items, advance]);

  // Only the current video plays; moving to another story rewinds the rest.
  useEffect(() => {
    videos.current.forEach((video, position) => {
      if (video && position !== index) {
        video.pause();
        if (video.readyState > 0) video.currentTime = 0;
      }
    });
  }, [index]);
  useEffect(() => {
    const video = videos.current[index];
    if (!video) return;
    if (!inView || paused || held) {
      video.pause();
      return;
    }
    video.muted = muted;
    video.play().catch(() => {
      // Autoplay with sound blocked: play muted and offer the sound button.
      if (video.muted) return;
      video.muted = true;
      setMuted(true);
      void video.play().catch(() => {});
    });
  }, [index, inView, paused, held, muted, seen]);

  const endHold = () => {
    clearTimeout(holdTimer.current);
    if (wasHeld.current) setHeld(false);
  };
  // iOS only plays a video with sound when play() runs inside the tap itself.
  const prime = (position: number, sound = !muted) => {
    const video = videos.current[position];
    if (!video?.src) return;
    if (position !== current.current) video.currentTime = 0;
    video.muted = !sound;
    void video.play().catch(() => {});
  };
  const tap = (direction: 1 | -1) => {
    if (wasHeld.current) {
      wasHeld.current = false;
      return;
    }
    if (direction > 0 && current.current === last && modal) return onClose?.();
    const target =
      direction > 0 && current.current === last
        ? 0
        : Math.max(0, current.current + direction);
    prime(target);
    goTo(target);
    setPaused(false);
  };

  return (
    <div
      ref={root}
      className={"stories" + (modal ? " stories-modal" : "")}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Testimonios de quienes ya vivieron Casiciaco"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") goTo(current.current + 1);
        if (event.key === "ArrowLeft") goTo(current.current - 1);
      }}
    >
      <div className="stories-bars" aria-hidden="true">
        {items.map((story, position) => (
          <span
            key={story.id}
            className={
              "stories-bar" +
              (position < index ? " is-done" : "") +
              (position > index ? " is-next" : "")
            }
          >
            <i ref={(element) => void (fills.current[position] = element)} />
          </span>
        ))}
      </div>
      <div className="stories-head">
        <Avatar item={item} size={36} />
        <p>
          <strong>{item.name}</strong> <ExampleBadge item={item} />
          <small>{testimonialMeta(item)}</small>
        </p>
        <div className="stories-controls">
          {item.kind === "video" && (
            <button
              type="button"
              aria-pressed={!muted}
              aria-label="Sonido del video"
              onClick={() => {
                prime(index, muted);
                setMuted(!muted);
              }}
            >
              {muted ? <MutedIcon /> : <SoundIcon />}
            </button>
          )}
          <button
            type="button"
            aria-label={paused ? "Reanudar" : "Pausar"}
            onClick={() => {
              if (paused && current.current === last && !modal) {
                goTo(0);
              }
              setPaused(!paused);
            }}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
          </button>
          {modal && (
            <button type="button" aria-label="Cerrar" onClick={onClose}>
              <CloseIcon />
            </button>
          )}
        </div>
      </div>
      <div
        ref={strip}
        className="stories-strip"
        onPointerDown={() => {
          wasHeld.current = false;
          holdTimer.current = window.setTimeout(() => {
            wasHeld.current = true;
            setHeld(true);
          }, 260);
        }}
        onPointerUp={endHold}
        onPointerCancel={endHold}
        onPointerLeave={endHold}
        onContextMenu={(event) => event.preventDefault()}
      >
        {items.map((story, position) => (
          <div
            key={story.id}
            className={"story story-" + story.kind}
            role="group"
            aria-roledescription="historia"
            aria-label={`${position + 1} de ${items.length}: ${story.name}`}
            inert={position !== index}
          >
            {story.kind === "video" ? (
              <>
                <video
                  ref={(element) => void (videos.current[position] = element)}
                  playsInline
                  preload="none"
                  poster={story.poster}
                  src={
                    Math.abs(position - index) <= 1 && seen
                      ? story.video
                      : undefined
                  }
                  onPlay={(event) => {
                    document.querySelectorAll("video").forEach((element) => {
                      if (element !== event.currentTarget) element.pause();
                    });
                    track("testimonial_play");
                  }}
                  onEnded={() => {
                    track("testimonial_complete");
                    if (!reducedMotion()) advance();
                  }}
                >
                  {story.captions && (
                    <track
                      kind="captions"
                      src={story.captions}
                      srcLang="es"
                      label="Español"
                      default
                    />
                  )}
                </video>
                <details className="story-transcript">
                  <summary>Leer transcripción</summary>
                  <p>{story.transcript}</p>
                </details>
              </>
            ) : (
              <div className="story-card">
                <Avatar item={story} size={88} />
                <p className="story-name">
                  {story.name} <ExampleBadge item={story} />
                </p>
                <p className="story-meta">{testimonialMeta(story)}</p>
                <blockquote>
                  <p>{story.text}</p>
                </blockquote>
              </div>
            )}
            <button
              type="button"
              className="story-tap story-tap-prev"
              aria-label="Testimonio anterior"
              tabIndex={position === index ? 0 : -1}
              onClick={() => tap(-1)}
            />
            <button
              type="button"
              className="story-tap story-tap-next"
              aria-label="Testimonio siguiente"
              tabIndex={position === index ? 0 : -1}
              onClick={() => tap(1)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full-screen stories, opened from the floating bubble. */
function StoriesDialog({
  start,
  onClose,
}: {
  start: number | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (start !== null && !element.open) element.showModal();
    if (start === null && element.open) element.close();
  }, [start]);
  return (
    <dialog
      ref={dialog}
      className="stories-dialog"
      aria-label="Testimonios"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {start !== null && (
        <Stories
          items={testimonials}
          start={start}
          modal
          onClose={() => dialog.current?.close()}
        />
      )}
    </dialog>
  );
}

const bubbleTimes = { typing: 1200, shown: 5600, leaving: 450 };

/**
 * A chat message that floats next to «Quiero anotarme»: a different testimonial each
 * time, in random order. Tapping it opens that testimonial as a story.
 */
export function TestimonialBubble() {
  const zone = useRef<HTMLDivElement>(null);
  const bag = useRef<number[]>([]);
  const [phase, setPhase] = useState<keyof typeof bubbleTimes>("typing");
  const [shown, setShown] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [inView, setInView] = useState(false);
  const [resting, setResting] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!zone.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(zone.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Paused while hovered or focused, while a story is open and off screen. With reduced
    // motion it shows one testimonial and stays there.
    if (!inView || resting || open !== null) return;
    if (phase !== "typing" && reducedMotion()) return;
    const timeout = setTimeout(() => {
      if (phase === "typing") {
        if (!bag.current.length)
          bag.current = shuffle(
            testimonials.map((_, position) => position),
          ).filter((position, _, all) => all.length < 2 || position !== shown);
        setShown(bag.current.pop() ?? 0);
        setRound((value) => value + 1);
        setPhase("shown");
      } else if (phase === "shown") setPhase("leaving");
      else setPhase("typing");
    }, bubbleTimes[phase]);
    return () => clearTimeout(timeout);
  }, [phase, inView, resting, open, shown]);

  const item = shown === null ? null : testimonials[shown];
  return (
    <div
      ref={zone}
      className="bubble-zone"
      onPointerEnter={(event) =>
        event.pointerType === "mouse" && setResting(true)
      }
      onPointerLeave={() => setResting(false)}
      onFocus={() => setResting(true)}
      onBlur={() => setResting(false)}
    >
      <p className="bubble-label">
        <span className="live-dot" aria-hidden="true" />
        Ellos ya lo vivieron
      </p>
      <div className="bubble-slot">
        {phase === "typing" || !item ? (
          <span className="bubble-typing" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <button
            key={round}
            type="button"
            className={"bubble" + (phase === "leaving" ? " is-leaving" : "")}
            aria-haspopup="dialog"
            onClick={() => {
              setOpen(shown);
              track("testimonial_open", {
                desde: "burbuja",
                formato: item.kind,
              });
            }}
          >
            <Avatar item={item} size={52} />
            <span className="bubble-text">
              <span className="bubble-head">
                <strong>{item.name}</strong>
                <small>{testimonialMeta(item)}</small>
                <ExampleBadge item={item} />
              </span>
              <span className="bubble-teaser">{item.teaser}</span>
            </span>
            <span className="bubble-kind">
              {item.kind === "video" ? (
                <>
                  <PlayIcon /> Ver
                </>
              ) : (
                "Leer"
              )}
            </span>
          </button>
        )}
      </div>
      <a className="bubble-more" href="#historias">
        Ver todas las historias <Arrow />
      </a>
      <StoriesDialog start={open} onClose={() => setOpen(null)} />
    </div>
  );
}

/** Every testimonial, at the end of the page. */
export function TestimonialStories() {
  return <Stories items={testimonials} />;
}

function shuffle<T>(list: T[]) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M6.5 4.5h4v15h-4zm7 0h4v15h-4z" fill="currentColor" />
    </svg>
  );
}
function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path
        d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path
        d="m15.5 9.5 5 5m0-5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
