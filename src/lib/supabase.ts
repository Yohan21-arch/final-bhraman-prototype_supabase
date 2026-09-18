import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Clean and normalize Supabase project URL (removes trailing slashes and /rest/v1 if present)
function cleanSupabaseUrl(url?: string): string {
  let u = (url || "").trim();
  u = u.replace(/\/+$/, "");
  u = u.replace(/\/rest\/v1\/?$/, "");
  return u;
}

// Read client-side Supabase credentials using direct static access for Vite bundler replacement
const viteSupabaseUrl =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_SUPABASE_URL
    : undefined;

const nodeSupabaseUrl =
  typeof process !== "undefined" && process.env
    ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    : undefined;

const rawSupabaseUrl =
  (typeof viteSupabaseUrl === "string" && viteSupabaseUrl) ||
  (typeof nodeSupabaseUrl === "string" && nodeSupabaseUrl) ||
  "";

const viteAnonKey =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : undefined;

const nodeAnonKey =
  typeof process !== "undefined" && process.env
    ? process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    : undefined;

const rawSupabaseAnonKey =
  (typeof viteAnonKey === "string" && viteAnonKey) ||
  (typeof nodeAnonKey === "string" && nodeAnonKey) ||
  "";

export const SUPABASE_URL = cleanSupabaseUrl(rawSupabaseUrl);
export const SUPABASE_ANON_KEY = (rawSupabaseAnonKey || "").trim();

/**
 * Checks if valid Supabase environment variables have been configured.
 * Validates that URL is non-empty, points to an HTTP(S) endpoint, and isn't a placeholder.
 */
export function isSupabaseConfigured(): boolean {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  if (
    SUPABASE_URL === "MY_SUPABASE_URL" ||
    SUPABASE_URL.includes("placeholder") ||
    !SUPABASE_URL.startsWith("http")
  ) {
    return false;
  }
  return true;
}

// Fallback safe values to prevent runtime module initialization errors when env vars are pending
const effectiveUrl = isSupabaseConfigured()
  ? SUPABASE_URL
  : "https://placeholder-bhraman.supabase.co";

const effectiveKey = isSupabaseConfigured()
  ? SUPABASE_ANON_KEY
  : "placeholder-anon-key";

/**
 * Supabase client instance configured using public client-side environment variables.
 * Safe for browser usage under Row Level Security (RLS).
 */
export const supabase: SupabaseClient = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

