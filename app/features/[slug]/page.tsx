import type { Metadata } from "next";
import { FeatureSubPage } from "@/src/landing";
import { getSupabaseClient } from "@/src/lib/supabase";
import { generateSEOMeta } from "@/src/marketing/SEOHead";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://musekit.com";
  const supabase = getSupabaseClient();

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, content")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (post) {
    let description = post.excerpt || "";
    if (!description) {
      try {
        const parsed = JSON.parse(post.content);
        description = parsed.hero?.subtitle || parsed.description || "";
      } catch {
        description = post.content.replace(/[#*_`\n]/g, "").slice(0, 160).trim();
      }
    }
    return generateSEOMeta({
      title: `${post.title} — MuseKit`,
      description: description || `Learn more about ${post.title}`,
      url: `${baseUrl}/features/${params.slug}`,
      siteName: "MuseKit",
    });
  }

  return generateSEOMeta({
    title: "Feature Not Found — MuseKit",
    description: "The requested feature page could not be found.",
    noIndex: true,
  });
}

export default function FeaturePage({ params }: { params: { slug: string } }) {
  return <FeatureSubPage slug={params.slug} />;
}
