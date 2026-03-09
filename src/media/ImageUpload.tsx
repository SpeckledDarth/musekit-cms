"use client";

import { useState, useRef, useCallback } from "react";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { uploadFile } from "./storage";
import { MediaPicker } from "./MediaPicker";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

function sanitizeFilename(name: string): string {
  const ext = name.substring(name.lastIndexOf("."));
  const base = name
    .substring(0, name.lastIndexOf("."))
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${Date.now()}${ext.toLowerCase()}`;
}

export function ImageUpload({ value, onChange, folder }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Invalid file type. Use JPG, PNG, GIF, WebP, or SVG.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("File too large. Maximum size is 5 MB.");
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const safeName = sanitizeFilename(file.name);
        const path = folder ? `${folder}/${safeName}` : safeName;
        const url = await uploadFile(file, path);
        onChange(url);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handlePickerSelect(url: string) {
    onChange(url);
  }

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50",
          value ? "p-2" : "p-6",
        )}
      >
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt="Selected"
              className="w-full h-40 object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="px-3 py-1.5 bg-background text-foreground text-xs font-medium rounded-md hover:bg-muted"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="p-1.5 bg-background text-red-600 rounded-md hover:bg-muted"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Drag and drop an image, or
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Media Library
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload image"
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
      />
    </>
  );
}
