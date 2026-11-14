import Image from "next/image";
import Link from "next/link";
import { retreat } from "@/config/retreat";
import { Arrow, Spark } from "@/components/marks";

/** After the retreat: thanks, an open door to the next one and the parish. */
export function RetreatThanks() {
  const copy = retreat.after;
  const organization = retreat.organization;
  return (
    <main className="thanks">
      <section className="thanks-hero" aria-labelledby="gracias-title">
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
        <div className="thanks-hero-content">
          <p className="eyebrow">
            RETIRO CATÓLICO JUVENIL · {organization.short} ·{" "}
            {organization.city.toUpperCase()}
          </p>
          <h1 id="gracias-title" className="thanks-title">
            <span className="hero-line">{copy.title[0]}</span>{" "}
            <span className="hero-line hero-accent">
              <em>{copy.title[1]}</em>
            </span>
          </h1>
          <p className="thanks-lead">
            <Spark /> {copy.thanks}
          </p>
        </div>
      </section>

      <section className="thanks-next" aria-labelledby="proximo-title">
        <div className="thanks-next-text">
          <h2 id="proximo-title">
            {copy.nextTitle[0]} <em>{copy.nextTitle[1]}</em>
          </h2>
          <p>{copy.next}</p>
        </div>
        <div className="thanks-parish">
          <p>{copy.parishLead}</p>
          <p className="thanks-parish-name">{organization.parish}</p>
          <address>{organization.parishAddress}</address>
          <a
            className="button-primary"
            href={organization.parishMapUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Cómo llegar
            <Arrow direction="up-right" />
          </a>
        </div>
        <Link className="button-outline thanks-archive" href="/2026">
          {copy.archive}
          <Arrow direction="right" />
        </Link>
      </section>

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
          <strong>{organization.name}</strong>
          <br />
          {organization.order} · {organization.parish} · {organization.city}
        </p>
      </footer>
    </main>
  );
}
