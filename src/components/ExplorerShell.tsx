import { useEffect, useRef } from "react";
import { Compass } from "lucide-react";
import { IndiaMap } from "@/components/IndiaMap";
import { StatePanel, type PanelViewState } from "@/components/StatePanel";
import { STATES_DATA, REGION_NAMES } from "@/data/states";
import type { MapViewState } from "@/lib/map-camera";
import type { Place, Region, StateData } from "@/types";

export function ExplorerShell({ places, stateId, selectedRegion, onSelectRegion, categoryFilter, mapView, onMapViewChange, panelView, onPanelViewChange, onSelectState, onSelectPlace, onClose, onOpenFullGuide }: {
  places: Place[]; stateId: string | null; selectedRegion: Region | "all"; onSelectRegion: (region: Region | "all") => void;
  categoryFilter: "all" | "iconic" | "hidden"; mapView: MapViewState; onMapViewChange: (view: MapViewState) => void;
  panelView: PanelViewState; onPanelViewChange: (view: PanelViewState) => void; onSelectState: (state: StateData) => void;
  onSelectPlace: (place: Place) => void; onClose: () => void; onOpenFullGuide: (state: StateData) => void;
}) {
  const previousState = useRef(stateId);
  useEffect(() => {
    if (stateId && previousState.current !== stateId) document.getElementById("state-preview-title")?.focus({ preventScroll: true });
    previousState.current = stateId;
  }, [stateId]);
  return <div className="atlas-shell">
    <div className="atlas-filters">
      <div className="atlas-regions" aria-label="Map region">
        <button aria-pressed={selectedRegion === "all"} onClick={() => onSelectRegion("all")}>All India</button>
        {Object.entries(REGION_NAMES).map(([id, name]) => <button key={id} aria-pressed={selectedRegion === id} onClick={() => onSelectRegion(id as Region)}>{name}</button>)}
      </div>
      <label className="atlas-state-select">Explore a state
        <select id="map-state-selector" value={stateId || ""} onChange={e => { const state = STATES_DATA.find(s => s.id === e.target.value); if (state) onSelectState(state); }}>
          <option value="" disabled>Choose a state or union territory</option>
          {STATES_DATA.filter(s => selectedRegion === "all" || s.region === selectedRegion).map(state => <option value={state.id} key={state.id}>{state.name}</option>)}
        </select>
      </label>
    </div>
    <div className="atlas-workspace">
      <IndiaMap places={places} selectedStateId={stateId || undefined} selectedRegion={selectedRegion} categoryFilter={categoryFilter} view={mapView} onViewChange={onMapViewChange} onSelectState={onSelectState} onSelectPlace={onSelectPlace} />
      {stateId ? <StatePanel key={stateId} stateId={stateId} places={places} view={panelView} onViewChange={onPanelViewChange} onSelectPlace={onSelectPlace} onClose={onClose} onOpenFullGuide={onOpenFullGuide} />
        : <aside className="atlas-empty"><Compass className="size-9 text-primary" /><p className="eyebrow mt-6 text-primary">Your next chapter</p><h3 className="display-font mt-3 text-3xl">Where will India take you?</h3><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Choose a state on the map to discover iconic landmarks and quieter corners. Your journey begins with a little curiosity.</p><p className="mt-6 text-xs text-muted-foreground">Use the state selector for smaller regions.</p></aside>}
    </div>
  </div>;
}

