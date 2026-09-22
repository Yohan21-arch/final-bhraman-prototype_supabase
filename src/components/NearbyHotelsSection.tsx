import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  MapPin,
  Star,
  ExternalLink,
  Navigation,
  Globe,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Compass,
} from "lucide-react";
import type { Place, NearbyHotel } from "@/types";
import { fetchNearbyHotels } from "@/services/nearbyHotelsService";
import { cn } from "@/lib/utils";

interface NearbyHotelsSectionProps {
  place: Place;
  onAskYatra?: (prompt: string) => void;
}

type SortOption = "distance" | "rating";
type FilterOption = "all" | "hotel" | "guest_house" | "resort";

export function NearbyHotelsSection({ place, onAskYatra }: NearbyHotelsSectionProps) {
  const [hotels, setHotels] = useState<NearbyHotel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const loadHotels = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const lat = place.coordinates?.lat;
    const lng = place.coordinates?.lng;

    if (typeof lat !== "number" || typeof lng !== "number") {
      setIsLoading(false);
      setErrorMessage("Coordinates for this destination are unavailable.");
      return;
    }

    try {
      const result = await fetchNearbyHotels(lat, lng, 15000);
      if (result.error && (!result.hotels || result.hotels.length === 0)) {
        setErrorMessage(result.message || "Nearby hotel information is temporarily unavailable.");
        setHotels([]);
      } else {
        setHotels(result.hotels || []);
        if (result.hotels?.length === 0 && result.message) {
          setErrorMessage(result.message);
        }
      }
    } catch {
      setErrorMessage("Nearby hotel information is temporarily unavailable.");
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, [place.id, place.coordinates.lat, place.coordinates.lng]);

  // Sort & Filter
  const displayedHotels = useMemo(() => {
    let list = [...hotels];

    // Filter by lodging type if selected
    if (activeFilter !== "all") {
      list = list.filter((h) => {
        const types = h.types || [];
        const primary = (h.primaryType || "").toLowerCase();
        if (activeFilter === "hotel") {
          return types.includes("hotel") || types.includes("motel") || primary.includes("hotel");
        }
        if (activeFilter === "resort") {
          return types.includes("resort_hotel") || primary.includes("resort");
        }
        if (activeFilter === "guest_house") {
          return (
            types.includes("guest_house") ||
            types.includes("bed_and_breakfast") ||
            types.includes("hostel") ||
            primary.includes("guest") ||
            primary.includes("homestay")
          );
        }
        return true;
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "distance") {
        const distA = a.distanceKm ?? 9999;
        const distB = b.distanceKm ?? 9999;
        return distA - distB;
      }
      if (sortBy === "rating") {
        // Sort primarily by rating descending, then review count
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        return (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0);
      }
      return 0;
    });

    return list;
  }, [hotels, sortBy, activeFilter]);

  return (
    <section
      id="nearby-hotels-section"
      aria-label={`Nearby Hotels for ${place.name}`}
      className="space-y-6 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-6 md:p-8 shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-border/60 pb-4 sm:pb-5">
        <div>
          <p className="eyebrow flex items-center gap-1.5 text-primary font-semibold">
            <Building2 className="size-3.5" /> Verified Local Accommodations
          </p>
          <h3 className="display-font text-2xl font-bold text-foreground">
            Nearby Hotels
          </h3>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Real accommodations near <span className="font-semibold text-foreground">{place.name}</span>
          </p>
        </div>

        {/* Sort and Refresh Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort Buttons */}
          <div className="inline-flex rounded-lg border border-border/80 bg-background/80 p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setSortBy("distance")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                sortBy === "distance"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Sort by nearest distance from landmark"
            >
              <Navigation className="size-3" />
              <span>Nearest</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy("rating")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                sortBy === "rating"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Sort by rating & review popularity"
            >
              <Star className="size-3 fill-current" />
              <span>Top Rated</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadHotels}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
            title="Refresh nearby accommodation listings"
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin text-primary")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs (when hotels are loaded) */}
      {!isLoading && hotels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground font-medium mr-1">Filter type:</span>
          {(
            [
              { id: "all", label: `All (${hotels.length})` },
              { id: "hotel", label: "Hotels" },
              { id: "resort", label: "Resorts" },
              { id: "guest_house", label: "Guest Houses & B&Bs" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "rounded-full px-3 py-1 font-medium transition-all cursor-pointer",
                activeFilter === tab.id
                  ? "bg-primary/15 text-primary border border-primary/40 font-semibold"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-xl border border-border/60 bg-background/50 overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-muted/60" />
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted/80 rounded-md w-3/4" />
                  <div className="h-3 bg-muted/60 rounded-md w-1/2" />
                  <div className="h-3 bg-muted/50 rounded-md w-full" />
                </div>
                <div className="pt-3 border-t border-border/50 flex justify-between">
                  <div className="h-3 bg-muted/60 rounded-md w-1/3" />
                  <div className="h-3 bg-muted/60 rounded-md w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && hotels.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-background/60 p-8 text-center space-y-3">
          <div className="rounded-full bg-muted p-3">
            <AlertCircle className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm md:text-base">
              {errorMessage.includes("temporarily unavailable")
                ? "Nearby hotel information is temporarily unavailable."
                : errorMessage}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-md">
              Unable to load live lodging data from Google Places for this destination right now. You can retry in a moment.
            </p>
          </div>
          <button
            type="button"
            onClick={loadHotels}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && displayedHotels.length === 0 && hotels.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-background/60 p-8 text-center space-y-3">
          <div className="rounded-full bg-muted p-3">
            <Building2 className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm md:text-base">
              No nearby hotels found.
            </h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-md">
              No registered lodging places were found within 15 km of {place.name}.
            </p>
          </div>
        </div>
      )}

      {/* Filtered Empty State */}
      {!isLoading && hotels.length > 0 && displayedHotels.length === 0 && (
        <div className="rounded-xl border border-border/70 bg-background/50 p-6 text-center text-xs text-muted-foreground">
          No accommodations matched the &ldquo;{activeFilter}&rdquo; filter.{" "}
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className="text-primary underline font-medium hover:opacity-80"
          >
            View all {hotels.length} hotels
          </button>
        </div>
      )}

      {/* Real Hotel Cards Grid */}
      {!isLoading && displayedHotels.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {displayedHotels.map((hotel) => (
            <article
              key={hotel.id}
              className="group flex flex-col rounded-xl border border-border/80 bg-card hover:border-primary/50 transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden"
            >
              {/* Hotel Photo or Clean Fallback */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
                {hotel.photoUrl ? (
                  <img
                    src={hotel.photoUrl}
                    alt={hotel.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-muted/80 to-muted/40 p-4 text-center">
                    <Building2 className="size-8 text-muted-foreground/40 mb-1" />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {hotel.primaryType || "Hotel"}
                    </span>
                  </div>
                )}

                {/* Badges Over Photo */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
                  {/* Primary Type Badge */}
                  <span className="rounded-md bg-background/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-xs border border-border/60">
                    {hotel.primaryType || "Hotel"}
                  </span>

                  {/* Geodesic Distance Badge */}
                  {typeof hotel.distanceKm === "number" && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-background/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-primary shadow-xs border border-border/60">
                      <Navigation className="size-2.5" />
                      {hotel.distanceKm < 1 ? `${Math.round(hotel.distanceKm * 1000)}m` : `${hotel.distanceKm} km`}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                <div className="space-y-1.5">
                  {/* Hotel Name */}
                  <h4
                    className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors"
                    title={hotel.name}
                  >
                    {hotel.name}
                  </h4>

                  {/* Rating & Review Count (Only when returned by API) */}
                  {typeof hotel.rating === "number" && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <Star className="size-3 fill-amber-500 text-amber-500" />
                        {hotel.rating.toFixed(1)}
                      </span>
                      {typeof hotel.userRatingCount === "number" && (
                        <span className="text-[11px] text-muted-foreground">
                          ({hotel.userRatingCount.toLocaleString()}{" "}
                          {hotel.userRatingCount === 1 ? "review" : "reviews"})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Real Address */}
                  {hotel.address && (
                    <p
                      className="flex items-start gap-1.5 text-xs text-muted-foreground line-clamp-2 pt-0.5"
                      title={hotel.address}
                    >
                      <MapPin className="size-3.5 shrink-0 text-primary/70 mt-0.5" />
                      <span>{hotel.address}</span>
                    </p>
                  )}
                </div>

                {/* Card Footer: Links & Actions */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View on Google Maps Link */}
                    {hotel.googleMapsUri && (
                      <a
                        href={hotel.googleMapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        title="Open place in Google Maps"
                      >
                        <span>Maps</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    )}

                    {/* Official Website Link */}
                    {hotel.websiteUri && (
                      <a
                        href={hotel.websiteUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        title="Visit hotel official website"
                      >
                        <Globe className="size-2.5" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>

                  {/* Yatra AI Inquire */}
                  {onAskYatra && (
                    <button
                      type="button"
                      onClick={() =>
                        onAskYatra(
                          `Can you give me practical travel advice, booking guidance, and what to expect when staying at "${hotel.name}" near ${place.name}?`
                        )
                      }
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="Ask Yatra AI for tips about this stay"
                    >
                      <Sparkles className="size-2.5 text-primary" />
                      <span>Ask Yatra</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Disclaimers & Grounding Note */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-4 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <Compass className="size-3.5 text-primary" />
          <span>Accommodations retrieved in real time via Google Places API based on verified landmark coordinates.</span>
        </p>
        <p>Distances measured geodesic from destination center.</p>
      </div>
    </section>
  );
}
