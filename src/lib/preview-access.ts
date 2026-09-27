import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const previewCookie = "casiciaco-preview";
const accessCode = "177";
// This shared-code guard is for a draft preview, not individual user accounts.
const accessToken = createHash("sha256")
  .update(`casiciaco-preview-v1:${accessCode}`)
  .digest("hex");

export function validPreviewToken(value: unknown): boolean {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{64}$/.test(value) &&
    timingSafeEqual(Buffer.from(value), Buffer.from(accessToken))
  );
}

export function authorizePreview(code: unknown, token: unknown): string | null {
  return code === accessCode || validPreviewToken(token) ? accessToken : null;
}

export async function hasPreviewAccess() {
  return validPreviewToken((await cookies()).get(previewCookie)?.value);
}
