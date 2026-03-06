export interface BrandSettings {
  appName: string;
  logoUrl?: string;
  faviconUrl?: string;
  description?: string;
  url?: string;
}

export interface SitePage {
  slug: string;
  title: string;
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
  updated_at?: string;
  created_at?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  seo_title?: string;
  excerpt?: string;
  cover_image?: string;
  author_name?: string;
  published_at?: string;
  updated_at?: string;
  created_at?: string;
}

export function getOrganizationSchema(brandSettings: BrandSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brandSettings.appName,
    ...(brandSettings.url && { url: brandSettings.url }),
    ...(brandSettings.logoUrl && {
      logo: {
        "@type": "ImageObject",
        url: brandSettings.logoUrl,
      },
    }),
    ...(brandSettings.description && { description: brandSettings.description }),
  };
}

export function getWebPageSchema(page: SitePage, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.seo_title || page.title,
    url: `${baseUrl}/${page.slug === "home" ? "" : page.slug}`,
    ...(page.seo_description && { description: page.seo_description }),
    ...(page.og_image && {
      image: {
        "@type": "ImageObject",
        url: page.og_image,
      },
    }),
    ...(page.updated_at && { dateModified: page.updated_at }),
    ...(page.created_at && { datePublished: page.created_at }),
  };
}

export function getArticleSchema(post: BlogPost, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seo_title || post.title,
    url: `${baseUrl}/blog/${post.slug}`,
    ...(post.excerpt && { description: post.excerpt }),
    ...(post.cover_image && {
      image: {
        "@type": "ImageObject",
        url: post.cover_image,
      },
    }),
    ...(post.author_name && {
      author: {
        "@type": "Person",
        name: post.author_name,
      },
    }),
    ...(post.published_at && { datePublished: post.published_at }),
    ...(post.updated_at && { dateModified: post.updated_at }),
    ...(post.created_at && !post.published_at && { datePublished: post.created_at }),
  };
}

export function getBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
