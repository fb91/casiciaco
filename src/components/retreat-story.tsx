import Image from "next/image";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { retreat, approvedTestimonials } from "@/config/retreat";
import { ExperienceRuntime } from "@/components/experience-runtime";
import {
  Choice,
  Countdown,
  HoldToSilence,
  InvitationActions,
  InvitationLine,
  PracticalDetails,
  ShareStudio,
  SoundHint,
  TestimonialGallery,
} from "@/components/interactions";
import { Arrow } from "@/components/marks";

const copy = retreat.copy;
type Vars = CSSProperties & Record<`--${string}`, string | number>;

function Scene({
  id,
  className,
  dark = false,
  pin,
  children,
  ...rest
}: {
  id: string;
  className: string;
  dark?: boolean;
  pin?: boolean;
  children: ReactNode;
  [data: `data-${string}`]: string | boolean | undefined;
}) {
  return (
    <section
      id={id}
      className={"scene " + className + (pin ? " pin" : "")}
      data-scene
      data-theme={dark ? "dark" : "light"}
      data-progress={pin ? "pin" : undefined}
      aria-labelledby={id + "-title"}
      {...rest}
    >
      {pin ? <div className="pin-frame">{children}</div> : children}
    </section>
  );
}
function Tag({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
/** Words that rise one after another when the block enters the viewport. */
function Rise({
  lines,
  as: Element = "h2",
  id,
  className = "",
}: {
  lines: readonly string[];
  as?: "h1" | "h2" | "p";
  id?: string;
  className?: string;
}) {
  let index = 0;
  return (
    <Element id={id} className={"rise " + className} data-reveal>
      {lines.map((line) => (
        <span className="rise-line" key={line}>
          {line.split(" ").map((word, position) => (
            <Fragment key={position}>
              {position > 0 && " "}
              <span className="rise-word" style={{ "--i": index++ } as Vars}>
                {word}
              </span>
            </Fragment>
          ))}
        </span>
      ))}
    </Element>
  );
}

export function RetreatStory({ inviter }: { inviter: string | null }) {
  const videos = approvedTestimonials();
  const questions = retreat.questions.filter((question) => question.approved);
  const notifications = copy.notifications;
  const quoteWords = copy.quote.split(" ");
  return (
    <ExperienceRuntime>
      <Scene id="inicio" className="hero">
        <div className="scene-media hero-media">
          <Image
            src="/images/friends.webp"
            alt=""
            fill
            preload
            sizes="(max-width: 899px) 180vh, 100vw"
            quality={85}
          />
        </div>
        <div className="image-shade" />
        <div className="hero-content">
          {inviter ? (
            <p className="inviter">
              <span aria-hidden="true">✳</span> {inviter} te invita
            </p>
          ) : (
            <Tag>RETIRO CATÓLICO JUVENIL · JAR · ROSARIO</Tag>
          )}
          <h1 id="inicio-title" className="hero-title">
            <span className="hero-line">{copy.opening[0]}</span>{" "}
            <span className="hero-line hero-accent">
              <em>{copy.opening[1]}</em>
            </span>
          </h1>
          <p className="hero-lead">
            Casiciaco: tres días en Rosario para jóvenes de {retreat.age.min} a{" "}
            {retreat.age.max}. <strong>13—15 de noviembre.</strong>
          </p>
          <Countdown compact />
          <SoundHint />
        </div>
        <a className="scroll-hint" href="#ruido">
          <span>Deslizá</span>
          <Arrow />
        </a>
      </Scene>

      <Scene id="ruido" className="noise" pin>
        <div className="noise-field" aria-hidden="true">
          {[copy.noise.slice(0, 4), copy.noise.slice(4)].map((words, row) => (
            <div className={"noise-row row-" + row} key={row}>
              <div className="marquee-track" data-marquee>
                {[0, 1].map((copyIndex) => (
                  <div className="marquee-copy" key={copyIndex}>
                    {words.map((word) => (
                      <span key={word}>
                        {word}
                        <i>✳</i>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <ol
          className="notifications"
          aria-label="Notificaciones de un día cualquiera"
        >
          {notifications.map((item, index) => (
            <li
              key={item.text}
              data-notification
              style={
                {
                  "--at": (
                    (index + 0.6) /
                    (notifications.length + 1.5)
                  ).toFixed(3),
                  // Scattered, newest on top: only the latest one is fully readable.
                  "--y": (((index * 37) % 100) / 100).toFixed(2),
                } as Vars
              }
            >
              <strong>{item.app}</strong>
              <span>{item.text}</span>
              <small>ahora</small>
            </li>
          ))}
        </ol>
        <div className="noise-content">
          <Tag>ENTRE TANTAS COSAS POR HACER</Tag>
          <h2 id="ruido-title">
            Todo el día <span>a mil.</span>
          </h2>
          <p className="noise-end">
            ¿Y en algún momento… <strong>{copy.noiseEnd.toLowerCase()}</strong>?
          </p>
        </div>
      </Scene>

      <Scene id="silencio" className="silence" dark>
        <HoldToSilence />
      </Scene>

      <div className="after-silence">
        <Scene id="agustin" className="augustine" dark>
          <div className="augustine-portrait" data-reveal>
            <Image
              src="/images/saint-augustine-champaigne.webp"
              alt="San Agustín con un corazón encendido, pintura de Philippe de Champaigne"
              fill
              sizes="(min-width: 900px) 42vw, 92vw"
              quality={85}
            />
            <p className="portrait-caption">
              San Agustín · Philippe de Champaigne · c. 1645
            </p>
          </div>
          <div className="augustine-content">
            <Tag>ANTES DE SER SANTO</Tag>
            <Rise id="agustin-title" lines={copy.augustine} className="serif" />
            <p className="slide-description" data-reveal>
              Un pibe con preguntas, como vos.
            </p>
          </div>
        </Scene>

        <Scene id="historia" className="timeline" dark pin data-timeline>
          <div className="timeline-head">
            <Tag>LA BÚSQUEDA DE AGUSTÍN</Tag>
            <h2 id="historia-title" className="sr-only">
              La búsqueda de Agustín, del año 354 al 386
            </h2>
            <div className="timeline-bar" aria-hidden="true">
              <span />
            </div>
          </div>
          <ol className="timeline-track" data-track>
            {retreat.timeline.map((stop, index) => (
              <li
                key={stop.title}
                className={
                  "stop" +
                  (index === retreat.timeline.length - 1 ? " stop-final" : "")
                }
                style={{ "--i": index } as Vars}
              >
                <span className="stop-year">{stop.year}</span>
                <span className="stop-place">{stop.place}</span>
                <h3>{stop.title}</h3>
                <p>{stop.text}</p>
              </li>
            ))}
          </ol>
        </Scene>

        <Scene id="corazon" className="heart-scene" dark pin>
          <div className="heart" data-heart aria-hidden="true">
            <svg viewBox="0 0 100 90">
              <path d="M50 86 C20 64 4 48 4 28 A22 22 0 0 1 50 16 A22 22 0 0 1 96 28 C96 48 80 64 50 86Z" />
            </svg>
          </div>
          <figure className="quote">
            <blockquote>
              <p id="corazon-title">
                {quoteWords.map((word, index) => (
                  <span
                    key={index}
                    style={
                      { "--at": (index / quoteWords.length).toFixed(3) } as Vars
                    }
                  >
                    {word}{" "}
                  </span>
                ))}
              </p>
            </blockquote>
            <figcaption>{copy.quoteSource}</figcaption>
          </figure>
        </Scene>

        <Scene id="vos" className="choice-scene">
          <div className="choice-intro">
            <Tag>{copy.choice.title.toUpperCase()}</Tag>
            <Rise id="vos-title" lines={["¿Qué te gustaría", "encontrar?"]} />
            <p className="slide-description" data-reveal>
              Elegí lo que te resuene. Lo vamos a tener en cuenta al final.
            </p>
          </div>
          <Choice />
        </Scene>

        <Scene id="tres-dias" className="days">
          <div className="days-heading">
            <Tag>ESTO ES CASICIACO</Tag>
            <Rise id="tres-dias-title" lines={copy.room} />
            <p className="moments" data-reveal>
              {copy.moments.map((moment, index) => (
                <span key={moment} style={{ "--i": index } as Vars}>
                  {moment}
                </span>
              ))}
            </p>
          </div>
          <ol className="day-cards">
            {retreat.days.map((day, index) => (
              <li
                key={day}
                className={"day-card day-" + index}
                style={{ "--i": index } as Vars}
              >
                <h3 className="day-name">{day}</h3>
                <span className="day-mystery" aria-hidden="true">
                  ?
                </span>
              </li>
            ))}
          </ol>
          <p className="days-teaser" data-reveal>
            {retreat.daysTeaser}
          </p>
        </Scene>

        <Scene id="jesus" className="encounter" dark pin>
          <div className="encounter-media">
            <Image
              src="/images/encounter.webp"
              alt=""
              fill
              sizes="100vw"
              quality={85}
            />
          </div>
          <div className="encounter-dark" aria-hidden="true" />
          <div className="encounter-content">
            <Rise id="jesus-title" lines={copy.jesus} className="serif" />
            <p className="encounter-hint" aria-hidden="true">
              Seguí deslizando <Arrow />
            </p>
          </div>
        </Scene>

        {videos.length > 0 && (
          <Scene id="voces" className="voices">
            <Tag>EN PRIMERA PERSONA</Tag>
            <Rise id="voces-title" lines={["Ellos ya", "lo vivieron."]} />
            <TestimonialGallery items={videos} />
          </Scene>
        )}

        {questions.length > 0 && (
          <Scene id="dudas" className="doubts">
            <div className="doubts-heading">
              <Tag>SIN VUELTAS</Tag>
              <Rise
                id="dudas-title"
                lines={["Lo que capaz", "te estás preguntando."]}
              />
            </div>
            <div className="faq">
              {questions.map((question) => (
                <details key={question.question} data-reveal>
                  <summary>
                    {question.question}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{question.answer}</p>
                </details>
              ))}
            </div>
          </Scene>
        )}

        <Scene id="invitacion" className="invitation">
          <div className="invitation-intro">
            <Tag>CASICIACO #{retreat.edition} · JAR · ROSARIO</Tag>
            <Rise
              id="invitacion-title"
              lines={copy.invitation}
              className="invitation-title"
            />
            <InvitationLine />
            <div className="date-lockup" data-reveal>
              <strong>13—15</strong>
              <span>
                NOVIEMBRE {retreat.dates.year}
                <br />
                De {retreat.age.min} a {retreat.age.max} años
              </span>
            </div>
            <Countdown />
          </div>
          <div className="invitation-details">
            <InvitationActions />
            <details className="practical">
              <summary>
                Lo que necesitás saber <span aria-hidden="true">+</span>
              </summary>
              <PracticalDetails />
            </details>
          </div>
        </Scene>

        <Scene id="compartir" className="share-scene">
          <div className="share-heading">
            <Tag>PASALA</Tag>
            <Rise
              id="compartir-title"
              lines={["¿Conocés a alguien", "que lo necesita?"]}
            />
            <p className="slide-description" data-reveal>
              Vayas o no, podés invitar. Subí una placa a tu historia o mandá la
              invitación a tus grupos.
            </p>
          </div>
          <ShareStudio />
          <footer className="invitation-footer">
            <p>
              {retreat.organization.name} · {retreat.organization.order}
              <br />
              {retreat.organization.parish} · {retreat.organization.city}
            </p>
            <a href="#inicio">
              Volver arriba <Arrow direction="up" />
            </a>
          </footer>
        </Scene>
      </div>
    </ExperienceRuntime>
  );
}
