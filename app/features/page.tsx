import type { Metadata } from "next";
import { getSupabaseClient } from "@/src/lib/supabase";
import { generateSEOMeta } from "@/src/marketing/SEOHead";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://musekit.com";
  return generateSEOMeta({
    title: "Features — MuseKit",
    description: "Explore the complete set of features that make MuseKit the ultimate SaaS starter kit.",
    url: `${baseUrl}/features`,
    siteName: "MuseKit",
  });
}

interface FeaturePost {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
}

function getDescription(post: FeaturePost): string {
  if (post.excerpt) return post.excerpt;
  try {
    const parsed = JSON.parse(post.content);
    return parsed.hero?.subtitle || parsed.description || "";
  } catch {
    return post.content.replace(/[#*_`\n]/g, "").slice(0, 160).trim();
  }
}

export default async function FeaturesPage() {
  const supabase = getSupabaseClient();
  const { data: features } = await supabase
    .from("posts")
    .select("title, slug, excerpt, content")
    .eq("type", "feature")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Features</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to build and launch your SaaS product, all in one place.
        </p>
      </div>

      {!features || features.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No feature pages published yet.</p>
          <Link
            href="/"
            className="inline-flex items-center mt-4 text-sm text-primary hover:underline"
          >
            Back to home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const description = getDescription(feature);
            return (
              <Link
                key={feature.slug}
                href={`/features/${feature.slug}`}
                className="group block p-6 border border-border rounded-lg hover:border-primary/50 hover:shadow-lg transition-all bg-background"
              >
                <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h2>
                {description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {description}
                  </p>
                )}
                <span className="inline-block mt-4 text-sm text-primary font-medium">
                  Learn more &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
