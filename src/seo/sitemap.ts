import { getSupabaseClient } from "../lib/supabase";

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

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

export async function generateSitemap(baseUrl: string): Promise<SitemapEntry[]> {
  const supabase = getSupabaseClient();

  const staticPages: SitemapEntry[] = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const legalPageEntries: SitemapEntry[] = legalSlugs.map((slug) => ({
    url: `${baseUrl}/legal/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.2,
  }));

  const { data: sitePages } = await supabase
    .from("site_pages")
    .select("slug, updated_at, created_at")
    .eq("status", "published")
    .eq("no_index", false);

  const dynamicPageEntries: SitemapEntry[] = (sitePages || [])
    .filter((p: any) => p.slug !== "home")
    .map((page: any) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(page.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const { data: blogPosts } = await supabase
    .from("posts")
    .select("slug, updated_at, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const blogEntries: SitemapEntry[] = (blogPosts || []).map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const { data: changelogEntries } = await supabase
    .from("changelog_entries")
    .select("slug, updated_at, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const changelogSitemapEntries: SitemapEntry[] = (changelogEntries || []).map((entry: any) => ({
    url: `${baseUrl}/blog/${entry.slug}`,
    lastModified: entry.updated_at ? new Date(entry.updated_at) : new Date(entry.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...dynamicPageEntries,
    ...blogEntries,
    ...changelogSitemapEntries,
    ...legalPageEntries,
  ];
}
