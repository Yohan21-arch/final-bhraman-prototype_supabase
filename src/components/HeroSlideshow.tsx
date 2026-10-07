import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, MapPin, Pause, Play, Sparkles } from "lucide-react";
import { DiscoveryImage } from "@/components/DiscoveryImage";
import { SearchBar } from "@/components/SearchBar";
import { stateById } from "@/data/states";
import type { Place, StateData } from "@/types";

export interface HeroSlideshowProps {
  titleChildren?: ReactNode;
  statsChildren?: ReactNode;
  places?: Place[];
  onSelectPlace?: (place: Place) => void;
  onSelectState?: (state: StateData) => void;
  onExplore?: () => void;
  onAskYatra?: () => void;
  onReplayIntro?: () => void;
}

export function HeroSlideshow({ titleChildren, statsChildren, places = [], onSelectPlace, onSelectState, onExplore, onAskYatra, onReplayIntro }: HeroSlideshowProps) {
  const reduceMotion = useReducedMotion();
  const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  // Use the same live destinations as search and the map, with geographic variety.
  const slides = useMemo(() => {
    const candidates = places.filter((place) => place.images?.length);
    const regions = ["rajasthan", "ladakh", "kerala", "uttar-pradesh", "meghalaya", "goa"];
    const selected = regions.flatMap((state) => {
      const place = candidates.find((p) => p.state === state && p.featured) || candidates.find((p) => p.state === state);
      return place ? [place] : [];
    });
    for (const place of candidates.filter((p) => p.featured)) {
      if (selected.length >= 6) break;
      if (!selected.some((p) => p.id === place.id)) selected.push(place);
    }
    return selected.length ? selected : candidates.slice(0, 6);
  }, [places]);

  const currentIndex = slides.length ? index % slides.length : 0;
  const current = slides[currentIndex];
  const credit = current?.imageAttributions?.[photoIndices[current.id] || 0];
  const autoplay = !reduceMotion && !paused && !hovered && !focused && pageVisible && slides.length > 1;

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(() => setIndex((previous) => (previous + 1) % slides.length), 7500);
    return () => window.clearTimeout(timer);
  }, [autoplay, index, slides.length]);

  const next = (direction: number) => {
    if (slides.length) setIndex((currentIndex + direction + slides.length) % slides.length);
  };

  return (
    <section aria-label="Discover India" aria-roledescription="carousel" className="hero-shell"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
      <div className="hero-stage">
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <AnimatePresence initial={false}>
            {current && <motion.div key={current.id} className="absolute inset-0"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.7 }}>
              <DiscoveryImage place={current} priority className="hero-photo absolute inset-0 h-full w-full" onImageChange={(photoIndex) => setPhotoIndices((indices) => ({ ...indices, [current.id]: photoIndex }))} />
            </motion.div>}
          </AnimatePresence>
          <div className="hero-shade absolute inset-0" />
        </div>

        <div className="hero-copy relative z-10 flex flex-1 flex-col justify-center px-6 sm:px-10 lg:px-14 lg:py-16">
          {titleChildren || <>
            <p className="eyebrow mb-6 flex items-center gap-3 text-ivory"><span className="h-px w-8 bg-primary" /> A world within a country</p>
            <h1 className="hero-title">Find your<br />own <em className="font-normal text-primary">India.</em></h1>
            <p className="mt-6 max-w-[29rem] text-base leading-relaxed text-ivory/85 sm:text-lg">
              Beyond the familiar. Into the extraordinary.<br className="hidden sm:block" /> Explore iconic places, hidden corners, and journeys that stay with you.
            </p>
          </>}
          <div className="mt-8 flex flex-wrap gap-3">
            {onExplore && <button onClick={onExplore} className="brand-button brand-button-primary">Explore the map <ArrowDown className="size-4" /></button>}
            {onAskYatra && <button onClick={onAskYatra} className="brand-button border border-ivory/40 bg-background/35 text-ivory hover:bg-background/60"><Sparkles className="size-4 text-primary" /> Ask Yatra</button>}
          </div>
          {onReplayIntro && <button onClick={onReplayIntro} className="mt-6 flex min-h-11 w-fit items-center gap-2 text-sm text-ivory/75 hover:text-ivory"><Play className="size-3" /> Watch the Bhraman introduction</button>}
        </div>

        {current && <div className="relative z-10 flex flex-col justify-between gap-5 border-t border-ivory/20 bg-background/20 px-6 py-5 sm:flex-row sm:items-end sm:px-10 lg:px-14">
          <div className="min-w-0" aria-live="off">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs text-ivory/80"><MapPin className="size-3.5 text-primary" /> {stateById(current.state)?.name || "India"}</p>
            <button onClick={() => onSelectPlace?.(current)} className="group flex min-h-11 items-center gap-3 text-left font-display text-xl text-ivory sm:text-2xl">
              {current.name}<ArrowUpRight className="size-5 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            {credit && <p className="mt-1 text-[11px] text-ivory/75">Photography: {credit.sourceUrl ? <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{credit.author || credit.sourceName || "Photo source"}</a> : credit.author || credit.sourceName}{credit.license ? " · " + credit.license : ""}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="mr-3 text-xs tabular-nums tracking-widest text-ivory/80">{String(currentIndex + 1).padStart(2, "0")} <span className="text-ivory/40">/ {String(slides.length).padStart(2, "0")}</span></span>
            <button className="hero-control" onClick={() => next(-1)} disabled={slides.length < 2} aria-label="Previous destination"><ChevronLeft className="size-4" /></button>
            <button className="hero-control" onClick={() => next(1)} disabled={slides.length < 2} aria-label="Next destination"><ChevronRight className="size-4" /></button>
            {!reduceMotion && <button className="hero-control" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Resume destination slideshow" : "Pause destination slideshow"}>{paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}</button>}
          </div>
        </div>}
      </div>

      <div className="hero-discovery">
        <div className="min-w-0 flex-1">
          <p className="mb-3 text-sm font-semibold text-foreground">Where will curiosity take you?</p>
          {onSelectPlace && <SearchBar places={places} onSelectPlace={onSelectPlace} onSelectState={onSelectState} placeholder="Search destinations, states, and experiences" />}
        </div>
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-5 text-center sm:gap-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          {statsChildren || <>
            <div><p className="font-display text-2xl text-primary">{places.length}</p><p className="mt-1 text-xs text-muted-foreground">Places to discover</p></div>
            <div><p className="font-display text-2xl text-foreground">{new Set(places.map((p) => p.state)).size}</p><p className="mt-1 text-xs text-muted-foreground">States & territories represented</p></div>
            <div><p className="font-display text-2xl text-primary">Yatra</p><p className="mt-1 text-xs text-muted-foreground">Your AI companion</p></div>
          </>}
        </div>
      </div>
    </section>
  );
}

