import { MetadataRoute } from "next";
import { generateRobots } from "@/src/seo/robots";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://musekit.com";
  return generateRobots(baseUrl);
}
