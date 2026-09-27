import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { retreat } from "@/config/retreat";
export const alt = `CASICIACO ${retreat.edition} — Un finde para vos. ${retreat.dates.days} de noviembre de ${retreat.dates.year}. De ${retreat.age.min} a ${retreat.age.max} años.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const font = await readFile(
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
        padding: "48px 65px",
        background: "#d2e9ed",
        color: "#204d70",
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 25,
        }}
      >
        <span>casiciaco / #{retreat.edition}</span>
        <span>RETIRO CATÓLICO JUVENIL · JAR</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 104,
          letterSpacing: -5,
          lineHeight: 1.08,
        }}
      >
        <span>Un finde</span>
        <span
          style={{
            display: "flex",
            background: "#edcb62",
            color: "#204d70",
            borderRadius: 10,
            padding: "0 20px 10px",
            alignSelf: "flex-start",
            marginTop: 12,
          }}
        >
          para vos.
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 24,
          borderTop: "1px solid #204d7040",
          paddingTop: 22,
        }}
      >
        <span>
          {retreat.dates.days} NOVIEMBRE {retreat.dates.year}
        </span>
        <span>
          {retreat.age.min}–{retreat.age.max} AÑOS · ROSARIO
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Geist", data: font, weight: 400, style: "normal" }],
    },
  );
}
