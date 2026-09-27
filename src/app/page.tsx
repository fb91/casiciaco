import Image from "next/image";
import type { ReactNode } from "react";
import { retreat, approvedTestimonials, publicUrl } from "@/config/retreat";
import { ExperienceRuntime } from "@/components/experience-runtime";
import {
  Choice,
  InvitationActions,
  TestimonialGallery,
} from "@/components/interactions";
import { Arrow } from "@/components/marks";

function Scene({
  id,
  chapter,
  className = "",
  children,
}: {
  id: string;
  chapter: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={"scene " + className}
      data-scene
      data-chapter={chapter}
      aria-labelledby={id + "-title"}
    >
      {children}
    </section>
  );
}
function Chapter({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <p className="chapter-label">
      <span>{number}</span>
      <span className="chapter-line" />
      {children}
    </p>
  );
}
function Continue({
  to,
  children = "Seguí el recorrido",
}: {
  to: string;
  children?: ReactNode;
}) {
  return (
    <a className="continue-link" href={"#" + to}>
      {children}
      <Arrow />
    </a>
  );
}

export default function Home() {
  const videos = approvedTestimonials();
  const questions = retreat.questions.filter((question) => question.approved);
  const contact = publicUrl(retreat.contactUrl);
  return (
    <>
      <ExperienceRuntime />
      <main>
        <Scene id="inicio" chapter="La inquietud" className="hero scene-pinned">
          <div className="scene-panel hero-panel">
            <div className="scene-media hero-media">
              <Image
                src="/images/journey.webp"
                alt=""
                fill
                preload
                sizes="(max-width: 899px) 180vh, 100vw"
                quality={85}
              />
            </div>
            <div className="hero-shade" />
            <div className="hero-topline">
              <span>UN RETIRO. UN NUEVO COMIENZO.</span>
              <span>ROSARIO, ARGENTINA</span>
            </div>
            <div className="hero-copy">
              <p className="eyebrow">
                CASICIACO #{retreat.edition} · RETIRO CATÓLICO JUVENIL
              </p>
              <h1 id="inicio-title">
                <span>¿Qué estás</span>
                <em>buscando?</em>
              </h1>
              <p className="hero-description">
                A veces, para encontrarte,
                <br />
                tenés que hacer una pausa.
              </p>
              <Continue to="ruido">Empezá el recorrido</Continue>
            </div>
            <div className="hero-bottom">
              <span>13—15 NOVIEMBRE 2026</span>
              <span>
                DESLIZÁ PARA DESCUBRIR
                <span className="scroll-line" />
              </span>
            </div>
            <span className="hero-side-note" aria-hidden="true">
              UN POCO MENOS DE RUIDO. UN POCO MÁS DE VOS.
            </span>
          </div>
        </Scene>

        <Scene
          id="ruido"
          chapter="Bajar el ruido"
          className="noise scene-pinned"
        >
          <div className="scene-panel noise-panel">
            <Chapter number="02">TODO PASA. TODO EL TIEMPO.</Chapter>
            <div className="noise-field" aria-hidden="true">
              <div className="noise-row row-one">
                <span>Estudiar.</span>
                <em>El futuro.</em>
                <span>Trabajar.</span>
                <span>Estudiar.</span>
              </div>
              <div className="noise-row row-two">
                <em>Salir.</em>
                <span>La próxima cosa.</span>
                <em>Encajar.</em>
              </div>
            </div>
            <div className="noise-center">
              <span className="tiny-orbit" aria-hidden="true" />
              <h2 id="ruido-title">
                Todo allá afuera.
                <br />
                <em>¿Y adentro?</em>
              </h2>
              <p>
                Hay preguntas que no se responden scrolleando.
                <br className="desktop-break" /> Quizás sea momento de
                escucharlas.
              </p>
            </div>
            <Continue to="agustin">No sos el primero en preguntártelo</Continue>
          </div>
        </Scene>

        <Scene
          id="agustin"
          chapter="Una búsqueda compartida"
          className="augustine scene-pinned"
        >
          <div className="scene-panel augustine-panel">
            <div className="augustine-portrait scene-media">
              <Image
                src="/images/augustine.webp"
                alt="Recreación artística de un joven Agustín junto a una ventana, mirando hacia la luz"
                fill
                sizes="(min-width: 900px) 60vw, 100vw"
                quality={85}
              />
            </div>
            <div className="portrait-shade" />
            <div className="augustine-copy">
              <Chapter number="03">UNA INQUIETUD DE 1600 AÑOS.</Chapter>
              <h2 id="agustin-title">
                Él también
                <br />
                quería <em>más.</em>
              </h2>
              <p>
                Agustín estudió. Enseñó. Cambió de ideas.
                <br />
                Tenía preguntas. Y siguió buscando.
              </p>
              <p className="augustine-emphasis">Hasta que se animó a parar.</p>
              <Continue to="casiciaco">Un lugar cambió la historia</Continue>
            </div>
            <p className="portrait-caption">
              AGUSTÍN DE HIPONA <span>RECREACIÓN ARTÍSTICA</span>
            </p>
            <span className="year-watermark" aria-hidden="true">
              386
            </span>
          </div>
        </Scene>

        <Scene
          id="casiciaco"
          chapter="Un lugar para encontrarse"
          className="reveal scene-pinned"
        >
          <div className="scene-panel reveal-panel">
            <div className="scene-media retreat-media">
              <Image
                src="/images/cassiciacum.webp"
                alt=""
                fill
                sizes="(max-width: 899px) 180vh, 100vw"
                quality={85}
              />
            </div>
            <div className="reveal-shade" />
            <Chapter number="04">HAY LUGARES QUE SON UN COMIENZO.</Chapter>
            <div className="reveal-copy">
              <p>
                Después de su conversión, se retiró al campo
                <br />
                con familiares y amigos. A un lugar llamado…
              </p>
              <h2 id="casiciaco-title">
                Casiciaco<span>.</span>
              </h2>
              <figure>
                <blockquote>
                  “Nuestro corazón está <em>inquieto</em>
                  <br />
                  hasta que descanse en ti.”
                </blockquote>
                <figcaption>SAN AGUSTÍN · CONFESIONES, I, 1, 1</figcaption>
              </figure>
            </div>
            <Continue to="vos">Ahora, la pregunta es tuya</Continue>
          </div>
        </Scene>

        <Scene id="vos" chapter="Tu propia búsqueda" className="choice-scene">
          <div className="scene-panel choice-panel">
            <Chapter number="05">NO HAY UNA RESPUESTA CORRECTA.</Chapter>
            <div className="choice-layout">
              <div className="choice-intro">
                <p className="eyebrow">UN MOMENTO PARA VOS</p>
                <h2 id="vos-title">
                  ¿Y <em>vos?</em>
                </h2>
                <p>¿Qué te gustaría encontrar?</p>
                <span className="choice-orbit" aria-hidden="true" />
              </div>
              <Choice />
            </div>
            <Continue to="tres-dias">Hacé espacio para algo nuevo</Continue>
          </div>
        </Scene>

        <Scene
          id="tres-dias"
          chapter="Hacer lugar"
          className="moments-scene scene-pinned"
        >
          <div className="scene-panel moments-panel">
            <Chapter number="06">SALIR DE LO DE SIEMPRE.</Chapter>
            <div className="moments-heading">
              <h2 id="tres-dias-title">
                Tres días.
                <br />
                <em>Hacé lugar.</em>
              </h2>
              <p>
                No necesitás tener todo resuelto.
                <br />
                Podés empezar por estar.
              </p>
            </div>
            <div className="moment-cards">
              <div className="moment-card moment-one">
                <span className="moment-number">01 / CONVERSAR</span>
                <p>
                  A una
                  <br />
                  <em>charla.</em>
                </p>
                <div className="card-lines" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="moment-card moment-two">
                <span className="moment-number">02 / ENCONTRARSE</span>
                <p>
                  A <em>otros.</em>
                </p>
                <div className="card-orbits" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="moment-card moment-three">
                <span className="moment-number">03 / ESCUCHARSE</span>
                <p>
                  A tus
                  <br />
                  <em>preguntas.</em>
                </p>
                <span className="card-question" aria-hidden="true">
                  ?
                </span>
              </div>
            </div>
            <Continue to="jesus">Y a un encuentro más profundo</Continue>
          </div>
        </Scene>

        <Scene
          id="jesus"
          chapter="Un encuentro"
          className="jesus-scene scene-pinned"
        >
          <div className="scene-panel jesus-panel">
            <div className="scene-media encounter-media">
              <Image
                src="/images/encounter.webp"
                alt=""
                fill
                sizes="(max-width: 899px) 180vh, 100vw"
                quality={85}
              />
            </div>
            <div className="encounter-shade" />
            <Chapter number="07">EL CENTRO DE ESTA INVITACIÓN.</Chapter>
            <div className="jesus-copy">
              <p className="eyebrow">
                HAY ALGUIEN QUE QUIERE ENCONTRARSE CON VOS.
              </p>
              <h2 id="jesus-title">
                Y a conocer
                <br />
                <em>a Jesús.</em>
              </h2>
              <p>
                Casiciaco es un retiro católico juvenil.
                <br />
                Un espacio para la fe, las preguntas y el encuentro.
              </p>
              <Continue
                to={
                  videos.length
                    ? "voces"
                    : questions.length
                      ? "dudas"
                      : "invitacion"
                }
              >
                Esta es tu invitación
              </Continue>
            </div>
          </div>
        </Scene>

        {videos.length > 0 && (
          <Scene id="voces" chapter="Otras voces" className="voices-scene">
            <div className="scene-panel content-panel">
              <p className="eyebrow">EN PRIMERA PERSONA</p>
              <h2 id="voces-title">
                Ellos ya
                <br />
                <em>lo vivieron.</em>
              </h2>
              <TestimonialGallery items={videos} />
            </div>
          </Scene>
        )}
        {questions.length > 0 && (
          <Scene id="dudas" chapter="Podés preguntar" className="doubts-scene">
            <div className="scene-panel content-panel">
              <p className="eyebrow">SIN VUELTAS</p>
              <h2 id="dudas-title">
                También hay lugar
                <br />
                <em>para tus dudas.</em>
              </h2>
              <div className="quick-questions">
                {questions.map((question) => (
                  <details key={question.question}>
                    <summary>
                      {question.question}
                      <span aria-hidden="true">+</span>
                    </summary>
                    <p>{question.answer}</p>
                  </details>
                ))}
              </div>
              <Continue to="invitacion">Date lugar</Continue>
            </div>
          </Scene>
        )}

        <Scene
          id="invitacion"
          chapter="El camino empieza acá"
          className="invitation"
        >
          <div className="scene-panel invitation-panel">
            <Chapter number="08">
              CASICIACO #{retreat.edition} · JAR · ROSARIO
            </Chapter>
            <div className="invitation-layout">
              <div className="invitation-title">
                <p className="eyebrow">EL PRIMER PASO PUEDE SER ESTE.</p>
                <h2 id="invitacion-title">
                  Date
                  <br />
                  <em>lugar.</em>
                </h2>
                <p>
                  Tres días para hacer una pausa.
                  <br />Y abrirte a lo que viene.
                </p>
              </div>
              <div className="invitation-details">
                <div className="date-lockup">
                  <span>13—15</span>
                  <div>
                    <strong>NOVIEMBRE</strong>
                    <span>2026</span>
                  </div>
                </div>
                <p className="age-line">
                  De {retreat.age.min} a {retreat.age.max} años <span>·</span>{" "}
                  Retiro católico juvenil
                </p>
                <InvitationActions />
                <details className="practical">
                  <summary>
                    Lo que necesitás saber<span aria-hidden="true">+</span>
                  </summary>
                  <dl>
                    <div>
                      <dt>Fecha</dt>
                      <dd>
                        {retreat.dates.days} de noviembre de{" "}
                        {retreat.dates.year}
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
                      <dd>
                        {retreat.venue || "A confirmar por la organización."}
                      </dd>
                    </div>
                    <div>
                      <dt>Costo</dt>
                      <dd>
                        {retreat.price || "A confirmar por la organización."}
                      </dd>
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
                      Consultar a JAR
                      <Arrow direction="up-right" />
                    </a>
                  )}
                </details>
              </div>
            </div>
            <footer>
              <div className="footer-brand">
                CASICIACO<span> / 45</span>
              </div>
              <p>
                {retreat.organization.name}
                <br />
                {retreat.organization.parish} · {retreat.organization.city}
              </p>
              <a href="#inicio">
                Volver al comienzo
                <Arrow direction="up-right" />
              </a>
            </footer>
          </div>
        </Scene>
      </main>
    </>
  );
}
