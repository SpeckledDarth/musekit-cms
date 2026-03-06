import type { Metadata } from "next";
import { getSupabaseClient } from "../lib/supabase";

interface BrandSettings {
  appName: string;
  logoUrl: string;
  faviconUrl: string;
  description: string;
}

const DEFAULT_BRAND: BrandSettings = {
  appName: "MuseKit",
  logoUrl: "",
  faviconUrl: "/favicon.ico",
  description: "Build and launch your product faster",
};

export async function getBrandSettings(): Promise<BrandSettings> {
  try {
    const supabase = getSupabaseClient();
    const keys = [
      "branding.appName",
      "branding.logoUrl",
      "branding.faviconUrl",
      "branding.description",
    ];
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", keys);

    if (!data || data.length === 0) return DEFAULT_BRAND;

    const settings: Record<string, string> = {};
    for (const row of data) {
      settings[row.key] = row.value;
    }

    return {
      appName: settings["branding.appName"] || DEFAULT_BRAND.appName,
      logoUrl: settings["branding.logoUrl"] || DEFAULT_BRAND.logoUrl,
      faviconUrl: settings["branding.faviconUrl"] || DEFAULT_BRAND.faviconUrl,
      description: settings["branding.description"] || DEFAULT_BRAND.description,
    };
  } catch {
    return DEFAULT_BRAND;
  }
}

function buildTitle(pageTitle: string, appName: string): string {
  if (pageTitle.includes(appName)) return pageTitle;
  return `${pageTitle} | ${appName}`;
}

export async function getPageMetadata(slug: string): Promise<Metadata> {
  const brand = await getBrandSettings();
  const supabase = getSupabaseClient();

  const { data: page } = await supabase
    .from("site_pages")
    .select("title, seo_title, seo_description, og_image, canonical_url, no_index")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  const title = page?.seo_title || page?.title || slug;
  const description = page?.seo_description || brand.description;

  return {
    title: buildTitle(title, brand.appName),
    description,
    openGraph: {
      title: buildTitle(title, brand.appName),
      description,
      type: "website",
      ...(page?.og_image && { images: [{ url: page.og_image }] }),
    },
    twitter: {
      card: page?.og_image ? "summary_large_image" : "summary",
      title: buildTitle(title, brand.appName),
      description,
      ...(page?.og_image && { images: [page.og_image] }),
    },
    ...(page?.canonical_url && {
      alternates: { canonical: page.canonical_url },
    }),
    robots: page?.no_index
      ? { index: false, follow: false }
      : { index: true, follow: true },
    icons: { icon: brand.faviconUrl },
  };
}

export async function getHomePageMetadata(): Promise<Metadata> {
  const brand = await getBrandSettings();
  const supabase = getSupabaseClient();

  const { data: page } = await supabase
    .from("site_pages")
    .select("title, seo_title, seo_description, og_image, canonical_url")
    .eq("slug", "home")
    .eq("status", "published")
    .single();

  const title = page?.seo_title || page?.title || brand.appName;
  const description = page?.seo_description || brand.description;

  return {
    title: buildTitle(title, brand.appName),
    description,
    openGraph: {
      title: buildTitle(title, brand.appName),
      description,
      type: "website",
      ...(page?.og_image && { images: [{ url: page.og_image }] }),
    },
    twitter: {
      card: page?.og_image ? "summary_large_image" : "summary",
      title: buildTitle(title, brand.appName),
      description,
      ...(page?.og_image && { images: [page.og_image] }),
    },
    ...(page?.canonical_url && {
      alternates: { canonical: page.canonical_url },
    }),
    robots: { index: true, follow: true },
    icons: { icon: brand.faviconUrl },
  };
}

export async function getBlogPostMetadata(slug: string): Promise<Metadata> {
  const brand = await getBrandSettings();
  const supabase = getSupabaseClient();

  const { data: post } = await supabase
    .from("posts")
    .select("title, seo_title, excerpt, cover_image, slug")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (post) {
    const title = post.seo_title || post.title;
    const description = post.excerpt || brand.description;
    return {
      title: buildTitle(title, brand.appName),
      description,
      openGraph: {
        title: buildTitle(title, brand.appName),
        description,
        type: "article",
        ...(post.cover_image && { images: [{ url: post.cover_image }] }),
      },
      twitter: {
        card: post.cover_image ? "summary_large_image" : "summary",
        title: buildTitle(title, brand.appName),
        description,
        ...(post.cover_image && { images: [post.cover_image] }),
      },
      robots: { index: true, follow: true },
      icons: { icon: brand.faviconUrl },
    };
  }

  const { data: changelog } = await supabase
    .from("changelog_entries")
    .select("title, content")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (changelog) {
    const title = changelog.title;
    const description = changelog.content?.replace(/[#*_`\n]/g, "").slice(0, 160).trim() || brand.description;
    return {
      title: buildTitle(title, brand.appName),
      description,
      openGraph: {
        title: buildTitle(title, brand.appName),
        description,
        type: "article",
      },
      twitter: {
        card: "summary",
        title: buildTitle(title, brand.appName),
        description,
      },
      robots: { index: true, follow: true },
      icons: { icon: brand.faviconUrl },
    };
  }

  return {
    title: buildTitle("Post Not Found", brand.appName),
    description: "The requested post could not be found.",
    robots: { index: false, follow: false },
  };
}

export async function getBlogListMetadata(): Promise<Metadata> {
  const brand = await getBrandSettings();

  const title = "Blog";
  const description = `Latest posts and updates from ${brand.appName}`;

  return {
    title: buildTitle(title, brand.appName),
    description,
    openGraph: {
      title: buildTitle(title, brand.appName),
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: buildTitle(title, brand.appName),
      description,
    },
    robots: { index: true, follow: true },
    icons: { icon: brand.faviconUrl },
  };
}

const LEGAL_PAGE_TITLES: Record<string, string> = {
  "terms-of-service": "Terms of Service",
  "privacy-policy": "Privacy Policy",
  "cookie-policy": "Cookie Policy",
  "acceptable-use": "Acceptable Use Policy",
  "refund-policy": "Refund Policy",
  "dmca": "DMCA Policy",
  "gdpr": "GDPR Compliance",
  "disclaimer": "Disclaimer",
};

export async function getLegalPageMetadata(slug: string): Promise<Metadata> {
  const brand = await getBrandSettings();

  const title = LEGAL_PAGE_TITLES[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const description = `${title} for ${brand.appName}`;

  return {
    title: buildTitle(title, brand.appName),
    description,
    openGraph: {
      title: buildTitle(title, brand.appName),
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: buildTitle(title, brand.appName),
      description,
    },
    robots: { index: true, follow: true },
    icons: { icon: brand.faviconUrl },
  };
}
