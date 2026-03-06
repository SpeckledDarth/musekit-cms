import type { Metadata } from "next";
import { BlogPost } from "@/src/blog";
import { getSupabaseClient } from "@/src/lib/supabase";
import { getBlogPostMetadata } from "@/src/seo/metadata";
import { getArticleSchema } from "@/src/seo/json-ld";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return getBlogPostMetadata(params.slug);
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
    const schema = getArticleSchema(
      {
        slug: params.slug,
        title: post.title,
        excerpt: post.excerpt || post.content?.replace(/[#*_`\n]/g, "").slice(0, 160).trim(),
        published_at: post.published_at,
        updated_at: post.updated_at,
        created_at: post.created_at,
      },
      baseUrl
    );
    jsonLdScript = JSON.stringify(schema);
  } else {
    const { data: changelog } = await supabase
      .from("changelog_entries")
      .select("title, content, published_at, updated_at, created_at")
      .eq("id", params.slug)
      .eq("published", true)
      .single();

    if (changelog) {
      const schema = getArticleSchema(
        {
          slug: params.slug,
          title: changelog.title,
          excerpt: changelog.content?.replace(/[#*_`\n]/g, "").slice(0, 160).trim(),
          published_at: changelog.published_at,
          updated_at: changelog.updated_at,
          created_at: changelog.created_at,
        },
        baseUrl
      );
      jsonLdScript = JSON.stringify(schema);
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
