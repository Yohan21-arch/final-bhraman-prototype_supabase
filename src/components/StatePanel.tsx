import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Sparkles, X, MapPin, Compass, ExternalLink } from "lucide-react";
import { MAP_HEIGHT, MAP_WIDTH, stateById, REGION_NAMES } from "@/data/states";
import { allTags, placesByState } from "@/data/places";
import { PlaceCard } from "@/components/PlaceCard";
import type { Category, Tag, Place, StateData } from "@/types";
import { cn } from "@/lib/utils";

export function StatePanel({
  stateId,
  places: providedPlaces,
  onClose,
  onSelectPlace,
  onOpenFullGuide,
}: {
  stateId: string;
  places?: Place[];
  onClose: () => void;
  onSelectPlace?: (place: Place) => void;
  onOpenFullGuide?: (state: StateData) => void;
}) {
  const state = stateById(stateId);
  const [tab, setTab] = useState<Category>("iconic");
  const [activeTags, setActiveTags] = useState<Tag[]>([]);

  // Keyboard shortcut: Escape to close the sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA";
      if (e.key === "Escape" && !isInput) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const allPlaces = useMemo(() => {
    if (providedPlaces && providedPlaces.length > 0) {
      return providedPlaces.filter((p) => p.state.toLowerCase() === stateId.toLowerCase());
    }
    return state ? placesByState(state.id) : [];
  }, [state, stateId, providedPlaces]);

  const visiblePlaces = useMemo(
    () =>
      allPlaces.filter(
        (p) =>
          p.category === tab &&
          (activeTags.length === 0 || activeTags.some((t) => p.tags.includes(t)))
      ),
    [allPlaces, tab, activeTags]
  );

  const availableTags = useMemo(() => {
    const present = new Set(
      allPlaces.filter((p) => p.category === tab).flatMap((p) => p.tags)
    );
    return allTags.filter((t) => present.has(t));
  }, [allPlaces, tab]);

  if (!state) return null;

  return (
    <>
      {/* Backdrop overlay allowing click outside to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-background/50 backdrop-blur-[2px] cursor-pointer"
      />

      {/* Slide-in State Panel */}
      <motion.aside
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-background/95 shadow-2xl backdrop-blur-2xl md:w-[480px] lg:w-[520px] max-w-full"
        aria-label={`Places in ${state.name}`}
      >
        <header className="space-y-3.5 border-b border-border p-4 sm:p-5 md:p-6 bg-card/75 backdrop-blur-md">
          {/* Top navigation row with Back and Prominent Top-Right ✕ Close Button */}
          <div className="flex items-center justify-between gap-3">
            <button
              id="state-panel-back-btn"
              onClick={onClose}
              aria-label="Back to Map (Esc)"
              title="Back to Map (Esc)"
              className="group inline-flex min-h-[44px] items-center gap-1.5 sm:gap-2 rounded-full border border-border/80 bg-secondary/60 px-3 sm:px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-foreground transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-1" />
              <span>Back to Map</span>
            </button>

            {/* Clearly Visible ✕ Close button with >= 44x44px clickable area */}
            <button
              id="state-panel-close-btn"
              onClick={onClose}
              aria-label={`Close ${state.name} information (Esc)`}
              title="Close sidebar (Esc)"
              className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border/90 bg-card/90 text-foreground shadow-xs transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 cursor-pointer shrink-0"
            >
              <X className="size-4.5" />
            </button>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="relative size-12 sm:size-14 shrink-0 rounded-lg border border-border/80 bg-secondary/50 p-1 flex items-center justify-center">
              <svg
                viewBox={`${state.bbox[0] - 8} ${state.bbox[1] - 8} ${state.bbox[2] + 16} ${state.bbox[3] + 16}`}
                className="size-10 sm:size-12"
                aria-hidden="true"
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
              >
                <path
                  d={state.d}
                  className="fill-primary/20 stroke-primary"
                  strokeWidth={2.5}
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="eyebrow flex items-center gap-1.5 text-primary font-semibold text-[11px] sm:text-xs">
                <Compass className="size-3 text-primary shrink-0" />
                <span className="truncate">{REGION_NAMES[state.region]}</span>
              </p>
              <h2 className="display-font mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold leading-tight text-foreground truncate">
                {state.name}
              </h2>
              <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground truncate">
                Capital: <span className="text-foreground/90">{state.capital}</span> · {allPlaces.length} places
              </p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground font-sans line-clamp-3 sm:line-clamp-none">
            {state.description}
          </p>

          {/* Category Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary/40 p-1">
            {(["iconic", "hidden"] as Category[]).map((key) => {
              const count = allPlaces.filter((p) => p.category === key).length;
              const isTab = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setTab(key);
                    setActiveTags([]);
                  }}
                  className={cn(
                    "flex min-h-[38px] items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-[0.14em] font-medium transition-all cursor-pointer",
                    isTab
                      ? "bg-primary text-primary-foreground shadow-md font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  {key === "hidden" && <Sparkles className="size-3 sm:size-3.5 shrink-0" />}
                  <span className="truncate">{key === "iconic" ? "Iconic" : "Hidden Gems"}</span>
                  <span
                    className={cn(
                      "ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] shrink-0",
                      isTab ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tags filter */}
          {availableTags.length > 1 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableTags.map((tag) => {
                const active = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() =>
                      setActiveTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] transition-colors cursor-pointer",
                      active
                        ? "border-primary bg-primary/20 text-primary font-semibold"
                        : "border-border/80 bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
              {activeTags.length > 0 && (
                <button
                  onClick={() => setActiveTags([])}
                  className="text-[10px] text-muted-foreground hover:text-primary underline px-1 py-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </header>

        {/* Place list */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5 md:p-6">
          {visiblePlaces.length > 0 ? (
            visiblePlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onSelect={onSelectPlace}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/30">
              <Sparkles className="mx-auto size-6 text-primary/60" />
              <h4 className="mt-3 text-sm font-medium text-foreground">
                {activeTags.length > 0
                  ? `No ${tab === "hidden" ? "hidden gems" : "iconic sights"} match these tags`
                  : tab === "hidden"
                  ? `We're currently scouting secret spots in ${state.name}`
                  : `Iconic wonders for ${state.name} coming soon`}
              </h4>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Try changing your tag filters or switch tabs above.
              </p>
            </div>
          )}

          <button
            onClick={() => onOpenFullGuide?.(state)}
            className="group flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-3.5 text-center text-xs uppercase tracking-[0.16em] text-foreground font-semibold transition-all hover:border-primary hover:bg-secondary hover:text-primary cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <span>Open Full {state.name} Travel Guide</span>
            <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </motion.aside>
    </>
  );
}
