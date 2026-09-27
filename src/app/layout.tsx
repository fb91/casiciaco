import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import { retreat, publicUrl } from "@/config/retreat";

const title = `${retreat.name} — Vista previa`;
const description = "Una idea en construcción. Acceso con código.";
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
  robots: { index: false, follow: false, noarchive: true },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#24483e",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>
        <a className="skip-link" href="#recorrido">
          Ir al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
