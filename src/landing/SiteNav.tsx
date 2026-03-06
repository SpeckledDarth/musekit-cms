"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "../lib/supabase";

interface NavPage {
  slug: string;
  title: string;
  sort_order: number;
}

interface SiteNavProps {
  className?: string;
}

export function SiteNav({ className }: SiteNavProps) {
  const [pages, setPages] = useState<NavPage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = getBrowserClient();

    supabase
      .from("site_pages")
      .select("slug, title, sort_order")
      .eq("show_in_nav", true)
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!cancelled && data) {
          setPages(data as NavPage[]);
        }
        if (!cancelled) {
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || pages.length === 0) {
    return null;
  }

  return (
    <nav className={className}>
      {pages.map((page) => (
        <a
          key={page.slug}
          href={page.slug === "home" ? "/" : `/${page.slug}`}
          className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          {page.title}
        </a>
      ))}
    </nav>
  );
}
