import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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
  sage: "#e2e8d7",
};
