"use client";

import { useState, useEffect, useMemo } from "react";
import { getBrowserClient } from "@/src/lib/supabase";
import { slugify, cn, formatDate } from "@/src/lib/utils";
import { useToast } from "@/src/lib/toast";
import { BlogEditor } from "@/src/blog/BlogEditor";
import {
  Plus,
  Trash2,
  FileText,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";

interface Page {
  id: string;
  type?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  published: boolean;
  created_at?: string;
}

interface CustomPageEditorProps {
  userId?: string;
}

type SortField = "title" | "slug" | "published" | "created_at";
type SortDir = "asc" | "desc";

export function CustomPageEditor({ userId }: CustomPageEditorProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSlugManual, setFormSlugManual] = useState(false);
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formPublished, setFormPublished] = useState(true);
  const [formContent, setFormContent] = useState("");

  const { success, error: showError } = useToast();

  function resetForm() {
    setFormTitle("");
    setFormSlug("");
    setFormSlugManual(false);
    setFormExcerpt("");
    setFormPublished(true);
    setFormContent("");
  }

  function initFormForCreate() {
    resetForm();
    setCreating(true);
  }

  function initFormForEdit(page: Page) {
    setFormTitle(page.title);
    setFormSlug(page.slug);
    setFormSlugManual(true);
    setFormExcerpt(page.excerpt || "");
    setFormPublished(page.published);
    setFormContent(page.content);
    setEditing(page);
  }

  function handleTitleChange(value: string) {
    setFormTitle(value);
    if (!formSlugManual) {
      setFormSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setFormSlugManual(true);
    setFormSlug(slugify(value));
  }

  async function fetchPages() {
    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("type", "page")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPages(data || []);
    } catch (err) {
      console.error("Failed to fetch pages:", err);
      showError("Failed to load pages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPages();
  }, []);

  async function handleCreate(data: { title: string; content: string }) {
    setSaving(true);
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.from("posts").insert({
        title: data.title,
        slug: formSlug || slugify(data.title),
        excerpt: formExcerpt || null,
        content: data.content,
        type: "page",
        published: formPublished,
        author_id: userId || "anonymous",
      });
      if (error) throw error;
      setCreating(false);
      resetForm();
      success("Page created");
      fetchPages();
    } catch (err) {
      console.error("Failed to create page:", err);
      showError("Failed to create page");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data: { title: string; content: string }) {
    if (!editing) return;
    setSaving(true);
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase
        .from("posts")
        .update({
          title: data.title,
          slug: formSlug || slugify(data.title),
          excerpt: formExcerpt || null,
          content: data.content,
          published: formPublished,
        })
        .eq("id", editing.id);
      if (error) throw error;
      setEditing(null);
      resetForm();
      success("Page updated");
      fetchPages();
    } catch (err) {
      console.error("Failed to update page:", err);
      showError("Failed to update page");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      success("Page deleted");
      fetchPages();
    } catch (err) {
      console.error("Failed to delete page:", err);
      showError("Failed to delete page");
    }
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...pages];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "slug":
          cmp = a.slug.localeCompare(b.slug);
          break;
        case "published":
          cmp = Number(a.published) - Number(b.published);
          break;
        case "created_at":
          cmp = new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [pages, search, sortField, sortDir]);

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

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filteredAndSorted.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredAndSorted.map((p) => p.id)));
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected page(s)?`)) return;
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase
        .from("posts")
        .delete()
        .in("id", Array.from(selected));
      if (error) throw error;
      const count = selected.size;
      setSelected(new Set());
      success(`${count} page(s) deleted`);
      fetchPages();
    } catch (err) {
      console.error("Failed to bulk delete:", err);
      showError("Failed to delete selected pages");
    }
  }

  function MetadataFields() {
    return (
      <div className="space-y-4 mb-6 p-4 border border-border rounded-lg bg-muted/30">
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/</span>
            <input
              type="text"
              value={formSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="auto-generated-from-title"
              className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formSlugManual ? "Custom slug" : "Auto-generated from title"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt / Description</label>
          <textarea
            value={formExcerpt}
            onChange={(e) => setFormExcerpt(e.target.value)}
            placeholder="Brief description for SEO and page previews..."
            rows={2}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Published</label>
          <button
            type="button"
            onClick={() => setFormPublished(!formPublished)}
            aria-label={formPublished ? "Set to draft" : "Set to published"}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              formPublished ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                formPublished ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
          <span className={cn(
            "text-xs font-medium",
            formPublished ? "text-green-600" : "text-muted-foreground"
          )}>
            {formPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>
    );
  }

  if (creating) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Create Page</h1>
          <button onClick={() => { setCreating(false); resetForm(); }} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
        <MetadataFields />
        <BlogEditor onSave={handleCreate} saving={saving} onTitleChange={handleTitleChange} />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Page</h1>
          <button onClick={() => { setEditing(null); resetForm(); }} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
        <MetadataFields />
        <BlogEditor initialTitle={editing.title} initialContent={editing.content} onSave={handleUpdate} saving={saving} onTitleChange={handleTitleChange} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Custom Pages</h1>
          <p className="text-sm text-muted-foreground">{filteredAndSorted.length} page(s)</p>
        </div>
        <button onClick={initFormForCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> New Page
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <label htmlFor="pages-search" className="sr-only">Search pages</label>
          <input
            id="pages-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="animate-pulse h-14 bg-muted rounded-lg" />)}</div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {pages.length === 0 ? "No custom pages yet." : "No pages match your search."}
          </p>
          {pages.length === 0 && (
            <button
              onClick={initFormForCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Create your first page
            </button>
          )}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="bg-muted/50">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === filteredAndSorted.length && filteredAndSorted.length > 0}
                    onChange={toggleSelectAll}
                    aria-label="Select all pages"
                    className="rounded border-border"
                  />
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
                  onClick={() => toggleSort("title")}
                >
                  <span className="inline-flex items-center gap-1">
                    Title <SortIcon field="title" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground w-40"
                  onClick={() => toggleSort("slug")}
                >
                  <span className="inline-flex items-center gap-1">
                    Slug <SortIcon field="slug" />
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
                  className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground w-36"
                  onClick={() => toggleSort("created_at")}
                >
                  <span className="inline-flex items-center gap-1">
                    Created <SortIcon field="created_at" />
                  </span>
                </th>
                <th className="w-20 px-4 py-3 text-sm font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((page) => (
                <tr
                  key={page.id}
                  onClick={() => initFormForEdit(page)}
                  className="border-t border-border cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(page.id)}
                      onChange={() => toggleSelect(page.id)}
                      aria-label={`Select ${page.title}`}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-sm">{page.title}</span>
                    {page.excerpt && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{page.excerpt}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">/{page.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        page.published
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      )}
                    >
                      {page.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {page.created_at ? formatDate(page.created_at) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-muted"
                      aria-label="Delete page"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
