import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAccountService } from "@/services/userAccountService";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Database,
  Globe,
  Bell,
  Trash2,
  RefreshCw,
  LogOut,
  CheckCircle2,
  Lock,
} from "lucide-react";
import type { NavTab } from "@/components/Navbar";

export function SettingsView({
  onSelectTab,
  onOpenAuthModal,
}: {
  onSelectTab: (tab: NavTab) => void;
  onOpenAuthModal: () => void;
}) {
  const { user, profile, signOut, authProvider } = useAuth();
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleSyncCloud = async () => {
    if (!user) return;
    setSyncStatus("Synchronizing...");
    await userAccountService.syncLocalItemsToCloud(user.id);
    setSyncStatus("Cloud synchronization complete!");
    setTimeout(() => setSyncStatus(null), 3500);
  };

  const handleClearCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bhraman_local_travel_plans");
      localStorage.removeItem("bhraman_demo_bookings");
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SettingsIcon className="size-5" />
          </div>
          <h1 className="display-font text-2xl md:text-3xl font-bold text-foreground">
            Account Settings
          </h1>
        </div>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground">
          Manage your Bhraman account security, preferences, and local data synchronization.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="display-font text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <span>Security & Authentication</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your login identity and session tokens are secured by Supabase Auth with Row Level Security.
          </p>
        </div>

        {user ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Signed In As</span>
              <p className="text-sm font-bold text-foreground">{user.email}</p>
              <p className="text-[10px] text-muted-foreground font-mono">UID: {user.id.slice(0, 16)}...</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Authentication Provider</span>
              <p className="text-sm font-bold text-foreground capitalize">
                {authProvider || "Email & Password"}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <CheckCircle2 className="size-3" />
                Verified Active Session
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              You are currently browsing as a guest traveler.
            </p>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
            >
              <User className="size-3.5" />
              <span>Sign In with Google, Microsoft, or Email</span>
            </button>
          </div>
        )}
      </div>

      {/* Cloud Sync & Storage */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="display-font text-lg font-semibold text-foreground flex items-center gap-2">
            <Database className="size-4 text-primary" />
            <span>Data Persistence & Synchronization</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control how your saved destinations, travel plans, and booking records synchronize with Supabase.
          </p>
        </div>

        <div className="space-y-4 divide-y divide-border/60">
          {user && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Sync Local Wishlist to Cloud</p>
                <p className="text-xs text-muted-foreground">
                  Pushes any destinations bookmarked locally to your authenticated Supabase profile.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSyncCloud}
                className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-border bg-background hover:bg-muted px-3.5 py-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Sync Now</span>
              </button>
            </div>
          )}

          {syncStatus && (
            <p className="text-xs text-primary font-medium pt-2">{syncStatus}</p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Clear Temporary Browser Cache</p>
              <p className="text-xs text-muted-foreground">
                Clears cached demo trips and temporary search indexes without affecting your cloud account.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>{cacheCleared ? "Cache Cleared!" : "Clear Cache"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Session Actions */}
      {user && (
        <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="display-font text-base font-semibold text-foreground">
              Sign Out of Session
            </h3>
            <p className="text-xs text-muted-foreground">
              Safely end your session on this browser.
            </p>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
