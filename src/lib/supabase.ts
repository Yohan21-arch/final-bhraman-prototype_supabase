import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Safe helper to read environment variables in Vite/browser and Node environments
function getEnvVar(key: string): string {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
    if (metaEnv && typeof metaEnv[key] === "string") {
      return metaEnv[key]!;
    }
  } catch {
    // Ignore in non-Vite contexts
  }

  try {
    if (typeof process !== "undefined" && process?.env && typeof process.env[key] === "string") {
      return process.env[key]!;
    }
  } catch {
    // Ignore in non-Node contexts
  }

  return "";
}

// Read Supabase credentials from client-side environment variables
const rawSupabaseUrl = getEnvVar("VITE_SUPABASE_URL") || getEnvVar("SUPABASE_URL");
const rawSupabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY") || getEnvVar("SUPABASE_ANON_KEY");

function cleanSupabaseUrl(url: string): string {
  let u = (url || "").trim();
  // Strip trailing slashes
  u = u.replace(/\/+$/, "");
  // Strip trailing /rest/v1 or /rest/v1/
  u = u.replace(/\/rest\/v1\/?$/, "");
  return u;
}

export const SUPABASE_URL = cleanSupabaseUrl(rawSupabaseUrl);
export const SUPABASE_ANON_KEY = (rawSupabaseAnonKey || "").trim();

/**
 * Checks if valid Supabase environment variables have been configured.
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
 * Supabase client instance configured using environment variables.
 */
export const supabase: SupabaseClient = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
