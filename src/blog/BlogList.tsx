"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn, formatDate } from "@/src/lib/utils";
import { getBrowserClient } from "@/src/lib/supabase";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  author_id: string;
  published_at: string | null;
  created_at: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
}

export function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchPosts() {
      try {
        const supabase = getBrowserClient();
        let query = supabase
          .from("content_posts")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (selectedCategory !== "all") {
          query = query.eq("category", selectedCategory);
        }

        const { data, error } = await query;
        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [selectedCategory]);

  const categories = ["all", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-3" />
              <div className="h-4 bg-muted rounded w-1/4 mb-4" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Blog</h1>
      <p className="text-muted-foreground mb-8">Latest news, updates, and insights</p>

      {categories.length > 1 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as string)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat === "all" ? "All" : (cat as string)}
            </button>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No posts yet. Check back soon!</p>
      ) : (
        <div className="space-y-10">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-semibold group-hover:text-primary transition-colors mb-1">
                  {post.title}
                </h2>
              </Link>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                {post.published_at && <time>{formatDate(post.published_at)}</time>}
                {post.category && (
                  <>
                    <span>·</span>
                    <span>{post.category}</span>
                  </>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {post.excerpt || post.content.slice(0, 200).replace(/[#*_]/g, "")}...
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-primary text-sm font-medium mt-2 inline-block hover:underline"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
