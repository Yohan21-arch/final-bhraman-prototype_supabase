import { useState, useEffect, useMemo, type ReactNode } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Compass,
  Info,
  Lightbulb,
  MapPin,
  Route as RouteIcon,
  Share2,
  Check,
  Sparkles,
  Layers,
  X,
  Camera,
  ExternalLink,
  Maximize2,
} from "lucide-react";
import type { Place, StateData } from "@/types";
import { stateById } from "@/data/states";
import { relatedPlaces } from "@/data/places";
import { PlaceCard, PlaceImage } from "@/components/PlaceCard";
import { LocalTravelTips } from "@/components/LocalTravelTips";
import { ImageLightbox } from "@/components/ImageLightbox";
import { PlaceTourGuideSection } from "@/components/PlaceTourGuideSection";
import { NearbyHotelsSection } from "@/components/NearbyHotelsSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { getPlaceGalleryImages } from "@/lib/gallery";
import { useTripList } from "@/lib/trip-list";
import { useAuth } from "@/contexts/AuthContext";
import { userAccountService } from "@/services/userAccountService";
import { cn } from "@/lib/utils";

export function PlaceDetail({
  place,
  onBack,
  onClose,
  backLabel = "Back",
  onSelectPlace,
  onSelectState,
  onAskYatra,
}: {
  place: Place;
  onBack: () => void;
  onClose?: () => void;
  backLabel?: string;
  onSelectPlace: (place: Place) => void;
  onSelectState: (state: StateData) => void;
  onAskYatra?: (query: string) => void;
}) {
  const state = stateById(place.state);
  const { user } = useAuth();
  const { has, toggle, items, updateNotes } = useTripList();
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [notesInput, setNotesInput] = useState(() => {
    const found = items.find((i) => i.placeId === place.id);
    return found?.notes || "";
  });
  const [noteSaved, setNoteSaved] = useState(false);

  const galleryImages = useMemo(() => getPlaceGalleryImages(place), [place]);
  const isSaved = has(place.id);
  const related = relatedPlaces(place);

  const handleBookmarkToggle = async () => {
    const willBeSaved = !isSaved;
    toggle(place.id);
    if (user) {
      if (willBeSaved) {
        await userAccountService.addSavedDestination(user.id, place.id);
      } else {
        await userAccountService.removeSavedDestination(user.id, place.id);
      }
    }
  };

  // Keyboard shortcut: Escape to go back / close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in a textarea or input
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA";
      if (e.key === "Escape" && !isInput) {
        if (onClose) {
          onClose();
        } else {
          onBack();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack, onClose]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveNotes = () => {
    updateNotes(place.id, notesInput);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <main className="min-h-screen pb-28">
      {/* Top Floating / Sticky Navigation Bar */}
      <nav
        id="destination-sticky-nav"
        aria-label="Destination navigation"
        className="sticky top-16 z-30 flex items-center justify-between border-b border-border/80 bg-background/95 px-3.5 py-2.5 backdrop-blur-xl md:px-8 shadow-sm transition-all"
      >
        {/* Clearly Visible Top-Left Back Button */}
        <button
          id="destination-back-btn"
          onClick={onBack}
          aria-label={backLabel ? `${backLabel} (Press Esc to go back)` : "Go back to previous page (Esc)"}
          title={backLabel ? `${backLabel} (Esc)` : "Go back (Esc)"}
          className="group inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border/90 bg-card/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-foreground shadow-xs transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-1" />
          <span className="truncate max-w-[140px] xs:max-w-[220px] sm:max-w-xs">{backLabel}</span>
        </button>

        {/* Action Controls & Top-Right Close Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onAskYatra && (
            <button
              onClick={() =>
                onAskYatra(
                  `Tell me more about visiting ${place.name} in ${state?.name || "India"} — best time, nearby hidden spots, and tips for booking.`
                )
              }
              aria-label="Ask Yatra AI for travel guidance"
              className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#F2A93B]/50 bg-[#17233D] px-3.5 py-2 text-xs font-semibold text-[#F2A93B] hover:bg-[#101A30] transition-colors shadow-xs"
            >
              <Sparkles className="size-3.5 text-[#F2A93B]" />
              <span>Ask Yatra</span>
            </button>
          )}

          <button
            onClick={handleShare}
            aria-label="Share destination link"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-border bg-card/80 px-3.5 py-2 text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors cursor-pointer"
          >
            {copied ? <Check className="size-3.5 text-green-400" /> : <Share2 className="size-3.5" />}
            <span className="hidden xs:inline">{copied ? "Link Copied" : "Share"}</span>
          </button>

          <button
            onClick={handleBookmarkToggle}
            aria-label={isSaved ? "Remove from saved list" : "Save destination"}
            className={cn(
              "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] font-semibold transition-all cursor-pointer",
              isSaved
                ? "bg-primary text-primary-foreground shadow-md"
                : "border border-primary/50 text-primary hover:bg-primary/10"
            )}
          >
            {isSaved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
            <span className="hidden xs:inline">{isSaved ? "Saved" : "Save"}</span>
          </button>

          {/* Clearly Visible Top-Right Close Button (✕) */}
          <button
            id="destination-close-btn"
            onClick={onClose || onBack}
            aria-label="Close destination details (Esc)"
            title="Close destination details (Esc)"
            className="inline-flex size-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border/90 bg-card/90 text-foreground transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 shadow-xs cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </nav>

      {/* Hero Visual Section */}
      <section className="relative h-[55vh] min-h-[420px] max-h-[640px] w-full overflow-hidden bg-secondary">
        <PlaceImage
          place={{ ...place, images: place.images.length ? [place.images[activeImage] || place.images[0]!] : [] }}
          priority
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-4 pb-8 md:px-8">
          <div className="flex flex-wrap items-center gap-2.5">
            {state && (
              <button
                onClick={() => onSelectState(state)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/70 px-3.5 py-1 text-[11px] uppercase tracking-[0.16em] text-foreground backdrop-blur-md transition-colors hover:border-primary hover:text-primary"
              >
                <MapPin className="size-3 text-primary" />
                {state.name}
              </button>
            )}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em] backdrop-blur-md",
                place.category === "hidden"
                  ? "border border-primary/50 bg-primary/20 text-primary font-medium"
                  : "border border-border bg-secondary/80 text-muted-foreground"
              )}
            >
              {place.category === "hidden" ? (
                <>
                  <Sparkles className="size-3" /> Off the Beaten Path
                </>
              ) : (
                <>
                  <Layers className="size-3" /> Iconic Landmark
                </>
              )}
            </span>
          </div>

          <h1 className="display-font mt-3 text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
            {place.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {place.shortDesc}
          </p>
        </div>

        <div className="absolute bottom-6 right-4 md:right-8 flex items-center gap-2 z-10">
          <button
            onClick={() => setLightboxIndex(activeImage)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 py-1 text-xs font-semibold text-foreground backdrop-blur-md hover:border-primary hover:text-primary transition-all shadow-md cursor-pointer"
          >
            <Camera className="size-3.5 text-primary" />
            <span>View Gallery ({place.images.length})</span>
          </button>

          {place.images.length > 1 && (
            <div className="flex gap-2 bg-background/60 p-1.5 rounded-full backdrop-blur-md border border-border/70">
              {place.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View photo ${i + 1}`}
                  className={cn(
                    "size-2.5 rounded-full transition-all",
                    i === activeImage ? "bg-primary scale-125" : "bg-foreground/40 hover:bg-foreground/70"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Verified Photograph Attribution & Licensing Bar */}
      {(() => {
        const currentAttr = place.imageAttributions?.[activeImage] || place.imageAttributions?.[0];
        if (!currentAttr) return null;
        return (
          <div className="border-b border-border/60 bg-secondary/30 px-4 py-2.5 text-xs text-muted-foreground md:px-8">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Camera className="size-3.5 text-primary shrink-0" />
                <span className="leading-tight">
                  <strong className="font-semibold text-foreground">Authentic Photo:</strong>{" "}
                  {currentAttr.title || place.name}
                  {currentAttr.author && (
                    <> &bull; Contributor: <span className="text-foreground/90 font-medium">{currentAttr.author}</span></>
                  )}
                  {currentAttr.license && (
                    <> &bull; <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground/80">{currentAttr.license}</span></>
                  )}
                </span>
              </div>
              {currentAttr.sourceUrl && (
                <a
                  href={currentAttr.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  <span>{currentAttr.sourceName || "Wikimedia Commons"}</span>
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </div>
        );
      })()}

      {/* Main Content Layout */}
      <div className="mx-auto max-w-5xl space-y-12 px-4 pt-10 md:px-8">
        <section className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div>
              <p className="eyebrow">The Experience & Story</p>
              <h2 className="display-font mt-1 text-2xl font-semibold text-foreground">Why Visit</h2>
              <p className="mt-3 text-base leading-relaxed text-foreground/90 font-sans">
                {place.whyVisit}
              </p>
            </div>

            <div className="pt-2">
              <p className="eyebrow mb-2.5">Travel Themes & Highlights</p>
              <div className="flex flex-wrap gap-2">
                {place.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/80 bg-secondary/50 px-3 py-1 text-xs uppercase tracking-[0.12em] text-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Traveler Notes Box if saved */}
            {isSaved && (
              <div className="rounded-xl border border-primary/30 bg-secondary/30 p-5 space-y-3">
                <p className="eyebrow flex items-center gap-1.5 text-primary">
                  <Bookmark className="size-3.5" /> Your Personal Itinerary Notes
                </p>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="E.g. Book sunrise slot at 6 AM, try the local masala chai, bring wide angle lens..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background/80 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Saved in your local Bhraman list
                  </span>
                  <button
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 px-3 py-1 text-xs uppercase tracking-wider font-semibold transition-colors"
                  >
                    {noteSaved ? <Check className="size-3" /> : null}
                    {noteSaved ? "Note Saved" : "Save Note"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Practical Info Sidebar */}
          <aside className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="display-font text-lg font-semibold text-foreground border-b border-border/60 pb-3">
              Essential Travel Logistics
            </h3>

            <DetailItem
              icon={<Calendar className="size-4" />}
              label="Best Season & Timing"
              body={place.bestTimeToVisit}
            />

            <DetailItem
              icon={<RouteIcon className="size-4" />}
              label="How to Reach"
              body={place.howToReach}
            />

            <DetailItem
              icon={<Info className="size-4" />}
              label="Entry Passes & Operational Info"
              body={place.entryInfo}
            />

            <DetailItem
              icon={<Compass className="size-4" />}
              label="Coordinates"
              body={`${place.coordinates.lat.toFixed(4)}° N, ${place.coordinates.lng.toFixed(4)}° E`}
            />
          </aside>
        </section>

        {/* Quick-Access Collapsible Local Travel Tips */}
        <LocalTravelTips
          place={place}
          state={state}
          onAskYatra={onAskYatra}
          defaultExpanded={true}
        />

        {/* Golden Editorial Traveler Tip */}
        <section className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/[0.08] to-transparent p-6 md:p-8">
          <p className="eyebrow flex items-center gap-2 text-primary font-semibold">
            <Lightbulb className="size-4 text-primary" /> Curated Field Tip
          </p>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-foreground/90 italic">
            &ldquo;{place.travelerTip}&rdquo;
          </p>
        </section>

        {/* Authentic Photographic Gallery Section */}
        {galleryImages.length > 0 && (
          <section className="space-y-6 rounded-2xl border border-border/70 bg-card/60 p-6 md:p-8 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <p className="eyebrow flex items-center gap-1.5 text-primary font-semibold">
                  <Camera className="size-3.5" /> Visual Archive
                </p>
                <h3 className="display-font text-2xl font-bold text-foreground">
                  Photo Gallery of {place.name}
                </h3>
              </div>
              <button
                onClick={() => setLightboxIndex(0)}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/60 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-xs"
              >
                <Maximize2 className="size-3.5" />
                <span>Fullscreen Lightbox ({galleryImages.length})</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {galleryImages.map((img, idx) => (
                <div
                  key={img.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative overflow-hidden rounded-xl border border-border/70 bg-secondary/80 aspect-[4/3] cursor-pointer hover:border-primary/70 hover:shadow-lg transition-all"
                >
                  <img
                    src={img.url}
                    alt={img.attribution?.title || img.placeName}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                      <Maximize2 className="size-4" />
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 inset-x-2.5 z-10">
                    <p className="text-xs font-semibold text-white truncate drop-shadow-sm">
                      {img.attribution?.title || `Photograph ${idx + 1}`}
                    </p>
                    {img.attribution?.author && (
                      <p className="text-[10px] text-white/70 truncate">
                        By {img.attribution.author}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Verified Tour Guides & Government ASI Rates Section */}
        <PlaceTourGuideSection
          place={place}
          onAskYatra={onAskYatra}
        />

        {/* Real Nearby Accommodations via Google Places API */}
        <NearbyHotelsSection
          place={place}
          onAskYatra={onAskYatra}
        />

        {/* Traveler Reviews & Value Price Ratings Section */}
        <ReviewsSection
          place={place}
          onAskYatra={onAskYatra}
        />

        {/* More Like This */}
        {related.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Discover Further</p>
                <h3 className="display-font text-2xl font-bold text-foreground">
                  More Destinations You May Like
                </h3>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <PlaceCard
                  key={item.id}
                  place={item}
                  onSelect={onSelectPlace}
                />
              ))}
            </div>
          </section>
        )}

        {/* Bottom Call to Action */}
        <section className="flex flex-col items-center gap-4 border-t border-border/80 pt-10 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onBack}
              aria-label={backLabel ? `${backLabel} (Esc)` : "Go back"}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border/90 bg-card/90 px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>{backLabel}</span>
            </button>

            <button
              onClick={() => toggle(place.id)}
              className={cn(
                "inline-flex min-h-[44px] items-center gap-2 rounded-full px-8 py-3 text-xs uppercase tracking-[0.18em] font-semibold transition-all shadow-lg cursor-pointer",
                isSaved
                  ? "border border-primary/80 bg-primary/20 text-primary hover:bg-primary/30"
                  : "bg-primary text-primary-foreground hover:opacity-90 hover:shadow-primary/20"
              )}
            >
              {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
              {isSaved ? "Saved to My Bhraman List" : "Add to My Bhraman List"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Access your curated saved destinations anytime from the top navigation.
          </p>
        </section>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={galleryImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onAskYatra={onAskYatra}
        />
      )}
    </main>
  );
}

function DetailItem({
  icon,
  label,
  body,
}: {
  icon: ReactNode;
  label: string;
  body: string;
}) {
  return (
    <div>
      <p className="eyebrow flex items-center gap-2 text-primary">
        <span>{icon}</span>
        {label}
      </p>
      <p className="mt-1.5 text-xs md:text-sm leading-relaxed text-foreground/85">{body}</p>
    </div>
  );
}
