import { retreat } from "./retreat";

/** Story images (1080×1920) served at /historia/[id]. */
export const inviteCards = [
  { id: "buscando", label: "¿Qué estás buscando?" },
  { id: "scrolleando", label: "Hay preguntas…" },
  { id: "lugar", label: "Date lugar." },
] as const;
/** "I'm going" cards: one per choice plus a neutral one. */
export const goingCards = [
  { id: "libre", label: retreat.copy.storyDefault },
  ...retreat.copy.storyBy.map((label, index) => ({ id: String(index), label })),
];
export const cardIds = [...inviteCards, ...goingCards].map((card) => card.id);
export type ShareMode = "invitar" | "voy";
