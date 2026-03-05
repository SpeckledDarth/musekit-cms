"use client";

import { useState, useEffect } from "react";
import { getBrowserClient } from "@/src/lib/supabase";
import { formatDate, slugify } from "@/src/lib/utils";
import { BlogEditor } from "./BlogEditor";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

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

export function BlogAdmin({ userId }: BlogAdminProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

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
      fetchPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Admin</h1>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-16 bg-muted rounded-lg" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{post.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span
                    className={
                      post.published
                        ? "text-green-600 dark:text-green-400"
                        : "text-yellow-600 dark:text-yellow-400"
                    }
                  >
                    {post.published ? "published" : "draft"}
                  </span>
                  <span>·</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleTogglePublish(post)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                  title={post.published ? "Unpublish" : "Publish"}
                >
                  {post.published ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setEditing(post)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 text-muted-foreground hover:text-red-500 rounded-md hover:bg-muted"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
