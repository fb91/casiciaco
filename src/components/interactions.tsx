"use client";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { publicUrl, retreat, type Testimonial } from "@/config/retreat";
import { track } from "@/lib/analytics";
import { live, storyState, useStory } from "@/lib/story-state";
import { soundscape } from "@/lib/soundscape";
import { Arrow } from "./marks";

const copy = retreat.copy;

function InfoDialog({
  dialogRef,
  id,
  title,
  children,
  onClose,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  id: string;
  title: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <dialog
      ref={dialogRef}
      id={id}
      className="info-dialog"
      aria-labelledby={id + "-title"}
      onClose={onClose}
    >
      <div className="dialog-header">
        <h2 id={id + "-title"}>{title}</h2>
        <button
          type="button"
          className="dialog-close"
          aria-label="Cerrar"
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}

const holdDuration = 2600;

/** The one intentional pause: the rest of the story appears after holding still. */
export function HoldToSilence() {
  const silenced = useStory((state) => state.silenced);
  const [holding, setHolding] = useState(false);
  const held = useRef(false);
  const ring = useRef<HTMLButtonElement>(null);
  const pause = useRef<HTMLParagraphElement>(null);
  const timer = useRef({ start: 0, frame: 0, value: 0 });

  useEffect(() => () => cancelAnimationFrame(timer.current.frame), []);

  function paint(value: number) {
    timer.current.value = value;
    live.hold = value;
    ring.current
      ?.closest("section")
      ?.style.setProperty("--hold", value.toFixed(3));
  }
  function finish(skipped: boolean) {
    cancelAnimationFrame(timer.current.frame);
    held.current = false;
    setHolding(false);
    paint(1);
    live.hold = 0;
    navigator.vibrate?.([18, 80, 18]);
    soundscape.chime();
    storyState.openSilence();
    track(skipped ? "silence_skip" : "silence_complete");
    setTimeout(() => pause.current?.focus({ preventScroll: true }), 60);
  }
  function start() {
    if (silenced || held.current) return;
    held.current = true;
    setHolding(true);
    navigator.vibrate?.(12);
    const from = timer.current.value;
    timer.current.start = performance.now() - from * holdDuration;
    const step = (now: number) => {
      const value = Math.min(1, (now - timer.current.start) / holdDuration);
      paint(value);
      if (value >= 1) finish(false);
      else timer.current.frame = requestAnimationFrame(step);
    };
    timer.current.frame = requestAnimationFrame(step);
  }
  function release() {
    if (!held.current || silenced) return;
    held.current = false;
    setHolding(false);
    cancelAnimationFrame(timer.current.frame);
    // Letting go drains the ring: the noise comes back.
    const drain = () => {
      const value = Math.max(0, timer.current.value - 0.035);
      paint(value);
      if (value > 0) timer.current.frame = requestAnimationFrame(drain);
    };
    timer.current.frame = requestAnimationFrame(drain);
  }

  return (
    <div className={"silence-gate" + (silenced ? " is-open" : "")}>
      <div className="silence-question" aria-hidden={silenced}>
        <h2 id="silencio-title" className="kinetic">
          {copy.scrolling.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>
        {!silenced && (
          <>
            <button
              ref={ring}
              type="button"
              className={"hold-ring" + (holding ? " is-holding" : "")}
              aria-describedby="hold-hint"
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture?.(event.pointerId);
                start();
              }}
              onPointerUp={release}
              onPointerCancel={release}
              onLostPointerCapture={release}
              onKeyDown={(event) => {
                if (
                  (event.key === " " || event.key === "Enter") &&
                  !event.repeat
                ) {
                  event.preventDefault();
                  start();
                }
              }}
              onKeyUp={(event) => {
                if (event.key === " " || event.key === "Enter") release();
              }}
              onContextMenu={(event) => event.preventDefault()}
            >
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="54" className="ring-track" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  className="ring-fill"
                  pathLength={1}
                />
              </svg>
              <span className="hold-label">{copy.hold}</span>
            </button>
            <p id="hold-hint" className="hold-hint">
              {copy.holdHint}
            </p>
            <button
              type="button"
              className="skip-silence"
              onClick={() => finish(true)}
            >
              Seguir sin esperar
            </button>
          </>
        )}
      </div>
      <div className="silence-answer" aria-hidden={!silenced}>
        <p ref={pause} className="pause-line" tabIndex={-1}>
          <span>{copy.pause[0]}</span>
          <em>{copy.pause[1]}</em>
        </p>
        <a className="scroll-cue" href="#agustin" tabIndex={silenced ? 0 : -1}>
          <span>Seguí bajando</span>
          <Arrow />
        </a>
      </div>
    </div>
  );
}

