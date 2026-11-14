import type { Metadata } from "next";
import { RetreatStory } from "@/components/retreat-story";
import { RetreatThanks } from "@/components/retreat-thanks";
import { inviterName, retreat, retreatEnded } from "@/config/retreat";

export type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const thanksTitle = `${retreat.name} ${retreat.dates.year} — ${retreat.after.title[1].replace(/^./, (letter) => letter.toUpperCase())}`;
export const thanksMetadata: Metadata = {
  title: thanksTitle,
  description: retreat.after.thanks,
  openGraph: { title: thanksTitle, description: retreat.after.thanks },
  twitter: { title: thanksTitle, description: retreat.after.thanks },
};

export async function storyMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const inviter = inviterName((await searchParams).de);
  if (!inviter) return {};
  const title = `${inviter} te invita a ${retreat.name} #${retreat.edition}`;
  return { title, openGraph: { title }, twitter: { title } };
}

/** The retreat page as it was published. Once it is over, it is an archive. */
export async function StoryPage({ searchParams }: PageProps) {
  return (
    <RetreatStory
      inviter={inviterName((await searchParams).de)}
      archived={retreatEnded()}
    />
  );
}

/** «/»: the invitation until the retreat ends, the thanks page afterwards. */
export async function HomePage(props: PageProps) {
  // Reading the query keeps this route dynamic, so the switch happens on its own.
  await props.searchParams;
  return retreatEnded() ? <RetreatThanks /> : <StoryPage {...props} />;
}
export async function homeMetadata(props: PageProps): Promise<Metadata> {
  await props.searchParams;
  return retreatEnded() ? thanksMetadata : storyMetadata(props);
}
