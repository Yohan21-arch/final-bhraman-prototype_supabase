import { useState, type ReactNode } from "react";
import {
  Compass,
  Bookmark,
  Sparkles,
  Map as MapIcon,
  Menu,
  X,
  Layers,
  Dices,
  Camera,
  ShieldCheck,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CyclingBrandName } from "@/components/CyclingBrandName";
import { ProfileMenu } from "@/components/account/ProfileMenu";
import { useTripList } from "@/lib/trip-list";
import type { Place, StateData } from "@/types";
import { cn } from "@/lib/utils";

export type NavTab =
  | "map"
  | "destinations"
  | "gallery"
  | "guides"
  | "planner"
  | "my-list"
  | "profile"
  | "saved-places"
  | "my-trips"
  | "booking-history"
  | "settings";

interface NavItem {
  id: NavTab;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export function Navbar({
  activeTab,
  onSelectTab,
  onSelectPlace,
  onSelectState,
  onSurpriseMe,
  onOpenAuthModal,
  places,
}: {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onSelectPlace: (place: Place) => void;
  onSelectState: (state: StateData) => void;
  onSurpriseMe?: () => void;
  onOpenAuthModal?: () => void;
  places?: Place[];
}) {
  const { count } = useTripList();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: "map", label: "Map Explorer", icon: <MapIcon className="size-4" /> },
    { id: "destinations", label: "Destinations", icon: <Layers className="size-4" /> },
    { id: "guides", label: "Tour Guides", icon: <ShieldCheck className="size-4" /> },
    { id: "planner", label: "Trip Planner", icon: <Sparkles className="size-4" /> },
    { id: "my-list", label: "My List", icon: <Bookmark className="size-4" />, badge: count },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1536px] items-center justify-between gap-1.5 sm:gap-2 lg:gap-3 px-2.5 sm:px-4 md:px-5 lg:px-6 xl:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => onSelectTab("map")}
          className="flex items-center gap-1.5 sm:gap-2.5 text-left group shrink-0"
        >
          <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary transition-all group-hover:border-primary group-hover:bg-primary/20">
            <Compass className="size-4 sm:size-5 transition-transform group-hover:rotate-45" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <CyclingBrandName />
            <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.2em] text-primary/80 font-bold whitespace-nowrap pl-2 border-l border-border/70">
              India Curated
            </span>
          </div>
        </button>

        {/* Center Search Bar */}
        <div className="hidden md:flex flex-1 lg:flex-initial w-36 lg:w-44 xl:w-56 max-w-xs mx-2 lg:mx-3 shrink-0">
          <SearchBar
            places={places}
            onSelectPlace={onSelectPlace}
            onSelectState={onSelectState}
          />
        </div>

        {/* Desktop Nav Links & Surprise Me */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0 ml-auto mr-3 lg:mr-5 xl:mr-8">
          <nav className="flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 xl:px-3.5 xl:py-2 text-[11px] xl:text-xs uppercase tracking-[0.1em] font-semibold transition-all shrink-0 cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full text-[10px] font-bold",
                        isActive
                          ? "bg-primary-foreground text-primary"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Surprise Me Button in Navbar */}
          {onSurpriseMe && (
            <button
              onClick={onSurpriseMe}
              title="Open a random destination"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-2.5 py-1.5 xl:px-3.5 xl:py-2 text-[11px] xl:text-xs uppercase tracking-[0.1em] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
            >
              <Dices className="size-3.5 transition-transform hover:rotate-180" />
              <span>Surprise Me</span>
            </button>
          )}

          {/* User Account / Profile Menu */}
          <div className="ml-1 pl-1.5 xl:pl-2 border-l border-border/60 shrink-0 pr-1">
            <ProfileMenu
              onSelectTab={onSelectTab}
              onOpenAuthModal={onOpenAuthModal || (() => {})}
            />
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden shrink-0">
          {/* Mobile Profile Menu */}
          <ProfileMenu
            onSelectTab={onSelectTab}
            onOpenAuthModal={onOpenAuthModal || (() => {})}
          />

          {onSurpriseMe && (
            <button
              onClick={onSurpriseMe}
              title="Surprise Me (Random Destination)"
              className="hidden sm:flex size-8 sm:size-9 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-primary active:scale-95 shrink-0"
              aria-label="Open random destination"
            >
              <Dices className="size-3.5 sm:size-4" />
            </button>
          )}
          <button
            onClick={() => onSelectTab("my-list")}
            className="relative flex size-8 sm:size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shrink-0"
            aria-label="My saved places"
          >
            <Bookmark className="size-3.5 sm:size-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-8 sm:size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-4 sm:size-5" /> : <Menu className="size-4 sm:size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background/95 p-3.5 sm:p-4 backdrop-blur-2xl lg:hidden space-y-3.5 sm:space-y-4 max-w-full">
          <div className="w-full">
            <SearchBar
              places={places}
              onSelectPlace={(p) => {
                setMobileMenuOpen(false);
                onSelectPlace(p);
              }}
              onSelectState={(s) => {
                setMobileMenuOpen(false);
                onSelectState(s);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl p-3 text-xs uppercase tracking-wider font-semibold transition-all last:col-span-2",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "border border-border/80 bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="rounded-full bg-primary-foreground/20 px-1.5 text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {onSurpriseMe && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSurpriseMe();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary/10 py-3 text-xs uppercase tracking-wider font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Dices className="size-4" />
              <span>Surprise Me with a Destination</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
