import type { Metadata } from "next";
import { LegalPageLayout, legalPages } from "@/src/legal";
import type { LegalPageSlug } from "@/src/legal";
import { getLegalPageMetadata } from "@/src/seo/metadata";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return getLegalPageMetadata(params.slug);
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  return <LegalPageLayout slug={params.slug as LegalPageSlug} />;
}
