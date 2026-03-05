import type { Metadata } from "next";
import { BlogPost } from "@/src/blog";
import { getSupabaseClient } from "@/src/lib/supabase";
import { generateSEOMeta, generateJsonLd } from "@/src/marketing/SEOHead";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://musekit.com";
  const supabase = getSupabaseClient();

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, content, published_at, updated_at")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (post) {
    const description = post.excerpt || post.content.replace(/[#*_`\n]/g, "").slice(0, 160).trim();
    return generateSEOMeta({
      title: `${post.title} — MuseKit`,
      description,
      url: `${baseUrl}/blog/${params.slug}`,
      type: "article",
      siteName: "MuseKit",
    });
  }

  const { data: changelog } = await supabase
    .from("changelog_entries")
    .select("title, content")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (changelog) {
    const description = changelog.content.replace(/[#*_`\n]/g, "").slice(0, 160).trim();
    return generateSEOMeta({
      title: `${changelog.title} — MuseKit`,
      description,
      url: `${baseUrl}/blog/${params.slug}`,
      type: "article",
      siteName: "MuseKit",
    });
  }

  return generateSEOMeta({
    title: "Post Not Found — MuseKit",
    description: "The requested post could not be found.",
    noIndex: true,
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://musekit.com";
  const supabase = getSupabaseClient();

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, content, published_at, updated_at, created_at")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  let jsonLdScript: string | null = null;

  if (post) {
    jsonLdScript = generateJsonLd({
      "@type": "Article",
      headline: post.title,
      description: post.excerpt || post.content.replace(/[#*_`\n]/g, "").slice(0, 160).trim(),
      datePublished: post.published_at || post.created_at,
      dateModified: post.updated_at || post.published_at || post.created_at,
      url: `${baseUrl}/blog/${params.slug}`,
    });
  } else {
    const { data: changelog } = await supabase
      .from("changelog_entries")
      .select("title, content, published_at, updated_at, created_at")
      .eq("slug", params.slug)
      .eq("published", true)
      .single();

    if (changelog) {
      jsonLdScript = generateJsonLd({
        "@type": "Article",
        headline: changelog.title,
        description: changelog.content.replace(/[#*_`\n]/g, "").slice(0, 160).trim(),
        datePublished: changelog.published_at || changelog.created_at,
        dateModified: changelog.updated_at || changelog.published_at || changelog.created_at,
        url: `${baseUrl}/blog/${params.slug}`,
      });
    }
  }

  return (
    <>
      {jsonLdScript && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript }}
        />
      )}
      <BlogPost slug={params.slug} />
    </>
  );
}
