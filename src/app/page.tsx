import type { Metadata } from "next";
import { RetreatStory } from "@/components/retreat-story";
import { inviterName, retreat } from "@/config/retreat";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const inviter = inviterName((await searchParams).de);
  if (!inviter) return {};
  const title = `${inviter} te invita a ${retreat.name} #${retreat.edition}`;
  return { title, openGraph: { title }, twitter: { title } };
}

export default async function Home({ searchParams }: Props) {
  return <RetreatStory inviter={inviterName((await searchParams).de)} />;
}
