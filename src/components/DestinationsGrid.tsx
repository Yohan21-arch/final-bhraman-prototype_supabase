import { useState, useMemo } from "react";
import { Sparkles, Layers, Filter, Compass, Check, Dices, RefreshCw, AlertCircle } from "lucide-react";
import { PLACES_DATA, allTags } from "@/data/places";
import { STATES_DATA, stateById, REGION_NAMES } from "@/data/states";
import { PlaceCard } from "@/components/PlaceCard";
import type { Place, Tag, Category, Region, StateData } from "@/types";
import { cn } from "@/lib/utils";

export interface DestinationsGridFilters {
  category: Category | "all";
  selectedRegion: Region | "all";
  selectedTag: Tag | "all";
  searchQuery: string;
}

export function DestinationsGrid({
  onSelectPlace,
  onSelectState,
  onSurpriseMe,
  filters,
  onFiltersChange,
  places = PLACES_DATA,
  isUsingSupabase,
  isLoading,
  error,
  onRetry,
}: {
  onSelectPlace: (place: Place) => void;
  onSelectState: (state: StateData) => void;
  onSurpriseMe?: () => void;
  filters?: DestinationsGridFilters;
  onFiltersChange?: (filters: DestinationsGridFilters) => void;
  places?: Place[];
  isUsingSupabase?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  const [internalCategory, setInternalCategory] = useState<Category | "all">("all");
  const [internalRegion, setInternalRegion] = useState<Region | "all">("all");
  const [internalTag, setInternalTag] = useState<Tag | "all">("all");
  const [internalQuery, setInternalQuery] = useState("");

  const activePlaces = places && places.length > 0 ? places : PLACES_DATA;

  const category = filters ? filters.category : internalCategory;
  const selectedRegion = filters ? filters.selectedRegion : internalRegion;
  const selectedTag = filters ? filters.selectedTag : internalTag;
  const searchQuery = filters ? filters.searchQuery : internalQuery;

  const setCategory = (cat: Category | "all") => {
    if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, category: cat });
    } else {
      setInternalCategory(cat);
    }
  };

  const setSelectedRegion = (reg: Region | "all") => {
    if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, selectedRegion: reg });
    } else {
      setInternalRegion(reg);
    }
  };

  const setSelectedTag = (tag: Tag | "all") => {
    if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, selectedTag: tag });
    } else {
      setInternalTag(tag);
    }
  };

  const setSearchQuery = (query: string) => {
    if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, searchQuery: query });
    } else {
      setInternalQuery(query);
    }
  };

  const filteredPlaces = useMemo(() => {
    return activePlaces.filter((place) => {
      if (category !== "all" && place.category !== category) return false;
      if (selectedTag !== "all" && !place.tags.includes(selectedTag)) return false;
      if (selectedRegion !== "all") {
        const s = STATES_DATA.find((st) => st.id === place.state);
        if (!s || s.region !== selectedRegion) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const state = stateById(place.state);
        const matchName = place.name.toLowerCase().includes(q);
        const matchDesc = place.shortDesc.toLowerCase().includes(q);
        const matchState = state?.name.toLowerCase().includes(q);
        const matchTag = place.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchState && !matchTag) return false;
      }
      return true;
    });
  }, [activePlaces, category, selectedTag, selectedRegion, searchQuery]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-8 md:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow flex items-center gap-1.5 text-primary">
              <Compass className="size-3.5" /> Comprehensive Directory
            </p>
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                <RefreshCw className="size-3 animate-spin" />
                Syncing Supabase...
              </span>
            ) : isUsingSupabase ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Supabase Synced ({activePlaces.length} live)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Offline Fallback Cache
              </span>
            )}
          </div>
          <h1 className="display-font mt-1 text-3xl font-extrabold text-foreground sm:text-5xl">
            All Curated Destinations
          </h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Explore {activePlaces.length} hand-scouted historical monuments, natural wonders, and offbeat sanctuaries.
          </p>

          {error && !isUsingSupabase && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-700 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-amber-500" />
                <span>Operating on verified local destination backup ({error}).</span>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold hover:bg-amber-500/30 transition-colors cursor-pointer"
                >
                  <RefreshCw className="size-3" />
                  Retry Sync
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Search & Surprise Me */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {onSurpriseMe && (
            <button
              onClick={onSurpriseMe}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.14em] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-xs active:scale-95"
            >
              <Dices className="size-3.5" />
              <span>Surprise Me</span>
            </button>
          )}

          <div className="w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter list..."
              className="w-full rounded-full border border-border/80 bg-card px-4 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mt-6 space-y-4 rounded-xl border border-border/80 bg-card/60 p-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            Category:
          </span>
          {[
            { id: "all", label: "All Types" },
            { id: "iconic", label: "Iconic Wonders" },
            { id: "hidden", label: "Hidden Gems" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id as Category | "all")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider transition-all",
                category === c.id
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "border border-border/70 bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Region Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            Region:
          </span>
          {(["all", "north", "south", "west", "east", "northeast", "central"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wider transition-colors",
                selectedRegion === r
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {r === "all" ? "All India" : REGION_NAMES[r].replace(" India", "")}
            </button>
          ))}
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            Themes:
          </span>
          <button
            onClick={() => setSelectedTag("all")}
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors",
              selectedTag === "all" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            All Themes
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(selectedTag === t ? "all" : t)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider transition-all",
                selectedTag === t
                  ? "border-primary bg-primary/20 text-primary font-semibold"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Results */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>Showing {filteredPlaces.length} destinations</span>
          {(category !== "all" || selectedRegion !== "all" || selectedTag !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setCategory("all");
                setSelectedRegion("all");
                setSelectedTag("all");
                setSearchQuery("");
              }}
              className="text-primary hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {isLoading && activePlaces.length === 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-border/80 bg-card/60"
              >
                <div className="aspect-[4/3] w-full bg-muted/70" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 w-3/4 rounded bg-muted/80" />
                  <div className="h-3 w-1/2 rounded bg-muted/60" />
                  <div className="h-10 w-full rounded bg-muted/40" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPlaces.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onSelect={onSelectPlace}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Sparkles className="mx-auto size-7 text-primary/60" />
            <h3 className="display-font mt-3 text-xl font-bold text-foreground">
              No destinations match your filters
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search query, theme tag, or region criteria.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
