import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Mail,
  Globe,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Bookmark,
  Compass,
  CalendarCheck2,
  Sparkles,
} from "lucide-react";
import { userAccountService } from "@/services/userAccountService";
import type { NavTab } from "@/components/Navbar";

const INDIAN_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi (हिंदी)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "mr", label: "Marathi (मराठी)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "gu", label: "Gujarati (ગુજરાતી)" },
  { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", label: "Malayalam (മലയാളം)" },
  { code: "pa", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "or", label: "Odia (ଓଡ଼ିଆ)" },
];

export function ProfileView({
  onSelectTab,
  onOpenAuthModal,
}: {
  onSelectTab: (tab: NavTab) => void;
  onOpenAuthModal: () => void;
}) {
  const { user, profile, updateProfile, authProvider, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [language, setLanguage] = useState("en");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Quick stats
  const [stats, setStats] = useState({ savedCount: 0, tripsCount: 0, bookingsCount: 0 });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || user?.user_metadata?.full_name || "");
      setLanguage(profile.preferred_language || "en");
    } else if (user) {
      setFullName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
      setLanguage("en");
    }
  }, [profile, user]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      userAccountService.getSavedDestinations(user.id),
      userAccountService.getTravelPlans(user.id),
      userAccountService.getBookings(user.id),
    ]).then(([saved, trips, bookings]) => {
      setStats({
        savedCount: saved.length,
        tripsCount: trips.length,
        bookingsCount: bookings.length,
      });
    });
  }, [user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <User className="size-7" />
        </div>
        <h2 className="display-font text-2xl font-bold text-foreground">Sign In to View Profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in to access your personal Bhraman account, saved destinations, and travel history.
        </p>
        <button
          onClick={onOpenAuthModal}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
        >
          <span>Sign In / Create Account</span>
        </button>
      </div>
    );
  }

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName = fullName || profile?.full_name || user.email?.split("@")[0] || "Traveler";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Recently joined";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSaving(true);

    const { error } = await updateProfile({
      full_name: fullName.trim(),
      preferred_language: language,
    });

    setIsSaving(false);
    if (error) {
      setStatusMessage({ type: "error", text: error });
    } else {
      setStatusMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-card/60 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="size-24 md:size-28 rounded-2xl object-cover ring-2 ring-primary/30 shadow-md"
              />
            ) : (
              <div className="flex size-24 md:size-28 items-center justify-center rounded-2xl bg-primary/15 text-primary text-3xl font-bold ring-2 ring-primary/30 shadow-md">
                {initials}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 ring-2 ring-background" title="Active session" />
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="display-font text-2xl md:text-3xl font-bold text-foreground">
                {displayName}
              </h1>
              {authProvider && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary capitalize">
                  <Shield className="size-3" />
                  {authProvider}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="size-3.5" />
              {user.email}
            </p>

            <p className="text-xs text-muted-foreground/80 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <Calendar className="size-3.5" />
              Bhraman Member since {memberSince}
            </p>
          </div>
        </div>

        {/* Quick Account Metrics */}
        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border/80 pt-6">
          <button
            type="button"
            onClick={() => onSelectTab("saved-places")}
            className="flex flex-col items-center justify-center rounded-2xl bg-muted/40 p-3 hover:bg-muted/70 transition-colors cursor-pointer text-center group"
          >
            <Bookmark className="size-4 text-primary mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-foreground">{stats.savedCount}</span>
            <span className="text-[11px] text-muted-foreground">Saved Places</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("my-trips")}
            className="flex flex-col items-center justify-center rounded-2xl bg-muted/40 p-3 hover:bg-muted/70 transition-colors cursor-pointer text-center group"
          >
            <Compass className="size-4 text-primary mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-foreground">{stats.tripsCount}</span>
            <span className="text-[11px] text-muted-foreground">My Trips</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("booking-history")}
            className="flex flex-col items-center justify-center rounded-2xl bg-muted/40 p-3 hover:bg-muted/70 transition-colors cursor-pointer text-center group"
          >
            <CalendarCheck2 className="size-4 text-primary mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-foreground">{stats.bookingsCount}</span>
            <span className="text-[11px] text-muted-foreground">Bookings</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="display-font text-lg font-semibold text-foreground">
            Personal Information
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update your public display name and preferred regional language. Sensitive credentials remain secured by Supabase.
          </p>
        </div>

        {statusMessage && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${
              statusMessage.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-destructive/20 bg-destructive/10 text-destructive"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Email (Read-Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground" />
                Email Address
                <span className="text-[10px] text-muted-foreground font-normal">(Primary Auth)</span>
              </label>
              <input
                type="email"
                disabled
                value={user.email || ""}
                className="w-full rounded-xl border border-border/60 bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          {/* Preferred Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-primary" />
              Preferred Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Customizes AI assistance and monument historical descriptions according to your linguistic preference.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
