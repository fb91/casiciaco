import { ImageResponse } from "next/og";
import { retreat } from "@/config/retreat";
import { cardFonts, jarLogo, LogoChip, palette } from "@/lib/cards";

export const alt = `CASICIACO #${retreat.edition} — ¿Qué estás buscando? Retiro para jóvenes, 13 al 15 de noviembre en Rosario`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const logo = await jarLogo();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "52px 68px",
        background: `radial-gradient(circle at 78% 30%, #2d5a4c 0%, ${palette.night} 62%)`,
        color: palette.paper,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <LogoChip src={logo} height={64} />
          <span>casiciaco #{retreat.edition}</span>
        </div>
        <span>RETIRO CATÓLICO JUVENIL · ROSARIO</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontFamily: "Serif", fontSize: 128 }}>¿Qué estás</span>
        <span
          style={{
            fontFamily: "Serif",
            fontStyle: "italic",
            fontSize: 150,
            color: palette.accent,
          }}
        >
          buscando?
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 28,
          borderTop: `1px solid ${palette.paper}40`,
          paddingTop: 22,
        }}
      >
        <span>13—15 de noviembre · Tres días para hacer lugar</span>
        <span>
          {retreat.age.min} a {retreat.age.max} años
        </span>
      </div>
    </div>,
    { ...size, fonts: await cardFonts() },
  );
}
