import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { retreat, publicUrl } from "@/config/retreat";

const title = `${retreat.name} #${retreat.edition} — Retiro para jóvenes de ${retreat.age.min} a ${retreat.age.max}`;
const description =
  "¿Qué estás buscando? Tres días en Rosario para hacer lugar. 13—15 de noviembre. Retiro católico juvenil de la JAR.";
const canonical = publicUrl(retreat.canonicalUrl);
export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(
    canonical ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  ),
  ...(canonical ? { alternates: { canonical: "/" } } : {}),
  openGraph: {
    title,
    description,
    locale: "es_AR",
    type: "website",
    ...(canonical ? { url: canonical } : {}),
  },
  twitter: { card: "summary_large_image", title, description },
  robots: retreat.indexable
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1c18",
};

// Runs before first paint: enables the scroll-driven layout (no-JS keeps a plain page) and
// keeps the silence open for deep links or a visitor who already went through it.
const boot = `(function(){var d=document.documentElement;d.dataset.enhanced="";try{if(sessionStorage.getItem("casiciaco-silencio")==="1")d.dataset.silence="open"}catch(e){}var h=location.hash.slice(1);if(h&&["inicio","ruido","silencio"].indexOf(h)<0)d.dataset.silence="open"})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <a className="skip-link" href="#invitacion">
          Ir directo a la inscripción
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
