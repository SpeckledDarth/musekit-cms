import { MetadataRoute } from "next";
import { getSupabaseClient } from "@/src/lib/supabase";

const legalSlugs = [
  "terms-of-service",
  "privacy-policy",
  "cookie-policy",
  "acceptable-use",
  "accessibility",
  "data-handling",
  "dmca",
  "ai-data-usage",
  "security-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://musekit.com";
  const supabase = getSupabaseClient();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  const legalPageEntries: MetadataRoute.Sitemap = legalSlugs.map((slug) => ({
    url: `${baseUrl}/legal/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const { data: blogPosts } = await supabase
    .from("posts")
    .select("slug, updated_at, created_at, type")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const blogEntries: MetadataRoute.Sitemap = [];
  const featureEntries: MetadataRoute.Sitemap = [];
  const pageEntries: MetadataRoute.Sitemap = [];

  if (blogPosts) {
    for (const post of blogPosts) {
      const lastMod = post.updated_at || post.created_at;
      const type = post.type || "blog";

      if (type === "feature") {
        featureEntries.push({
          url: `${baseUrl}/features/${post.slug}`,
          lastModified: lastMod ? new Date(lastMod) : new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      } else if (type === "page") {
        pageEntries.push({
          url: `${baseUrl}/${post.slug}`,
          lastModified: lastMod ? new Date(lastMod) : new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      } else {
        blogEntries.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: lastMod ? new Date(lastMod) : new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }

  const { data: changelogEntries } = await supabase
    .from("changelog_entries")
    .select("slug, updated_at, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const changelogSitemapEntries: MetadataRoute.Sitemap = (changelogEntries || []).map((entry) => ({
    url: `${baseUrl}/blog/${entry.slug}`,
    lastModified: entry.updated_at ? new Date(entry.updated_at) : new Date(entry.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...blogEntries,
    ...changelogSitemapEntries,
    ...featureEntries,
    ...pageEntries,
    ...legalPageEntries,
  ];
}
