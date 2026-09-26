import { retreat } from "@/config/retreat";
export const origins = [
  "colegio",
  "instagram",
  "whatsapp",
  "flyer",
  "parroquia",
] as const;
export type Origin = (typeof origins)[number] | "directo";
export function normalizeOrigin(value: string | null): Origin {
  return origins.includes(value as (typeof origins)[number])
    ? (value as Origin)
    : "directo";
}
export type SmartEvent =
  | "registration_click"
  | "registration_info"
  | "share_open"
  | "share_handoff"
  | "share_whatsapp"
  | "copy_link"
  | "testimonial_play"
  | "testimonial_complete";
declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}
export function clarityAllowed(): boolean {
  return (
    retreat.analytics.enabled &&
    retreat.age.min >= 18 &&
    !!retreat.analytics.projectId?.match(/^[a-z0-9]+$/i)
  );
}
export function track(event: SmartEvent) {
  if (typeof window !== "undefined" && clarityAllowed())
    window.clarity?.("event", event);
}