export function Choice() {
  const selected = useStory((state) => state.choice);
  return (
    <div className="choices" role="group" aria-label={copy.choice.question}>
      {copy.choice.options.map((option, index) => (
        <button
          key={option}
          type="button"
          aria-pressed={selected === index}
          onClick={() => {
            const next = selected === index ? null : index;
            storyState.setChoice(next);
            if (next !== null) track("choice", { opcion: next });
          }}
        >
          <span className="choice-number">0{index + 1}</span>
          <span>{option}</span>
          <span className="choice-check" aria-hidden="true">
            {selected === index ? "✓" : "+"}
          </span>
        </button>
      ))}
      <p className="choice-response" aria-live="polite">
        {selected === null
          ? "No hay respuestas correctas. Podés cambiar de idea."
          : copy.choice.responses[selected]}
      </p>
    </div>
  );
}

/** Invitation subtitle that answers the visitor's earlier choice. */
export function InvitationLine() {
  const choice = useStory((state) => state.choice);
  return (
    <p className="slide-description invitation-line">
      {choice === null ? copy.invitationDefault : copy.invitationBy[choice]}
    </p>
  );
}

function daysLeft(now: number) {
  const start = Date.parse(retreat.dates.startsAt);
  const end = Date.parse(retreat.dates.endsAt);
  if (now > end) return null;
  if (now >= start) return 0;
  return Math.ceil((start - now) / 86_400_000);
}
export function Countdown({ compact = false }: { compact?: boolean }) {
  const [days, setDays] = useState<number | null | undefined>(undefined);
  useEffect(() => {
    const update = () => setDays(daysLeft(Date.now()));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);
  if (days === undefined || days === null) return null;
  const text =
    days === 0
      ? "¡Es este finde!"
      : days === 1
        ? "Falta 1 día"
        : `Faltan ${days} días`;
  return (
    <p className={"countdown" + (compact ? " countdown-compact" : "")}>
      <span className="countdown-dot" aria-hidden="true" />
      {compact ? (
        text
      ) : (
        <>
          <strong>{days === 0 ? "¡Ya!" : days}</strong>
          <span>
            {days === 0
              ? "Es este finde"
              : days === 1
                ? "día para Casiciaco"
                : "días para Casiciaco"}
          </span>
        </>
      )}
    </p>
  );
}

function baseUrl() {
  const url = new URL(
    publicUrl(retreat.canonicalUrl) || window.location.origin,
  );
  url.search = "";
  url.hash = "";
  return url;
}

export function InvitationActions() {
  const choice = useStory((state) => state.choice);
  const [message, setMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const registration = publicUrl(retreat.registrationUrl);
  const contact = publicUrl(retreat.contactUrl);
  const manualLink = useRef<HTMLInputElement>(null);
  const registrationDialog = useRef<HTMLDialogElement>(null);
  const shareDialog = useRef<HTMLDialogElement>(null);
  const shareText = `¿Y si vamos? Casiciaco · ${retreat.dates.days} de noviembre · De ${retreat.age.min} a ${retreat.age.max} años.`;

  function inviteUrl() {
    const url = baseUrl();
    const trimmed = name.trim().slice(0, 24);
    if (trimmed) url.searchParams.set("de", trimmed);
    url.searchParams.set("ref", trimmed ? "invitacion" : "whatsapp");
    return url.href;
  }
  async function share() {
    const url = inviteUrl();
    setShareUrl(url);
    setMessage("");
    track("share_open", { personal: name.trim() ? 1 : 0 });
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CASICIACO #${retreat.edition}`,
          text: shareText,
          url,
        });
        track("share_handoff");
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    shareDialog.current?.showModal();
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage("Enlace copiado. ¿A quién se lo mandás?");
      track("copy_link");
    } catch {
      setMessage("Podés seleccionar y copiar el enlace de abajo.");
      manualLink.current?.focus();
      manualLink.current?.select();
    }
  }
  async function storyCard() {
    const image = `/historia/${choice ?? "libre"}`;
    track("story_card", { opcion: choice ?? -1 });
    setBusy(true);
    try {
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], "casiciaco-historia.png", {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        const url = baseUrl();
        url.searchParams.set("ref", "historia");
        await navigator.share({
          files: [file],
          title: `CASICIACO #${retreat.edition}`,
          text: url.href,
        });
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "casiciaco-historia.png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        window.open(image, "_blank");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="invitation-actions">
      {registration ? (
        <a
          className="button-primary"
          href={registration}
          onClick={() => track("registration_click", { desde: "invitacion" })}
        >
          {copy.cta}
          <Arrow direction="up-right" />
        </a>
      ) : (
        <>
          <button
            type="button"
            className="button-primary"
            aria-haspopup="dialog"
            aria-controls="registration-info"
            onClick={() => {
              registrationDialog.current?.showModal();
              track("registration_info");
            }}
          >
            {copy.cta}
            <Arrow direction="up-right" />
          </button>
          <InfoDialog
            dialogRef={registrationDialog}
            id="registration-info"
            title="Cómo sumarte"
          >
            <p>{retreat.registrationNote}</p>
          </InfoDialog>
        </>
      )}
      {contact && (
        <a
          className="button-outline"
          href={contact}
          target="_blank"
          rel="noopener noreferrer"
        >
          Hablar con alguien de JAR <Arrow direction="up-right" />
        </a>
      )}

      <div className="share-panel">
        <div className="share-block">
          <p className="share-title">Contalo en tu historia</p>
          <p className="share-copy">
            Una placa lista para subir: «
            {choice === null ? copy.storyDefault : copy.storyBy[choice]}»
          </p>
          <button
            type="button"
            className="text-button"
            onClick={storyCard}
            disabled={busy}
          >
            {busy ? "Preparando…" : "Crear mi historia"}{" "}
            <Arrow direction="up-right" />
          </button>
        </div>
        <div className="share-block">
          <p className="share-title">{copy.share}</p>
          <label className="invite-label" htmlFor="invite-name">
            Tu nombre, para que sepan quién invita <span>(opcional)</span>
          </label>
          <div className="invite-row">
            <input
              id="invite-name"
              value={name}
              maxLength={24}
              autoComplete="given-name"
              placeholder="Ej: Juli"
              onChange={(event) => setName(event.target.value)}
            />
            <button
              type="button"
              className="text-button"
              aria-haspopup="dialog"
              onClick={share}
            >
              Compartir <Arrow direction="up-right" />
            </button>
          </div>
        </div>
      </div>
      <InfoDialog
        dialogRef={shareDialog}
        id="share-dialog"
        title="¿Y si van juntos?"
      >
        <div className="share-options">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("share_whatsapp")}
          >
            Enviar por WhatsApp
            <Arrow direction="up-right" />
          </a>
          <button type="button" onClick={copyLink}>
            Copiar enlace
          </button>
          <label className="sr-only" htmlFor="share-link">
            Enlace para compartir
          </label>
          <input
            ref={manualLink}
            id="share-link"
            value={shareUrl}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
        <p role="status" className="share-status">
          {message}
        </p>
      </InfoDialog>
    </div>
  );
}

