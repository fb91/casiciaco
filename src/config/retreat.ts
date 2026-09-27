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
    // Argentina has no DST: 00:00 of the first day in Rosario.
    startsAt: "2026-11-13T00:00:00-03:00",
    endsAt: "2026-11-15T23:59:59-03:00",
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
  // A WhatsApp link to a real organizer, e.g. "https://wa.me/549341XXXXXXX".
  contactUrl: null as string | null,
  registrationNote: "La información para anotarte estará disponible acá.",
  canonicalUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_ENV === "production"
      ? "https://casiciaco.vercel.app"
      : null),
  // Flip to true when the page is ready to appear in search engines.
  indexable: false,
  // TODO: organizers should review these answers. Only approved ones are shown.
  questions: [
    {
      question: "¿Tengo que ser re creyente?",
      answer:
        "No. Podés venir con fe, con dudas o sin saber bien qué pensás. Nadie te toma examen.",
      approved: true,
    },
    {
      question: "¿Y si no conozco a nadie?",
      answer:
        "Es muy común llegar sin conocer a nadie. El finde está pensado para que eso dure poco.",
      approved: true,
    },
    {
      question: "¿Nunca hice un retiro?",
      answer: "Puede ser el primero. No hace falta experiencia previa.",
      approved: true,
    },
    {
      question: "¿Me van a obligar a rezar?",
      answer:
        "No. Vas a tener momentos de oración y de silencio, y cada uno participa como le salga.",
      approved: true,
    },
    {
      question: "¿Puedo ir con alguien?",
      answer:
        "¡Obvio! Invitá a quien quieras que tenga entre 16 y 30 años. Cada uno se anota con el formulario.",
      approved: true,
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
    opening: ["¿Qué estás", "buscando?"],
    noise: [
      "ESTUDIAR",
      "LABURAR",
      "EL FUTURO",
      "LLEGAR A TODO",
      "LOS PLANES",
      "LAS REDES",
      "ENCAJAR",
      "NO PARAR",
    ],
    // Fictional phone notifications that pile up while scrolling the noise.
    notifications: [
      { app: "Grupo Facu", text: "¿Rendiste? Mañana es el final 😬" },
      { app: "Mamá", text: "¿Venís a comer el domingo?" },
      { app: "Laburo", text: "Te cambio el turno del sábado, ¿ok?" },
      { app: "Instagram", text: "A 3 personas les gustó tu historia" },
      { app: "Banco", text: "Tu resumen ya está disponible" },
      { app: "Juli", text: "Che, ¿salimos hoy o qué?" },
      { app: "Calendario", text: "Entregar TP · hoy 23:59" },
      { app: "Grupo Amigos", text: "+47 mensajes" },
      { app: "Recordatorio", text: "Empezar el gym (de nuevo)" },
      { app: "WhatsApp", text: "3 audios sin escuchar" },
    ],
    noiseEnd: "Encontrar tu lugar.",
    scrolling: ["Hay preguntas", "que no se responden", "scrolleando."],
    hold: "Mantené apretado",
    holdHint: "Hacé silencio unos segundos",
    pause: ["¿Y si, aun con todo eso,", "seguís buscando?"],
    augustine: [
      "Hace más de 1600 años,",
      "Agustín también",
      "estaba buscando.",
    ],
    quote: "Nuestro corazón está inquieto hasta que descanse en ti.",
    quoteSource: "San Agustín · Confesiones I, 1",
    choice: {
      title: "¿Y vos?",
      question: "¿Qué te gustaría encontrar?",
      options: [
        "Un poco de calma.",
        "Gente con quien compartir.",
        "Todavía no sé.",
      ],
      responses: [
        "Un rato para bajar un cambio. Suena bien.",
        "Compartir el camino también hace bien.",
        "Está bien. No tenés que tener todo resuelto.",
      ],
    },
    room: ["Tres días", "para hacer lugar."],
    moments: ["A una charla.", "A otros.", "A tus preguntas."],
    jesus: ["Conocer", "a Jesús."],
    description: "Casiciaco es un retiro católico juvenil.",
    invitation: ["Date", "lugar."],
    // Invitation subtitle, story card line and share text follow the visitor's choice.
    invitationBy: [
      "Tres días para bajar un cambio. Sin correr.",
      "Hay gente esperando para compartir el camino con vos.",
      "No hace falta tenerlo claro. Vení igual.",
    ],
    invitationDefault: "Regalate un finde diferente. ¡Te esperamos!",
    storyBy: [
      "Voy a buscar un poco de calma.",
      "Voy a compartir el camino.",
      "Todavía no sé qué busco. Voy igual.",
    ],
    storyDefault: "Me voy a hacer lugar.",
    cta: "Quiero anotarme",
    share: "¿A quién invitarías?",
  },
  // Stops of Augustine's search: one short line each, facts from the Confessions.
  timeline: [
    {
      year: "354",
      place: "Tagaste",
      title: "Un pibe inquieto.",
      text: "Curioso, rebelde y con mil preguntas.",
    },
    {
      year: "371",
      place: "Cartago",
      title: "Ganas de ser alguien.",
      text: "Estudia, sale, se enamora. A los 18 es papá.",
    },
    {
      year: "384",
      place: "Milán",
      title: "Le va bien. ¿Y?",
      text: "Por fuera, todo resuelto. Por dentro, el ruido sigue.",
    },
    {
      year: "386",
      place: "Casiciaco",
      title: "Paró. Y no fue solo.",
      text: "Se fue al campo con su familia y amigos. De ahí viene el nombre del retiro.",
    },
  ],
  // The weekend is not described on purpose: it is lived, not told.
  days: ["Viernes", "Sábado", "Domingo"],
  daysTeaser: "Qué pasa cada día no te lo contamos: se vive. Vení con ganas.",
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
/** A short first name for personalized invitations (`?de=Juli`). */
export function inviterName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value
    .normalize("NFC")
    .replace(/[^\p{L}\p{M} '’-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24)
    .trim();
  return name.length >= 2 ? name : null;
}
/** Visitor choice index from a query value, or null. */
export function choiceIndex(value: unknown): number | null {
  const index = Number(value);
  return Number.isInteger(index) &&
    index >= 0 &&
    index < retreat.copy.choice.options.length
    ? index
    : null;
}
