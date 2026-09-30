import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Calendar, Compass, Info, Lightbulb, MapPin, Route, Share2, Check, Sparkles, X, Camera, ExternalLink } from "lucide-react";
import type { Place, StateData } from "@/types";
import { stateById } from "@/data/states";
import { relatedPlaces } from "@/data/places";
import { PlaceCard } from "@/components/PlaceCard";
import { DestinationPhoto } from "@/components/DestinationPhoto";
import { DestinationSectionNav, type DestinationSection } from "@/components/DestinationSectionNav";
import { LocalTravelTips } from "@/components/LocalTravelTips";
import { ImageLightbox } from "@/components/ImageLightbox";
import { PlaceTourGuideSection } from "@/components/PlaceTourGuideSection";
import { NearbyHotelsSection } from "@/components/NearbyHotelsSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { getPlaceGalleryImages } from "@/lib/gallery";
import { useTripList } from "@/lib/trip-list";
import { useAuth } from "@/contexts/AuthContext";
import { userAccountService } from "@/services/userAccountService";

export function PlaceDetail({ place, onBack, onClose, backLabel = "Back", onSelectPlace, onSelectState, onAskYatra, onPlanTrip, section = "overview", onSectionChange }: {
  place: Place; onBack: () => void; onClose?: () => void; backLabel?: string;
  onSelectPlace: (place: Place) => void; onSelectState: (state: StateData) => void;
  onAskYatra?: (query: string) => void; onPlanTrip?: () => void;
  section?: DestinationSection; onSectionChange?: (section: DestinationSection) => void;
}) {
  const state = stateById(place.state);
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const { has, toggle, items, updateNotes } = useTripList();
  const [internalSection, setInternalSection] = useState<DestinationSection>("overview");
  const currentSection = onSectionChange ? section : internalSection;
  const [activeImage, setActiveImage] = useState(0);
  const [displayedImage, setDisplayedImage] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [notesInput, setNotesInput] = useState(() => items.find(i => i.placeId === place.id)?.notes || "");
  const [noteSaved, setNoteSaved] = useState(false);
  const galleryImages = useMemo(() => getPlaceGalleryImages(place), [place]);
  const isSaved = has(place.id);
  const related = relatedPlaces(place);
  const currentAttr = displayedImage === null ? null : place.imageAttributions?.[displayedImage] || place.imageAttributions?.[0];

  const changeSection = (next: DestinationSection) => {
    setInternalSection(next); onSectionChange?.(next);
    document.getElementById("destination-content")?.scrollIntoView({ block: "start", behavior: reduceMotion ? "instant" : "smooth" });
  };
  const handleBookmarkToggle = async () => {
    toggle(place.id); setNotice("");
    if (user) {
      try {
        if (!isSaved) await userAccountService.addSavedDestination(user.id, place.id);
        else await userAccountService.removeSavedDestination(user.id, place.id);
      } catch { setNotice("Your list is updated on this device. Cloud sync is unavailable."); }
    }
  };
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented || lightboxIndex !== null || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const target = event.target as HTMLElement;
      if (event.key === "Escape" && !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) (onClose || onBack)();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onBack, onClose, lightboxIndex]);
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch { setNotice("Copy the destination link from your browser address bar."); }
  };
  const askToPlan = () => onAskYatra?.("Help me plan a visit to " + place.name + " in " + (state?.name || "India") + ". Ask about my dates, starting city, interests and budget.");
  const panel = (id: DestinationSection, children: ReactNode) => <section id={"destination-section-" + id} role="tabpanel" tabIndex={0} aria-labelledby={"destination-tab-" + id} hidden={currentSection !== id} className="destination-section">{children}</section>;

  return <main className="destination-detail pb-24">
    <nav id="destination-sticky-nav" className="destination-actions" aria-label="Destination navigation">
      <button id="destination-back-btn" className="brand-button brand-button-secondary destination-back" onClick={onBack} aria-label={backLabel + " (Press Esc to go back)"}><ArrowLeft className="size-4 shrink-0" /><span>{backLabel}</span></button>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {onAskYatra && <button className="brand-button brand-button-secondary hidden sm:inline-flex" onClick={askToPlan}><Sparkles className="size-4 text-primary" />Ask Yatra</button>}
        <button className="destination-icon-button" onClick={handleShare} aria-label="Share destination link">{copied ? <Check className="size-4" /> : <Share2 className="size-4" />}</button>
        <button className="destination-icon-button" onClick={handleBookmarkToggle} aria-label={isSaved ? "Remove from saved list" : "Save destination"} aria-pressed={isSaved}>{isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}</button>
        <button id="destination-close-btn" className="destination-icon-button" onClick={onClose || onBack} aria-label="Close destination details (Esc)"><X className="size-4" /></button>
      </div>
      <span className="sr-only" role="status">{copied ? "Destination link copied" : notice}</span>
    </nav>

    <header className="destination-hero site-container">
      <div className="destination-hero-photo">
        <DestinationPhoto sources={place.images || []} initialIndex={activeImage} onPhotoChange={setDisplayedImage} alt={place.name} priority className="h-full w-full" />
        {galleryImages.length > 0 && <button id="destination-hero-gallery" className="brand-button brand-button-secondary destination-open-photo" onClick={() => setLightboxIndex(displayedImage ?? activeImage)}><Camera className="size-4" />View photographs <span>{galleryImages.length}</span></button>}
      </div>
      <div className="destination-hero-copy">
        <div className="flex flex-wrap items-center gap-3">
          {state && <button id="destination-state-link" className="destination-state-link" onClick={() => onSelectState(state)}><MapPin className="size-3.5" />{state.name}<ArrowRight className="size-3" /></button>}
          <span className="eyebrow text-primary">{place.category === "hidden" ? "Off the beaten path" : "Iconic wonder"}</span>
        </div>
        <h1 className="display-font">{place.name}</h1>
        <p>{place.shortDesc}</p>
      </div>
    </header>
    <div className="site-container destination-photo-credit">
      {currentAttr ? <p>{currentAttr.title || place.name}{currentAttr.author && <> · {currentAttr.author}</>}{currentAttr.license && <> · {currentAttr.license}</>}{currentAttr.sourceUrl && <a href={currentAttr.sourceUrl} target="_blank" rel="noreferrer noopener">{currentAttr.sourceName || "Photo source"}<ExternalLink className="size-3" /></a>}</p> : <p>Destination photography from the existing Bhraman archive.</p>}
    </div>

    <DestinationSectionNav active={currentSection} onChange={changeSection} />
    <div id="destination-content" className="site-container destination-content">
      {panel("overview", <>
        <div className="destination-overview">
          <div>
            <p className="eyebrow text-primary">The experience</p><h2 className="section-heading mt-3">Why this place stays with you.</h2>
            <p className="destination-story">{place.whyVisit}</p>
            <div className="destination-themes">{place.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
            <blockquote className="destination-field-tip"><Lightbulb className="size-5 text-primary shrink-0" /><div><p className="eyebrow text-primary mb-3">A note for your journey</p><p>{place.travelerTip}</p></div></blockquote>
          </div>
          <aside className="destination-essentials" aria-labelledby="destination-essentials-heading">
            <p className="eyebrow text-primary">Before you go</p><h2 id="destination-essentials-heading" className="display-font text-2xl">The essentials.</h2>
            <DetailItem icon={<Calendar className="size-4" />} label="Best time to visit" body={place.bestTimeToVisit} />
            <DetailItem icon={<Route className="size-4" />} label="How to reach" body={place.howToReach} />
            <DetailItem icon={<Info className="size-4" />} label="Entry information" body={place.entryInfo} />
            <DetailItem icon={<Compass className="size-4" />} label="Coordinates" body={place.coordinates.lat.toFixed(4) + "° N, " + place.coordinates.lng.toFixed(4) + "° E"} />
          </aside>
        </div>
        <section className="destination-planning">
          <div><p className="eyebrow text-primary">From discovery to departure</p><h2 className="display-font mt-3 text-3xl">Make room for this journey.</h2><p className="section-copy">Keep this place in your list, gather the details, and start planning your visit.</p></div>
          <div className="flex flex-wrap gap-3">
            <button className="brand-button brand-button-primary" onClick={handleBookmarkToggle}>{isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}{isSaved ? "Saved to My Bhraman List" : "Add to My Bhraman List"}</button>
            {onAskYatra && <button className="brand-button brand-button-secondary" onClick={askToPlan}><Sparkles className="size-4 text-primary" />Plan with Yatra</button>}
            {onPlanTrip && <button id="destination-open-planner" className="brand-button brand-button-secondary" onClick={onPlanTrip}>Open trip planner<ArrowRight className="size-4" /></button>}
          </div>
          {isSaved && <div className="destination-notes"><label htmlFor="destination-notes" className="eyebrow text-primary">Your itinerary notes</label><textarea id="destination-notes" value={notesInput} onChange={e => { setNotesInput(e.target.value); setNoteSaved(false); }} rows={3} placeholder="Keep a reminder for your visit..." /><div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Stored in your local Bhraman list</span><button className="brand-button brand-button-secondary" onClick={() => { updateNotes(place.id, notesInput); setNoteSaved(true); }}>{noteSaved ? "Note saved" : "Save note"}</button></div><span role="status" className="sr-only">{noteSaved ? "Itinerary note saved" : ""}</span></div>}
        </section>
      </>)}
      {panel("photos", <>
        <p className="eyebrow text-primary">Through the lens</p><h2 className="section-heading mt-3">A closer look.</h2><p className="section-copy">Open a photograph to explore it in full, with its source and attribution.</p>
        <div className="destination-photo-grid">{galleryImages.map((image, index) => <figure key={image.id}>
          <button id={"destination-photo-" + index} className="destination-photo-button" aria-label={"Open photograph " + (index + 1) + ": " + (image.attribution?.title || place.name)} onClick={() => setLightboxIndex(index)}><DestinationPhoto sources={[image.url]} alt={image.attribution?.title || place.name} className="h-full w-full" /><Camera className="size-5" /></button>
          <figcaption><p>{image.attribution?.title || place.name}</p><p>{image.attribution?.author}{image.attribution?.license && " · " + image.attribution.license}</p><button className="destination-text-link" onClick={() => { setActiveImage(index); setDisplayedImage(null); document.querySelector(".destination-hero")?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" }); }}>Use as cover photo</button></figcaption>
        </figure>)}</div>
        {!galleryImages.length && <p className="destination-empty">Photography is not available for this destination yet. Its travel information is available in Overview.</p>}
      </>)}
      {panel("tips", <><p className="eyebrow text-primary">Travel thoughtfully</p><h2 className="section-heading mt-3 mb-7">Local knowledge, a better journey.</h2><LocalTravelTips place={place} state={state} onAskYatra={onAskYatra} defaultExpanded={true} /></>)}
      {panel("stay", <><p className="eyebrow text-primary">Shape your visit</p><h2 className="section-heading mt-3 mb-7">Stay nearby. Explore with insight.</h2><div className="space-y-10"><NearbyHotelsSection place={place} onAskYatra={onAskYatra} /><PlaceTourGuideSection place={place} onAskYatra={onAskYatra} /></div></>)}
      {panel("reviews", <ReviewsSection place={place} onAskYatra={onAskYatra} />)}
      {panel("discover", <><p className="eyebrow text-primary">Keep exploring</p><h2 className="section-heading mt-3">Where curiosity leads next.</h2><p className="section-copy">More destinations you may like.</p><div className="destination-related">{related.map(item => <PlaceCard key={item.id} place={item} onSelect={onSelectPlace} />)}</div>{!related.length && <p className="destination-empty">Return to the atlas to explore more destinations.</p>}{state && <button className="brand-button brand-button-secondary mt-6" onClick={() => onSelectState(state)}>Explore all of {state.name}<ArrowRight className="size-4" /></button>}</>)}
    </div>
    {lightboxIndex !== null && galleryImages.length > 0 && <ImageLightbox images={galleryImages} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} onAskYatra={onAskYatra} />}
  </main>;
}
function DetailItem({ icon, label, body }: { icon: ReactNode; label: string; body: string }) {
  return <div className="destination-detail-item"><span className="text-primary mt-1">{icon}</span><div><h3>{label}</h3><p>{body || "Details are not available yet."}</p></div></div>;
}

