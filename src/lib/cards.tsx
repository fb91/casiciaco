import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";
import { choiceIndex, publicUrl, retreat } from "@/config/retreat";

/** Fonts for next/og images (Satori reads TTF/WOFF, not WOFF2). */
export async function cardFonts() {
  const modules = join(process.cwd(), "node_modules");
  const [sans, serif, serifItalic] = await Promise.all([
    readFile(join(modules, "next/dist/compiled/@vercel/og/Geist-Regular.ttf")),
    readFile(
      join(
        modules,
        "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff",
      ),
    ),
    readFile(
      join(
        modules,
        "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff",
      ),
    ),
  ]);
  return [
    {
      name: "Geist",
      data: sans,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Serif",
      data: serif,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Serif",
      data: serifItalic,
      weight: 400 as const,
      style: "italic" as const,
    },
  ];
}
export const palette = {
  night: "#0f1c18",
  ink: "#24483e",
  paper: "#fcf8ef",
  accent: "#edb6a0",
  accentInk: "#b5532f",
  sage: "#e2e8d7",
};

type Theme = {
  background: string;
  color: string;
  accent: string;
  line: string;
  badge?: string;
};
const themes: Record<string, Theme> = {
  night: {
    background: `radial-gradient(circle at 70% 38%, #2d5a4c 0%, ${palette.night} 58%)`,
    color: palette.paper,
    accent: palette.accent,
    line: `${palette.paper}40`,
  },
  sage: {
    background: `linear-gradient(170deg, ${palette.sage} 0%, #f19a78 130%)`,
    color: palette.night,
    accent: palette.accentInk,
    line: `${palette.night}33`,
  },
  accent: {
    background: `linear-gradient(170deg, ${palette.accent} 0%, #e58d6c 100%)`,
    color: palette.night,
    accent: palette.paper,
    line: `${palette.night}33`,
    badge: palette.night,
  },
};

export function siteUrl() {
  return new URL(
    publicUrl(retreat.canonicalUrl) || "https://casiciaco.vercel.app",
  );
}

async function qr(color: string) {
  const url = siteUrl();
  url.searchParams.set("ref", "historia");
  const svg = await QRCode.toString(url.href, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: color, light: "#00000000" },
  });
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** Shared bottom block: facts, QR and the web address, readable in any story. */
function Footer({
  theme,
  code,
  question,
}: {
  theme: Theme;
  code: string;
  question?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      {question && (
        <span
          style={{ fontFamily: "Serif", fontStyle: "italic", fontSize: 110 }}
        >
          {question}
        </span>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 40,
          borderTop: `2px solid ${theme.line}`,
          paddingTop: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            fontSize: 38,
          }}
        >
          <span>13—15 NOV · ROSARIO</span>
          <span>
            Jóvenes de {retreat.age.min} a {retreat.age.max} años
          </span>
          <span
            style={{
              marginTop: 22,
              alignSelf: "flex-start",
              padding: "14px 26px",
              borderRadius: 999,
              background: theme.color,
              color:
                theme.color === palette.paper ? palette.night : palette.paper,
              fontSize: 42,
            }}
          >
            {siteUrl().host}
          </span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={code} width={210} height={210} alt="" />
      </div>
    </div>
  );
}

function Frame({
  theme,
  children,
}: {
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "120px 96px 150px",
        background: theme.background,
        color: theme.color,
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
            background: theme.badge || palette.accent,
            color: theme.badge ? palette.paper : palette.ink,
            padding: "4px 18px",
            borderRadius: 12,
          }}
        >
          #{retreat.edition}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Story card by id: invitation designs for anyone, or "I'm going" by choice. */
export async function StoryCard({ id }: { id: string }) {
  const theme =
    id === "scrolleando"
      ? themes.sage
      : id === "lugar"
        ? themes.accent
        : themes.night;
  const code = await qr(theme.color);
  if (id === "buscando") {
    return (
      <Frame theme={theme}>
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}
        >
          <span style={{ fontFamily: "Serif", fontSize: 170 }}>¿Qué estás</span>
          <span
            style={{
              fontFamily: "Serif",
              fontStyle: "italic",
              fontSize: 210,
              color: theme.accent,
            }}
          >
            buscando?
          </span>
          <span
            style={{
              marginTop: 70,
              fontSize: 54,
              lineHeight: 1.3,
              color: palette.sage,
            }}
          >
            Tres días para hacer lugar. Retiro católico juvenil.
          </span>
        </div>
        <Footer theme={theme} code={code} />
      </Frame>
    );
  }
  if (id === "scrolleando") {
    return (
      <Frame theme={theme}>
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 1.02 }}
        >
          <span style={{ fontSize: 118, letterSpacing: -4 }}>
            Hay preguntas
          </span>
          <span style={{ fontSize: 118, letterSpacing: -4 }}>que no se</span>
          <span style={{ fontSize: 118, letterSpacing: -4 }}>responden</span>
          <span
            style={{
              fontFamily: "Serif",
              fontStyle: "italic",
              fontSize: 180,
              color: theme.accent,
            }}
          >
            scrolleando.
          </span>
        </div>
        <Footer theme={theme} code={code} question="¿Venís?" />
      </Frame>
    );
  }
  if (id === "lugar") {
    return (
      <Frame theme={theme}>
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 0.9 }}
        >
          <span style={{ fontSize: 250, letterSpacing: -12 }}>Date</span>
          <span
            style={{ fontFamily: "Serif", fontStyle: "italic", fontSize: 300 }}
          >
            lugar.
          </span>
          <span style={{ marginTop: 60, fontSize: 56, lineHeight: 1.3 }}>
            Un finde distinto. Te esperamos.
          </span>
        </div>
        <Footer theme={theme} code={code} />
      </Frame>
    );
  }
  const choice = choiceIndex(id);
  const line =
    choice === null ? retreat.copy.storyDefault : retreat.copy.storyBy[choice];
  return (
    <Frame theme={theme}>
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
            color: theme.accent,
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
      <Footer theme={theme} code={code} question="¿Venís?" />
    </Frame>
  );
}
