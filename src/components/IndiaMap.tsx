import { useState, useRef, type MouseEvent, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  Sparkles,
  Compass,
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  CheckCircle2,
} from "lucide-react";
import { STATES_DATA, MAP_WIDTH, MAP_HEIGHT, REGION_NAMES } from "@/data/states";
import { PLACES_DATA, placesByState } from "@/data/places";
import { projectCoordinates, invertCoordinates } from "@/lib/geo";
import type { StateData, Region, Place, GeoCoordinates } from "@/types";
import { cn } from "@/lib/utils";

export function IndiaMap({
  selectedStateId,
  onSelectState,
  onSelectPlace,
  selectedRegion,
  onSelectRegion,
  categoryFilter,
  places = PLACES_DATA,
}: {
  selectedStateId?: string;
  onSelectState: (state: StateData) => void;
  onSelectPlace?: (place: Place) => void;
  selectedRegion: Region | "all";
  onSelectRegion: (region: Region | "all") => void;
  categoryFilter: "all" | "iconic" | "hidden";
  places?: Place[];
}) {
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [hoveredPin, setHoveredPin] = useState<Place | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [mouseCoords, setMouseCoords] = useState<GeoCoordinates | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePlaces = places && places.length > 0 ? places : PLACES_DATA;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.35, 3.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.35, 0.75));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Zoom to state when selected
  const handleZoomToState = (state: StateData) => {
    if (!state.bbox) return;
    const [minX, minY, width, height] = state.bbox;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;

    const targetZoom = Math.min(Math.max(MAP_WIDTH / (width * 1.6), 1.3), 3.0);
    const targetPanX = (MAP_WIDTH / 2 - centerX) * targetZoom;
    const targetPanY = (MAP_HEIGHT / 2 - centerY) * targetZoom;

    setZoom(targetZoom);
    setPan({ x: targetPanX, y: targetPanY });
  };

  useEffect(() => {
    if (selectedStateId) {
      const st = STATES_DATA.find((s) => s.id === selectedStateId);
      if (st) {
        // Soft zoom to state if bbox is available
        const [minX, minY, width, height] = st.bbox;
        if (width > 0 && height > 0) {
          const centerX = minX + width / 2;
          const centerY = minY + height / 2;
          const targetZoom = Math.min(Math.max(MAP_WIDTH / (width * 2.2), 1.2), 2.6);
          setZoom(targetZoom);
          setPan({
            x: (MAP_WIDTH / 2 - centerX) * targetZoom,
            y: (MAP_HEIGHT / 2 - centerY) * targetZoom,
          });
        }
      }
    }
  }, [selectedStateId]);

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: MouseEvent) => {
    // Calculate live geographical coordinates under mouse
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Transform from screen coords back to SVG viewBox coords
      const svgX = (clientX / rect.width) * MAP_WIDTH;
      const svgY = (clientY / rect.height) * MAP_HEIGHT;

      // Account for pan & zoom
      const unprojectedX = (svgX - MAP_WIDTH / 2 - pan.x) / zoom + MAP_WIDTH / 2;
      const unprojectedY = (svgY - MAP_HEIGHT / 2 - pan.y) / zoom + MAP_HEIGHT / 2;

      const geo = invertCoordinates(unprojectedX, unprojectedY);
      if (geo && geo.lat >= 6 && geo.lat <= 38 && geo.lng >= 66 && geo.lng <= 99) {
        setMouseCoords(geo);
      } else {
        setMouseCoords(null);
      }
    }

    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const visiblePlaces = activePlaces.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (selectedRegion !== "all") {
      const s = STATES_DATA.find((st) => st.id === p.state);
      if (s && s.region !== selectedRegion) return false;
    }
    return true;
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[640px] md:h-[720px] lg:h-[780px] overflow-hidden rounded-2xl border border-border/90 bg-gradient-to-b from-card/95 via-card/60 to-background select-none shadow-2xl transition-all"
    >
      {/* Subtle Cartographic Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(212,175,55,0.08)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Top Left: Region Filter & Map Info Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Region Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-border/90 bg-background/85 p-1 backdrop-blur-xl shadow-lg">
          {(["all", "north", "south", "west", "east", "northeast", "central"] as const).map((r) => {
            const isSelected = selectedRegion === r;
            return (
              <button
                key={r}
                onClick={() => onSelectRegion(r)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] uppercase tracking-wider font-semibold transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                {r === "all" ? "All India" : REGION_NAMES[r].replace(" India", "")}
              </button>
            );
          })}
        </div>

        {/* Top Right: Layer & Zoom Controls */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            title={showLabels ? "Hide State Labels" : "Show State Labels"}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/90 text-[11px] font-medium backdrop-blur-xl shadow-sm transition-all",
              showLabels
                ? "bg-background/90 text-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {showLabels ? <Eye className="size-3 text-primary" /> : <EyeOff className="size-3" />}
            <span className="hidden sm:inline">Names</span>
          </button>

          {/* Toggle Pins */}
          <button
            onClick={() => setShowPins(!showPins)}
            title={showPins ? "Hide Destinations" : "Show Destinations"}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/90 text-[11px] font-medium backdrop-blur-xl shadow-sm transition-all",
              showPins
                ? "bg-background/90 text-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <MapPin className={cn("size-3", showPins ? "text-gold" : "text-muted-foreground")} />
            <span className="hidden sm:inline">Pins</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-0.5 rounded-full border border-border/90 bg-background/85 p-1 backdrop-blur-xl shadow-lg">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <button
              onClick={handleReset}
              title="Reset Map View"
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner: Survey of India Official Boundaries Badge */}
      <div className="absolute top-16 left-4 z-10 pointer-events-none hidden md:flex items-center gap-2 rounded-lg border border-primary/20 bg-background/70 px-2.5 py-1 text-[10px] text-muted-foreground backdrop-blur-md">
        <CheckCircle2 className="size-3 text-emerald-500" />
        <span>Official Survey of India Boundary (36 States & UTs)</span>
      </div>

      {/* Live Geographic Coordinates HUD in Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 rounded-lg border border-border/80 bg-background/85 px-3 py-1.5 text-xs backdrop-blur-md shadow-lg">
        <Compass className="size-3.5 text-primary animate-spin-slow" />
        {mouseCoords ? (
          <span className="font-mono text-[11px] text-foreground font-medium">
            {mouseCoords.lat.toFixed(2)}°N, {mouseCoords.lng.toFixed(2)}°E
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">Hover over map or click state</span>
        )}
      </div>

      {/* Hover Info Tooltip for State */}
      <AnimatePresence>
        {hoveredState && !hoveredPin && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 left-4 md:left-6 z-30 pointer-events-none rounded-xl border border-primary/40 bg-background/95 p-4 shadow-2xl backdrop-blur-xl max-w-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <p className="eyebrow text-primary text-[10px] font-semibold tracking-wider uppercase">
                  {REGION_NAMES[hoveredState.region]}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {placesByState(hoveredState.id).length} places
              </span>
            </div>
            <h4 className="display-font mt-1 text-lg font-bold text-foreground leading-tight">
              {hoveredState.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Capital: <span className="text-foreground font-medium">{hoveredState.capital}</span>
            </p>
            {hoveredState.bestSeasons && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Season: <span className="text-foreground">{hoveredState.bestSeasons}</span>
              </p>
            )}
            {hoveredState.highlights && hoveredState.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2.5">
                {hoveredState.highlights.slice(0, 3).map((h) => (
                  <span
                    key={h}
                    className="rounded-md bg-secondary/80 px-1.5 py-0.5 text-[10px] text-foreground font-medium"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Info Tooltip for Landmark Place */}
      <AnimatePresence>
        {hoveredPin && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 left-4 md:left-6 z-30 pointer-events-none rounded-xl border border-primary/50 bg-background/95 p-4 shadow-2xl backdrop-blur-xl max-w-sm"
          >
            <div className="flex items-center gap-1.5 text-primary text-[10px] uppercase tracking-wider font-semibold">
              {hoveredPin.category === "hidden" ? (
                <>
                  <Sparkles className="size-3 text-primary" /> Hidden Gem
                </>
              ) : (
                <>
                  <MapPin className="size-3 text-gold" /> Iconic Landmark
                </>
              )}
            </div>
            <h4 className="display-font mt-1 text-base font-bold text-foreground">
              {hoveredPin.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {hoveredPin.shortDesc}
            </p>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
              <span>{hoveredPin.bestTimeToVisit}</span>
              <span className="text-primary font-semibold">Click to explore →</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive SVG Canvas */}
      <div
        className={cn(
          "w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="w-full h-full max-h-[850px] transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <defs>
            {/* Soft map glow filter */}
            <filter id="map-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Pin drop shadow */}
            <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Tropic of Cancer Subtle Cartographic Guide (23.5° N) */}
          <line
            x1="50"
            y1="410"
            x2="750"
            y2="410"
            stroke="currentColor"
            strokeDasharray="4 6"
            className="text-border/40"
            strokeWidth="0.8"
          />
          <text
            x="60"
            y="405"
            className="fill-muted-foreground/30 text-[8px] font-mono uppercase tracking-widest pointer-events-none"
          >
            Tropic of Cancer 23.5° N
          </text>

          {/* Render State Polygons (Survey of India Boundaries) */}
          <g className="states-layer">
            {STATES_DATA.map((state) => {
              const isSelected = selectedStateId === state.id;
              const isHovered = hoveredState?.id === state.id;
              const matchesRegion =
                selectedRegion === "all" || state.region === selectedRegion;

              return (
                <g key={state.id} className="transition-all">
                  <path
                    d={state.d}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectState(state);
                      handleZoomToState(state);
                    }}
                    onMouseEnter={() => setHoveredState(state)}
                    onMouseLeave={() => setHoveredState(null)}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      isSelected
                        ? "fill-primary/45 stroke-primary stroke-[2.8] drop-shadow-md"
                        : isHovered
                        ? "fill-primary/30 stroke-primary stroke-[2.2]"
                        : matchesRegion
                        ? "fill-secondary/90 stroke-border hover:fill-primary/20 stroke-[1.1]"
                        : "fill-secondary/35 stroke-border/40 opacity-40 hover:opacity-85 stroke-[0.8]"
                    )}
                  />

                  {/* State Center Name Labels */}
                  {showLabels && state.labelPos && (
                    <text
                      x={state.labelPos[0]}
                      y={state.labelPos[1]}
                      textAnchor="middle"
                      pointerEvents="none"
                      className={cn(
                        "font-semibold tracking-wider uppercase transition-all select-none",
                        isSelected || isHovered
                          ? "fill-primary text-[11px] font-bold"
                          : matchesRegion
                          ? "fill-foreground/80 text-[9px]"
                          : "fill-muted-foreground/35 text-[8px]"
                      )}
                    >
                      {state.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Landmark Place Pinpoints (Projected mathematically with D3 Geo) */}
          {showPins && (
            <g className="pins-layer">
              {visiblePlaces.map((place) => {
                const { x, y } = projectCoordinates(
                  place.coordinates.lng,
                  place.coordinates.lat
                );
                const isHidden = place.category === "hidden";
                const isPinHovered = hoveredPin?.id === place.id;

                return (
                  <g
                    key={place.id}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlace?.(place);
                    }}
                    onMouseEnter={() => setHoveredPin(place)}
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    {/* Animated Pulse Ring */}
                    <circle
                      r={isHidden ? 10 : 13}
                      className={cn(
                        "animate-pulse-ring",
                        isHidden ? "fill-primary/30" : "fill-gold/30"
                      )}
                    />
                    {/* Core Pin Dot */}
                    <circle
                      r={isPinHovered ? 6.5 : isHidden ? 4 : 5}
                      filter="url(#pin-shadow)"
                      className={cn(
                        "transition-all duration-200",
                        isHidden
                          ? "fill-primary stroke-background stroke-2"
                          : "fill-gold stroke-background stroke-2"
                      )}
                    />
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 rounded-full border border-border/90 bg-background/85 px-3.5 py-1.5 text-[11px] text-muted-foreground backdrop-blur-xl shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-gold inline-block shadow-sm" />
          <span className="font-medium text-foreground">Iconic Landmarks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary inline-block shadow-sm" />
          <span className="font-medium text-foreground">Hidden Gems</span>
        </div>
      </div>
    </div>
  );
}
