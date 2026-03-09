"use client";

import { useState, useEffect, useMemo } from "react";
import { getBrowserClient } from "@/src/lib/supabase";
import { formatDate, slugify } from "@/src/lib/utils";
import { BlogEditor } from "./BlogEditor";
import { useToast } from "@/src/lib/toast";
import { RelativeTime } from "@/src/lib/RelativeTime";
import { useUnsavedChanges } from "@/src/lib/useUnsavedChanges";
import { useURLFilters } from "@/src/lib/useURLFilters";
import { Breadcrumb } from "@/src/lib/Breadcrumb";
import { Pagination, paginate } from "@/src/lib/Pagination";
import { auditLog } from "@/src/lib/audit";
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
  Download,
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
  const { getParam, getNumericParam, setParams } = useURLFilters();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState(getParam("q"));
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">(getParam("status", "all") as "all" | "published" | "draft");
  const [typeFilter, setTypeFilter] = useState<"all" | "blog" | "changelog">(getParam("type", "all") as "all" | "blog" | "changelog");
  const [sortField, setSortField] = useState<SortField>(getParam("sort", "created_at") as SortField);
  const [sortDir, setSortDir] = useState<SortDir>(getParam("dir", "desc") as SortDir);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(getNumericParam("page", 1));
  const [isDirty, setIsDirty] = useState(false);
  const [titleError, setTitleError] = useState("");

  const { success, error: showError } = useToast();
  const { confirmDiscard } = useUnsavedChanges(isDirty);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

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
      showError("Failed to load posts");
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

  const paginatedItems = paginate(filteredAndSorted, page);

  function toggleSort(field: SortField) {
    let newDir: SortDir;
    if (sortField === field) {
      newDir = sortDir === "asc" ? "desc" : "asc";
      setSortDir(newDir);
    } else {
      newDir = "asc";
      setSortField(field);
      setSortDir(newDir);
    }
    setParams({ sort: field, dir: newDir, page: null });
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

  function exportCSV() {
    const csv = ["Title,Slug,Status,Type,Created,Updated", ...filteredAndSorted.map(p =>
      [p.title, p.slug, p.published ? "Published" : "Draft", p.type || "blog", p.created_at, p.updated_at || ""].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(",")
    )].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blog-posts-" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCreate(data: { title: string; content: string }) {
    if (!data.title.trim()) { setTitleError("Title is required"); return; } else { setTitleError(""); }
    setSaving(true);
    try {
      const supabase = getBrowserClient();
      if (!userId) {
        showError("You must be signed in to create posts");
        setSaving(false);
        return;
      }
      const { error } = await supabase.from("posts").insert({
        title: data.title,
        slug: slugify(data.title),
        content: data.content,
        published: false,
        author_id: userId,
      });
      if (error) throw error;
      setCreating(false);
      setIsDirty(false);
      success("Post created");
      auditLog({ action: "create", entity: "post", entityId: undefined, userId, details: { title: data.title } });
      fetchPosts();
    } catch (err) {
      console.error("Failed to create post:", err);
      showError("Failed to create post");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data: { title: string; content: string }) {
    if (!editing) return;
    if (!data.title.trim()) { setTitleError("Title is required"); return; } else { setTitleError(""); }
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
      setIsDirty(false);
      success("Post updated");
      auditLog({ action: "update", entity: "post", entityId: editing.id, userId, details: { title: data.title } });
      fetchPosts();
    } catch (err) {
      console.error("Failed to update post:", err);
      showError("Failed to update post");
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
      success(nowPublished ? "Post published" : "Post unpublished");
      auditLog({ action: nowPublished ? "publish" : "unpublish", entity: "post", entityId: post.id, userId });
      fetchPosts();
    } catch (err) {
      console.error("Failed to toggle publish:", err);
      showError("Failed to update publish status");
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
      success("Post deleted");
      auditLog({ action: "delete", entity: "post", entityId: id, userId });
      fetchPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
      showError("Failed to delete post");
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
      auditLog({ action: "bulk_delete", entity: "post", userId, details: { count: selected.size, ids: Array.from(selected) } });
      setSelected(new Set());
      success(`${selected.size} post(s) deleted`);
      fetchPosts();
    } catch (err) {
      console.error("Failed to bulk delete:", err);
      showError("Failed to delete selected posts");
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
      auditLog({ action: publish ? "bulk_publish" : "bulk_unpublish", entity: "post", userId, details: { count: selected.size, ids: Array.from(selected) } });
      setSelected(new Set());
      success(`${selected.size} post(s) ${action}ed`);
      fetchPosts();
    } catch (err) {
      console.error(`Failed to bulk ${action}:`, err);
      showError(`Failed to ${action} selected posts`);
    }
  }

  if (creating) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: "Blog Admin", onClick: () => { if (confirmDiscard()) { setCreating(false); setIsDirty(false); setTitleError(""); } } }, { label: "New Post" }]} />
        {titleError && <p className="text-danger text-sm mb-2">{titleError}</p>}
        <BlogEditor onSave={handleCreate} saving={saving} onTitleChange={() => { setIsDirty(true); setTitleError(""); }} onContentChange={() => setIsDirty(true)} />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: "Blog Admin", onClick: () => { if (confirmDiscard()) { setEditing(null); setIsDirty(false); setTitleError(""); } } }, { label: "Edit Post" }]} />
        {titleError && <p className="text-danger text-sm mb-2">{titleError}</p>}
        <BlogEditor
          initialTitle={editing.title}
          initialContent={editing.content}
          onSave={handleUpdate}
          saving={saving}
          onTitleChange={() => { setIsDirty(true); setTitleError(""); }}
          onContentChange={() => setIsDirty(true)}
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
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => { setCreating(true); setIsDirty(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <label htmlFor="blog-search" className="sr-only">Search posts</label>
          <input
            id="blog-search"
            type="text"
            value={search}
            onChange={(e) => { const val = e.target.value; setSearch(val); setParams({ q: val, page: null }); }}
            placeholder="Search posts..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { const val = e.target.value as typeof statusFilter; setStatusFilter(val); setParams({ status: val, page: null }); }}
          aria-label="Filter by status"
          className="px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { const val = e.target.value as typeof typeFilter; setTypeFilter(val); setParams({ type: val, page: null }); }}
          aria-label="Filter by type"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-success text-success-foreground rounded-md hover:bg-success/90"
          >
            <Eye className="w-3.5 h-3.5" />
            Publish
          </button>
          <button
            onClick={() => handleBulkTogglePublish(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-warning text-warning-foreground rounded-md hover:bg-warning/90"
          >
            <EyeOff className="w-3.5 h-3.5" />
            Unpublish
          </button>
          <button
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-danger text-danger-foreground rounded-md hover:bg-danger/90"
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
          <p className="text-muted-foreground mb-4">
            {posts.length === 0
              ? "No posts yet. Create your first post!"
              : "No posts match your filters."}
          </p>
          {posts.length === 0 && (
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Create your first post
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-muted/50">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size === filteredAndSorted.length && filteredAndSorted.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all posts"
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
                {paginatedItems.map((post) => (
                  <tr
                    key={post.id}
                    onClick={() => { setEditing(post); setIsDirty(false); }}
                    className="border-t border-border cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(post.id)}
                        onChange={() => toggleSelect(post.id)}
                        aria-label={`Select ${post.title}`}
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
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
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
                      <RelativeTime date={post.created_at} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {post.updated_at ? <RelativeTime date={post.updated_at} /> : "—"}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                          aria-label={post.published ? "Unpublish post" : "Publish post"}
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
                          className="p-1.5 text-muted-foreground hover:text-danger rounded-md hover:bg-muted"
                          aria-label="Delete post"
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
          <Pagination currentPage={page} totalItems={filteredAndSorted.length} onPageChange={(p) => { setPage(p); setParams({ page: p > 1 ? p : null }); }} />
        </>
      )}
    </div>
  );
}
