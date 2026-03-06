import { MetadataRoute } from "next";
import { generateSitemap } from "@/src/seo/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://musekit.com";
  return generateSitemap(baseUrl);
}
