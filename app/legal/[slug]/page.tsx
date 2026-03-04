import { LegalPageLayout } from "@/src/legal";
import type { LegalPageSlug } from "@/src/legal";

export default function LegalPage({ params }: { params: { slug: string } }) {
  return <LegalPageLayout slug={params.slug as LegalPageSlug} />;
}
