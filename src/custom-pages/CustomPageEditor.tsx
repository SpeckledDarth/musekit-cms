"use client";

import { useState, useEffect } from "react";
import { getBrowserClient } from "@/src/lib/supabase";
import { slugify } from "@/src/lib/utils";
import { BlogEditor } from "@/src/blog/BlogEditor";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Page {
  id: string;
  type?: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
}

interface CustomPageEditorProps {
  userId?: string;
}

export function CustomPageEditor({ userId }: CustomPageEditorProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

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
        slug: slugify(data.title),
        content: data.content,
        type: "page",
        published: true,
        author_id: userId || "anonymous",
      });
      if (error) throw error;
      setCreating(false);
      fetchPages();
    } catch (err) {
      console.error("Failed to create page:", err);
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
        .update({ title: data.title, slug: slugify(data.title), content: data.content })
        .eq("id", editing.id);
      if (error) throw error;
      setEditing(null);
      fetchPages();
    } catch (err) {
      console.error("Failed to update page:", err);
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
      fetchPages();
    } catch (err) {
      console.error("Failed to delete page:", err);
    }
  }

  if (creating) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Create Page</h1>
          <button onClick={() => setCreating(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
        <BlogEditor onSave={handleCreate} saving={saving} />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Page</h1>
          <button onClick={() => setEditing(null)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
        <BlogEditor initialTitle={editing.title} initialContent={editing.content} onSave={handleUpdate} saving={saving} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Custom Pages</h1>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> New Page
        </button>
      </div>
      {loading ? (
        <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="animate-pulse h-14 bg-muted rounded-lg" />)}</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No custom pages yet.</div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <h3 className="font-medium">{page.title}</h3>
                <p className="text-sm text-muted-foreground">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditing(page)} className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(page.id)} className="p-2 text-muted-foreground hover:text-red-500 rounded-md hover:bg-muted"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
