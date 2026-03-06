"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDate } from "@/src/lib/utils";
import { getBrowserClient } from "@/src/lib/supabase";
import { ArrowLeft } from "lucide-react";

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

interface BlogPostProps {
  slug: string;
}

export function BlogPost({ slug }: BlogPostProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const supabase = getBrowserClient();
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .single();

        if (data && !error) {
          setPost(data);
          return;
        }

        const { data: changelogData, error: changelogError } = await supabase
          .from("changelog_entries")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .single();

        if (changelogError) throw changelogError;
        if (changelogData) {
          setPost({
            ...changelogData,
            type: "changelog",
            author_id: "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-muted rounded w-3/4 mb-4" />
        <div className="h-4 bg-muted rounded w-1/4 mb-8" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-muted rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link href="/blog" className="text-primary hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to blog
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {post.published_at && <time>{formatDate(post.published_at)}</time>}
        </div>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>,
            h2: ({ children }) => <h3 className="text-2xl font-semibold mt-6 mb-3">{children}</h3>,
            h3: ({ children }) => <h4 className="text-xl font-semibold mt-5 mb-2">{children}</h4>,
            h4: ({ children }) => <h5 className="text-lg font-medium mt-4 mb-2">{children}</h5>,
            h5: ({ children }) => <h6 className="text-base font-medium mt-3 mb-1">{children}</h6>,
            h6: ({ children }) => <h6 className="text-base font-medium mt-3 mb-1">{children}</h6>,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
