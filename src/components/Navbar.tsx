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
import { useTripList } from "@/lib/trip-list";
import type { Place, StateData } from "@/types";
import { cn } from "@/lib/utils";

export type NavTab = "map" | "destinations" | "gallery" | "guides" | "planner" | "my-list";

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
}: {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onSelectPlace: (place: Place) => void;
  onSelectState: (state: StateData) => void;
  onSurpriseMe?: () => void;
}) {
  const { count } = useTripList();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: "map", label: "Map Explorer", icon: <MapIcon className="size-4" /> },
    { id: "destinations", label: "Destinations", icon: <Layers className="size-4" /> },
    { id: "gallery", label: "Photo Gallery", icon: <Camera className="size-4" /> },
    { id: "guides", label: "Tour Guides", icon: <ShieldCheck className="size-4" /> },
    { id: "planner", label: "Trip Planner", icon: <Sparkles className="size-4" /> },
    { id: "my-list", label: "My List", icon: <Bookmark className="size-4" />, badge: count },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => onSelectTab("map")}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="flex size-9 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary transition-all group-hover:border-primary group-hover:bg-primary/20">
            <Compass className="size-5 transition-transform group-hover:rotate-45" />
          </div>
          <div className="flex items-center">
            <CyclingBrandName />
            <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.25em] text-primary/80 font-bold ml-2">
              India Curated
            </span>
          </div>
        </button>

        {/* Center Search Bar */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <SearchBar
            onSelectPlace={onSelectPlace}
            onSelectState={onSelectState}
          />
        </div>

        {/* Desktop Nav Links & Surprise Me */}
        <div className="hidden lg:flex items-center gap-2">
          <nav className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] font-semibold transition-all",
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
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-3.5 py-2 text-xs uppercase tracking-[0.14em] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-xs active:scale-95"
            >
              <Dices className="size-3.5 transition-transform hover:rotate-180" />
              <span>Surprise Me</span>
            </button>
          )}
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex items-center gap-2 lg:hidden">
          {onSurpriseMe && (
            <button
              onClick={onSurpriseMe}
              title="Surprise Me (Random Destination)"
              className="flex size-9 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-primary active:scale-95"
              aria-label="Open random destination"
            >
              <Dices className="size-4" />
            </button>
          )}
          <button
            onClick={() => onSelectTab("my-list")}
            className="relative flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground"
            aria-label="My saved places"
          >
            <Bookmark className="size-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background/95 p-4 backdrop-blur-2xl lg:hidden space-y-4">
          <div className="w-full">
            <SearchBar
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
