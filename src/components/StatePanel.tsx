import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight, Bookmark, ChevronDown, ChevronUp, X } from "lucide-react";
import { stateById, REGION_NAMES } from "@/data/states";
import { allTags, placesByState } from "@/data/places";
import { DiscoveryImage } from "@/components/DiscoveryImage";
import { useTripList } from "@/lib/trip-list";
import { useAuth } from "@/contexts/AuthContext";
import { userAccountService } from "@/services/userAccountService";
import type { Category, Tag, Place, StateData } from "@/types";

export interface PanelViewState { tab: Category; tags: Tag[]; expanded: boolean; scrollTop: number }
export const DEFAULT_PANEL_VIEW: PanelViewState = { tab: "iconic", tags: [], expanded: false, scrollTop: 0 };

function PreviewPlace({ place, onSelect }: { key?: string; place: Place; onSelect?: (place: Place) => void }) {
  const { user } = useAuth();
  const { has, toggle } = useTripList();
  const saved = has(place.id);
  return <article className="atlas-place">
    <button id={"state-place-" + place.id} onClick={() => onSelect?.(place)} aria-label={"Explore " + place.name} className="atlas-place-link">
      <DiscoveryImage place={place} className="atlas-place-image" />
      <span className="min-w-0"><span className="mb-1 block text-[10px] uppercase tracking-widest text-primary">{place.category === "hidden" ? "Hidden gem" : "Iconic wonder"}</span><span className="display-font block text-xl leading-tight">{place.name}</span><span className="mt-2 block text-xs text-muted-foreground">{place.tags.slice(0, 2).join(" · ")}</span></span>
      <ArrowUpRight className="size-4 text-primary" />
    </button>
    <button className="atlas-save atlas-control" aria-label={(saved ? "Remove " : "Save ") + place.name} aria-pressed={saved} onClick={async () => {
      toggle(place.id);
      if (user) {
        if (!saved) await userAccountService.addSavedDestination(user.id, place.id);
        else await userAccountService.removeSavedDestination(user.id, place.id);
      }
    }}><Bookmark className={"size-4 " + (saved ? "fill-primary text-primary" : "")} /></button>
  </article>;
}

export function StatePanel({ stateId, places, view, onViewChange, onClose, onSelectPlace, onOpenFullGuide }: {
  key?: string; stateId: string; places?: Place[]; view: PanelViewState; onViewChange: (view: PanelViewState) => void;
  onClose: () => void; onSelectPlace?: (place: Place) => void; onOpenFullGuide?: (state: StateData) => void;
}) {
  const state = stateById(stateId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const dragged = useRef(false);
  useLayoutEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = view.scrollTop; }, [stateId]);
  if (!state) return null;
  const allPlaces = places ? places.filter(p => p.state.toLowerCase() === stateId.toLowerCase()) : placesByState(stateId);
  const availableTags = allTags.filter(tag => allPlaces.some(p => p.category === view.tab && p.tags.includes(tag)));
  const visible = allPlaces.filter(p => p.category === view.tab && (!view.tags.length || view.tags.some(tag => p.tags.includes(tag))));
  return <aside className={"atlas-preview " + (view.expanded ? "is-expanded" : "")} aria-label={"Places in " + state.name}
    onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}>
    <button className="atlas-sheet-handle" aria-label={view.expanded ? "Collapse state preview" : "Expand state preview"} aria-expanded={view.expanded} aria-controls="state-preview-content"
      onClick={() => { if (!dragged.current) onViewChange({ ...view, expanded: !view.expanded }); dragged.current = false; }}
      onPointerDown={e => { dragged.current = false; dragStart.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerUp={e => { if (dragStart.current !== null && Math.abs(e.clientY - dragStart.current) > 24) { dragged.current = true; onViewChange({ ...view, expanded: e.clientY < dragStart.current }); } dragStart.current = null; }}
      onPointerCancel={() => { dragStart.current = null; }}>
      <span />{view.expanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
    </button>
    <header className="atlas-preview-header">
      <div className="flex items-start justify-between gap-3">
        <div><p className="eyebrow text-primary">{REGION_NAMES[state.region]}</p><h3 id="state-preview-title" tabIndex={-1} className="display-font mt-2 text-3xl">{state.name}</h3><p className="mt-2 text-xs text-muted-foreground">{state.capital} · {allPlaces.length} places to discover</p></div>
        <button className="atlas-control shrink-0" aria-label="Close state preview" onClick={onClose}><X className="size-4" /></button>
      </div>
      <p className="atlas-state-description">{state.description}</p>
    </header>
    <div id="state-preview-content" ref={scrollRef} className="atlas-preview-content" onScroll={e => onViewChange({ ...view, scrollTop: e.currentTarget.scrollTop })}>
      <div className="atlas-categories" aria-label="State destination category">
        {(["iconic", "hidden"] as Category[]).map(tab => <button key={tab} aria-pressed={view.tab === tab} onClick={() => { onViewChange({ ...view, tab, tags: [], scrollTop: 0 }); scrollRef.current?.scrollTo(0, 0); }}>{tab === "iconic" ? "Iconic wonders" : "Hidden gems"} <span>{allPlaces.filter(p => p.category === tab).length}</span></button>)}
      </div>
      <div className="atlas-tags" aria-label="Filter state destinations">
        {availableTags.map(tag => <button key={tag} aria-pressed={view.tags.includes(tag)} onClick={() => onViewChange({ ...view, tags: view.tags.includes(tag) ? view.tags.filter(t => t !== tag) : [...view.tags, tag] })}>{tag}</button>)}
        {view.tags.length > 0 && <button onClick={() => onViewChange({ ...view, tags: [] })}>Clear filters</button>}
      </div>
      <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">{visible.length} {visible.length === 1 ? "destination" : "destinations"}</p>
      <div className="space-y-3">{visible.map(place => <PreviewPlace key={place.id} place={place} onSelect={onSelectPlace} />)}</div>
      {!visible.length && <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">No places match this selection yet. Try another category or clear your filters.</p>}
      <button id="state-full-guide" onClick={() => onOpenFullGuide?.(state)} className="brand-button brand-button-secondary mt-5 w-full">Full {state.name} guide <ArrowUpRight className="size-4 shrink-0" /></button>
    </div>
  </aside>;
}

