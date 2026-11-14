import { RetreatThanks } from "@/components/retreat-thanks";
import { thanksMetadata } from "@/lib/story-page";

// What «/» shows once the retreat is over, always reachable here.
export const metadata = thanksMetadata;
export default function Thanks() {
  return <RetreatThanks />;
}
