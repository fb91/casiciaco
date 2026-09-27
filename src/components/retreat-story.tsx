import Image from "next/image";
import type { ReactNode } from "react";
import { retreat, approvedTestimonials } from "@/config/retreat";
import { ExperienceRuntime } from "@/components/experience-runtime";
import {
  Choice,
  InvitationActions,
  PracticalInfo,
  TestimonialGallery,
} from "@/components/interactions";
import { Arrow } from "@/components/marks";

function Scene({
  id,
  className,
  light = false,
  previous,
  children,
}: {
  id: string;
  className: string;
  light?: boolean;
  previous?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={"scene " + className}
      data-scene
      data-theme={light ? "light" : "dark"}
      aria-labelledby={id + "-title"}
    >
      <div className="slide-shell">
        {previous && (
          <a
            className="back-link"
            href={"#" + previous}
            data-next={previous}
            aria-label="Volver a la pantalla anterior"
          >
            <span aria-hidden="true">←</span> Atrás
          </a>
        )}
        {children}
      </div>
    </section>
  );
}
function Next({
  to,
  children,
  first = false,
}: {
  to: string;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <div className={"slide-action" + (first ? " first-action" : "")}>
      {first && (
        <p className="tap-hint">
          <span aria-hidden="true">↓</span> Tocá el botón para empezar
        </p>
      )}
      <a className="next-cta" href={"#" + to} data-next={to}>
        <span>{children}</span>
        <span className="cta-arrow">
          <Arrow />
        </span>
      </a>
      <span className="action-caption">
        {first
          ? "Después, seguí con el botón de cada pantalla."
          : "TOCÁ PARA SEGUIR"}
      </span>
    </div>
  );
}
function Tag({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function RetreatStory() {
  const videos = approvedTestimonials();
  const questions = retreat.questions.filter((question) => question.approved);
  return (
    <ExperienceRuntime
      total={8 + Number(videos.length > 0) + Number(questions.length > 0)}
    >
      <Scene id="inicio" className="hero" light>
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
        <div className="slide-content hero-content">
          <Tag>RETIRO CATÓLICO JUVENIL · JAR · ROSARIO</Tag>
          <h1 id="inicio-title" tabIndex={-1}>
            Un finde
            <br />
            <span className="highlight">para vos.</span>
          </h1>
          <p className="slide-description">
            Para disfrutar, crecer, conocer más de Jesús
            <br className="desktop-break" /> y hacer nuevos amigos.
          </p>
          <p className="date-chip">
            13—15 NOV <span>{retreat.dates.year}</span>
          </p>
        </div>
        <span className="hero-sticker" aria-hidden="true">
          UN FINDE
          <br />
          DIFERENTE.
        </span>
        <Next to="ruido" first>
          Dale, contame más
        </Next>
      </Scene>

      <Scene id="ruido" className="noise" light previous="inicio">
        <div className="noise-field" aria-hidden="true">
          {[
            ["ESTUDIAR", "LABURAR", "EL FUTURO", "LLEGAR A TODO"],
            ["LOS PLANES", "LAS REDES", "ENCAJAR", "NO PARAR"],
          ].map((words, index) => (
            <div className={"noise-row row-" + index} key={index}>
              <div className="marquee-track">
                {[0, 1].map((copy) => (
                  <div className="marquee-copy" key={copy}>
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
        <div className="slide-content noise-content">
          <Tag>ENTRE TANTAS COSAS POR HACER</Tag>
          <h2 id="ruido-title" tabIndex={-1}>
            Todo el día
            <br />
            <span>a mil.</span>
          </h2>
          <p className="slide-description">
            Estudiar, laburar, cumplir con todo… A veces cuesta encontrar un
            rato para pensar cómo estamos y qué queremos.
          </p>
          <p className="small-note">
            Y esto no pasa solo hoy. San Agustín también fue un joven en busca
            de su camino.
          </p>
        </div>
        <Next to="agustin">Conocer la historia de Agustín</Next>
      </Scene>

      <Scene id="agustin" className="augustine" previous="ruido">
        <div className="scene-media augustine-portrait">
          <Image
            src="/images/saint-augustine-champaigne.webp"
            alt="San Agustín con un corazón encendido, pintura de Philippe de Champaigne"
            fill
            sizes="(min-width: 900px) 60vw, 90vh"
            quality={85}
          />
        </div>
        <div className="portrait-shade" />
        <div className="slide-content augustine-content">
          <Tag>ANTES DE SER SANTO, TAMBIÉN BUSCABA SU CAMINO</Tag>
          <h2 id="agustin-title" tabIndex={-1}>
            Agustín también
            <br />
            <span>buscaba más.</span>
          </h2>
          <p className="slide-description">
            Hace más de 1600 años, estudiaba, enseñaba y se preguntaba qué hacer
            con su vida.
          </p>
          <p className="small-note">Esa búsqueda lo acercó a Dios.</p>
        </div>
        <p className="portrait-caption">
          SAN AGUSTÍN · PHILIPPE DE CHAMPAIGNE · C. 1645
        </p>
        <Next to="casiciaco">Seguir: ¿qué hizo después?</Next>
      </Scene>

      <Scene id="casiciaco" className="reveal" previous="agustin">
        <div className="scene-media retreat-media">
          <Image
            src="/images/cassiciacum.webp"
            alt=""
            fill
            sizes="(max-width: 899px) 180vh, 100vw"
            quality={85}
          />
        </div>
        <div className="image-shade" />
        <div className="slide-content reveal-content">
          <Tag>UN CAMBIO DE RITMO</Tag>
          <h2 id="casiciaco-title" tabIndex={-1}>
            Paró.
            <br />
            <span>Y no fue solo.</span>
          </h2>
          <p className="slide-description">
            Después de su conversión, se fue al campo con familiares y amigos.
            Ese lugar se llamaba <strong>Casiciaco.</strong>
          </p>
          <p className="name-sticker">
            De ahí viene el nombre de este retiro.{" "}
            <span aria-hidden="true">↗</span>
          </p>
        </div>
        <Next to="vos">Ahora te toca a vos</Next>
      </Scene>

      <Scene id="vos" className="choice-scene" light previous="casiciaco">
        <div className="slide-content choice-content">
          <div className="choice-intro">
            <Tag>UN MOMENTO PARA VOS</Tag>
            <h2 id="vos-title" tabIndex={-1}>
              ¿Qué te gustaría
              <br />
              <span>encontrar?</span>
            </h2>
            <p className="slide-description">
              Elegí lo que te resuene.
              <br />
              También podés seguir sin elegir.
            </p>
          </div>
          <Choice />
        </div>
        <Next to="tres-dias">Ver qué propone el retiro</Next>
      </Scene>

      <Scene id="tres-dias" className="moments-scene" light previous="vos">
        <div className="slide-content moments-content">
          <div className="moments-heading">
            <Tag>ESTO ES CASICIACO</Tag>
            <h2 id="tres-dias-title" tabIndex={-1}>
              Tres días.
              <br />
              <span>Otro ritmo.</span>
            </h2>
            <p className="slide-description">
              Alegría, mates y tiempo para compartir.
            </p>
          </div>
          <div className="moment-cards">
            <div className="moment-card moment-one">
              <span className="card-symbol" aria-hidden="true">
                ☺
              </span>
              <span>
                Alegría
                <br />
                <strong>y mates.</strong>
              </span>
            </div>
            <div className="moment-card moment-two">
              <span className="card-symbol" aria-hidden="true">
                ♫
              </span>
              <span>
                Música
                <br />
                <strong>y amigos.</strong>
              </span>
            </div>
            <div className="moment-card moment-three">
              <span className="card-symbol" aria-hidden="true">
                ◌
              </span>
              <span>
                Tiempo
                <br />
                <strong>para crecer.</strong>
              </span>
            </div>
          </div>
        </div>
        <Next to="jesus">¿Y qué lugar tiene la fe?</Next>
      </Scene>

      <Scene id="jesus" className="jesus-scene" previous="tres-dias">
        <div className="scene-media encounter-media">
          <Image
            src="/images/encounter.webp"
            alt=""
            fill
            sizes="(max-width: 899px) 180vh, 100vw"
            quality={85}
          />
        </div>
        <div className="image-shade" />
        <div className="slide-content jesus-content">
          <Tag>EL CENTRO DEL RETIRO</Tag>
          <h2 id="jesus-title" tabIndex={-1}>
            Un encuentro
            <br />
            <span>con Jesús.</span>
          </h2>
          <p className="slide-description">
            Entre las charlas, la música y los mates, también hay lugar para
            conocer más de Jesús. Para compartir la fe y crecer juntos.
          </p>
        </div>
        <Next
          to={
            videos.length ? "voces" : questions.length ? "dudas" : "invitacion"
          }
        >
          {videos.length
            ? "Escuchar a quienes fueron"
            : questions.length
              ? "Ver algunas preguntas"
              : "Ver fechas y cómo sumarme"}
        </Next>
      </Scene>

      {videos.length > 0 && (
        <Scene id="voces" className="voices-scene" light previous="jesus">
          <div className="slide-content">
            <Tag>EN PRIMERA PERSONA</Tag>
            <h2 id="voces-title" tabIndex={-1}>
              Ellos ya
              <br />
              <span>lo vivieron.</span>
            </h2>
            <TestimonialGallery items={videos} />
          </div>
          <Next to={questions.length ? "dudas" : "invitacion"}>
            Ver cómo sumarme
          </Next>
        </Scene>
      )}
      {questions.length > 0 && (
        <Scene
          id="dudas"
          className="doubts-scene"
          light
          previous={videos.length ? "voces" : "jesus"}
        >
          <div className="slide-content">
            <Tag>SIN VUELTAS</Tag>
            <h2 id="dudas-title" tabIndex={-1}>
              Podés
              <br />
              <span>preguntar.</span>
            </h2>
            <div className="quick-questions">
              {questions.map((question) => (
                <div key={question.question}>
                  <h3>{question.question}</h3>
                  <p>{question.answer}</p>
                </div>
              ))}
            </div>
          </div>
          <Next to="invitacion">Ver la invitación</Next>
        </Scene>
      )}

      <Scene
        id="invitacion"
        className="invitation"
        light
        previous={
          questions.length ? "dudas" : videos.length ? "voces" : "jesus"
        }
      >
        <div className="slide-content invitation-content">
          <div className="invitation-intro">
            <Tag>CASICIACO #{retreat.edition} · JAR · ROSARIO</Tag>
            <h2 id="invitacion-title" tabIndex={-1}>
              ¿Te
              <br className="desktop-break" />
              <span> sumás?</span>
            </h2>
            <p className="slide-description">
              Regalate un finde diferente.
              <br />
              ¡Te esperamos!
            </p>
          </div>
          <div className="invitation-details">
            <div className="date-lockup">
              <strong>13—15</strong>
              <span>NOVIEMBRE {retreat.dates.year}</span>
            </div>
            <p className="age-line">
              De {retreat.age.min} a {retreat.age.max} años · Retiro católico
              juvenil
            </p>
            <InvitationActions />
            <PracticalInfo />
          </div>
        </div>
        <footer className="invitation-footer">
          <p>
            {retreat.organization.name}
            <br />
            {retreat.organization.parish} · {retreat.organization.city}
          </p>
          <a href="#inicio" data-next="inicio">
            Volver a empezar <Arrow direction="right" />
          </a>
        </footer>
      </Scene>
    </ExperienceRuntime>
  );
}
