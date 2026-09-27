import { hasPreviewAccess } from "@/lib/preview-access";
import { PreviewGate } from "@/components/preview-gate";
import { RetreatStory } from "@/components/retreat-story";

export default async function Home() {
  return (await hasPreviewAccess()) ? <RetreatStory /> : <PreviewGate />;
}
