import { useEffect, useMemo, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import { useReducedMotion } from "motion/react";
import { Compass, Eye, EyeOff, Hand, MapPin, Minus, Plus, RotateCcw, X } from "lucide-react";
import { STATES_DATA, MAP_WIDTH, MAP_HEIGHT, REGION_NAMES } from "@/data/states";
import { projectCoordinates, invertCoordinates } from "@/lib/geo";
import { clampCamera, zoomAt, DEFAULT_CAMERA, type MapCamera, type MapViewState } from "@/lib/map-camera";
import type { Place, StateData, Region } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  places: Place[];
  selectedStateId?: string;
  onSelectState: (state: StateData) => void;
  onSelectPlace?: (place: Place) => void;
  selectedRegion: Region | "all";
  categoryFilter: "all" | "iconic" | "hidden";
  view: MapViewState;
  onViewChange: (view: MapViewState) => void;
}

export function IndiaMap({ places, selectedStateId, onSelectState, onSelectPlace, selectedRegion, categoryFilter, view, onViewChange }: Props) {
  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ camera: MapCamera; center: { x: number; y: number }; distance: number; count: number } | null>(null);
  const moved = useRef(false);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [touchEnabled, setTouchEnabled] = useState(false);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null);
  const clusterPlaces = useMemo(() => (view.clusterIds || []).flatMap(id => { const place = places.find(p => p.id === id); return place ? [place] : []; }), [view.clusterIds, places]);
  const setClusterPlaces = (next: Place[]) => update({ clusterIds: next.map(place => place.id) });
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const { camera, showLabels, showPins } = view;
  useEffect(() => { if (clusterPlaces.length) document.getElementById("cluster-place-" + clusterPlaces[0].id)?.focus({ preventScroll: true }); }, [clusterPlaces]);

  const update = (change: Partial<MapViewState>) => {
    const next = { ...viewRef.current, ...change };
    viewRef.current = next;
    onViewChange(next);
  };
  const setCamera = (next: MapCamera) => update({ camera: clampCamera(next, MAP_WIDTH, MAP_HEIGHT) });
  const pointAt = (clientX: number, clientY: number) => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix || !svgRef.current) return null;
    const point = svgRef.current.createSVGPoint();
    point.x = clientX; point.y = clientY;
    const result = point.matrixTransform(matrix.inverse());
    return { x: result.x, y: result.y };
  };
  const rebaseGesture = () => {
    const points = [...pointers.current.values()];
    if (!points.length) { gesture.current = null; return; }
    const a = points[0], b = points[1] || a;
    gesture.current = { camera: viewRef.current.camera, center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, distance: Math.hypot(b.x - a.x, b.y - a.y), count: points.length };
  };
  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.size) moved.current = false;
    if (event.pointerType === "touch" && !touchEnabled) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const point = pointAt(event.clientX, event.clientY);
    if (!point) return;
    if (!pointers.current.size) { moved.current = false; dragOrigin.current = { x: event.clientX, y: event.clientY }; }
    pointers.current.set(event.pointerId, point);
    // Capture on the actual hit target: a tap still activates its state or pin.
    (event.target as Element).setPointerCapture?.(event.pointerId);
    rebaseGesture();
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const point = pointAt(event.clientX, event.clientY);
    if (!point) return;
    const current = viewRef.current.camera;
    if (event.pointerType === "mouse") {
      setCoordinates(invertCoordinates((point.x - current.x) / current.zoom, (point.y - current.y) / current.zoom));
    }
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, point);
    const start = gesture.current;
    if (!start) return;
    const points = [...pointers.current.values()];
    const a = points[0], b = points[1] || a;
    if (points.length > 1 || (dragOrigin.current && Math.hypot(event.clientX - dragOrigin.current.x, event.clientY - dragOrigin.current.y) > 6)) moved.current = true;
    if (!moved.current) return;
    const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    const zoom = points.length > 1 && start.distance > 0 ? Math.max(1, Math.min(5, start.camera.zoom * distance / start.distance)) : start.camera.zoom;
    setCamera({
      zoom,
      x: center.x - (start.center.x - start.camera.x) * zoom / start.camera.zoom,
      y: center.y - (start.center.y - start.camera.y) * zoom / start.camera.zoom,
    });
    setHoveredPlace(null);
  };
  const endPointer = (event: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    if (event.type === "pointercancel") moved.current = true;
    if (!pointers.current.size) setDragging(false);
    rebaseGesture();
  };
  const adjustZoom = (factor: number) => setCamera(zoomAt(viewRef.current.camera, { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 }, viewRef.current.camera.zoom * factor, MAP_WIDTH, MAP_HEIGHT));
  const activateState = (state: StateData) => {
    update({ focusedStateId: state.id });
    setClusterPlaces([]);
    onSelectState(state);
  };
  const stateKeys = (event: KeyboardEvent<SVGPathElement>, state: StateData) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activateState(state); return; }
    const step = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
    if (step) {
      event.preventDefault(); event.stopPropagation();
      const states = STATES_DATA.filter((s) => selectedRegion === "all" || s.region === selectedRegion);
      const next = states[(states.findIndex((s) => s.id === state.id) + step + states.length) % states.length];
      update({ focusedStateId: next.id });
      document.getElementById("map-state-" + next.id)?.focus();
    }
  };

  const regionStates = useMemo(() => STATES_DATA.filter((state) => selectedRegion === "all" || state.region === selectedRegion), [selectedRegion]);
  const focusId = regionStates.some((state) => state.id === view.focusedStateId) ? view.focusedStateId : regionStates[0]?.id;
  const filtered = useMemo(() => places.filter((place) => {
    const state = STATES_DATA.find((s) => s.id === place.state);
    return (categoryFilter === "all" || place.category === categoryFilter) && (selectedRegion === "all" || state?.region === selectedRegion);
  }), [places, selectedRegion, categoryFilter]);
  const visiblePins = useMemo(() => filtered.filter((place) => selectedStateId ? place.state === selectedStateId : camera.zoom >= 1.8 || selectedRegion !== "all" || categoryFilter !== "all" || place.featured), [filtered, selectedStateId, camera.zoom, selectedRegion, categoryFilter]);
  const clusters = useMemo(() => {
    const groups: { x: number; y: number; places: Place[] }[] = [];
    for (const place of visiblePins) {
      const point = projectCoordinates(place.coordinates.lng, place.coordinates.lat);
      const group = groups.find((g) => Math.hypot((g.x - point.x) * camera.zoom, (g.y - point.y) * camera.zoom) < 30);
      if (group) group.places.push(place); else groups.push({ ...point, places: [place] });
    }
    return groups;
  }, [visiblePins, camera.zoom]);
  const labels = useMemo(() => {
    const accepted: { x: number; y: number; width: number }[] = [];
    return [...regionStates].sort((a, b) => Number(b.id === selectedStateId) - Number(a.id === selectedStateId) || b.bbox[2] * b.bbox[3] - a.bbox[2] * a.bbox[3]).filter((state) => {
      const [x, y] = state.labelPos || [state.bbox[0] + state.bbox[2] / 2, state.bbox[1] + state.bbox[3] / 2];
      const point = { x: x * camera.zoom + camera.x, y: y * camera.zoom + camera.y, width: state.name.length * 6.3 + 12 };
      if (point.x < 0 || point.x > MAP_WIDTH || point.y < 0 || point.y > MAP_HEIGHT) return false;
      if (state.id !== selectedStateId && state.id !== hoveredState && accepted.some((p) => Math.abs(p.y - point.y) < 22 && Math.abs(p.x - point.x) < (p.width + point.width) / 2)) return false;
      accepted.push(point); return true;
    });
  }, [regionStates, selectedStateId, hoveredState, camera]);
  const hover = STATES_DATA.find((state) => state.id === hoveredState);
  const hint = hoveredPlace?.name || hover?.name;
  const reset = () => { update({ camera: DEFAULT_CAMERA }); setClusterPlaces([]); };

  return (
    <div className="atlas-canvas">
      <div className="atlas-toolbar">
        <div className="flex items-center gap-1 rounded-full border border-border bg-background/95 p-1">
          <button className="atlas-control" onClick={() => adjustZoom(1.3)} disabled={camera.zoom >= 5} aria-label="Zoom in"><Plus className="size-4" /></button>
          <span className="w-9 text-center text-xs tabular-nums text-muted-foreground">{camera.zoom.toFixed(1)}×</span>
          <button className="atlas-control" onClick={() => adjustZoom(1 / 1.3)} disabled={camera.zoom <= 1} aria-label="Zoom out"><Minus className="size-4" /></button>
          <button className="atlas-control" onClick={reset} aria-label="Reset map view"><RotateCcw className="size-4" /></button>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-background/95 p-1">
          <button className="atlas-control" onClick={() => update({ showLabels: !showLabels })} aria-label="State labels" aria-pressed={showLabels}>{showLabels ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</button>
          <button className="atlas-control" onClick={() => update({ showPins: !showPins })} aria-label="Destination pins" aria-pressed={showPins}><MapPin className="size-4" /></button>
        </div>
      </div>
      <div className="atlas-touch-controls">
        <button className={cn("min-h-11 rounded-full border px-3 text-xs", touchEnabled ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground")}
          aria-pressed={touchEnabled} onClick={() => { setTouchEnabled(!touchEnabled); pointers.current.clear(); setDragging(false); }}>
          <Hand className="mr-1.5 inline size-3.5" />{touchEnabled ? "Finish moving map" : "Pan & pinch map"}
        </button>
        <span className="max-w-40 text-[11px] leading-tight text-muted-foreground">{touchEnabled ? "Drag or pinch. Finish to scroll the page." : "Tap a state, or scroll past the map."}</span>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className={cn("atlas-svg", dragging && "is-dragging")}
        style={{ touchAction: touchEnabled ? "none" : "pan-y" }}
        role="group" aria-label="Interactive India map" aria-describedby="map-keyboard-help" tabIndex={0}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endPointer} onPointerCancel={endPointer}
        onLostPointerCapture={endPointer}
        onPointerLeave={() => { if (!dragging) { setHoveredState(null); setHoveredPlace(null); setCoordinates(null); } }}
        onClickCapture={(event) => { if (event.detail !== 0 && moved.current) { event.preventDefault(); event.stopPropagation(); moved.current = false; } }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const delta = 60;
          if (["+", "=", "-", "0", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) event.preventDefault();
          if (event.key === "+" || event.key === "=") adjustZoom(1.3);
          if (event.key === "-") adjustZoom(1 / 1.3);
          if (event.key === "0") reset();
          if (event.key.startsWith("Arrow")) setCamera({ ...camera, x: camera.x + (event.key === "ArrowLeft" ? delta : event.key === "ArrowRight" ? -delta : 0), y: camera.y + (event.key === "ArrowUp" ? delta : event.key === "ArrowDown" ? -delta : 0) });
        }}>
        <title>Explore India's states and destinations</title>
        <defs><pattern id="atlas-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--primary)" strokeOpacity="0.07" strokeWidth="0.5" /></pattern></defs>
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#atlas-grid)" className="text-primary/10" aria-hidden="true" />
        <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`} style={{ transition: dragging || reduceMotion ? "none" : "transform 280ms cubic-bezier(0.22,1,0.36,1)" }}>
          {STATES_DATA.map((state) => {
            const selected = selectedStateId === state.id;
            const inRegion = selectedRegion === "all" || selectedRegion === state.region;
            return <path key={state.id} id={"map-state-" + state.id} d={state.d} role="button" aria-label={"Explore " + state.name} aria-pressed={selected}
              tabIndex={focusId === state.id ? 0 : -1} vectorEffect="non-scaling-stroke"
              className={cn("atlas-state", selected && "is-selected", !inRegion && "is-muted")}
              onClick={() => activateState(state)} onKeyDown={(event) => stateKeys(event, state)}
              onFocus={() => { setHoveredState(state.id); update({ focusedStateId: state.id }); }}
              onBlur={() => setHoveredState(null)}
              onPointerEnter={(event) => { if (event.pointerType !== "touch") setHoveredState(state.id); }}
              onPointerLeave={() => setHoveredState(null)} />;
          })}
          {showLabels && labels.map((state) => {
            const point = state.labelPos || [state.bbox[0] + state.bbox[2] / 2, state.bbox[1] + state.bbox[3] / 2];
            return <text key={state.id} x={point[0]} y={point[1]} textAnchor="middle" pointerEvents="none" aria-hidden="true"
              fontSize={12 / camera.zoom} strokeWidth={3 / camera.zoom} className={cn("atlas-label", state.id === selectedStateId && "is-selected")}>{state.name}</text>;
          })}
          {showPins && clusters.map((group) => {
            const place = group.places[0], multiple = group.places.length > 1;
            const label = multiple ? "Show " + group.places.length + " nearby destinations" : "Explore destination: " + place.name;
            const activate = () => { if (multiple) setClusterPlaces(group.places); else onSelectPlace?.(place); };
            return <g key={place.id} id={"map-pin-" + place.id} transform={`translate(${group.x},${group.y}) scale(${1 / camera.zoom})`}
              role="button" tabIndex={0} aria-label={label} className="atlas-pin"
              onClick={activate} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } }}
              onPointerEnter={(event) => { if (event.pointerType !== "touch") setHoveredPlace(place); }} onPointerLeave={() => setHoveredPlace(null)}
              onFocus={() => setHoveredPlace(place)} onBlur={() => setHoveredPlace(null)}>
              <circle r="22" fill="transparent" />
              {multiple ? <><circle r="14" className="fill-primary stroke-background" strokeWidth="2" /><text textAnchor="middle" dy="4" className="fill-background text-[12px] font-bold">{group.places.length}</text></>
                : place.category === "hidden" ? <path d="M0 -7 L7 0 L0 7 L-7 0Z" className="fill-ivory stroke-background" strokeWidth="2" />
                : <circle r="6" className="fill-primary stroke-background" strokeWidth="2" />}
            </g>;
          })}
        </g>
      </svg>
      <div className="atlas-map-caption" aria-live="polite">
        <Compass className="size-4 shrink-0 text-primary" />
        <span>{hint || (selectedStateId ? "State selected · explore its places alongside the map" : "Choose a state to begin your journey")}</span>
      </div>
      {clusterPlaces.length > 0 && <div className="atlas-cluster-list" role="region" aria-label="Nearby destinations" onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); setClusterPlaces([]); document.getElementById("map-pin-" + clusterPlaces[0].id)?.focus(); } }}>
        <div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold">Choose a destination</p><button className="atlas-control" onClick={() => { document.getElementById("map-pin-" + clusterPlaces[0].id)?.focus(); setClusterPlaces([]); }} aria-label="Close nearby destinations"><X className="size-4" /></button></div>
        {clusterPlaces.map((place) => <button id={"cluster-place-" + place.id} key={place.id} className="block min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary" onClick={() => onSelectPlace?.(place)}>{place.name}</button>)}
      </div>}
      <div className="sr-only" id="map-keyboard-help">Use Tab to reach a state. Arrow keys move between states; Enter opens the preview. On the map canvas, arrows pan, plus and minus zoom, and zero resets. A state selector is available above the map.</div>
      <div className="atlas-legend">
        <span><span className="mr-1.5 inline-block size-2 rounded-full bg-primary" />Iconic</span>
        <span><span className="mr-1.5 inline-block size-2 rotate-45 bg-ivory" />Hidden gems</span>
        <span className="ml-auto hidden sm:inline">{coordinates && coordinates.lat >= 6 && coordinates.lat <= 38 && coordinates.lng >= 66 && coordinates.lng <= 99 ? `${coordinates.lat.toFixed(2)}°N, ${coordinates.lng.toFixed(2)}°E` : selectedStateId || camera.zoom >= 1.8 ? visiblePins.length + " places" : "Highlights · zoom for more"}</span>
      </div>
    </div>
  );
}

