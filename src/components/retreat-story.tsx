import Image from "next/image";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { retreat } from "@/config/retreat";
import { ExperienceRuntime } from "@/components/experience-runtime";
import {
  Choice,
  Countdown,
  HoldToSilence,
  InvitationActions,
  InvitationLine,
  PracticalDetails,
  RestartButton,
  ShareStudio,
  StartButton,
} from "@/components/interactions";
import {
  TestimonialBubble,
  TestimonialStories,
} from "@/components/testimonials";
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
  const questions = retreat.questions.filter((question) => question.approved);
  const notifications = copy.notifications;
  const augustine = copy.augustine;
  const jesus = copy.jesus;
  const organization = retreat.organization;
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
        </div>
        <StartButton />
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
          {notifications.map((item, index) => {
            // They pile up during the first two thirds of the scene.
            const at = (0.03 + index * 0.06).toFixed(3);
            return (
              <li
                key={item.text}
                data-notification
                data-at={at}
                style={
                  {
                    "--at": at,
                    // Scattered, newest on top: only the latest one is fully readable.
                    "--y": (((index * 37) % 100) / 100).toFixed(2),
                  } as Vars
                }
              >
                <strong>{item.app}</strong>
                <span>{item.text}</span>
                <small>ahora</small>
              </li>
            );
          })}
        </ol>
        <div className="noise-content">
          <Tag>ENTRE TANTAS COSAS POR HACER</Tag>
          <h2 id="ruido-title">
            Todo el día <span>a mil.</span>
          </h2>
        </div>
        {/* Shown by the runtime when the visitor stops scrolling for a few seconds. */}
        <p className="scroll-nudge" aria-hidden="true">
          Seguí deslizando <Arrow />
        </p>
        {/* Everything else fades away so this can be read. */}
        <p className="noise-end">
          {copy.noiseEnd.lines.map((line, index) => (
            <span key={line} style={{ "--i": index } as Vars}>
              {line}{" "}
            </span>
          ))}
          <em style={{ "--i": copy.noiseEnd.lines.length } as Vars}>
            {copy.noiseEnd.emphasis}
          </em>
        </p>
      </Scene>

      <Scene id="silencio" className="silence" dark>
        <HoldToSilence />
      </Scene>

      <div className="after-silence">
        <Scene id="agustin" className="augustine" dark>
          <p className="augustine-era" data-reveal>
            <span>{augustine.era.before}</span>{" "}
            <strong>{augustine.era.number}</strong>{" "}
            <span>{augustine.era.after}</span>
          </p>
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
            <Rise
              id="agustin-title"
              lines={augustine.title}
              className="serif"
            />
            <ul className="life-list">
              {augustine.life.map((line, index) => (
                <li key={line} data-reveal style={{ "--i": index } as Vars}>
                  {line}
                </li>
              ))}
            </ul>
            <p className="augustine-search" data-reveal>
              {augustine.search[0]} <strong>{augustine.search[1]}</strong>
            </p>
          </div>
          <p className="augustine-ache" data-reveal>
            <span>{augustine.ache[0]}</span>
            <em>{augustine.ache[1]}</em>
          </p>
        </Scene>

        <Scene id="vos" className="choice-scene">
          <div className="choice-intro">
            <Tag>{copy.choice.title.toUpperCase()}</Tag>
            <Rise id="vos-title" lines={["¿Qué te gustaría", "encontrar?"]} />
          </div>
          <Choice />
        </Scene>

        <Scene id="tres-dias" className="days">
          <div className="days-heading">
            <Tag>ESTO ES CASICIACO</Tag>
            <Rise id="tres-dias-title" lines={copy.room} />
            <ul className="room-list" data-reveal>
              {copy.moments.map((moment, index) => (
                <li key={moment} style={{ "--i": index } as Vars}>
                  {moment}
                </li>
              ))}
            </ul>
            <p className="room-god" data-reveal>
              <span>{copy.roomGod[0]}</span> <em>{copy.roomGod[1]}</em>
            </p>
          </div>
          <ol className="day-cards">
            {retreat.days.map((day, index) => (
              <li
                key={day}
                className={"day-card day-" + index}
                style={{ "--i": index } as Vars}
                data-reveal
              >
                <h3 className="day-name">{day}</h3>
                <span className="day-mystery" aria-hidden="true">
                  <span className="mystery-ghost">?</span>
                  <span className="mystery-ghost">?</span>
                  <span className="mystery-mark">?</span>
                </span>
              </li>
            ))}
          </ol>
        </Scene>

        <Scene id="secreto" className="secret" dark data-progress="flow">
          <div className="secret-inner">
            <p className="secret-lead">{copy.secret.lead}</p>
            <h2 id="secreto-title" className="secret-title">
              <span>{copy.secret.lines[0]}</span>{" "}
              <em>{copy.secret.lines[1]}</em>
            </h2>
          </div>
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
            <p className="eyebrow encounter-tag">{jesus.tag}</p>
            <h2 id="jesus-title" className="encounter-title">
              <span>{jesus.title[0]}</span> <em>{jesus.title[1]}</em>
            </h2>
            <p className="encounter-hint" aria-hidden="true">
              Seguí deslizando <Arrow />
            </p>
          </div>
        </Scene>

        <Scene id="conocerlo" className="knowing" dark>
          <div className="knowing-free">
            {jesus.free.map((line) => (
              <p key={line} data-reveal>
                {line}
              </p>
            ))}
          </div>
          <ul className="knowing-verbs">
            {jesus.verbs.map((verb, index) => (
              <li key={verb} data-reveal style={{ "--i": index } as Vars}>
                {verb}
              </li>
            ))}
          </ul>
          <div className="knowing-discover" data-progress="flow">
            <p id="conocerlo-title">
              <span>{jesus.discover.before}</span>{" "}
              <mark>{jesus.discover.emphasis}</mark>{" "}
              <span>{jesus.discover.after}</span>
            </p>
          </div>
        </Scene>

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
            <TestimonialBubble />
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
        </Scene>

        <Scene id="historias" className="stories-scene" dark>
          <div className="stories-heading">
            <Tag>HISTORIAS DE CASICIACO</Tag>
            <Rise id="historias-title" lines={["Ellos ya", "lo vivieron."]} />
          </div>
          <TestimonialStories />
        </Scene>

        <footer className="site-footer">
          <Image
            className="footer-logo"
            src="/images/jar-logo.webp"
            alt={`${organization.short} · ${organization.name}`}
            width={720}
            height={493}
            sizes="180px"
          />
          <p className="footer-motto">
            «Una sola alma y un solo corazón hacia Dios»
            <small>Regla de San Agustín</small>
          </p>
          <p className="footer-org">
            Organiza la <strong>{organization.name}</strong>
            <br />
            {organization.order} · {organization.parish} · {organization.city}
          </p>
          <RestartButton />
        </footer>
      </div>
    </ExperienceRuntime>
  );
}
