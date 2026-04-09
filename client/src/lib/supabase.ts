import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** `null` when env vars are not configured — app falls back to local-only mode */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export const isSupabaseConfigured = !!supabase;
