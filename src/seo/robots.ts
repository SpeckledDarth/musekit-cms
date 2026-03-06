interface RobotsRule {
  userAgent: string;
  allow: string;
  disallow: string[];
}

interface RobotsConfig {
  rules: RobotsRule[];
  sitemap: string;
}

export function generateRobots(baseUrl: string): RobotsConfig {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/api/",
          "/login/",
          "/signup/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
