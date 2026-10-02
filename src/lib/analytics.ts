import { track as vercelTrack } from "@vercel/analytics";

export const origins = [
  "colegio",
  "instagram",
  "whatsapp",
  "flyer",
  "parroquia",
  "historia",
  "invitacion",
] as const;
export type Origin = (typeof origins)[number] | "directo";
export function normalizeOrigin(value: string | null): Origin {
  return origins.includes(value as (typeof origins)[number])
    ? (value as Origin)
    : "directo";
}
export type SmartEvent =
  | "start"
  | "scene_view"
  | "silence_complete"
  | "silence_skip"
  | "choice"
  | "sound_on"
  | "sound_off"
  | "copy_message"
  | "registration_click"
  | "registration_info"
  | "share_open"
  | "share_handoff"
  | "share_whatsapp"
  | "copy_link"
  | "story_card"
  | "testimonial_open"
  | "testimonial_play"
  | "testimonial_complete";

/**
 * Cookieless, aggregate events (Vercel Web Analytics). Never send names or free text:
 * the audience includes minors.
 */
export function track(
  event: SmartEvent,
  properties: Record<string, string | number> = {},
) {
  if (typeof window === "undefined") return;
  try {
    vercelTrack(event, {
      ...properties,
      origen: normalizeOrigin(new URLSearchParams(location.search).get("ref")),
    });
  } catch {
    // Analytics must never break the story.
  }
}
