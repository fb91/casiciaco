import { ImageResponse } from "next/og";
import { retreat } from "@/config/retreat";
export const alt =
  "CASICIACO 45 — Date lugar. 13, 14 y 15 de noviembre de 2026. De 16 a 30 años.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#12384a",
        color: "#f5f1e7",
        padding: "55px 70px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 26,
          letterSpacing: 2,
        }}
      >
        <span>CASICIACO / {retreat.edition}</span>
        <span>JAR · ROSARIO</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 146,
          fontWeight: 700,
          letterSpacing: -10,
        }}
      >
        Date <span style={{ color: "#efc45b", marginLeft: 30 }}>lugar.</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 27,
          borderTop: "2px solid #efc45b",
          paddingTop: 28,
        }}
      >
        <span>
          {retreat.dates.days} NOVIEMBRE {retreat.dates.year}
        </span>
        <span>
          {retreat.age.min}–{retreat.age.max} AÑOS
        </span>
      </div>
    </div>,
    size,
  );
}
