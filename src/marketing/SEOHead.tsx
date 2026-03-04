interface SEOHeadProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  siteName?: string;
  twitterHandle?: string;
  jsonLd?: Record<string, any>;
  noIndex?: boolean;
}

export function generateSEOMeta({
  title,
  description,
  url,
  image,
  type = "website",
  siteName,
  twitterHandle,
  jsonLd,
  noIndex = false,
}: SEOHeadProps) {
  const metadata: Record<string, any> = {
    title,
    description,
    openGraph: {
      title,
      description,
      type,
      ...(url && { url }),
      ...(image && { images: [{ url: image }] }),
      ...(siteName && { siteName }),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image && { images: [image] }),
      ...(twitterHandle && { creator: twitterHandle }),
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };

  return metadata;
}

export function generateJsonLd(data: Record<string, any>): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    ...data,
  });
}

export function SEOHead({ title, description, siteName, jsonLd }: SEOHeadProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {siteName && <meta property="og:site_name" content={siteName} />}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateJsonLd(jsonLd) }}
        />
      )}
    </>
  );
}
