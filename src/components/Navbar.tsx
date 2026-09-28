import { useEffect, useRef, useState } from "react";
import { Bookmark, Compass, Dices, Layers, Map as MapIcon, Menu, ShieldCheck, Sparkles, X } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CyclingBrandName } from "@/components/CyclingBrandName";
import { ProfileMenu } from "@/components/account/ProfileMenu";
import { useTripList } from "@/lib/trip-list";
import { cn } from "@/lib/utils";
import type { Place, StateData } from "@/types";

export type NavTab = "map" | "destinations" | "gallery" | "guides" | "planner" | "my-list" | "profile" | "saved-places" | "my-trips" | "booking-history" | "settings";

const NAV_ITEMS = [
  { id: "map", label: "Explore India", icon: MapIcon },
  { id: "destinations", label: "Destinations", icon: Layers },
  { id: "guides", label: "Tour guides", icon: ShieldCheck },
  { id: "planner", label: "Plan a trip", icon: Sparkles },
  { id: "my-list", label: "My list", icon: Bookmark },
] as const;

export function Navbar({ activeTab, onSelectTab, onSelectPlace, onSelectState, onSurpriseMe, onOpenAuthModal, places }: {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onSelectPlace: (place: Place) => void;
  onSelectState: (state: StateData) => void;
  onSurpriseMe?: () => void;
  onOpenAuthModal?: () => void;
  places?: Place[];
}) {
  const { count } = useTripList();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    menu.current?.querySelector<HTMLInputElement>("input")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [menuOpen]);

  const selectTab = (tab: NavTab) => {
    setMenuOpen(false);
    onSelectTab(tab);
  };

  return (
    <header className="site-header sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="site-container flex h-16 items-center justify-between gap-3">
        <button onClick={() => selectTab("map")} aria-label="Bhraman home" className="flex min-h-11 shrink-0 items-center gap-2.5 text-left">
          <span className="flex size-9 items-center justify-center rounded-full border border-primary/35 text-primary">
            <Compass className="size-5" aria-hidden="true" />
          </span>
          <CyclingBrandName />
          <span className="ml-1 hidden border-l border-border pl-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground 2xl:block">Discover India</span>
        </button>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} onClick={() => selectTab(id)} aria-current={activeTab === id || (id === "destinations" && activeTab === "gallery") ? "page" : undefined}
              className={cn("nav-link", activeTab === id || (id === "destinations" && activeTab === "gallery") ? "nav-link-active" : "")}>
              {label}
              {id === "my-list" && count > 0 && <span className="rounded-full bg-primary/15 px-1.5 text-xs text-primary">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="ml-auto hidden w-48 min-w-0 md:block xl:ml-0 2xl:w-56">
          <SearchBar places={places} onSelectPlace={onSelectPlace} onSelectState={onSelectState} placeholder="Find your next journey" />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {onSurpriseMe && <button onClick={onSurpriseMe} className="icon-button hidden sm:inline-flex" aria-label="Surprise me with a destination" title="Surprise me"><Dices className="size-4" /></button>}
          <ProfileMenu onSelectTab={selectTab} onOpenAuthModal={() => { setMenuOpen(false); onOpenAuthModal?.(); }} />
          <button ref={menuButton} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="icon-button xl:hidden">
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div ref={menu} id="mobile-navigation" className="mobile-navigation border-t border-border bg-background xl:hidden">
          <div className="site-container space-y-5 py-5">
            <SearchBar places={places}
              onSelectPlace={(place) => { setMenuOpen(false); onSelectPlace(place); }}
              onSelectState={(state) => { setMenuOpen(false); onSelectState(state); }} />
            <nav aria-label="Mobile navigation" className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => selectTab(id)} aria-current={activeTab === id ? "page" : undefined}
                  className={cn("flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors", activeTab === id ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-foreground")}>
                  <Icon className="size-4" /> {label}
                  {id === "my-list" && count > 0 && <span className="ml-auto text-primary">{count}</span>}
                </button>
              ))}
              {onSurpriseMe && <button onClick={() => { setMenuOpen(false); onSurpriseMe(); }} className="flex min-h-12 items-center gap-3 rounded-xl border border-primary/30 px-4 py-3 text-left text-sm text-primary"><Dices className="size-4" /> Surprise me</button>}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

