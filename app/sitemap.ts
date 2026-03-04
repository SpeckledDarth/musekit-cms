import { MetadataRoute } from "next";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://musekit.com";

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/admin`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  const legalPageEntries = legalSlugs.map((slug) => ({
    url: `${baseUrl}/legal/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...legalPageEntries];
}
