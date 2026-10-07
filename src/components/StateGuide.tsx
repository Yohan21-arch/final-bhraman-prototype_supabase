import { useMemo, useEffect } from "react";
import { ArrowLeft, Sparkles, MapPin, Calendar, Compass, Layers, X } from "lucide-react";
import { MAP_HEIGHT, MAP_WIDTH, REGION_NAMES } from "@/data/states";
import { placesByState } from "@/data/places";
import { PlaceCard } from "@/components/PlaceCard";
import type { StateData, Place } from "@/types";

export function StateGuide({
  state,
  places: providedPlaces,
  onBack,
  onClose,
  onSelectPlace,
  onAskYatra,
}: {
  state: StateData;
  places?: Place[];
  onBack: () => void;
  onClose?: () => void;
  onSelectPlace: (place: Place) => void;
  onAskYatra?: (prompt: string) => void;
}) {
  const places = useMemo(() => {
    if (providedPlaces && providedPlaces.length > 0) {
      return providedPlaces.filter((p) => p.state.toLowerCase() === state.id.toLowerCase());
    }
    return placesByState(state.id);
  }, [state.id, providedPlaces]);
  const iconic = places.filter((p) => p.category === "iconic");
  const hidden = places.filter((p) => p.category === "hidden");

  // Escape key support to close / go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const activeEl = document.activeElement;
      const isInput = activeEl && ["INPUT", "TEXTAREA", "SELECT"].includes(activeEl.tagName);
      if (e.key === "Escape" && !isInput) {
        if (onClose) onClose();
        else onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack, onClose]);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8">
      {/* State Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-6">
        <button
          id="state-back-btn"
          onClick={onBack}
          aria-label="Back to Explorer (Esc)"
          title="Back to Explorer (Esc)"
          className="group inline-flex min-h-[44px] items-center gap-1.5 sm:gap-2 rounded-full border border-border/90 bg-card/90 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-foreground shadow-xs transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 cursor-pointer shrink-0"
        >
          <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-1" />
          <span><span className="hidden xs:inline">Back to </span>Explorer</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {onAskYatra && (
            <button
              onClick={() =>
                onAskYatra(
                  `Tell me the best travel itinerary for ${state.name}, including iconic landmarks and offbeat experiences.`
                )
              }
              aria-label={`Ask Yatra About ${state.name}`}
              className="inline-flex min-h-[44px] items-center gap-1.5 sm:gap-2 rounded-full border border-primary/50 bg-card px-3 sm:px-4 py-2 text-xs font-semibold text-primary hover:bg-secondary transition-colors shadow-xs"
            >
              <Sparkles className="size-3.5 shrink-0 text-primary" />
              <span className="hidden sm:inline">Ask Yatra About {state.name}</span>
              <span className="sm:hidden">Ask Yatra</span>
            </button>
          )}

          <button
            id="state-close-btn"
            onClick={onClose || onBack}
            aria-label="Close state guide (Esc)"
            title="Close state guide (Esc)"
            className="inline-flex size-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border/90 bg-card/90 text-foreground transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 shadow-xs cursor-pointer shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* State Header Card */}
      <header className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card/80 to-secondary/30 p-4 sm:p-6 md:p-10 shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 max-w-2xl">
            <p className="eyebrow flex items-center gap-1.5 text-primary">
              <Compass className="size-3.5" />
              {REGION_NAMES[state.region]}
            </p>
            <h1 className="display-font text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground">
              {state.name}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {state.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-foreground/80">
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1">
                <MapPin className="size-3.5 text-primary" />
                <span>Capital: {state.capital}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1">
                <Calendar className="size-3.5 text-primary" />
                <span>Best time: {state.bestSeasons || "October to March"}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1">
                <Layers className="size-3.5 text-primary" />
                <span>{places.length} Curated Sights</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-center rounded-2xl border border-border/80 bg-background/50 p-6 shadow-inner">
            <svg
              viewBox={`${state.bbox[0] - 8} ${state.bbox[1] - 8} ${state.bbox[2] + 16} ${state.bbox[3] + 16}`}
              className="size-32 md:size-40"
              aria-hidden="true"
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
            >
              <path
                d={state.d}
                className="fill-primary/20 stroke-primary hover:fill-primary/30 transition-colors"
                strokeWidth={2.5}
              />
            </svg>
          </div>
        </div>
      </header>

      {/* Iconic Places Section */}
      <section className="mt-14">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <p className="eyebrow">World Renowned</p>
            <h2 className="display-font text-2xl font-bold text-foreground">
              Iconic Monuments & Wonders
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">{iconic.length} Destinations</span>
        </div>

        {iconic.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {iconic.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onSelect={onSelectPlace}
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            We are currently documenting the iconic sights of {state.name}. Check back soon!
          </p>
        )}
      </section>

      {/* Hidden Gems Section */}
      <section className="mt-16">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <p className="eyebrow flex items-center gap-1.5 text-primary font-medium">
              <Sparkles className="size-3.5" /> Off the Beaten Track
            </p>
            <h2 className="display-font text-2xl font-bold text-foreground">
              Hidden Gems & Secret Sanctuaries
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">{hidden.length} Destinations</span>
        </div>

        {hidden.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hidden.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onSelect={onSelectPlace}
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            We&apos;re still exploring the undiscovered corners of {state.name}.
          </p>
        )}
      </section>
    </main>
  );
}
