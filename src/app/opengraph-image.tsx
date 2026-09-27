import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const alt = "CASICIACO — Vista previa con acceso por código";
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
        background: "#fcf8ef",
        color: "#24483e",
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
        <span>casiciaco</span>
        <span>VISTA PREVIA</span>
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
        <span>Algo lindo</span>
        <span
          style={{
            display: "flex",
            background: "#edb6a0",
            color: "#24483e",
            borderRadius: 10,
            padding: "0 20px 10px",
            alignSelf: "flex-start",
            marginTop: 12,
          }}
        >
          en proceso.
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 24,
          borderTop: "1px solid #24483e40",
          paddingTop: 22,
        }}
      >
        <span>Una idea en construcción.</span>
        <span>ACCESO CON CÓDIGO</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Geist", data: font, weight: 400, style: "normal" }],
    },
  );
}
