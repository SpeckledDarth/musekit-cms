"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { getBrowserClient } from "../lib/supabase";
import { useToast } from "../lib/toast";
import {
  Search,
  Upload,
  Trash2,
  Copy,
  Eye,
  X,
  ImageIcon,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "../lib/utils";

const BUCKET = "media";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

interface MediaFile {
  name: string;
  id: string;
  size: number;
  created_at: string;
  publicUrl: string;
}

interface MediaLibraryProps {
  selectable?: boolean;
  onSelect?: (url: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sanitizeFilename(name: string): string {
  const ext = name.substring(name.lastIndexOf("."));
  const base = name
    .substring(0, name.lastIndexOf("."))
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const timestamp = Date.now();
  return `${base}-${timestamp}${ext.toLowerCase()}`;
}

export function MediaLibrary({ selectable = false, onSelect }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { success, error: showError } = useToast();

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
            created_at: f.created_at || new Date().toISOString(),
            publicUrl: urlData.publicUrl,
          };
        });
      setFiles(mediaFiles);
    } catch (err) {
      console.error("Failed to fetch media files:", err);
      showError("Failed to load media files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, search]);

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
      }
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${formatFileSize(file.size)}). Maximum: ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    return null;
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const filesToUpload = Array.from(fileList);
    if (filesToUpload.length === 0) return;

    setUploadError(null);
    setUploading(true);

    try {
      const supabase = getBrowserClient();
      const errors: string[] = [];
      let uploaded = 0;

      for (const file of filesToUpload) {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
          continue;
        }

        const safeName = sanitizeFilename(file.name);
        const { error } = await supabase.storage.from(BUCKET).upload(safeName, file, {
          cacheControl: "3600",
          upsert: false,
        });

        if (error) {
          errors.push(`${file.name}: ${error.message}`);
        } else {
          uploaded++;
        }
      }

      if (errors.length > 0) {
        setUploadError(errors.join("\n"));
      }

      if (uploaded > 0) {
        success(`${uploaded} file(s) uploaded`);
      }

      await fetchFiles();
    } catch (err) {
      setUploadError("Upload failed. Please try again.");
      console.error("Upload error:", err);
      showError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  async function handleDelete(file: MediaFile) {
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.storage.from(BUCKET).remove([file.name]);
      if (error) throw error;
      setDeleteConfirmId(null);
      success("File deleted");
      await fetchFiles();
    } catch (err) {
      console.error("Failed to delete file:", err);
      showError("Failed to delete file");
    }
  }

  async function handleCopyUrl(file: MediaFile) {
    try {
      await navigator.clipboard.writeText(file.publicUrl);
      setCopiedId(file.id);
      success("URL copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = file.publicUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(file.id);
      success("URL copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground">{files.length} file(s)</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          className="hidden"
          aria-label="Upload files"
        />
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50"
        )}
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-1">
          Drag and drop images here, or click Upload
        </p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, GIF, WebP, SVG — max {formatFileSize(MAX_FILE_SIZE)}
        </p>
      </div>

      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">{uploadError}</div>
          <button
            onClick={() => setUploadError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <label htmlFor="media-search" className="sr-only">Search media files</label>
          <input
            id="media-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {files.length === 0
              ? "No media files yet. Upload your first image!"
              : "No files match your search."}
          </p>
          {files.length === 0 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
            >
              <Upload className="w-4 h-4" />
              Upload your first image
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((file) => (
            <div
              key={file.id}
              className={cn(
                "group relative border border-border rounded-lg overflow-hidden bg-muted/30 transition-all",
                selectable && "cursor-pointer hover:ring-2 hover:ring-primary"
              )}
              onClick={selectable ? () => onSelect?.(file.publicUrl) : undefined}
            >
              <div className="aspect-square relative">
                <img
                  src={file.publicUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {!selectable && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(file);
                        }}
                        className="p-2 bg-white/90 text-gray-900 rounded-full hover:bg-white"
                        aria-label={`Preview ${file.name}`}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(file);
                        }}
                        className="p-2 bg-white/90 text-gray-900 rounded-full hover:bg-white"
                        aria-label={`Copy URL for ${file.name}`}
                        title="Copy URL"
                      >
                        {copiedId === file.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(file.id);
                        }}
                        className="p-2 bg-white/90 text-gray-900 rounded-full hover:bg-white"
                        aria-label={`Delete ${file.name}`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate" title={file.name}>{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · {formatDate(file.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Delete file confirmation"
            className="bg-background border border-border rounded-lg p-6 max-w-sm mx-4 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2">Delete File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete this file? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const file = files.find((f) => f.id === deleteConfirmId);
                  if (file) handleDelete(file);
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewFile(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/40 rounded-full"
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-[90vw] max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewFile.publicUrl}
              alt={previewFile.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="mt-3 text-center">
              <p className="text-white text-sm font-medium">{previewFile.name}</p>
              <p className="text-white/60 text-xs">{formatFileSize(previewFile.size)}</p>
              <button
                onClick={() => handleCopyUrl(previewFile)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white text-xs rounded-md hover:bg-white/30"
              >
                {copiedId === previewFile.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy URL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
