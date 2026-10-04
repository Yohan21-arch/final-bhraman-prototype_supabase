import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAccountService } from "@/services/userAccountService";
import { useTripList } from "@/lib/trip-list";
import type { Place, StateData, SavedDestination } from "@/types";
import { stateById } from "@/data/states";
import { PlaceImage } from "@/components/PlaceCard";
import {
  Bookmark,
  Trash2,
  MapPin,
  Sparkles,
  ArrowRight,
  Compass,
  Calendar,
  Layers,
  Share2,
  Check,
  RefreshCw,
} from "lucide-react";
import type { NavTab } from "@/components/Navbar";

export function SavedPlacesView({
  onSelectPlace,
  onSelectState,
  onSelectTab,
  places,
}: {
  onSelectPlace: (place: Place) => void;
  onSelectState: (state: StateData) => void;
  onSelectTab: (tab: NavTab) => void;
  places?: Place[];
}) {
  const { user } = useAuth();
  const { items, remove, clear } = useTripList();
  const [savedItems, setSavedItems] = useState<SavedDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const data = await userAccountService.getSavedDestinations(user?.id || "");
      setSavedItems(data);
    } catch (err) {
      console.warn("Failed to load saved destinations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [user, items]);

  const handleRemove = async (destinationId: string) => {
    remove(destinationId);
    if (user) {
      await userAccountService.removeSavedDestination(user.id, destinationId);
    }
    setSavedItems((prev) => prev.filter((item) => item.destination_id !== destinationId));
  };

  const handleShareList = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const names = savedItems.map((s) => s.destination?.name).filter(Boolean).join(", ");
      navigator.clipboard.writeText(`My Bhraman India Travel Wishlist: ${names}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bookmark className="size-5" />
            </div>
            <h1 className="display-font text-2xl md:text-3xl font-bold text-foreground">
              Saved Destinations
            </h1>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {savedItems.length}
            </span>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            {user
              ? "Your account collection, with a local fallback when cloud sync is unavailable."
              : "Saved on this browser. Sign in to keep your collection across devices."}
          </p>
        </div>

        {savedItems.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareList}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
              <span>{copied ? "Copied to Clipboard" : "Share List"}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab("planner")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Compass className="size-3.5" />
              <span>Open Trip Planner</span>
            </button>
          </div>
        )}
      </div>

      <div className="account-journey-link"><span>Saved Places is your collection. List & notes adds personal notes and day assignments on this device.</span><button onClick={() => onSelectTab("my-list")}>Open list & notes</button></div>
      {/* Content */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3"
            >
              <div className="aspect-[4/3] w-full rounded-xl bg-muted/80" />
              <div className="h-4 w-3/4 rounded bg-muted/80" />
              <div className="h-3 w-1/2 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      ) : savedItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Bookmark className="size-7" />
          </div>
          <h3 className="display-font text-lg font-semibold text-foreground">
            No saved destinations yet
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">
            Discover breathtaking hill stations, ancient temple towns, and untouched coastal sanctuaries across India.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onSelectTab("destinations")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
            >
              <span>Explore Destinations</span>
              <ArrowRight className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSelectTab("map")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <span>Open India Map</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {savedItems.map((item) => {
            const place = item.destination;
            if (!place) return null;
            const stateObj = stateById(place.state);

            return (
              <div
                key={item.destination_id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                {/* Place Image */}
                <div
                  className="relative aspect-[4/3] w-full overflow-hidden bg-muted cursor-pointer"
                  onClick={() => onSelectPlace(place)}
                >
                  <PlaceImage
                    place={place}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  {/* Category Pill */}
                  <span
                    className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide backdrop-blur-md shadow-xs ${
                      place.category === "iconic"
                        ? "bg-primary text-primary-foreground font-bold"
                        : "bg-background text-primary border border-primary/40 font-medium"
                    }`}
                  >
                    {place.category === "iconic" ? "Iconic Monument" : "Hidden Sanctuary"}
                  </span>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(place.id);
                    }}
                    aria-label={"Remove saved place: " + place.name} title="Remove from saved"
                    className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-red-500/90 transition-all cursor-pointer backdrop-blur-md"
                  >
                    <Trash2 className="size-3.5" />
                  </button>

                  {/* Bottom Image Label */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white/90">
                    <span className="text-[11px] font-medium drop-shadow-sm flex items-center gap-1">
                      <MapPin className="size-3 text-primary" />
                      {stateObj?.name}
                    </span>
                  </div>
                </div>

                {/* Place Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      className="display-font text-xl font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                    >
                      <button id={"saved-place-" + place.id} className="text-left" onClick={() => onSelectPlace(place)}>{place.name}</button>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {place.shortDesc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      Best: {place.bestTimeToVisit.split(",")[0] || place.bestTimeToVisit}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectPlace(place)}
                      aria-label={"Explore " + place.name} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <span>Explore</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


