export type Testimonial = {
  id: string;
  name: string;
  video: string;
  poster: string;
  captions: string;
  transcript: string;
  approved: boolean;
};

/** Event information and approved content. Null = not supplied; never fabricate logistics. */
export const retreat = {
  name: "CASICIACO",
  edition: 45,
  dates: {
    days: "13 · 14 · 15",
    month: "NOVIEMBRE",
    year: "2026",
    start: "2026-11-13",
    end: "2026-11-15",
  },
  age: { min: 16, max: 30 },
  organization: {
    short: "JAR",
    name: "Juventud Agustino Recoleta",
    order: "Agustinos Recoletos",
    parish: "Parroquia Nuestra Señora de Luján",
    city: "Rosario",
  },
  // Venue and packing list verified in the Google Form linked by the official flyer QR.
  venue:
    "Colegio Nuestra Señora de Luján · Av. Perón 3320 Oeste, Rosario, Santa Fe" as
      string | null,
  price: null as string | null,
  schedule: null as string | null,
  practicalNotes:
    "Traé ropa cómoda, bolsa de dormir o colchón inflable, elementos de higiene personal, plato, vaso y cubiertos, cartuchera y Biblia." as
      string | null,
  // Official form decoded from the QR in instagram.com/p/DdpoV2Qz40q/.
  registrationUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSeEdv-2l_ax-kgsCZyvjgd_wui_nuxcj775NhAPs7mGkWb5TQ/viewform" as
      string | null,
  contactUrl: null as string | null,
  registrationNote: "La información para anotarte estará disponible acá.",
  canonicalUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_ENV === "production"
      ? "https://casiciaco.vercel.app"
      : null),
  analytics: {
    provider: "clarity",
    projectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || null,
    // Official flyer includes minors; keep session recording disabled.
    enabled: false,
  },
  // TODO: organizer approval required before these answers appear publicly.
  questions: [
    {
      question: "¿Tengo que participar de la Iglesia?",
      answer: "No hace falta.",
      approved: false,
    },
    {
      question: "¿Y si tengo dudas sobre Dios?",
      answer: "También podés venir.",
      approved: false,
    },
    {
      question: "¿Nunca hice un retiro?",
      answer: "Puede ser el primero.",
      approved: false,
    },
  ],
  // TODO: upload real videos, authorized names, posters, VTT captions and transcripts.
  // Prepared slots are deliberately omitted from the public page until complete and approved.
  testimonials: [
    {
      id: "antes-de-ir",
      name: "",
      video: "",
      poster: "",
      captions: "",
      transcript: "",
      approved: false,
    },
    {
      id: "un-momento",
      name: "",
      video: "",
      poster: "",
      captions: "",
      transcript: "",
      approved: false,
    },
    {
      id: "una-invitacion",
      name: "",
      video: "",
      poster: "",
      captions: "",
      transcript: "",
      approved: false,
    },
  ] satisfies Testimonial[],
  copy: {
    opening: ["¿QUÉ ESTÁS", "buscando?"],
    noise: [
      "Estudiar.",
      "Trabajar.",
      "Amigos.",
      "Pareja.",
      "Plata.",
      "Viajar.",
      "Salir.",
      "El futuro.",
    ],
    noiseEnd: "Encontrar tu lugar.",
    pause: ["¿Y si, aun con todo eso,", "seguís buscando?"],
    scrolling: ["Hay preguntas", "que no se responden", "scrolleando."],
    augustine: [
      "Hace más de 1600 años,",
      "Agustín también",
      "estaba buscando.",
    ],
    journey: ["Estudió.", "Enseñó.", "Cambió de ideas.", "Siguió buscando."],
    cassiciacum: [
      "Después de su conversión,",
      "se retiró al campo",
      "con familiares y amigos.",
      "A un lugar llamado…",
    ],
    quote: "Nuestro corazón está inquieto hasta que descanse en ti.",
    choice: {
      title: "¿Y vos?",
      question: "¿Qué te gustaría encontrar?",
      options: [
        "Un poco de calma.",
        "Gente con quien compartir.",
        "Todavía no sé.",
      ],
    },
    room: ["Tres días", "para hacer lugar."],
    moments: ["A una charla.", "A otros.", "A tus preguntas."],
    jesus: ["Y a conocer", "a Jesús."],
    description: "Casiciaco es un retiro católico juvenil.",
    invitation: ["Date", "lugar."],
    cta: "Quiero anotarme",
    share: "¿A quién invitarías?",
  },
} as const;

export function approvedTestimonials(): Testimonial[] {
  return retreat.testimonials.filter(
    (t) =>
      t.approved && t.name && t.video && t.poster && t.captions && t.transcript,
  );
}
export function publicUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
