"use client";
import { useEffect, useRef, useState } from "react";
import { publicUrl, retreat, type Testimonial } from "@/config/retreat";
import { track } from "@/lib/analytics";
import { Arrow } from "./marks";

export function Choice() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div
      className="choices"
      role="group"
      aria-label="¿Qué te gustaría encontrar?"
      data-clarity-mask="true"
    >
      {retreat.copy.choice.options.map((option, i) => (
        <button
          key={option}
          type="button"
          aria-pressed={selected === option}
          onClick={() => setSelected(selected === option ? null : option)}
        >
          <span className="choice-number">0{i + 1}</span>
          <span>{option}</span>
          <span className="choice-check" aria-hidden="true">
            {selected === option ? "✓" : "+"}
          </span>
        </button>
      ))}
    </div>
  );
}

export function InvitationActions() {
  const [shareOptions, setShareOptions] = useState(false);
  const [message, setMessage] = useState("");
  const [registrationInfo, setRegistrationInfo] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const registration = publicUrl(retreat.registrationUrl);
  const contact = publicUrl(retreat.contactUrl);
  const manualLink = useRef<HTMLInputElement>(null);
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
          title: "CASICIACO #45",
          text: `¿Y si vamos? Casiciaco · ${retreat.dates.days} de noviembre · De ${retreat.age.min} a ${retreat.age.max} años.`,
          url,
        });
        track("share_handoff");
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    setShareOptions(true);
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
            aria-expanded={registrationInfo}
            aria-controls="registration-info"
            onClick={() => {
              setRegistrationInfo(!registrationInfo);
              track("registration_info");
            }}
          >
            {retreat.copy.cta}
            <Arrow direction="up-right" />
          </button>
          <div
            id="registration-info"
            hidden={!registrationInfo}
            className="registration-info"
          >
            <p>{retreat.registrationNote}</p>
            {contact && (
              <a href={contact}>
                Consultar a JAR <Arrow direction="up-right" />
              </a>
            )}
          </div>
          <p className="registration-status">
            Inscripción: información próximamente.
          </p>
        </>
      )}
      <div className="share-row">
        <p>{retreat.copy.share}</p>
        <button type="button" className="text-button" onClick={share}>
          Compartir <Arrow direction="up-right" />
        </button>
      </div>
      {shareOptions && (
        <div className="share-options">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`¿Y si vamos? CASICIACO #45 · 13–15 noviembre 2026. ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("share_whatsapp")}
          >
            Enviar por WhatsApp <Arrow direction="up-right" />
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
      )}
      <p role="status" className="share-status">
        {message}
      </p>
    </div>
  );
}

export function TestimonialGallery({ items }: { items: Testimonial[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="button-outline"
        aria-expanded={open}
        aria-controls="testimonials"
        onClick={() => setOpen(!open)}
      >
        {open ? "Cerrar experiencias" : "Escuchar sus experiencias"}{" "}
        <Arrow direction="right" />
      </button>
      <a className="text-button" href="#invitacion">
        Seguir a la invitación <Arrow direction="down" />
      </a>
      <div id="testimonials" hidden={!open}>
        {open &&
          items.map((item) => <TestimonialVideo key={item.id} item={item} />)}
      </div>
    </>
  );
}
function TestimonialVideo({ item }: { item: Testimonial }) {
  const video = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const load = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true);
      },
      { rootMargin: "300px" },
    );
    const pause = new IntersectionObserver((entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) el.pause();
      }),
    );
    const onHidden = () => {
      if (document.hidden) el.pause();
    };
    load.observe(el);
    pause.observe(el);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      load.disconnect();
      pause.disconnect();
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
          document.querySelectorAll("video").forEach((el) => {
            if (el !== video.current) el.pause();
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
