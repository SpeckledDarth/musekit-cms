import { getBrowserClient } from "../lib/supabase";

const BUCKET = "media";

export async function uploadFile(file: File, path: string): Promise<string> {
  const supabase = getBrowserClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}

export interface StorageFile {
  name: string;
  id: string;
  size: number;
  created_at: string;
  publicUrl: string;
}

export async function listFiles(folder?: string): Promise<StorageFile[]> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.storage.from(BUCKET).list(folder || "", {
    limit: 500,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;

  return (data || [])
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => {
      const filePath = folder ? `${folder}/${f.name}` : f.name;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      return {
        name: f.name,
        id: f.id || f.name,
        size: f.metadata?.size || 0,
        created_at: f.created_at || "",
        publicUrl: urlData.publicUrl,
      };
    });
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = getBrowserClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
