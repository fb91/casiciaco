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
import { Arrow } from "./marks";

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

export function Choice() {
  const [selected, setSelected] = useState<number | null>(null);
  const responses = [
    "Un rato para bajar un cambio. Suena bien.",
    "Compartir el camino también hace bien.",
    "Está bien. No tenés que tener todo resuelto.",
  ];
  return (
    <div
      className="choices"
      role="group"
      aria-label="¿Qué te gustaría encontrar?"
      data-clarity-mask="true"
    >
      {retreat.copy.choice.options.map((option, index) => (
        <button
          key={option}
          type="button"
          aria-pressed={selected === index}
          onClick={() => setSelected(selected === index ? null : index)}
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
          : responses[selected]}
      </p>
    </div>
  );
}

export function InvitationActions() {
  const [message, setMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const registration = publicUrl(retreat.registrationUrl);
  const contact = publicUrl(retreat.contactUrl);
  const manualLink = useRef<HTMLInputElement>(null);
  const registrationDialog = useRef<HTMLDialogElement>(null);
  const shareDialog = useRef<HTMLDialogElement>(null);
  function urlToShare() {
    const url = new URL(
      publicUrl(retreat.canonicalUrl) || window.location.origin,
    );
    url.search = "";
    url.hash = "";
    url.searchParams.set("ref", "whatsapp");
    return url.href;
  }
  async function share() {
    const url = urlToShare();
    setShareUrl(url);
    setMessage("");
    track("share_open");
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CASICIACO #${retreat.edition}`,
          text: `¿Y si vamos? Casiciaco · ${retreat.dates.days} de noviembre · De ${retreat.age.min} a ${retreat.age.max} años.`,
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
  async function copy() {
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
  return (
    <div className="invitation-actions">
      {registration ? (
        <a
          className="button-primary"
          href={registration}
          onClick={() => track("registration_click")}
        >
          {retreat.copy.cta}
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
            {retreat.copy.cta}
            <Arrow direction="up-right" />
          </button>
          <p className="registration-status">
            Inscripción: información próximamente.
          </p>
          <InfoDialog
            dialogRef={registrationDialog}
            id="registration-info"
            title="Cómo sumarte"
          >
            <p>{retreat.registrationNote}</p>
            {contact && (
              <a className="text-button" href={contact}>
                Consultar a JAR <Arrow direction="up-right" />
              </a>
            )}
          </InfoDialog>
        </>
      )}
      <div className="share-row">
        <p>{retreat.copy.share}</p>
        <button
          type="button"
          className="text-button"
          aria-haspopup="dialog"
          onClick={share}
        >
          Compartir <Arrow direction="up-right" />
        </button>
      </div>
      <InfoDialog
        dialogRef={shareDialog}
        id="share-dialog"
        title="¿Y si van juntos?"
      >
        <div className="share-options">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`¿Y si vamos? CASICIACO #${retreat.edition} · ${retreat.dates.days} de noviembre de ${retreat.dates.year}. ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("share_whatsapp")}
          >
            Enviar por WhatsApp
            <Arrow direction="up-right" />
          </a>
          <button type="button" onClick={copy}>
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

function PracticalDetails() {
  const contact = publicUrl(retreat.contactUrl);
  return (
    <>
      <dl>
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
        <p>
          <strong>Qué llevar</strong>
          <br />
          {retreat.practicalNotes}
        </p>
      )}
      {contact && (
        <a className="text-button" href={contact}>
          Consultar a JAR
          <Arrow direction="up-right" />
        </a>
      )}
    </>
  );
}
export function PracticalInfo() {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className="text-button practical-trigger"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        Ver detalles del retiro <Arrow direction="up-right" />
      </button>
      <InfoDialog
        dialogRef={dialog}
        id="practical-info"
        title="Lo que necesitás saber"
      >
        <PracticalDetails />
      </InfoDialog>
      <noscript>
        <details className="no-js-info">
          <summary>Ver detalles del retiro</summary>
          <PracticalDetails />
        </details>
      </noscript>
    </>
  );
}

export function TestimonialGallery({ items }: { items: Testimonial[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className="button-outline"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        Escuchar sus experiencias
        <Arrow direction="right" />
      </button>
      <InfoDialog
        dialogRef={dialog}
        id="testimonials"
        title="Así lo vivieron"
        onClose={() =>
          dialog.current
            ?.querySelectorAll("video")
            .forEach((video) => video.pause())
        }
      >
        {items.map((item) => (
          <TestimonialVideo key={item.id} item={item} />
        ))}
      </InfoDialog>
    </>
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
      <h3>{item.name}</h3>
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
      <details>
        <summary>Leer transcripción</summary>
        <p>{item.transcript}</p>
      </details>
    </article>
  );
}
