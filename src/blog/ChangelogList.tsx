"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "../lib/utils";
import { getBrowserClient } from "../lib/supabase";
import { ScrollText } from "lucide-react";

interface ChangelogEntry {
  id: string;
  title: string;
  version: string;
  content: string;
  category: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
}

type FilterType = "all" | "release" | "update" | "feature" | "fix";

const filters: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Releases", value: "release" },
  { label: "Updates", value: "update" },
  { label: "Features", value: "feature" },
  { label: "Fixes", value: "fix" },
];

const tagColors: Record<string, string> = {
  release: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  update: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  feature: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  fix: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

const defaultBadge = "bg-muted text-muted-foreground";

function getTagBadge(entry: ChangelogEntry): { label: string; className: string } {
  const category = (entry.category || "").toLowerCase();
  return {
    label: category || "update",
    className: tagColors[category] || defaultBadge,
  };
}

function matchesFilter(entry: ChangelogEntry, filter: FilterType): boolean {
  if (filter === "all") return true;
  return (entry.category || "").toLowerCase() === filter;
}

function groupByMonth(entries: ChangelogEntry[]): { label: string; entries: ChangelogEntry[] }[] {
  const groups: Record<string, ChangelogEntry[]> = {};
  for (const entry of entries) {
    const date = new Date(entry.published_at || entry.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, entries]) => ({
      label: new Date(entries[0].published_at || entries[0].created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      }),
      entries,
    }));
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ChangelogList() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  useEffect(() => {
    async function fetchEntries() {
      try {
        const supabase = getBrowserClient();
        const { data, error } = await supabase
          .from("changelog_entries")
          .select("*")
          .eq("published", true)
          .order("published_at", { ascending: false });

        if (error) throw error;

        setEntries(data || []);
      } catch (err) {
        console.error("Failed to fetch changelog entries:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  const filteredEntries =
    activeFilter === "all"
      ? entries
      : entries.filter((entry) => matchesFilter(entry, activeFilter));

  const grouped = groupByMonth(filteredEntries);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-muted rounded w-72 mb-8 animate-pulse" />
        <div className="flex gap-2 mb-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-5 bg-muted rounded w-36 animate-pulse" />
              <div className="ml-8 space-y-4">
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Changelog</h1>
      <p className="text-muted-foreground mb-8">Latest updates, improvements, and fixes</p>

      <div className="flex gap-2 mb-10 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              activeFilter === filter.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-16">
          <ScrollText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">
            No changelog entries yet. Check back soon for updates.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map((group) => (
            <div key={group.label}>
              <h2 className="text-lg font-semibold text-muted-foreground mb-6">{group.label}</h2>
              <div className="relative pl-8 border-l-2 border-border space-y-8">
                {group.entries.map((entry) => {
                  const badge = getTagBadge(entry);
                  const summary =
                    entry.content.slice(0, 150).replace(/[#*_`]/g, "").trim();
                  return (
                    <div key={entry.id} className="relative">
                      <div className="absolute -left-[calc(2rem+5px)] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                              badge.className
                            )}
                          >
                            {badge.label}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatShortDate(entry.published_at || entry.created_at)}
                          </span>
                        </div>
                        <Link
                          href={`/blog/${entry.id}`}
                          className="text-lg font-semibold hover:text-primary transition-colors"
                        >
                          {entry.title}
                        </Link>
                        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                          {summary}
                          {entry.content.length > 150 && "..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
