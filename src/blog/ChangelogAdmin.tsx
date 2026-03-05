"use client";

import { useState, useEffect, useMemo } from "react";
import { getBrowserClient } from "../lib/supabase";
import { formatDate, slugify } from "../lib/utils";
import { cn } from "../lib/utils";
import { useToast } from "../lib/toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ScrollText,
  ArrowLeft,
} from "lucide-react";

interface ChangelogEntry {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
}

type CategoryFilter = "all" | "release" | "update" | "feature" | "fix";
type SortField = "title" | "published" | "category" | "created_at";
type SortDir = "asc" | "desc";

const categoryOptions: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Releases", value: "release" },
  { label: "Updates", value: "update" },
  { label: "Features", value: "feature" },
  { label: "Fixes", value: "fix" },
];

const categoryBadgeColors: Record<string, string> = {
  release: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  update: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  feature: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  fix: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

export function ChangelogAdmin() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState<string>("update");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const { success, error: showError } = useToast();

  async function fetchEntries() {
    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase
        .from("changelog_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error("Failed to fetch changelog entries:", err);
      showError("Failed to load changelog entries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5" />
    );
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...entries];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(q));
    }

    if (categoryFilter !== "all") {
      result = result.filter((e) => e.category === categoryFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "published":
          cmp = Number(a.published) - Number(b.published);
          break;
        case "category":
          cmp = (a.category || "").localeCompare(b.category || "");
          break;
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [entries, search, categoryFilter, sortField, sortDir]);

  function startCreate() {
    setFormTitle("");
    setFormContent("");
    setFormCategory("update");
    setActiveTab("write");
    setEditingEntry(null);
    setMode("create");
  }

  function startEdit(entry: ChangelogEntry) {
    setFormTitle(entry.title);
    setFormContent(entry.content);
    setFormCategory(entry.category || "update");
    setActiveTab("write");
    setEditingEntry(entry);
    setMode("edit");
  }

  function cancelEdit() {
    setMode("list");
    setEditingEntry(null);
  }

  async function handleSave() {
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      const supabase = getBrowserClient();
      if (mode === "create") {
        const { error } = await supabase.from("changelog_entries").insert({
          title: formTitle,
          slug: slugify(formTitle),
          content: formContent,
          category: formCategory,
          published: false,
        });
        if (error) throw error;
        success("Changelog entry created");
      } else if (mode === "edit" && editingEntry) {
        const { error } = await supabase
          .from("changelog_entries")
          .update({
            title: formTitle,
            slug: slugify(formTitle),
            content: formContent,
            category: formCategory,
          })
          .eq("id", editingEntry.id);
        if (error) throw error;
        success("Changelog entry updated");
      }
      setMode("list");
      setEditingEntry(null);
      fetchEntries();
    } catch (err) {
      console.error("Failed to save changelog entry:", err);
      showError("Failed to save changelog entry");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(entry: ChangelogEntry) {
    try {
      const supabase = getBrowserClient();
      const nowPublished = !entry.published;
      const { error } = await supabase
        .from("changelog_entries")
        .update({
          published: nowPublished,
          published_at: nowPublished ? new Date().toISOString() : null,
        })
        .eq("id", entry.id);
      if (error) throw error;
      success(nowPublished ? "Entry published" : "Entry unpublished");
      fetchEntries();
    } catch (err) {
      console.error("Failed to toggle publish:", err);
      showError("Failed to update publish status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this changelog entry?")) return;
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.from("changelog_entries").delete().eq("id", id);
      if (error) throw error;
      success("Changelog entry deleted");
      fetchEntries();
    } catch (err) {
      console.error("Failed to delete changelog entry:", err);
      showError("Failed to delete changelog entry");
    }
  }

  if (mode === "create" || mode === "edit") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={cancelEdit}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
              aria-label="Go back to list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">
              {mode === "create" ? "New Changelog Entry" : "Edit Changelog Entry"}
            </h1>
          </div>
          <button
            onClick={cancelEdit}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Entry title"
            className="w-full px-4 py-3 text-2xl font-bold bg-transparent border-b border-border focus:outline-none focus:border-primary"
          />

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Category</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="release">Release</option>
              <option value="update">Update</option>
              <option value="feature">Feature</option>
              <option value="fix">Fix</option>
            </select>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("write")}
                className={cn(
                  "px-4 py-2 text-sm font-medium",
                  activeTab === "write"
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Write
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "px-4 py-2 text-sm font-medium",
                  activeTab === "preview"
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Preview
              </button>
            </div>

            {activeTab === "write" ? (
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Write changelog content in Markdown..."
                className="w-full min-h-[300px] p-4 bg-background text-foreground font-mono text-sm resize-y focus:outline-none"
              />
            ) : (
              <div className="p-4 min-h-[300px] prose prose-neutral dark:prose-invert max-w-none">
                {formContent ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{formContent}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">Nothing to preview</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || !formTitle.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Changelog Admin</h1>
          <p className="text-sm text-muted-foreground">{filteredAndSorted.length} entry(ies)</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <label htmlFor="changelog-search" className="sr-only">Search changelog entries</label>
          <input
            id="changelog-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
          aria-label="Filter by category"
          className="px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {categoryOptions.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-14 bg-muted rounded-lg" />
          ))}
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-center py-16">
          <ScrollText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {entries.length === 0
              ? "No changelog entries yet. Create your first entry!"
              : "No entries match your filters."}
          </p>
          {entries.length === 0 && (
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Create your first entry
            </button>
          )}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-muted/50">
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
                  onClick={() => toggleSort("title")}
                >
                  <span className="inline-flex items-center gap-1">
                    Title <SortIcon field="title" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground w-28"
                  onClick={() => toggleSort("published")}
                >
                  <span className="inline-flex items-center gap-1">
                    Status <SortIcon field="published" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground w-28"
                  onClick={() => toggleSort("category")}
                >
                  <span className="inline-flex items-center gap-1">
                    Category <SortIcon field="category" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground w-36"
                  onClick={() => toggleSort("created_at")}
                >
                  <span className="inline-flex items-center gap-1">
                    Date <SortIcon field="created_at" />
                  </span>
                </th>
                <th className="w-24 px-4 py-3 text-sm font-medium text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((entry) => (
                <tr
                  key={entry.id}
                  onClick={() => startEdit(entry)}
                  className="border-t border-border cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-sm">{entry.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        entry.published
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      )}
                    >
                      {entry.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                        categoryBadgeColors[entry.category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      {entry.category || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(entry.published_at || entry.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePublish(entry)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                        aria-label={entry.published ? "Unpublish entry" : "Publish entry"}
                        title={entry.published ? "Unpublish" : "Publish"}
                      >
                        {entry.published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-muted"
                        aria-label="Delete entry"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
