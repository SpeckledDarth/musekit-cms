"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "../lib/supabase";
import { LandingPageBuilder } from "./LandingPageBuilder";
import type { SectionConfig } from "./LandingPageBuilder";
import { defaultLandingConfig } from "./default-config";

export function HomePageLoader() {
  const [sections, setSections] = useState<SectionConfig[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomePage() {
      try {
        const supabase = getBrowserClient();
        const { data, error } = await supabase
          .from("site_pages")
          .select("sections")
          .eq("slug", "home")
          .eq("status", "published")
          .single() as { data: { sections: SectionConfig[] } | null; error: unknown };

        if (error || !data) {
          setSections(defaultLandingConfig);
        } else {
          setSections(data.sections);
        }
      } catch {
        setSections(defaultLandingConfig);
      } finally {
        setLoading(false);
      }
    }

    loadHomePage();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8 p-8">
        <div className="h-64 bg-gray-200 rounded-lg" />
        <div className="h-48 bg-gray-200 rounded-lg" />
        <div className="h-48 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  return <LandingPageBuilder sections={sections || defaultLandingConfig} />;
}
