"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn, replaceVariables } from "@/src/lib/utils";
import { legalPages, type LegalPageSlug } from "./legal-content";

interface LegalPageLayoutProps {
  slug: LegalPageSlug;
  variables?: Record<string, string>;
}

const navItems = [
  { slug: "terms-of-service" as const, label: "Terms of Service" },
  { slug: "privacy-policy" as const, label: "Privacy Policy" },
  { slug: "cookie-policy" as const, label: "Cookie Policy" },
  { slug: "acceptable-use" as const, label: "Acceptable Use" },
  { slug: "accessibility" as const, label: "Accessibility" },
  { slug: "data-handling" as const, label: "Data Handling" },
  { slug: "dmca" as const, label: "DMCA" },
  { slug: "ai-data-usage" as const, label: "AI Data Usage" },
  { slug: "security-policy" as const, label: "Security Policy" },
];

export function LegalPageLayout({ slug, variables = {} }: LegalPageLayoutProps) {
  const page = legalPages[slug];
  if (!page) return <div className="p-8 text-center">Page not found</div>;

  const defaultVariables: Record<string, string> = {
    appName: variables.appName || "MuseKit",
    companyName: variables.companyName || "MuseKit Inc.",
    supportEmail: variables.supportEmail || "support@musekit.com",
    effectiveDate: variables.effectiveDate || new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    ...variables,
  };

  const content = replaceVariables(page.content, defaultVariables);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        <nav className="space-y-1">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Legal
          </h3>
          {navItems.map((item) => (
            <Link
              key={item.slug}
              href={`/legal/${item.slug}`}
              className={cn(
                "block px-3 py-2 rounded-md text-sm transition-colors",
                slug === item.slug
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