export function PracticalDetails() {
  return (
    <>
      <dl className="practical-list">
        <div>
          <dt>Fecha</dt>
          <dd>
            {retreat.dates.days} de noviembre de {retreat.dates.year}
          </dd>
        </div>
        <div>
          <dt>Edad</dt>
          <dd>
            De {retreat.age.min} a {retreat.age.max} años
          </dd>
        </div>
        <div>
          <dt>Lugar</dt>
          <dd>{retreat.venue || "A confirmar por la organización."}</dd>
        </div>
        <div>
          <dt>Costo</dt>
          <dd>{retreat.price || "A confirmar por la organización."}</dd>
        </div>
        <div>
          <dt>Horarios</dt>
          <dd>{retreat.schedule || "A confirmar por la organización."}</dd>
        </div>
      </dl>
      {retreat.practicalNotes && (
        <p className="packing">
          <strong>Qué llevar</strong>
          <br />
          {retreat.practicalNotes}
        </p>
      )}
    </>
  );
}

export function TestimonialGallery({ items }: { items: Testimonial[] }) {
  return (
    <div className="reels">
      {items.map((item) => (
        <TestimonialVideo key={item.id} item={item} />
      ))}
    </div>
  );
}
function TestimonialVideo({ item }: { item: Testimonial }) {
  const video = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setNear(true);
          else element.pause();
        }),
      { rootMargin: "200px" },
    );
    const onHidden = () => {
      if (document.hidden) element.pause();
    };
    observer.observe(element);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, []);
  return (
    <article className="testimonial">
      <video
        ref={video}
        controls
        playsInline
        preload="none"
        poster={item.poster}
        src={near ? item.video : undefined}
        onPlay={() => {
          document.querySelectorAll("video").forEach((element) => {
            if (element !== video.current) element.pause();
          });
          track("testimonial_play");
        }}
        onEnded={() => track("testimonial_complete")}
      >
        <track
          kind="captions"
          src={item.captions}
          srcLang="es"
          label="Español"
          default
        />
      </video>
      <h3>{item.name}</h3>
      <details>
        <summary>Leer transcripción</summary>
        <p>{item.transcript}</p>
      </details>
    </article>
  );
}
