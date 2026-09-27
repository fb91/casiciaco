import { ImageResponse } from "next/og";
import { choiceIndex, publicUrl, retreat } from "@/config/retreat";
import { cardFonts, palette } from "@/lib/cards";

export const dynamicParams = false;
export function generateStaticParams() {
  return [
    "libre",
    ...retreat.copy.choice.options.map((_, index) => String(index)),
  ].map((opcion) => ({ opcion }));
}

/** A 9:16 image to share in Instagram/WhatsApp stories, echoing the visitor's choice. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/historia/[opcion]">,
) {
  const choice = choiceIndex((await params).opcion);
  const line =
    choice === null ? retreat.copy.storyDefault : retreat.copy.storyBy[choice];
  const host = new URL(
    publicUrl(retreat.canonicalUrl) || "https://casiciaco.vercel.app",
  ).host;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "120px 96px 150px",
        background: `radial-gradient(circle at 70% 38%, #2d5a4c 0%, ${palette.night} 58%)`,
        color: palette.paper,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 40,
        }}
      >
        <span>casiciaco</span>
        <span
          style={{
            background: palette.accent,
            color: palette.ink,
            padding: "4px 18px",
            borderRadius: 12,
          }}
        >
          #{retreat.edition}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: "Serif", fontSize: 150, lineHeight: 1 }}>
          Me voy a
        </span>
        <span
          style={{
            fontFamily: "Serif",
            fontStyle: "italic",
            fontSize: 190,
            lineHeight: 1.05,
            color: palette.accent,
          }}
        >
          Casiciaco.
        </span>
        <span
          style={{
            marginTop: 70,
            fontSize: 56,
            lineHeight: 1.3,
            maxWidth: 820,
            color: palette.sage,
          }}
        >
          {line}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <span
          style={{ fontFamily: "Serif", fontStyle: "italic", fontSize: 110 }}
        >
          ¿Venís?
        </span>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `2px solid ${palette.paper}40`,
            paddingTop: 34,
            fontSize: 36,
          }}
        >
          <span>13—15 NOV · ROSARIO</span>
          <span>
            {retreat.age.min} a {retreat.age.max} años
          </span>
        </div>
        <span style={{ fontSize: 34, color: palette.accent }}>{host}</span>
      </div>
    </div>,
    {
      width: 1080,
      height: 1920,
      fonts: await cardFonts(),
    },
  );
}
