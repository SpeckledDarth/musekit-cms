"use client";

import { useState, useEffect, useMemo } from "react";
import { getBrowserClient } from "@/src/lib/supabase";
import { formatDate, slugify } from "@/src/lib/utils";
import { BlogEditor } from "./BlogEditor";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileText,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Post {
  id: string;
  type?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author_id: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
}

interface BlogAdminProps {
  userId?: string;
}

type SortField = "title" | "published" | "type" | "created_at" | "updated_at";
type SortDir = "asc" | "desc";

export function BlogAdmin({ userId }: BlogAdminProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "blog" | "changelog">("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  async function fetchPosts() {
    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...posts];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((p) =>
        statusFilter === "published" ? p.published : !p.published
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((p) => {
        const t = (p.type || "blog").toLowerCase();
        return t.includes(typeFilter);
      });
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
        case "type":
          cmp = (a.type || "").localeCompare(b.type || "");
          break;
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "updated_at":
          cmp =
            new Date(a.updated_at || a.created_at).getTime() -
            new Date(b.updated_at || b.created_at).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [posts, search, statusFilter, typeFilter, sortField, sortDir]);

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

  async function handleCreate(data: { title: string; content: string }) {
    setSaving(true);
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.from("posts").insert({
        title: data.title,
        slug: slugify(data.title),
        content: data.content,
        published: false,
        author_id: userId || "anonymous",
      });
      if (error) throw error;
      setCreating(false);
      fetchPosts();
    } catch (err) {
      console.error("Failed to create post:", err);
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
          slug: slugify(data.title),
          content: data.content,
        })
        .eq("id", editing.id);
      if (error) throw error;
      setEditing(null);
      fetchPosts();
    } catch (err) {
      console.error("Failed to update post:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(post: Post) {
    try {
      const supabase = getBrowserClient();
      const nowPublished = !post.published;
      const { error } = await supabase
        .from("posts")
        .update({
          published: nowPublished,
          published_at: nowPublished ? new Date().toISOString() : null,
        })
        .eq("id", post.id);
      if (error) throw error;
      fetchPosts();
    } catch (err) {
      console.error("Failed to toggle publish:", err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected post(s)?`)) return;
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase
        .from("posts")
        .delete()
        .in("id", Array.from(selected));
      if (error) throw error;
      setSelected(new Set());
      fetchPosts();
    } catch (err) {
      console.error("Failed to bulk delete:", err);
    }
  }

  async function handleBulkTogglePublish(publish: boolean) {
    if (selected.size === 0) return;
    const action = publish ? "publish" : "unpublish";
    if (!confirm(`${publish ? "Publish" : "Unpublish"} ${selected.size} selected post(s)?`)) return;
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase
        .from("posts")
        .update({
          published: publish,
          published_at: publish ? new Date().toISOString() : null,
        })
        .in("id", Array.from(selected));
      if (error) throw error;
      setSelected(new Set());
      fetchPosts();
    } catch (err) {
      console.error(`Failed to bulk ${action}:`, err);
    }
  }

  if (creating) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Create New Post</h1>
          <button
            onClick={() => setCreating(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
        <BlogEditor onSave={handleCreate} saving={saving} />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <button
            onClick={() => setEditing(null)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
        <BlogEditor
          initialTitle={editing.title}
          initialContent={editing.content}
          onSave={handleUpdate}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Admin</h1>
          <p className="text-sm text-muted-foreground">{filteredAndSorted.length} post(s)</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Types</option>
          <option value="blog">Blog</option>
          <option value="changelog">Changelog</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button
            onClick={() => handleBulkTogglePublish(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Eye className="w-3.5 h-3.5" />
            Publish
          </button>
          <button
            onClick={() => handleBulkTogglePublish(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            <EyeOff className="w-3.5 h-3.5" />
            Unpublish
          </button>
          <button
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-14 bg-muted rounded-lg" />
          ))}
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {posts.length === 0
              ? "No posts yet. Create your first post!"
              : "No posts match your filters."}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === filteredAndSorted.length && filteredAndSorted.length > 0}
                    onChange={toggleSelectAll}
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
                  className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground w-28"
                  onClick={() => toggleSort("published")}
                >
                  <span className="inline-flex items-center gap-1">
                    Status <SortIcon field="published" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground w-28"
                  onClick={() => toggleSort("type")}
                >
                  <span className="inline-flex items-center gap-1">
                    Type <SortIcon field="type" />
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
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground w-36"
                  onClick={() => toggleSort("updated_at")}
                >
                  <span className="inline-flex items-center gap-1">
                    Updated <SortIcon field="updated_at" />
                  </span>
                </th>
                <th className="w-24 px-4 py-3 text-sm font-medium text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((post) => (
                <tr
                  key={post.id}
                  onClick={() => setEditing(post)}
                  className="border-t border-border cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(post.id)}
                      onChange={() => toggleSelect(post.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-sm">{post.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        post.published
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      )}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground capitalize">
                      {post.type || "blog"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {post.updated_at ? formatDate(post.updated_at) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                        title={post.published ? "Unpublish" : "Publish"}
                      >
                        {post.published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-muted"
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
