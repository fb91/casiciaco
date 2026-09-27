import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { retreat } from "@/config/retreat";
export const alt = `CASICIACO ${retreat.edition} — Date lugar. ${retreat.dates.days} de noviembre de ${retreat.dates.year}. De ${retreat.age.min} a ${retreat.age.max} años.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const serif = await readFile(
    join(
      process.cwd(),
      "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff",
    ),
  );
  // Use the sans font already bundled with next/og; no external font requests.
  const sans = await readFile(
    join(
      process.cwd(),
      "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf",
    ),
  );
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#17251e",
        color: "#f2f0e7",
        padding: "55px 70px",
        fontFamily: "Geist",
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
          alignItems: "baseline",
          fontWeight: 400,
          letterSpacing: -8,
        }}
      >
        Date{" "}
        <span
          style={{
            color: "#d5ebaa",
            marginLeft: 30,
            fontFamily: "Instrument",
            fontStyle: "italic",
            fontSize: 195,
          }}
        >
          lugar.
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 27,
          borderTop: "1px solid #d5ebaa",
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
    {
      ...size,
      fonts: [
        { name: "Geist", data: sans, weight: 400, style: "normal" },
        { name: "Instrument", data: serif, weight: 400, style: "italic" },
      ],
    },
  );
}
