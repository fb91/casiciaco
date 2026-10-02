/**
 * Testimonials repository: static, no database. Every entry appears in the stories at the
 * end of the page and, in random order, in the floating bubble next to «Quiero anotarme».
 *
 * TODO: replace the examples with real, authorized testimonials and set `placeholder: false`.
 * Videos: vertical (9:16) MP4, short, with a poster image and, ideally, WebVTT captions.
 */
type Base = {
  id: string;
  /** First name, as the person wants to appear. */
  name: string;
  age: number | null;
  /** Edition they attended, e.g. 44. */
  edition: number | null;
  /** Square profile photo. */
  avatar: string;
  /** One line for the floating chat bubble. */
  teaser: string;
  /** Example content: shown with an «Ejemplo» badge until the real one arrives. */
  placeholder: boolean;
};
export type Testimonial = Base &
  (
    | { kind: "texto"; text: string }
    | {
        kind: "video";
        video: string;
        poster: string;
        captions: string | null;
        transcript: string;
      }
  );

const exampleTranscript =
  "Video de ejemplo: acá va el testimonio de alguien que ya vivió Casiciaco.";

export const testimonials: Testimonial[] = [
  {
    id: "sofi",
    name: "Sofi",
    age: 19,
    edition: 44,
    avatar: "/testimonios/avatar-sofi.svg",
    teaser: "Fui sin conocer a nadie y volví con amigos de verdad.",
    placeholder: true,
    kind: "video",
    video: "/testimonios/sofi.mp4",
    poster: "/testimonios/sofi.webp",
    captions: null,
    transcript: exampleTranscript,
  },
  {
    id: "tomi",
    name: "Tomi",
    age: 22,
    edition: 44,
    avatar: "/testimonios/avatar-tomi.svg",
    teaser: "Hacía años que no pisaba una iglesia…",
    placeholder: true,
    kind: "texto",
    text: "Hacía años que no pisaba una iglesia y me anotó una amiga. Pensé que me iba a aburrir. Me encontré con gente re abierta, charlas profundas y un silencio que no sabía que necesitaba. No volví con todas las respuestas, pero sí con ganas de seguir buscando.",
  },
  {
    id: "meli",
    name: "Meli",
    age: 17,
    edition: 44,
    avatar: "/testimonios/avatar-meli.svg",
    teaser: "No sabía rezar. Nadie me lo pidió: me animé a hablarle.",
    placeholder: true,
    kind: "video",
    video: "/testimonios/meli.mp4",
    poster: "/testimonios/meli.webp",
    captions: null,
    transcript: exampleTranscript,
  },
  {
    id: "juan",
    name: "Juan",
    age: 24,
    edition: 43,
    avatar: "/testimonios/avatar-juan.svg",
    teaser: "Tenía todo «bastante bien»… y aun así algo faltaba.",
    placeholder: true,
    kind: "texto",
    text: "Tenía laburo, amigos, planes. Todo «bastante bien». Y aun así sentía que algo faltaba. En Casiciaco, entre mates, silencio y charlas, me encontré con Jesús de una forma que no esperaba. Fue el comienzo de algo.",
  },
  {
    id: "cami",
    name: "Cami",
    age: 21,
    edition: 43,
    avatar: "/testimonios/avatar-cami.svg",
    teaser: "Lo que viví ese finde no te lo puedo explicar. Andá.",
    placeholder: true,
    kind: "video",
    video: "/testimonios/cami.mp4",
    poster: "/testimonios/cami.webp",
    captions: null,
    transcript: exampleTranscript,
  },
];

/** «Sofi, 19 · Casiciaco #44», with whatever is known. */
export function testimonialMeta(item: Testimonial) {
  return [
    item.age ? `${item.age} años` : null,
    item.edition ? `Casiciaco #${item.edition}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
