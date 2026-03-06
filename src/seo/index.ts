export {
  getBrandSettings,
  getPageMetadata,
  getHomePageMetadata,
  getBlogPostMetadata,
  getBlogListMetadata,
  getLegalPageMetadata,
} from "./metadata";

export { generateSitemap } from "./sitemap";
export { generateRobots } from "./robots";

export {
  getOrganizationSchema,
  getWebPageSchema,
  getArticleSchema,
  getBreadcrumbSchema,
  getFAQSchema,
} from "./json-ld";

export type { BrandSettings, SitePage, BlogPost } from "./json-ld";
