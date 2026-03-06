export { BlogList, BlogPost, BlogEditor, BlogAdmin, ChangelogList, ChangelogAdmin } from "./blog";

export {
  HeroSection,
  LogoMarquee,
  AnimatedCounters,
  FeatureCards,
  TestimonialCarousel,
  ProcessSteps,
  FAQSection,
  FounderLetter,
  ComparisonBars,
  ScreenshotShowcase,
  BottomHeroCTA,
  ImageCollage,
  ImageTextBlocks,
  FeatureSubPage,
  LandingPageBuilder,
  SiteNav,
  DynamicPage,
} from "./landing";
export type { SectionConfig } from "./landing";
export { defaultLandingConfig, getLandingConfig, HomePageLoader } from "./landing";

export { LegalPageLayout, legalPages } from "./legal";
export type { LegalPageSlug } from "./legal";

export {
  WaitlistForm,
  WaitlistAdmin,
  FeedbackWidget,
  AnnouncementBar,
  CookieConsentBanner,
  SEOHead,
  generateSEOMeta,
  generateJsonLd,
} from "./marketing";

export { CustomPage, CustomPageEditor } from "./custom-pages";

export { MediaLibrary, MediaPicker } from "./media";

export { PageErrorBoundary } from "./components";

export {
  getBrandSettings,
  getPageMetadata,
  getHomePageMetadata,
  getBlogPostMetadata,
  getBlogListMetadata,
  getLegalPageMetadata,
  generateSitemap,
  generateRobots,
  getOrganizationSchema,
  getWebPageSchema,
  getArticleSchema,
  getBreadcrumbSchema,
  getFAQSchema,
} from "./seo";
export type { BrandSettings, SitePage, BlogPost } from "./seo";

export { cn, replaceVariables, formatDate, slugify } from "./lib/utils";
export { getSupabaseClient, getSupabaseAdmin, getBrowserClient } from "./lib/supabase";
