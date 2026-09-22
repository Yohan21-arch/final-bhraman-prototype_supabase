import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Pause,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/SearchBar";
import type { Place, StateData } from "@/types";

export interface DestinationSlide {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  region: string;
  categoryLabel: string;
  imageUrl: string;
  fallbackUrl: string;
  alt: string;
}

// 8 Diverse, Verified Indian Destinations representing the user's requested landscape categories:
// 1. Rajasthan forts/palaces (Amer Fort, Jaipur)
// 2. Taj Mahal, Agra
// 3. Himalayan landscapes (Pangong Tso, Ladakh)
// 4. Kerala backwaters (Alleppey Lagoons)
// 5. Goa/coastal scenery (Goa Shoreline & Palms)
// 6. Ancient South Indian temples (Virupaksha & Hampi)
// 7. Varanasi ghats (Dashashwamedh Ghat & Ganga Aarti)
// 8. Northeast India landscapes (Living Root Bridges, Meghalaya)
export const HERO_SLIDES: DestinationSlide[] = [
  {
    id: "hawa-mahal-jaipur",
    title: "Amer Fort & Amber Palace",
    subtitle: "Golden hilltop citadel reflecting across Maota Lake at sunset",
    location: "Jaipur, Rajasthan",
    region: "North-West India",
    categoryLabel: "Forts & Palaces",
    imageUrl:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1920&auto=format&fit=crop",
    fallbackUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/1280px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg",
    alt: "Amber Fort overlooking Maota Lake at golden hour in Jaipur, Rajasthan",
  },
  {
    id: "taj-mahal-agra",
    title: "Taj Mahal & Yamuna Riverfront",
    subtitle: "Ivory-white marble jewel bathed in tranquil sunrise mist",
    location: "Agra, Uttar Pradesh",
    region: "Central India",
    categoryLabel: "UNESCO World Heritage",
    imageUrl:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1920&auto=format&fit=crop",
    fallbackUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg",
    alt: "Taj Mahal at sunrise reflecting in garden pool Agra India",
  },
  {
    id: "pangong-tso",
    title: "Pangong Tso & High Himalaya",
    subtitle: "High-altitude cobalt saltwater lake shimmering under 14,000-ft peaks",
    location: "Leh, Ladakh",
    region: "High Himalayas",
    categoryLabel: "Alpine Wonder",
    imageUrl:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1920&auto=format&fit=crop",
    fallbackUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Pangong_Tso_lake_banner.jpg/1280px-Pangong_Tso_lake_banner.jpg",
    alt: "Pangong Tso azure saltwater lake beneath trans-Himalayan peaks in Ladakh",
  },
  {
    id: "alleppey-backwaters",
    title: "Alleppey Backwaters & Lagoons",
    subtitle: "Kettuvallam houseboats drifting along emerald palm-fringed canals",
    location: "Alappuzha, Kerala",
    region: "South India",
    categoryLabel: "Kerala Backwaters",
    imageUrl:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1920&auto=format&fit=crop",
    fallbackUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Alappuzha_Boat_Beauty_W.jpg/1280px-Alappuzha_Boat_Beauty_W.jpg",
    alt: "Traditional thatched houseboat cruising through the Kerala backwaters in Alleppey",
  },
  {
    id: "dudhsagar-falls",
    title: "Goa Coastline & Tropical Palms",
    subtitle: "Swaying coconut groves and golden sands bordering the Arabian Sea",
    location: "South Goa",
    region: "Western Coast",
    categoryLabel: "Coastal Scenery",
    imageUrl:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1920&auto=format&fit=crop",
    fallbackUrl:
      "https://images.unsplash.com/photo-1587922546307-776227941871?q=80&w=1920&auto=format&fit=crop",
    alt: "Golden sunset over tropical Goa coastline and palm trees",
  },
  {
    id: "hampi-vijayanagara",
    title: "Virupaksha & Sacred Hampi",
    subtitle: "Seventh-century Dravidian granite monoliths amidst boulder hills",
    location: "Vijayanagara, Karnataka",
    region: "South India",
    categoryLabel: "Ancient Temples",
    imageUrl:
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1920&auto=format&fit=crop",
    fallbackUrl:
      "https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=1920&auto=format&fit=crop",
    alt: "Ancient Virupaksha temple tower rising above boulder hills in Hampi, Karnataka",
  },
  {
    id: "varanasi-ghats-ganga-aarti",
    title: "Varanasi Ghats & Sacred Ganga",
    subtitle: "Ancient riverfront stone steps illuminated by brass lamp rituals",
    location: "Varanasi, Uttar Pradesh",
    region: "Sacred Gangetic Plain",
    categoryLabel: "Varanasi Ghats",
    imageUrl:
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1920&auto=format&fit=crop",
    fallbackUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Ganga_Aarti_in_evening_at_Dashashwamedh_Ghat%2C_Varanasi.jpg/1280px-Ganga_Aarti_in_evening_at_Dashashwamedh_Ghat%2C_Varanasi.jpg",
    alt: "Evening Ganga Aarti ceremony with priests holding flaming brass lamps in Varanasi",
  },
  {
    id: "cherrapunji-root-bridges",
    title: "Living Root Bridges & Valleys",
    subtitle: "Bio-engineered botanical bridges guiding across rainforest streams",
    location: "Nongriat, Meghalaya",
    region: "Northeast India",
    categoryLabel: "Northeast Landscapes",
    imageUrl:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1920&auto=format&fit=crop",
    fallbackUrl:
      "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?q=80&w=1920&auto=format&fit=crop",
    alt: "Misty lush rainforest gorge and emerald pools in Meghalaya, Northeast India",
  },
];

