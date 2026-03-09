"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "../lib/supabase";
import { LandingPageBuilder } from "./LandingPageBuilder";
import type { SectionConfig } from "./LandingPageBuilder";

interface DynamicPageProps {
  slug: string;
  preview?: boolean;
}

interface SitePage {
  slug: string;
  title: string;
  status: string;
  sections: SectionConfig[];
}

export function DynamicPage({ slug, preview = false }: DynamicPageProps) {
  const [page, setPage] = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      setNotFound(false);

      const supabase = getBrowserClient();
      let query = supabase.from("site_pages").select("*").eq("slug", slug);

      if (!preview) {
        query = query.eq("status", "published");
      }

      const { data, error } = await query.single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setPage(data as SitePage);
      }

      setLoading(false);
    }

    fetchPage();
  }, [slug, preview]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-4xl px-4">
          <div className="h-12 bg-muted rounded w-3/4 mx-auto" />
          <div className="h-6 bg-muted rounded w-1/2 mx-auto" />
          <div className="h-64 bg-muted rounded" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground text-lg">Page not found</p>
        </div>
      </div>
    );
  }

  if (!page) return null;

  const isUnpublished = preview && page.status !== "published";

  return (
    <div>
      {isUnpublished && showBanner && (
        <div className="bg-warning/10 border-b border-warning/30 px-4 py-3 flex items-center justify-between">
          <p className="text-warning text-sm font-medium">
            Preview Mode — This page is not published
          </p>
          <button
            onClick={() => setShowBanner(false)}
            className="text-warning hover:text-warning/80 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}
      <LandingPageBuilder sections={page.sections} />
    </div>
  );
}
