"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { getBrowserClient } from "../lib/supabase";
import { cn } from "../lib/utils";
import {
  Search,
  Upload,
  X,
  ImageIcon,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

const BUCKET = "media";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

interface MediaFile {
  name: string;
  id: string;
  size: number;
  publicUrl: string;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

export function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase.storage.from(BUCKET).list("", {
        limit: 500,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;

      const mediaFiles: MediaFile[] = (data || [])
        .filter((f) => f.name && !f.name.startsWith("."))
        .map((f) => {
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
          return {
            name: f.name,
            id: f.id || f.name,
            size: f.metadata?.size || 0,
            publicUrl: urlData.publicUrl,
          };
        });
      setFiles(mediaFiles);
    } catch (err) {
      console.error("Failed to fetch media:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setSearch("");
      setSelectedUrl(null);
      setUploadError(null);
      fetchFiles();
    }
  }, [open, fetchFiles]);

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, search]);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setUploadError(null);

    try {
      const supabase = getBrowserClient();
      const errors: string[] = [];

      for (const file of Array.from(fileList)) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push(`${file.name}: Invalid file type`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: File too large (max ${formatFileSize(MAX_FILE_SIZE)})`);
          continue;
        }

        const safeName = sanitizeFilename(file.name);
        const { error } = await supabase.storage.from(BUCKET).upload(safeName, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) errors.push(`${file.name}: ${error.message}`);
      }

      if (errors.length > 0) setUploadError(errors.join("\n"));
      await fetchFiles();
    } catch {
      setUploadError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleConfirm() {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Select an image"
        className="bg-background border border-border rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] mx-4 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Select Image</h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md"
            aria-label="Close image picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <label htmlFor="picker-search" className="sr-only">Search media files</label>
            <input
              id="picker-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(",")}
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
            aria-label="Upload files"
          />
        </div>

        {uploadError && (
          <div className="mx-6 mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-red-700 dark:text-red-300 whitespace-pre-line">{uploadError}</span>
            <button
              onClick={() => setUploadError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
              aria-label="Dismiss upload error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {files.length === 0 ? "No media files. Upload an image to get started." : "No files match your search."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedUrl(file.publicUrl)}
                  aria-label={`Select ${file.name}`}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                    selectedUrl === file.publicUrl
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent hover:border-border"
                  )}
                >
                  <img
                    src={file.publicUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {selectedUrl === file.publicUrl && (
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                    <p className="text-white text-[10px] truncate">{file.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {selectedUrl ? "1 image selected" : "Select an image"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedUrl}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50"
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
