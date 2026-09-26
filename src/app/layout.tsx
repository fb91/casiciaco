import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource/instrument-serif/latin-400.css";
import "./globals.css";
import { retreat, publicUrl } from "@/config/retreat";

const title = `${retreat.name} #${retreat.edition} — Date lugar`;
const description = `Tres días para hacer lugar. Retiro católico juvenil de JAR, ${retreat.dates.days} de noviembre de ${retreat.dates.year}. De ${retreat.age.min} a ${retreat.age.max} años. Parroquia Nuestra Señora de Luján, Rosario.`;
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
  ...(canonical
    ? { metadataBase: new URL(canonical), alternates: { canonical: "/" } }
    : {}),
  openGraph: {
    title,
    description,
    locale: "es_AR",
    type: "website",
    ...(canonical ? { url: canonical } : {}),
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: !!canonical, follow: !!canonical },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12384A",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>
        <a className="skip-link" href="#invitacion">
          Ir a la invitación
        </a>
        {children}
      </body>
    </html>
  );
}
