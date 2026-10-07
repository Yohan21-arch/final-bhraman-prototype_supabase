import { useState, type ReactNode } from "react";
import {
  Sparkles,
  Compass,
  Calendar,
  Clock,
  MapPin,
  BookmarkPlus,
  Check,
  ArrowRight,
  Sun,
  Sunset,
  Moon
} from "lucide-react";
import { PLACES_DATA, placesByState, getLoadedPlaces } from "@/data/places";
import { STATES_DATA, stateById, REGION_NAMES } from "@/data/states";
import type { Place, StateData, Region } from "@/types";
import { useTripList } from "@/lib/trip-list";
import { PlaceImage } from "@/components/PlaceCard";
import { cn } from "@/lib/utils";

interface GeneratedDay {
  dayNumber: number;
  theme: string;
  morning: { place: Place; activity: string; time: string };
  afternoon: { place: Place; activity: string; time: string };
  evening: { place: Place; activity: string; time: string };
  travelAdvice: string;
}

export function ItineraryPlanner({
  onSelectPlace,
  onSelectState,
  places,
}: {
  onSelectPlace: (place: Place) => void;
  onSelectState: (state: StateData) => void;
  places?: Place[];
}) {
  const [duration, setDuration] = useState<number>(5);
  const [style, setStyle] = useState<string>("balanced");
  const [selectedRegion, setSelectedRegion] = useState<Region | "all">("all");
  const [selectedState, setSelectedState] = useState<string>("rajasthan");
  const [itinerary, setItinerary] = useState<GeneratedDay[] | null>(null);
  const [allSaved, setAllSaved] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const { toggle, has } = useTripList();

  const handleGenerate = () => {
    // Collect candidate places from Supabase loaded places or fallback pool
    const pool = places && places.length > 0 ? places : getLoadedPlaces();
    const candidates = pool.filter((p) => {
      if (selectedState !== "all") return p.state === selectedState;
      if (selectedRegion !== "all") {
        const s = STATES_DATA.find((st) => st.id === p.state);
        return s && s.region === selectedRegion;
      }
      return true;
    });

    if (candidates.length === 0) {
      setGenerationError("No destinations are available for this selection. Try another state or region.");
      return;
    }
    setGenerationError("");

    if (style === "hidden") {
      candidates.sort((a, b) => (a.category === "hidden" ? -1 : 1));
    } else if (style === "iconic") {
      candidates.sort((a, b) => (a.category === "iconic" ? -1 : 1));
    }

    const days: GeneratedDay[] = [];
    const themes = [
      "Heritage Foundations & Golden Horizons",
      "Sacred Sanctuaries & Architectural Marvels",
      "Offbeat Trails & Untouched Nature",
      "Living Traditions, Bazaars & Culinary Delights",
      "High Mountain Vistas & Serene Waters",
      "Monolithic Caves & Ancient Inscriptions",
      "Coastal Breezes & Royal Retreats",
    ];

    for (let i = 0; i < duration; i++) {
      const p1 = candidates[(i * 3) % candidates.length]!;
      const p2 = candidates[(i * 3 + 1) % candidates.length]!;
      const p3 = candidates[(i * 3 + 2) % candidates.length]!;

      days.push({
        dayNumber: i + 1,
        theme: themes[i % themes.length] || `Day ${i + 1} Deep Dive`,
        morning: {
          place: p1,
          time: "07:30 AM – 11:00 AM",
          activity: `Early sunrise photography, tranquil walk through ${p1.name} before crowds arrive.`,
        },
        afternoon: {
          place: p2,
          time: "01:00 PM – 04:30 PM",
          activity: `Explore the intricate details and history of ${p2.name}, followed by local artisan tea.`,
        },
        evening: {
          place: p3,
          time: "05:30 PM – 08:30 PM",
          activity: `Golden hour sunset vantage point at ${p3.name}, twilight ambiance and authentic cuisine.`,
        },
        travelAdvice: `Carry light footwear for temple/sanctuary walks and stay hydrated with local tender coconut water.`,
      });
    }

    setItinerary(days);
    setAllSaved(false);
  };

  const handleSaveAllToTripList = () => {
    if (!itinerary) return;
    const placeIds = new Set<string>(itinerary.flatMap(day => [day.morning.place.id, day.afternoon.place.id, day.evening.place.id]));
    placeIds.forEach(id => { if (!has(id)) toggle(id); });
    setAllSaved(true);
    setTimeout(() => setAllSaved(false), 3000);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-28 pt-8 md:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="eyebrow flex items-center justify-center gap-1.5 text-primary">
          <Sparkles className="size-3.5" /> Curated Itinerary Engine
        </p>
        <h1 className="display-font text-3xl font-extrabold text-foreground sm:text-5xl">
          Craft Your India Expedition
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Create a draft day-by-day itinerary from Bhraman's destinations. Check travel distances, opening times and availability before travelling.
        </p>
      </div>

      {/* Configuration Card */}
      <div className="mt-10 rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Duration */}
          <div>
            <label className="eyebrow flex items-center gap-1.5 mb-2 text-foreground font-semibold">
              <Calendar className="size-3.5 text-primary" /> Trip Duration
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[3, 5, 7, 10].map((d) => (
                <button
                  key={d}
                  aria-pressed={duration === d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all",
                    duration === d
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="eyebrow flex items-center gap-1.5 mb-2 text-foreground font-semibold">
              <Compass className="size-3.5 text-primary" /> Travel Style
            </label>
            <select
              aria-label="Travel style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="balanced">Balanced (Icons & Offbeat)</option>
              <option value="hidden">Pure Hidden Gems Focus</option>
              <option value="iconic">Essential Famous Wonders</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="eyebrow flex items-center gap-1.5 mb-2 text-foreground font-semibold">
              <MapPin className="size-3.5 text-primary" /> Region
            </label>
            <select
              aria-label="Travel region"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value as Region | "all");
                setSelectedState("all");
              }}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="all">Pan-India (Grand Tour)</option>
              {(["north", "south", "west", "east", "northeast", "central"] as Region[]).map((r) => (
                <option key={r} value={r}>
                  {REGION_NAMES[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Target State */}
          <div>
            <label className="eyebrow flex items-center gap-1.5 mb-2 text-foreground font-semibold">
              <MapPin className="size-3.5 text-primary" /> Preferred State
            </label>
            <select
              aria-label="Preferred state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="all">Any State in Region</option>
              {STATES_DATA.filter((s) => selectedRegion === "all" || s.region === selectedRegion).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-center border-t border-border/60 pt-6">
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-xs uppercase tracking-[0.18em] font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition-all"
          >
            <Sparkles className="size-4" />
            <span>Create Draft Itinerary</span>
          </button>
        </div>
        {generationError && <p role="alert" className="mt-4 text-center text-sm text-primary">{generationError}</p>}
      </div>

      {/* Generated Itinerary Output */}
      {itinerary && (
        <div className="mt-12 space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
            <div>
              <p className="eyebrow text-primary">Curated Travel Schedule</p>
              <h2 className="display-font text-2xl md:text-3xl font-extrabold text-foreground">
                Your {duration}-Day Journey Blueprint
              </h2>
            </div>

            <button
              onClick={handleSaveAllToTripList}
              className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-primary/15 px-4 py-2 text-xs uppercase tracking-wider text-primary font-semibold hover:bg-primary/25 transition-colors"
            >
              {allSaved ? <Check className="size-4" /> : <BookmarkPlus className="size-4" />}
              <span>{allSaved ? "All Added to Trip List!" : "Save All Places to My List"}</span>
            </button>
          </div>

          <div className="space-y-6">
            {itinerary.map((day) => (
              <div
                key={day.dayNumber}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-md space-y-5"
              >
                {/* Day Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                      D{day.dayNumber}
                    </span>
                    <h3 className="display-font text-xl font-bold text-foreground">
                      {day.theme}
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground uppercase tracking-widest">
                    3 Curated Stops
                  </span>
                </div>

                {/* Day Time Slots */}
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Morning */}
                  <SlotCard
                    icon={<Sun className="size-4 text-amber-400" />}
                    period="Morning"
                    time={day.morning.time}
                    place={day.morning.place}
                    activity={day.morning.activity}
                    onSelectPlace={onSelectPlace}
                  />

                  {/* Afternoon */}
                  <SlotCard
                    icon={<Compass className="size-4 text-primary" />}
                    period="Afternoon"
                    time={day.afternoon.time}
                    place={day.afternoon.place}
                    activity={day.afternoon.activity}
                    onSelectPlace={onSelectPlace}
                  />

                  {/* Evening */}
                  <SlotCard
                    icon={<Sunset className="size-4 text-orange-400" />}
                    period="Evening / Sunset"
                    time={day.evening.time}
                    place={day.evening.place}
                    activity={day.evening.activity}
                    onSelectPlace={onSelectPlace}
                  />
                </div>

                {/* Field Tip */}
                <div className="rounded-xl border border-primary/20 bg-secondary/30 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Logistics Note: </span>
                  {day.travelAdvice}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function SlotCard({
  icon,
  period,
  time,
  place,
  activity,
  onSelectPlace,
}: {
  icon: ReactNode;
  period: string;
  time: string;
  place: Place;
  activity: string;
  onSelectPlace: (place: Place) => void;
}) {
  const state = stateById(place.state);

  return (
    <button
      type="button"
      onClick={() => onSelectPlace(place)}
      aria-label={"Explore " + place.name + ", " + period}
      className="group min-w-0 text-left cursor-pointer rounded-xl border border-border/70 bg-secondary/40 p-4 transition-all hover:border-primary/60 hover:bg-secondary/70 flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            {icon} {period}
          </span>
          <span className="text-muted-foreground">{time}</span>
        </div>

        <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-secondary">
          <PlaceImage place={place} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-background/80 px-2 py-0.5 text-[9px] uppercase tracking-wider text-primary backdrop-blur-sm">
            {place.category === "hidden" ? "Hidden Gem" : "Iconic"}
          </span>
        </div>

        <div>
          <h4 className="display-font text-base font-bold text-foreground group-hover:text-primary transition-colors">
            {place.name}
          </h4>
          <p className="text-[11px] text-muted-foreground">
            {state?.name}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-foreground/80 line-clamp-2">
            {activity}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-primary">
        <span>View Details</span>
        <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}