export interface HeroSlideshowProps {
  titleChildren?: React.ReactNode;
  statsChildren?: React.ReactNode;
  places?: Place[];
  onSelectPlace?: (place: Place) => void;
  onSelectState?: (state: StateData) => void;
}

export function HeroSlideshow({
  titleChildren,
  statsChildren,
  places,
  onSelectPlace,
  onSelectState,
}: HeroSlideshowProps = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Subtle Parallax Scroll: Tracks the hero section's scroll progress through viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Moves the image downward slightly relative to the container as user scrolls down,
  // causing the background landscape to move slower than foreground content for depth
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [0, 60]
  );

  const currentSlide = HERO_SLIDES[currentIndex];

  // Preload next and previous slide images for instantaneous, lag-free transitions
  useEffect(() => {
    const nextIdx = (currentIndex + 1) % HERO_SLIDES.length;
    const prevIdx = (currentIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    [HERO_SLIDES[nextIdx], HERO_SLIDES[prevIdx]].forEach((slide) => {
      const img = new Image();
      img.src = failedImages[slide.id] ? slide.fallbackUrl : slide.imageUrl;
    });
  }, [currentIndex, failedImages]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto transition every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, 5200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, handleNext]);

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const currentImageSrc = failedImages[currentSlide.id]
    ? currentSlide.fallbackUrl
    : currentSlide.imageUrl;

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 p-4 sm:p-6 md:p-12 mb-8 shadow-2xl transition-all select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Bhraman Hero Destination Slideshow"
    >
      {/* 1. CINEMATIC FULL-CARD BACKGROUND SLIDESHOW LAYER WITH PARALLAX */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: parallaxY }}
          className="absolute -top-16 -bottom-16 -inset-x-2 transform-gpu will-change-transform"
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, scale: 1.05, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{
                opacity: 0,
                scale: 0.92,
                x: 80,
                transition: { duration: 0.65, ease: [0.32, 0.72, 0, 1] },
              }}
              transition={{ duration: 0.75, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0"
            >
              <img
                src={currentImageSrc}
                alt={currentSlide.alt}
                referrerPolicy="no-referrer"
                onError={() => handleImageError(currentSlide.id)}
                className="h-full w-full object-cover object-center transform-gpu"
                loading="eager"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Multi-layered Dark Vignette & Gradient Overlays:
            Guarantees high contrast legibility for white/gold heading, description and stats */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 md:via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(212,175,55,0.06)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* 2. FLOATING DESKTOP ARROW NAVIGATION BUTTONS (Right edge of hero) */}
      <div className="hidden lg:flex absolute top-10 right-10 z-20 items-center gap-2">
        <button
          onClick={handlePrev}
          aria-label="Previous destination slide"
          title="Previous Destination"
          className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 hover:text-white hover:bg-black/70 hover:border-primary/80 transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-lg"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next destination slide"
          title="Next Destination"
          className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 hover:text-white hover:bg-black/70 hover:border-primary/80 transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-lg"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* 3. HERO CONTENT: HEADING & DESCRIPTION (Preserved 100%) */}
      <div className="relative z-10 max-w-3xl space-y-4">
        {titleChildren ? (
          titleChildren
        ) : (
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs uppercase tracking-[0.2em] text-primary font-semibold backdrop-blur-md">
              <Compass className="size-3.5" />
              <span>Cinematic India Travel Atlas</span>
            </div>

            <h1 className="display-font text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] sm:leading-[0.98]">
              Discover the Soul of India
            </h1>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground max-w-2xl font-sans">
              From high-altitude Himalayan monasteries and golden desert citadels to secret tropical lagoons and thousand-year-old rock-cut sanctuaries.
            </p>

            {onSelectPlace && (
              <div className="pt-2 max-w-xl">
                <SearchBar
                  places={places}
                  onSelectPlace={onSelectPlace}
                  onSelectState={onSelectState}
                  placeholder="Search 50+ hand-curated places, states, valleys..."
                  className="shadow-2xl"
                />
              </div>
            )}
          </>
        )}

        {/* 4. SLIDESHOW NAVIGATION & PAGINATION BAR */}
        <div className="pt-2 pb-1">
          <div className="flex flex-wrap items-center justify-between gap-3 max-w-3xl pt-1 px-1">
            {/* Pagination Dots */}
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold hidden sm:inline">
                Live Atlas Slideshow
              </span>
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Slideshow destination dots">
                {HERO_SLIDES.map((slide, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => handleDotClick(idx)}
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Slide ${idx + 1}: ${slide.title}`}
                      title={`${slide.title} (${slide.location})`}
                      className={cn(
                        "transition-all duration-300 rounded-full cursor-pointer",
                        isActive
                          ? "w-7 h-2 bg-primary shadow-sm shadow-primary/60"
                          : "size-2 bg-white/30 hover:bg-white/60 hover:scale-125"
                      )}
                    />
                  );
                })}
              </div>
            </div>

            {/* Slide Index Counter & Controls */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-400 font-medium font-mono">
                {String(currentIndex + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
              </span>

              <div className="flex items-center gap-1">
                <button
                  id="hero-prev-slide-btn"
                  onClick={handlePrev}
                  aria-label="Previous destination slide"
                  title="Previous Destination"
                  className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/25 hover:border-primary/60 transition-all active:scale-90 cursor-pointer backdrop-blur-md"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <button
                  id="hero-next-slide-btn"
                  onClick={handleNext}
                  aria-label="Next destination slide"
                  title="Next Destination"
                  className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/25 hover:border-primary/60 transition-all active:scale-90 cursor-pointer backdrop-blur-md"
                >
                  <ChevronRight className="size-4" />
                </button>

                <button
                  onClick={() => setIsPaused((prev) => !prev)}
                  aria-label={isPaused ? "Resume slideshow autoplay" : "Pause slideshow autoplay"}
                  title={isPaused ? "Resume Autoplay" : "Pause Autoplay"}
                  className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/15 transition-all cursor-pointer backdrop-blur-md"
                >
                  {isPaused ? <Play className="size-3 text-primary" /> : <Pause className="size-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. STAT HIGHLIGHTS (Preserved 100%) */}
      <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 sm:grid-cols-4">
        {statsChildren ? (
          statsChildren
        ) : (
          <>
            <div>
              <p className="display-font text-2xl font-bold text-primary">28+</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                States & Territories
              </p>
            </div>
            <div>
              <p className="display-font text-2xl font-bold text-foreground">100%</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                Field Verified
              </p>
            </div>
            <div>
              <p className="display-font text-2xl font-bold text-primary">Dual Mode</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                Iconic & Secret
              </p>
            </div>
            <div>
              <p className="display-font text-2xl font-bold text-foreground">Yatra AI</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                Travel Companion
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
