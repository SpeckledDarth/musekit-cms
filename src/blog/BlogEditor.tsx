"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/src/lib/utils";

interface BlogEditorProps {
  initialContent?: string;
  initialTitle?: string;
  initialCategory?: string;
  initialTags?: string[];
  onSave: (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => void;
  saving?: boolean;
}

export function BlogEditor({
  initialContent = "",
  initialTitle = "",
  initialCategory = "",
  initialTags = [],
  onSave,
  saving = false,
}: BlogEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [category, setCategory] = useState(initialCategory);
  const [tagsInput, setTagsInput] = useState(initialTags.join(", "));
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  function handleSave() {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ title, content, category, tags });
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        className="w-full px-4 py-3 text-2xl font-bold bg-transparent border-b border-border focus:outline-none focus:border-primary"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Engineering, Product"
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g., release, feature, update"
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content in Markdown..."
            className="w-full min-h-[400px] p-4 bg-background text-foreground font-mono text-sm resize-y focus:outline-none"
          />
        ) : (
          <div className="p-4 min-h-[400px] prose prose-neutral dark:prose-invert max-w-none">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
