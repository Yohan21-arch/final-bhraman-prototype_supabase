import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Bookmark,
  Compass,
  CalendarCheck2,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import type { NavTab } from "@/components/Navbar";

interface ProfileMenuProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenAuthModal: () => void;
}

export function ProfileMenu({ onSelectTab, onOpenAuthModal }: ProfileMenuProps) {
  const { user, profile, signOut, loading, authProvider } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (loading) {
    return (
      <div className="size-8 rounded-full bg-muted/60 animate-pulse border border-border" />
    );
  }

  // When user is NOT logged in: Show clean "Sign In" button
  if (!user) {
    return (
      <button
        type="button"
        onClick={onOpenAuthModal}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 hover:bg-muted/80 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all duration-150 shadow-xs hover:border-primary/50 cursor-pointer group whitespace-nowrap"
      >
        <User className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Sign In</span>
      </button>
    );
  }

  // When user IS logged in: Derive display initials or avatar
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Traveler";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="profile-menu relative" ref={menuRef} onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); setIsOpen(false); menuRef.current?.querySelector<HTMLButtonElement>('[aria-label="User profile menu"]')?.focus(); } }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full p-0.5 ring-1 ring-border/80 hover:ring-primary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer group"
        aria-label="User profile menu"
        aria-expanded={isOpen} aria-controls="profile-menu-options"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="size-8 rounded-full object-cover shadow-xs"
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold shadow-xs">
            {initials}
          </div>
        )}
      </button>

      {isOpen && (
        <div id="profile-menu-options" className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-24px)] z-50 p-1.5 rounded-2xl border border-border/80 bg-background/98 backdrop-blur-xl shadow-xl">
          {/* User Identity Header */}
          <div className="px-3 py-2.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground line-clamp-1">
                {displayName}
              </p>
              {authProvider && authProvider !== "email" && (
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary capitalize">
                  {authProvider}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {user.email}
            </p>
          </div>

          <div className="h-px bg-border/80 my-1" />

          {/* Navigation Items */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onSelectTab("profile");
            }}
            className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium hover:bg-muted/80 transition-colors text-left cursor-pointer"
          >
            <User className="size-4 text-muted-foreground" />
            <span>My Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onSelectTab("saved-places");
            }}
            className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium hover:bg-muted/80 transition-colors text-left cursor-pointer"
          >
            <Bookmark className="size-4 text-muted-foreground" />
            <span>Saved Places</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onSelectTab("my-trips");
            }}
            className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium hover:bg-muted/80 transition-colors text-left cursor-pointer"
          >
            <Compass className="size-4 text-muted-foreground" />
            <span>My Trips</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onSelectTab("booking-history");
            }}
            className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium hover:bg-muted/80 transition-colors text-left cursor-pointer"
          >
            <CalendarCheck2 className="size-4 text-muted-foreground" />
            <span>Booking History</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onSelectTab("settings");
            }}
            className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium hover:bg-muted/80 transition-colors text-left cursor-pointer"
          >
            <SettingsIcon className="size-4 text-muted-foreground" />
            <span>Settings</span>
          </button>

          <div className="h-px bg-border/80 my-1" />

          {/* Sign Out */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
            className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}


