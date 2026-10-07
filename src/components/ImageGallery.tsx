import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Camera,
  Search,
  Filter,
  Maximize2,
  MapPin,
  Sparkles,
  Layers,
  Globe,
  Bookmark,
  BookmarkCheck,
  ArrowUpRight,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  Grid3X3,
  Columns3,
  Dices,
} from "lucide-react";
import { getAllGalleryImages, filterGalleryImages, type GalleryFilters } from "@/lib/gallery";
import { allTags } from "@/data/places";
import { REGION_NAMES } from "@/data/states";
import { DestinationPhoto } from "@/components/DestinationPhoto";
import { ImageLightbox } from "@/components/ImageLightbox";
import { useTripList } from "@/lib/trip-list";
import type { Place, StateData, Region, Category, Tag, GalleryImage } from "@/types";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "masonry" | "cinematic";
type SortOption = "curated" | "state" | "name";

export interface GalleryViewState { filters: GalleryFilters; viewMode: ViewMode; sortBy: SortOption }
export const DEFAULT_GALLERY_VIEW: GalleryViewState = { filters: { region: "all", category: "all", tag: "all", searchQuery: "" }, viewMode: "grid", sortBy: "curated" };

export function ImageGallery({
  places,
  onSelectPlace,
  onSelectState,
  onAskYatra,
  compact = false,
  view, onViewChange,
}: {
  places?: Place[];
  onSelectPlace: (place: Place) => void;
  onSelectState: (state: StateData) => void;
  onAskYatra?: (prompt: string) => void;
  compact?: boolean;
  view?: GalleryViewState; onViewChange?: (view: GalleryViewState) => void;
}) {
  const allImages = useMemo(() => getAllGalleryImages(places), [places]);

  const reduceMotion = useReducedMotion();
  const [internalView, setInternalView] = useState<GalleryViewState>(DEFAULT_GALLERY_VIEW);
  const currentView = view || internalView;
  const { filters, viewMode, sortBy } = currentView;
  const updateView = (change: Partial<GalleryViewState>) => {
    const next = { ...currentView, ...change };
    setInternalView(next); onViewChange?.(next);
  };
  const setFilters = (next: GalleryFilters | ((previous: GalleryFilters) => GalleryFilters)) => updateView({ filters: typeof next === "function" ? next(filters) : next });
  const setViewMode = (viewMode: ViewMode) => updateView({ viewMode });
  const setSortBy = (sortBy: SortOption) => updateView({ sortBy });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { has, toggle } = useTripList();

  // Filtered images
  const filteredImages = useMemo(() => {
    let result = filterGalleryImages(allImages, filters);

    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.placeName.localeCompare(b.placeName));
    } else if (sortBy === "state") {
      result = [...result].sort((a, b) => a.stateName.localeCompare(b.stateName));
    }

    return result;
  }, [allImages, filters, sortBy]);

  const hasActiveFilters =
    filters.region !== "all" ||
    filters.category !== "all" ||
    filters.tag !== "all" ||
    filters.searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setFilters({
      region: "all",
      category: "all",
      tag: "all",
      searchQuery: "",
    });
  };

  const handleRandomPhoto = () => {
    if (filteredImages.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredImages.length);
    setLightboxIndex(randomIndex);
  };

  // Region tabs
  const regions: { id: Region | "all"; label: string }[] = [
    { id: "all", label: "All India" },
    { id: "north", label: "North" },
    { id: "south", label: "South" },
    { id: "west", label: "West" },
    { id: "east", label: "East" },
    { id: "northeast", label: "North East" },
    { id: "central", label: "Central" },
  ];

  return (
    <div className={cn("destination-gallery space-y-8", !compact ? "mx-auto max-w-7xl px-4 pb-28 pt-6 md:px-8" : "w-full pt-4")}>
      {/* Editorial Hero Header */}
      <section hidden={compact} className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/80 to-secondary/30 p-6 md:p-10 shadow-2xl grain">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs uppercase tracking-[0.2em] text-primary font-semibold backdrop-blur-md">
            <Camera className="size-3.5" />
            <span>Curated Photographic Atlas</span>
          </div>

          <h1 className="display-font text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.02]">
            Visual Sanctuary of India
          </h1>

          <p className="text-sm md:text-base leading-relaxed text-muted-foreground font-sans">
            Explore authentic, high-resolution photographs documenting India&apos;s sacred heritage,
            trans-Himalayan passes, living monoliths, and secret coastal bays.
          </p>

          {/* Key Stat Badges & Random Photo Trigger */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 py-1 text-xs text-muted-foreground">
              <strong className="text-foreground font-semibold">{allImages.length}</strong> Authentic Photos
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 py-1 text-xs text-muted-foreground">
              <strong className="text-foreground font-semibold">36</strong> States &amp; UTs
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 py-1 text-xs text-muted-foreground">
              Source &amp; licence details where available
            </div>

            <button
              onClick={handleRandomPhoto}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/60 bg-primary/15 px-4 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all ml-auto cursor-pointer"
            >
              <Dices className="size-3.5" />
              <span>Surprise Photo</span>
            </button>
          </div>
        </div>
      </section>
      {compact && <button onClick={handleRandomPhoto} className="brand-button brand-button-secondary"><Dices className="size-4 text-primary" />Surprise photograph</button>}

      {/* Filter and Search Bar */}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-4 md:p-6 backdrop-blur-xl shadow-lg">
        {/* Search and Top Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="search" aria-label="Search destination photographs"
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              placeholder="Search by destination, monument, state, or tag..."
              className="w-full rounded-full border border-border/80 bg-background/90 py-2 pl-10 pr-4 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Toggle */}
            <div className="inline-flex rounded-full border border-border/80 bg-background p-1 text-xs">
              <button
                aria-pressed={filters.category === "all"}
                onClick={() => setFilters((prev) => ({ ...prev, category: "all" }))}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filters.category === "all"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({allImages.length})
              </button>
              <button
                aria-pressed={filters.category === "iconic"}
                onClick={() => setFilters((prev) => ({ ...prev, category: "iconic" }))}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filters.category === "iconic"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Iconic
              </button>
              <button
                aria-pressed={filters.category === "hidden"}
                onClick={() => setFilters((prev) => ({ ...prev, category: "hidden" }))}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filters.category === "hidden"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Hidden Gems
              </button>
            </div>

            {/* Sort Selector */}
            <select
              aria-label="Sort photographs"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-full border border-border/80 bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="curated">Curated Order</option>
              <option value="name">Destination A-Z</option>
              <option value="state">By State Name</option>
            </select>

            {/* View Mode Toggles */}
            <div className="hidden sm:inline-flex rounded-full border border-border/80 bg-background p-1">
              <button
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                title="Standard Grid (4:3)"
                className={cn(
                  "flex size-7 items-center justify-center rounded-full transition-colors",
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid3X3 className="size-3.5" />
              </button>
              <button
                aria-pressed={viewMode === "masonry"}
                onClick={() => setViewMode("masonry")}
                title="Masonry Gallery"
                className={cn(
                  "flex size-7 items-center justify-center rounded-full transition-colors",
                  viewMode === "masonry"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Columns3 className="size-3.5" />
              </button>
              <button
                aria-pressed={viewMode === "cinematic"}
                onClick={() => setViewMode("cinematic")}
                title="Cinematic Widescreen View"
                className={cn(
                  "flex size-7 items-center justify-center rounded-full transition-colors",
                  viewMode === "cinematic"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Region Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold shrink-0 mr-1">
            Region:
          </span>
          {regions.map((reg) => {
            const isActive = filters.region === reg.id;
            return (
              <button
                key={reg.id} aria-pressed={isActive}
                onClick={() => setFilters((prev) => ({ ...prev, region: reg.id }))}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 font-medium transition-all cursor-pointer",
                  isActive
                    ? "border border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border border-border/70 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {reg.label}
              </button>
            );
          })}
        </div>

        {/* Tag / Theme Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold shrink-0 mr-1">
            Theme:
          </span>
          <button
            aria-pressed={filters.tag === "all"}
            onClick={() => setFilters((prev) => ({ ...prev, tag: "all" }))}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer",
              filters.tag === "all"
                ? "bg-primary/20 text-primary border border-primary/40 font-semibold"
                : "border border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            All Themes
          </button>
          {allTags.map((tag) => {
            const isActive = filters.tag === tag;
            return (
              <button
                key={tag} aria-pressed={isActive}
                onClick={() => setFilters((prev) => ({ ...prev, tag }))}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary/20 text-primary border border-primary/40 font-semibold"
                    : "border border-border/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Filter Summary & Reset Bar */}
        <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <p>
            Showing <strong className="text-foreground font-semibold">{filteredImages.length}</strong> of{" "}
            {allImages.length} photographs
          </p>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </section>

      {/* Gallery Photos Grid */}
      {filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
          <Camera className="size-12 text-muted-foreground/60 mb-3" />
          <h3 className="display-font text-xl font-bold text-foreground">
            No photographs match your filters
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Try adjusting your search query, region, or theme filters to explore more of India.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Show All Photographs</span>
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "transition-all",
            viewMode === "grid" &&
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5",
            viewMode === "masonry" &&
              "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5",
            viewMode === "cinematic" &&
              "grid grid-cols-1 md:grid-cols-2 gap-6"
          )}
        >
          {filteredImages.map((img, idx) => {
            const isSaved = has(img.placeId);

            return (
              <motion.article
                key={img.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.25 }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm hover:border-primary/60 hover:shadow-xl transition-all duration-300",
                  viewMode === "masonry" && "break-inside-avoid mb-5"
                )}
              >
                {/* Photo Stage */}
                <div
                  role="button" tabIndex={0} aria-label={"Open photograph of " + img.placeName}
                  id={"gallery-photo-" + img.id}
                  onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setLightboxIndex(idx); } }}
                  onClick={() => setLightboxIndex(idx)}
                  className={cn(
                    "relative overflow-hidden bg-secondary cursor-pointer",
                    viewMode === "grid" && "aspect-[4/3]",
                    viewMode === "cinematic" && "aspect-[16/10]",
                    viewMode === "masonry" && (idx % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/3]")
                  )}
                >
                  <DestinationPhoto sources={[img.url]} alt={img.placeName + " in " + img.stateName} className="h-full w-full" />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 opacity-70 group-hover:opacity-85 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-2.5 py-0.5 text-[11px] text-white/90 backdrop-blur-md">
                      <MapPin className="size-2.5 text-primary" />
                      {img.stateName}
                    </span>

                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold backdrop-blur-md",
                        img.category === "hidden"
                          ? "bg-primary/90 text-primary-foreground font-bold"
                          : "bg-black/50 text-white/90 border border-white/20"
                      )}
                    >
                      {img.category === "hidden" ? "Offbeat" : "Iconic"}
                    </span>
                  </div>

                  {/* Center Expand Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Maximize2 className="size-5" />
                    </div>
                  </div>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-3 inset-x-3 z-10 space-y-1">
                    <h3 className="display-font text-lg font-bold text-white leading-tight drop-shadow-md">
                      {img.placeName}
                    </h3>
                    {img.attribution?.title && img.attribution.title !== img.placeName && (
                      <p className="text-[11px] text-white/80 line-clamp-1">
                        {img.attribution.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Bar */}
                <div className="p-3.5 bg-card flex items-center justify-between gap-2 border-t border-border/50 text-xs">
                  <div className="min-w-0 flex-1">
                    {img.attribution?.author ? (
                      <p className="text-[11px] text-muted-foreground truncate">
                        By <span className="text-foreground/90 font-medium">{img.attribution.author}</span>
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {img.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(img.placeId);
                      }}
                      title={isSaved ? "Remove from saved list" : "Save destination"}
                      aria-pressed={isSaved} aria-label={(isSaved ? "Remove saved destination: " : "Save destination: ") + img.placeName}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border transition-colors cursor-pointer",
                        isSaved
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                      )}
                    >
                      {isSaved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPlace(img.place);
                      }}
                      id={"gallery-explore-" + img.id}
                      aria-label={"Explore " + img.placeName}
                      title="Explore destination guide"
                      className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="size-3" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={filteredImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onSelectPlace={onSelectPlace}
          onAskYatra={onAskYatra}
        />
      )}
    </div>
  );
}


