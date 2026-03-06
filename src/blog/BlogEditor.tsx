"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/src/lib/utils";
import { MediaPicker } from "@/src/media/MediaPicker";
import { ImageIcon } from "lucide-react";

interface BlogEditorProps {
  initialContent?: string;
  initialTitle?: string;
  onSave: (data: {
    title: string;
    content: string;
  }) => void;
  saving?: boolean;
  onTitleChange?: (title: string) => void;
  onContentChange?: () => void;
}

export function BlogEditor({
  initialContent = "",
  initialTitle = "",
  onSave,
  saving = false,
  onTitleChange,
  onContentChange,
}: BlogEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSave() {
    onSave({ title, content });
  }

  function handleInsertImage(url: string) {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const markdown = `![image](${url})`;
      const newContent = content.slice(0, start) + markdown + content.slice(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        const newPos = start + markdown.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      setContent((prev) => prev + `\n![image](${url})`);
    }
    setMediaPickerOpen(false);
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          onTitleChange?.(e.target.value);
        }}
        placeholder="Post title"
        className="w-full px-4 py-3 text-2xl font-bold bg-transparent border-b border-border focus:outline-none focus:border-primary"
      />

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center border-b border-border">
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
          <div className="ml-auto pr-2">
            <button
              onClick={() => setMediaPickerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title="Insert Image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Insert Image
            </button>
          </div>
        </div>

        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => { setContent(e.target.value); onContentChange?.(); }}
            placeholder="Write your post content in Markdown..."
            className="w-full min-h-[400px] p-4 bg-background text-foreground font-mono text-sm resize-y focus:outline-none"
          />
        ) : (
          <div className="p-4 min-h-[400px] prose prose-neutral dark:prose-invert max-w-none">
            {content ? (
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
                {content}
              </ReactMarkdown>
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

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleInsertImage}
      />
    </div>
  );
}
