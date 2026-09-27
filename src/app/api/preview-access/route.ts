import { NextResponse } from "next/server";
import { authorizePreview, previewCookie } from "@/lib/preview-access";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  const origin = request.headers.get("origin");
  // Next's internal URL can use 0.0.0.0 behind a proxy; compare the incoming host.
  const host = request.headers.get("host") || new URL(request.url).host;
  let sameOrigin = !origin;
  try {
    if (origin) sameOrigin = new URL(origin).host === host;
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) {
    return NextResponse.json(
      { error: "Solicitud no permitida." },
      { status: 403, headers },
    );
  }
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ingresá el código de 3 números." },
      { status: 400, headers },
    );
  }
  const token = authorizePreview(payload?.code, payload?.token);
  if (!token) {
    return NextResponse.json(
      { error: "Ese código no es. Probá de nuevo." },
      { status: 401, headers },
    );
  }
  const response = NextResponse.json({ token }, { headers });
  response.cookies.set(previewCookie, token, {
    httpOnly: true,
    secure:
      request.headers.get("x-forwarded-proto") === "https" ||
      new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
