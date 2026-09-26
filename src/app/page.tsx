import Image from "next/image";
import type { ReactNode } from "react";
import { retreat, approvedTestimonials, publicUrl } from "@/config/retreat";
import { ExperienceRuntime } from "@/components/experience-runtime";
import {
  Choice,
  InvitationActions,
  TestimonialGallery,
} from "@/components/interactions";
import { Arrow, AugustineArt, Scribble, Spark } from "@/components/marks";
const c = retreat.copy;
function Scene({
  id,
  n,
  className,
  chapter,
  light = false,
  children,
}: {
  id: string;
  n: string;
  className: string;
  chapter: string;
  light?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scene ${className}`}
      data-scene
      data-chapter={chapter}
      data-tone={light ? "light" : "dark"}
      aria-labelledby={`${id}-title`}
    >
      <span className="scene-index" aria-hidden="true">
        {n} / LA INQUIETUD
      </span>
      {children}
    </section>
  );
}
function Next({ to, text = "Seguí bajando" }: { to: string; text?: string }) {
  return (
    <a className="next-scene" href={`#${to}`}>
      <span>{text}</span>
      <Arrow />
    </a>
  );
}
function Kicker({ children }: { children: ReactNode }) {
  return <p className="kicker">{children}</p>;
}
export default function Home() {
  const videos = approvedTestimonials();
  const questions = retreat.questions.filter((q) => q.approved);
  const contact = publicUrl(retreat.contactUrl);
  return (
    <>
      <ExperienceRuntime />
      <main>
        <Scene id="inicio" n="01" className="hero" chapter="LA INQUIETUD">
          <div className="hero-photo">
            <Image
              src="/images/forest.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 900px) 55vw, 100vw"
            />
          </div>
          <div className="hero-orbit" aria-hidden="true" />
          <div className="hero-content">
            <Kicker>Un encuentro. Muchas preguntas.</Kicker>
            <h1 id="inicio-title">
              <span>{c.opening[0]}</span>
              <em>{c.opening[1]}</em>
            </h1>
            <Scribble />
            <p className="hero-note">
              Quizás el camino
              <br />
              empieza por acá.
            </p>
          </div>
          <Spark className="hero-spark" />
          <div className="hero-edition" aria-hidden="true">
            <span>EDICIÓN</span>
            <strong>45</strong>
          </div>
          <Next to="ruido" />
          <p className="hero-date">
            {retreat.dates.days} NOV / {retreat.dates.year}
          </p>
        </Scene>
        <Scene
          id="ruido"
          n="02"
          className="noise"
          chapter="TODO A LA VEZ"
          light
        >
          <h2 id="ruido-title" className="sr-only">
            Todo lo que estás buscando
          </h2>
          <div className="noise-words" aria-hidden="true">
            {c.noise.map((word, i) => (
              <span key={word} className={`noise-word word-${i}`}>
                {word}
              </span>
            ))}
          </div>
          <p className="sr-only">{c.noise.join(" ")}</p>
          <div className="noise-anchor">
            <Spark />
            <p>{c.noiseEnd}</p>
            <Scribble />
          </div>
          <Next to="pausa" text="Y en medio de todo…" />
        </Scene>
        <Scene
          id="pausa"
          n="03"
          className="pause"
          chapter="BAJAR EL RUIDO"
          light
        >
          <span className="small-sun" aria-hidden="true" />
          <div className="center-copy">
            <p className="prelude">{c.pause[0]}</p>
            <h2 id="pausa-title">
              {c.pause[1].split(" ")[0]}
              <br />
              <em>{c.pause[1].split(" ")[1]}</em>
            </h2>
          </div>
          <div className="horizon" aria-hidden="true" />
          <Next to="preguntas" />
        </Scene>
        <Scene
          id="preguntas"
          n="04"
          className="questions-scene"
          chapter="HACER UNA PAUSA"
        >
          <div className="photo-backdrop">
            <Image src="/images/light.webp" alt="" fill sizes="100vw" />
          </div>
          <div className="center-copy">
            <Kicker>Un momento para vos</Kicker>
            <h2 id="preguntas-title">
              {c.scrolling[0]}
              <br />
              <span className="plain-line">{c.scrolling[1]}</span>
              <br />
              <em>{c.scrolling[2]}</em>
            </h2>
          </div>
          <Next to="agustin" />
        </Scene>
        <Scene
          id="agustin"
          n="05"
          className="augustine"
          chapter="NO SOS EL PRIMERO"
          light
        >
          <div className="augustine-copy">
            <Kicker>{c.augustine[0]}</Kicker>
            <h2 id="agustin-title">
              {c.augustine[1]}
              <br />
              <em>{c.augustine[2]}</em>
            </h2>
          </div>
          <AugustineArt />
          <span className="art-note" aria-hidden="true">
            Una inquietud que atraviesa el tiempo.
          </span>
          <Next to="busqueda" />
        </Scene>
        <Scene
          id="busqueda"
          n="06"
          className="biography"
          chapter="SEGUIR BUSCANDO"
          light
        >
          <h2 id="busqueda-title" className="sr-only">
            El camino de Agustín
          </h2>
          <ol className="bio-lines">
            {c.journey.map((line, i) => (
              <li key={line}>
                <span className="bio-number">0{i + 1}</span>
                <span>{line}</span>
                {i === 3 && <Scribble />}
              </li>
            ))}
          </ol>
          <Next to="casiciaco" />
        </Scene>
        <Scene
          id="casiciaco"
          n="07"
          className="name-reveal"
          chapter="UN LUGAR PARA ENCONTRARSE"
        >
          <div className="photo-backdrop">
            <Image src="/images/forest.webp" alt="" fill sizes="100vw" />
          </div>
          <div className="name-intro">
            <p>
              {c.cassiciacum[0]}
              <br />
              {c.cassiciacum[1]}
              <br />
              {c.cassiciacum[2]}
            </p>
            <p className="kicker">{c.cassiciacum[3]}</p>
          </div>
          <div className="name-lockup">
            <Spark />
            <h2 id="casiciaco-title">
              CASI<span>CIACO.</span>
            </h2>
            <Scribble />
          </div>
          <Next to="corazon" />
        </Scene>
        <Scene
          id="corazon"
          n="08"
          className="quote-scene"
          chapter="EL CORAZÓN INQUIETO"
          light
        >
          <span className="quote-mark" aria-hidden="true">
            “
          </span>
          <h2 id="corazon-title" className="sr-only">
            El corazón inquieto
          </h2>
          <figure>
            <blockquote>
              {c.quote.split("inquieto")[0]}
              <em>inquieto</em>
              {c.quote.split("inquieto")[1]}
            </blockquote>
            <figcaption>
              San Agustín<span>Confesiones, I, 1, 1</span>
            </figcaption>
          </figure>
          <Spark />
          <Next to="vos" />
        </Scene>
        <Scene
          id="vos"
          n="09"
          className="choice-scene"
          chapter="TU PROPIA BÚSQUEDA"
          light
        >
          <div className="choice-intro">
            <Kicker>La pregunta sigue abierta.</Kicker>
            <h2 id="vos-title">
              ¿Y <em>vos?</em>
            </h2>
            <p>{c.choice.question}</p>
          </div>
          <Choice />
          <Next to="tres-dias" />
        </Scene>
        <Scene
          id="tres-dias"
          n="10"
          className="room-scene"
          chapter="HACER LUGAR"
          light
        >
          <div className="room-top">
            <Kicker>Una invitación a parar</Kicker>
            <h2 id="tres-dias-title">
              {c.room[0]}
              <br />
              {c.room[1].replace("lugar.", "")}
              <br />
              <em>lugar.</em>
            </h2>
          </div>
          <div className="moments">
            {c.moments.map((line, i) => (
              <p key={line}>
                <span aria-hidden="true">{["↗", "✳", "↗"][i]}</span>
                {line}
              </p>
            ))}
          </div>
          <div className="room-rings" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <Next to="jesus" />
        </Scene>
        <Scene id="jesus" n="11" className="jesus-scene" chapter="UN ENCUENTRO">
          <div className="cross-art" aria-hidden="true">
            <i />
            <b />
          </div>
          <div className="jesus-copy">
            <h2 id="jesus-title">
              {c.jesus[0]}
              <br />
              <em>{c.jesus[1]}</em>
            </h2>
            <p>{c.description}</p>
          </div>
          <Next to="fecha" />
        </Scene>
        <Scene
          id="fecha"
          n="12"
          className="date-scene"
          chapter="RESERVATE ESTOS DÍAS"
          light
        >
          <Kicker>CASICIACO #{retreat.edition}</Kicker>
          <h2 id="fecha-title" className="date-heading">
            {retreat.dates.days.split(" · ").map((day, i) => (
              <span key={day}>
                {day}
                {i === 2 && <Spark />}
              </span>
            ))}
          </h2>
          <div className="date-month">
            <strong>{retreat.dates.month}</strong>
            <span>{retreat.dates.year}</span>
          </div>
          <p className="age-line">
            DE {retreat.age.min} A {retreat.age.max} AÑOS
          </p>
          <div className="organizer">
            <span className="jar-mark">
              JAR<span>↗</span>
            </span>
            <p>
              {retreat.organization.name}
              <br />
              {retreat.organization.order}
              <br />
              {retreat.organization.parish}
              <br />
              {retreat.organization.city}
            </p>
          </div>
          <Next
            to={
              videos.length
                ? "voces"
                : questions.length
                  ? "dudas"
                  : "invitacion"
            }
            text="Date lugar"
          />
        </Scene>
        {videos.length > 0 && (
          <Scene
            id="voces"
            n="13"
            className="voices-scene"
            chapter="OTRAS VOCES"
            light
          >
            <Kicker>En primera persona</Kicker>
            <h2 id="voces-title">
              Ellos ya
              <br />
              lo <em>vivieron.</em>
            </h2>
            <TestimonialGallery items={videos} />
          </Scene>
        )}
        {questions.length > 0 && (
          <Scene
            id="dudas"
            n="14"
            className="doubts-scene"
            chapter="PODÉS PREGUNTAR"
            light
          >
            <Kicker>Sin vueltas</Kicker>
            <h2 id="dudas-title">
              ¿Será
              <br />
              para <em>mí?</em>
            </h2>
            <div className="quick-questions">
              {questions.map((q) => (
                <details key={q.question}>
                  <summary>
                    {q.question}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{q.answer}</p>
                </details>
              ))}
            </div>
            <Next to="invitacion" />
          </Scene>
        )}
        <Scene
          id="invitacion"
          n="15"
          className="invitation"
          chapter="EL CAMINO EMPIEZA ACÁ"
        >
          <div className="invitation-top">
            <Kicker>CASICIACO #{retreat.edition}</Kicker>
            <h2 id="invitacion-title">
              {c.invitation[0]}
              <br />
              <em>{c.invitation[1]}</em>
            </h2>
            <Spark />
            <Scribble />
          </div>
          <p className="final-date">
            {retreat.dates.days} NOVIEMBRE {retreat.dates.year}
            <span>
              De {retreat.age.min} a {retreat.age.max} años
            </span>
          </p>
          <InvitationActions />
          <details className="practical">
            <summary>
              Información práctica <span aria-hidden="true">+</span>
            </summary>
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
                <dd>
                  {retreat.schedule || "A confirmar por la organización."}
                </dd>
              </div>
            </dl>
            {retreat.practicalNotes && <p>{retreat.practicalNotes}</p>}
            {contact && (
              <a className="text-button" href={contact}>
                Consultar a JAR <Arrow direction="up-right" />
              </a>
            )}
          </details>
          <footer>
            <p>
              JAR · {retreat.organization.order}
              <br />
              {retreat.organization.parish}
              <br />
              {retreat.organization.city}
            </p>
            <a href="#inicio">
              Volver al comienzo <Arrow direction="up-right" />
            </a>
          </footer>
        </Scene>
      </main>
    </>
  );
}
