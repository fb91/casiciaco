"use client";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { publicUrl, retreat, type Testimonial } from "@/config/retreat";
import { track, type SmartEvent as SmartEventName } from "@/lib/analytics";
import { goingCards, inviteCards, type ShareMode } from "@/config/share-cards";
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

/** Hero hint while the browser waits for a first gesture before playing sound. */
export function SoundHint() {
  const waiting = useStory((state) => state.sound && !state.audible);
  if (!waiting) return null;
  return (
    <button
      type="button"
      className="sound-hint"
      onClick={() => soundscape.enable()}
    >
      <span className="sound-bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      Tocá para activar el sonido
    </button>
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

const noSubscription = () => () => {};
function baseUrl() {
  const url = new URL(
    publicUrl(retreat.canonicalUrl) || window.location.origin,
  );
  url.search = "";
  url.hash = "";
  return url;
}

export function InvitationActions() {
  const registration = publicUrl(retreat.registrationUrl);
  const contact = publicUrl(retreat.contactUrl);
  const registrationDialog = useRef<HTMLDialogElement>(null);
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
      <a className="button-outline" href="#compartir">
        Compartir la invitación <Arrow />
      </a>
    </div>
  );
}

/**
 * Sharing for everyone: people who are going and people (parish, friends) who want to
 * invite others. Story images come from the same generator as /historia/[id].
 */
export function ShareStudio() {
  const choice = useStory((state) => state.choice);
  const [mode, setMode] = useState<ShareMode>("invitar");
  const [picked, setPicked] = useState<string>(inviteCards[0].id);
  const [name, setName] = useState("");
  // Known only in the browser; empty during server rendering.
  const origin = useSyncExternalStore(
    noSubscription,
    () => baseUrl().href,
    () => "",
  );
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const cards = mode === "invitar" ? inviteCards : goingCards;
  const card = cards.find((item) => item.id === picked) ?? cards[0];
  const image = `/historia/${card.id}`;
  const trimmed = name.trim().slice(0, 24);
  function link(ref: string) {
    if (!origin) return "";
    const url = new URL(origin);
    if (trimmed) url.searchParams.set("de", trimmed);
    url.searchParams.set("ref", trimmed ? "invitacion" : ref);
    return url.href;
  }
  const facts = `Casiciaco #${retreat.edition} es un retiro para jóvenes de ${retreat.age.min} a ${retreat.age.max} años: ${retreat.dates.days.replaceAll(" · ", ", ").replace(/, (\d+)$/, " y $1")} de noviembre en ${retreat.organization.city}.`;
  const message =
    mode === "invitar"
      ? `¿Qué estás buscando? ${facts} Mirá de qué se trata 👉 ${link("whatsapp")}`
      : `Me voy a Casiciaco 🙌 ${choice === null ? "" : copy.storyBy[choice] + " "}${facts} ¿Venís? 👉 ${link("whatsapp")}`;

  function switchMode(next: ShareMode) {
    setMode(next);
    setStatus("");
    setPicked(
      next === "invitar" ? inviteCards[0].id : String(choice ?? "libre"),
    );
  }
  async function copyText(text: string, done: string, event: SmartEventName) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(done);
      track(event, { modo: mode });
    } catch {
      setStatus("No se pudo copiar. Mantené apretado el texto para copiarlo.");
    }
  }
  async function shareImage() {
    track("story_card", { placa: card.id, modo: mode });
    setBusy(true);
    setStatus("");
    try {
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], `casiciaco-${card.id}.png`, {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: link("historia") });
        track("share_handoff", { modo: mode });
        setStatus("¡Listo! Si la subís a Instagram, sumá el sticker «Enlace».");
        return;
      }
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(blob);
      anchor.download = file.name;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(anchor.href), 4000);
      setStatus("Imagen descargada. Subila a tu historia desde la galería.");
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        window.open(image, "_blank");
    } finally {
      setBusy(false);
    }
  }
  async function shareMessage() {
    track("share_open", { modo: mode, personal: trimmed ? 1 : 0 });
    if (!navigator.share)
      return copyText(
        message,
        "Mensaje copiado. Pegalo donde quieras.",
        "copy_message",
      );
    try {
      await navigator.share({ text: message });
      track("share_handoff", { modo: mode });
    } catch {
      // Canceled: nothing else opens.
    }
  }

  return (
    <div className="share-studio">
      <div
        className="share-modes"
        role="group"
        aria-label="¿Qué querés compartir?"
      >
        <button
          type="button"
          aria-pressed={mode === "invitar"}
          onClick={() => switchMode("invitar")}
        >
          Quiero invitar
        </button>
        <button
          type="button"
          aria-pressed={mode === "voy"}
          onClick={() => switchMode("voy")}
        >
          Me voy a Casiciaco
        </button>
      </div>

      <div className="share-step">
        <p className="share-title">
          <span>1</span> Elegí una placa para tu historia
        </p>
        <div className="card-picker" role="group" aria-label="Placas">
          {cards.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === card.id}
              onClick={() => setPicked(item.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/historia/${item.id}`}
                alt={item.label}
                width={1080}
                height={1920}
                loading="lazy"
              />
            </button>
          ))}
        </div>
        <div className="share-buttons">
          <button
            type="button"
            className="button-primary"
            onClick={shareImage}
            disabled={busy}
          >
            {busy ? "Preparando…" : "Compartir en tu historia"}
            <Arrow direction="up-right" />
          </button>
          <a
            className="button-outline"
            href={image}
            download={`casiciaco-${card.id}.png`}
            onClick={() =>
              track("story_card", { placa: card.id, modo: mode, descarga: 1 })
            }
          >
            Descargar imagen <Arrow />
          </a>
        </div>
        <p className="share-tip">
          En Instagram sumá el sticker <strong>«Enlace»</strong> con la
          dirección de la web. La placa ya la muestra, con un QR para escanear.{" "}
          <button
            type="button"
            className="inline-button"
            onClick={() =>
              copyText(
                link("historia"),
                "Enlace copiado. Pegalo en el sticker.",
                "copy_link",
              )
            }
          >
            Copiar enlace
          </button>
        </p>
      </div>

      <div className="share-step">
        <p className="share-title">
          <span>2</span> Mandá la invitación
        </p>
        <label className="invite-label" htmlFor="invite-name">
          Tu nombre, para que sepan quién invita <span>(opcional)</span>
        </label>
        <input
          id="invite-name"
          className="invite-input"
          value={name}
          maxLength={24}
          autoComplete="given-name"
          placeholder="Ej: Juli"
          onChange={(event) => setName(event.target.value)}
        />
        <p className="share-message" data-testid="share-message">
          {message}
        </p>
        <div className="share-buttons">
          <a
            className="button-whatsapp"
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track("share_whatsapp", { modo: mode, personal: trimmed ? 1 : 0 })
            }
          >
            Enviar por WhatsApp <Arrow direction="up-right" />
          </a>
          <button
            type="button"
            className="button-outline"
            onClick={() =>
              copyText(
                message,
                "Mensaje copiado. Pegalo en tu grupo.",
                "copy_message",
              )
            }
          >
            Copiar mensaje
          </button>
          <button type="button" className="text-button" onClick={shareMessage}>
            Otras apps <Arrow direction="up-right" />
          </button>
        </div>
      </div>
      <p role="status" className="share-status">
        {status}
      </p>
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
