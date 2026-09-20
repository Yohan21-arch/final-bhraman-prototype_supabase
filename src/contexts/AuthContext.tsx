import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/types";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithMicrosoft: () => Promise<{ error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: string | null; requiresEmailConfirmation?: boolean }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: {
    full_name?: string;
    preferred_language?: string;
    avatar_url?: string;
  }) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  authProvider: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to construct dynamic redirect URL for OAuth across local & deployed environments
export function getAuthRedirectUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

// Map raw Supabase errors to polished, user-friendly messages
export function formatAuthError(error: AuthError | Error | unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";
  const msg = (typeof error === "object" && error !== null && "message" in error)
    ? String((error as { message: unknown }).message)
    : String(error);

  const lower = msg.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid username or password")) {
    return "Incorrect email or password. Please verify your credentials and try again.";
  }
  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email address before signing in. Check your inbox for the verification link.";
  }
  if (lower.includes("password should be at least")) {
    return "Your password must be at least 6 characters long.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many sign-in attempts. Please wait a few moments before trying again.";
  }
  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "Network connection issue. Please check your internet connection and try again.";
  }
  if (lower.includes("provider is not enabled")) {
    return "This social login provider has not been enabled in the Supabase Dashboard yet.";
  }
  return msg;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Helper to derive profile from user metadata if database table is not yet created
  const deriveProfileFromUser = useCallback((u: User): Profile => {
    const meta = u.user_metadata || {};
    const fullName =
      meta.full_name ||
      meta.name ||
      meta.user_name ||
      (u.email ? u.email.split("@")[0] : "Traveler");
    const avatarUrl = meta.avatar_url || meta.picture || "";

    return {
      id: u.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      preferred_language: meta.preferred_language || "en",
      created_at: u.created_at,
      updated_at: u.updated_at || u.created_at,
    };
  }, []);

  // Fetch or create profile row
  const fetchProfile = useCallback(
    async (currentUser: User | null) => {
      if (!currentUser || !isConfigured) {
        setProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (error) {
          // If table doesn't exist yet or permission error, use synthesized profile
          console.warn("Notice: Using profile from user session metadata:", error.message);
          setProfile(deriveProfileFromUser(currentUser));
          return;
        }

        if (data) {
          setProfile(data as Profile);
        } else {
          // Auto-insert profile row if possible
          const fallback = deriveProfileFromUser(currentUser);
          const { data: inserted, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: fallback.id,
              full_name: fallback.full_name,
              avatar_url: fallback.avatar_url,
              preferred_language: fallback.preferred_language,
            })
            .select()
            .maybeSingle();

          if (insertError) {
            setProfile(fallback);
          } else {
            setProfile((inserted as Profile) || fallback);
          }
        }
      } catch (err) {
        console.warn("Could not retrieve profile record:", err);
        setProfile(deriveProfileFromUser(currentUser));
      }
    },
    [deriveProfileFromUser, isConfigured]
  );

  // Initialize session on mount and subscribe to auth state changes
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn("Error getting initial Supabase auth session:", error.message);
        }
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          fetchProfile(initialSession.user);
        } else {
          setProfile(null);
        }
      })
      .catch((err) => {
        console.warn("Session check exception:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // 2. Listen to ongoing auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);

      if (newUser) {
        await fetchProfile(newUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, isConfigured]);

  // Social OAuth - Google
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (!isConfigured) {
      return { error: "Supabase connection is not yet configured." };
    }
    try {
      const redirectUrl = getAuthRedirectUrl();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) return { error: formatAuthError(error) };
      return { error: null };
    } catch (err) {
      return { error: formatAuthError(err) };
    }
  };

  // Social OAuth - Microsoft (Azure)
  const signInWithMicrosoft = async (): Promise<{ error: string | null }> => {
    if (!isConfigured) {
      return { error: "Supabase connection is not yet configured." };
    }
    try {
      const redirectUrl = getAuthRedirectUrl();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: redirectUrl,
          scopes: "email openid profile",
        },
      });
      if (error) return { error: formatAuthError(error) };
      return { error: null };
    } catch (err) {
      return { error: formatAuthError(err) };
    }
  };

  // Email & Password Sign In
  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    if (!isConfigured) {
      return { error: "Supabase connection is not yet configured." };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { error: formatAuthError(error) };
      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user);
      }
      return { error: null };
    } catch (err) {
      return { error: formatAuthError(err) };
    }
  };

  // Email & Password Sign Up
  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ error: string | null; requiresEmailConfirmation?: boolean }> => {
    if (!isConfigured) {
      return { error: "Supabase connection is not yet configured." };
    }
    try {
      const redirectUrl = getAuthRedirectUrl();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName?.trim() || "",
            name: fullName?.trim() || "",
          },
        },
      });
      if (error) return { error: formatAuthError(error) };

      // If user is returned without session, email confirmation is active
      const requiresEmailConfirmation = Boolean(data.user && !data.session);

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user);
      }

      return { error: null, requiresEmailConfirmation };
    } catch (err) {
      return { error: formatAuthError(err) };
    }
  };

  // Password Reset Email
  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    if (!isConfigured) {
      return { error: "Supabase connection is not yet configured." };
    }
    try {
      const redirectUrl = getAuthRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });
      if (error) return { error: formatAuthError(error) };
      return { error: null };
    } catch (err) {
      return { error: formatAuthError(err) };
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out exception:", err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  // Update non-sensitive profile info
  const updateProfile = async (data: {
    full_name?: string;
    preferred_language?: string;
    avatar_url?: string;
  }): Promise<{ error: string | null }> => {
    if (!user) return { error: "You must be signed in to update your profile." };

    try {
      const updates: Partial<Profile> = {
        updated_at: new Date().toISOString(),
      };
      if (typeof data.full_name === "string") updates.full_name = data.full_name.trim();
      if (typeof data.preferred_language === "string") updates.preferred_language = data.preferred_language;
      if (typeof data.avatar_url === "string") updates.avatar_url = data.avatar_url;

      // Update Supabase auth user metadata as well
      await supabase.auth.updateUser({
        data: {
          full_name: updates.full_name,
          preferred_language: updates.preferred_language,
          avatar_url: updates.avatar_url,
        },
      });

      // Update database profile record
      const { error: dbError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...updates,
        });

      if (dbError) {
        console.warn("Database profile upsert notice:", dbError.message);
      }

      setProfile((prev) => (prev ? { ...prev, ...updates } : ({ id: user.id, ...updates } as Profile)));
      return { error: null };
    } catch (err) {
      return { error: formatAuthError(err) };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  // Determine current auth provider
  const authProvider = user?.app_metadata?.provider || user?.identities?.[0]?.provider || "email";

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isConfigured,
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
    updateProfile,
    refreshProfile,
    authProvider,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
