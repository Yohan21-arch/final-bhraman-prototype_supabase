import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "motion/react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Camera,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  ArrowUpRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Layers,
} from "lucide-react";
import type { GalleryImage, Place } from "@/types";
import { useTripList } from "@/lib/trip-list";
import { cn } from "@/lib/utils";

export interface ImageLightboxProps {
  images: GalleryImage[];
  initialIndex?: number;
  onClose: () => void;
  onSelectPlace?: (place: Place) => void;
  onAskYatra?: (prompt: string) => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
  onSelectPlace,
  onAskYatra,
}: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialIndex, images.length - 1))
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const thumbStripRef = useRef<HTMLDivElement>(null);
  const currentImage = images[currentIndex];
  const { has, toggle } = useTripList();
  const isSaved = currentImage ? has(currentImage.placeId) : false;

  const total = images.length;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
    setIsZoomed(false);
    setImageLoaded(false);
    setImageError(false);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setIsZoomed(false);
    setImageLoaded(false);
    setImageError(false);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault(); e.stopPropagation(); onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " " && !e.repeat && e.target === dialogRef.current) {
        e.preventDefault();
        setIsZoomed((z) => !z);
      }
    };

    const dialog = dialogRef.current;
    dialog?.addEventListener("keydown", handleKeyDown);
    return () => dialog?.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

  // Prevent background body scroll while lightbox is open
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const root = document.getElementById("root");
    const wasInert = root?.inert || false;
    if (root) root.inert = true;
    dialogRef.current?.querySelector<HTMLButtonElement>('[aria-label="Close photo viewer"]')?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]') || [])].filter(el => el.getClientRects().length > 0);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const dialog = dialogRef.current;
    dialog?.addEventListener("keydown", trapFocus);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
      if (root) root.inert = wasInert;
      dialog?.removeEventListener("keydown", trapFocus);
      requestAnimationFrame(() => { if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); });
    };
  }, []);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbStripRef.current) {
      const activeEl = thumbStripRef.current.querySelector(
        `[data-thumb-index="${currentIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: reduceMotion ? "instant" : "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex, reduceMotion]);

  const handleShare = () => {
    if (!currentImage) return;
    const url = window.location.origin + window.location.pathname + `#/place/${currentImage.placeId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentImage) return null;

  return createPortal(
    <div ref={dialogRef} tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo viewer: ${currentImage.placeName}`}
      className="destination-lightbox fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-2xl text-foreground select-none animate-in fade-in duration-200"
    >
      {/* Top Header Controls Bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 md:px-8 bg-black/60 backdrop-blur-md z-20">
        {/* Left: Place and Counter Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="display-font text-base md:text-lg font-bold text-white truncate max-w-[180px] sm:max-w-[300px] md:max-w-md">
              {currentImage.placeName}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] text-white/90">
              <MapPin className="size-3 text-primary" />
              {currentImage.stateName}
            </span>
          </div>

          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-mono text-white/80 shrink-0">
            {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Right: Actions and Close */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            title={isZoomed ? "Reset Zoom (Space)" : "Zoom Photo (Space)"}
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
          >
            {isZoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            title="Share destination link"
            aria-label="Share photo"
            className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
          >
            {copied ? <Check className="size-4 text-green-400" /> : <Share2 className="size-4" />}
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={() => toggle(currentImage.placeId)}
            title={isSaved ? "Remove from My List" : "Save destination"}
            aria-label="Save destination"
            className={cn(
              "flex size-9 sm:size-10 items-center justify-center rounded-full border transition-colors",
              isSaved
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/15 bg-white/10 text-white/90 hover:bg-white/20 hover:text-white"
            )}
          >
            {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          </button>

          {/* Direct Destination Link */}
          {onSelectPlace && (
            <button
              onClick={() => {
                onClose();
                onSelectPlace(currentImage.place);
              }}
              data-return-focus={"gallery-explore-" + currentImage.id}
              title="Open full guide for this destination"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/60 bg-primary/20 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all ml-1"
            >
              <span>Explore Guide</span>
              <ArrowUpRight className="size-3.5" />
            </button>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            title="Close viewer (Esc)"
            aria-label="Close photo viewer"
            className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-red-500/80 hover:border-red-400 hover:text-white transition-all ml-1"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      {/* Main Image Stage */}
      <main className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-4 md:p-8">
        {/* Previous Button */}
        {total > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous photograph"
            title="Previous (Left Arrow)"
            className="absolute left-2 sm:left-4 z-20 flex size-11 sm:size-13 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl"
          >
            <ChevronLeft className="size-6 sm:size-7" />
          </button>
        )}

        {/* Image Display Area */}
        <div
          className={cn(
            "relative flex h-full w-full items-center justify-center transition-all duration-300",
            isZoomed ? "overflow-auto cursor-zoom-out" : "cursor-zoom-in"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {imageError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center max-w-md">
              <Camera className="size-12 text-muted-foreground mb-3" />
              <p className="font-semibold text-white">Photograph Preview Unavailable</p>
              <p className="text-xs text-muted-foreground mt-1">
                The authentic image could not be loaded from the archive server.
              </p>
            </div>
          ) : (
            <img
              key={currentImage.url}
              src={currentImage.url}
              alt={`${currentImage.placeName} in ${currentImage.stateName}`}
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageLoaded(true);
                setImageError(true);
              }}
              className={cn(
                "rounded-lg object-contain shadow-2xl transition-transform duration-300 max-h-full max-w-full",
                isZoomed ? "scale-150 sm:scale-175 cursor-zoom-out" : "cursor-zoom-in",
                !imageLoaded && "opacity-0",
                imageLoaded && "opacity-100"
              )}
            />
          )}
        </div>

        {/* Next Button */}
        {total > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next photograph"
            title="Next (Right Arrow)"
            className="absolute right-2 sm:right-4 z-20 flex size-11 sm:size-13 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl"
          >
            <ChevronRight className="size-6 sm:size-7" />
          </button>
        )}
      </main>

      {/* Bottom Info & Thumbnail Navigation Bar */}
      <footer className="shrink-0 border-t border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3 md:px-8 space-y-3 z-20">
        {/* Caption & Metadata Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-white/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-white">
              <Camera className="size-3.5 text-primary" />
              {currentImage.attribution?.title || currentImage.placeName}
            </span>

            {currentImage.attribution?.author && (
              <span className="text-white/60">
                &bull; Photo by <strong className="text-white/90">{currentImage.attribution.author}</strong>
              </span>
            )}

            {currentImage.attribution?.license && (
              <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-mono text-white/90">
                {currentImage.attribution.license}
              </span>
            )}

            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold",
                currentImage.category === "hidden"
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-white/10 text-white/80"
              )}
            >
              {currentImage.category === "hidden" ? (
                <>
                  <Sparkles className="size-2.5" /> Offbeat Gem
                </>
              ) : (
                <>
                  <Layers className="size-2.5" /> Iconic
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentImage.attribution?.sourceUrl && (
              <a
                href={currentImage.attribution.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              >
                <span>{currentImage.attribution.sourceName || "Wikimedia Commons"}</span>
                <ExternalLink className="size-3" />
              </a>
            )}

            {onSelectPlace && (
              <button
                onClick={() => {
                  onClose();
                  onSelectPlace(currentImage.place);
                }}
                data-return-focus={"gallery-explore-" + currentImage.id}
                className="sm:hidden inline-flex items-center gap-1 rounded-md bg-primary/20 px-2.5 py-1 text-[11px] font-semibold text-primary"
              >
                <span>Explore Destination</span>
                <ArrowUpRight className="size-3" />
              </button>
            )}

            {onAskYatra && (
              <button
                onClick={() => {
                  onClose();
                  onAskYatra(
                    `Tell me about visiting ${currentImage.placeName} in ${currentImage.stateName}. What are the photography tips and best vantage points?`
                  );
                }}
                className="inline-flex items-center gap-1 text-[11px] text-[#F2A93B] hover:underline"
              >
                <Sparkles className="size-3" />
                <span>Ask Yatra AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {total > 1 && (
          <div
            ref={thumbStripRef}
            className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none"
            tabIndex={0}
            aria-label="Photo thumbnails"
          >
            {images.map((img, i) => (
              <button
                key={img.id || i}
                data-thumb-index={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setIsZoomed(false);
                  setImageLoaded(false);
                  setImageError(false);
                }}
                aria-label={`View photo ${i + 1} of ${total}: ${img.placeName}`}
                className={cn(
                  "relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-md border transition-all cursor-pointer",
                  i === currentIndex
                    ? "border-primary ring-2 ring-primary scale-105 opacity-100 z-10"
                    : "border-white/20 opacity-50 hover:opacity-90 hover:border-white/50"
                )}
              >
                <img
                  src={img.url}
                  alt=""
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </footer>
    </div>, document.body
  );
}


