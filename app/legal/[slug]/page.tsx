import type { Metadata } from "next";
import { LegalPageLayout, legalPages } from "@/src/legal";
import type { LegalPageSlug } from "@/src/legal";
import { generateSEOMeta } from "@/src/marketing/SEOHead";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = legalPages[params.slug as LegalPageSlug];

  if (page) {
    return generateSEOMeta({
      title: `${page.title} — MuseKit`,
      description: `Read the MuseKit ${page.title}. Learn about our policies and commitments.`,
      siteName: "MuseKit",
    });
  }

  return generateSEOMeta({
    title: "Legal — MuseKit",
    description: "MuseKit legal and policy pages.",
    noIndex: true,
  });
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  return <LegalPageLayout slug={params.slug as LegalPageSlug} />;
}
