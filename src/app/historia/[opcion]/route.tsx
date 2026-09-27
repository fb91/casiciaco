import { ImageResponse } from "next/og";
import { cardIds } from "@/config/share-cards";
import { StoryCard, cardFonts } from "@/lib/cards";

export const dynamicParams = false;
export function generateStaticParams() {
  return cardIds.map((opcion) => ({ opcion }));
}

/** A 9:16 image to share in Instagram/WhatsApp stories, with the web address and a QR. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/historia/[opcion]">,
) {
  const { opcion } = await params;
  return new ImageResponse(await StoryCard({ id: opcion }), {
    width: 1080,
    height: 1920,
    fonts: await cardFonts(),
  });
}
