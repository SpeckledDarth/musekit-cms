import { createBrowserClient, createAdminClient } from "@musekit/database";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (browserClient) return browserClient;
  try {
    browserClient = createBrowserClient();
    return browserClient;
  } catch (error) {
    console.error("CMS: Failed to create Supabase browser client:", error);
    throw error;
  }
}

export function getSupabaseClient() {
  return getBrowserClient();
}

export function getSupabaseAdmin() {
  try {
    return createAdminClient();
  } catch (error) {
    console.error("CMS: Failed to create Supabase admin client:", error);
    throw error;
  }
}
