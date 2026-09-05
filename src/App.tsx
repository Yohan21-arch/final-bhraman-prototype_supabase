import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Compass,
  Sparkles,
  MapPin,
  Bookmark,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  Globe,
  Bot,
  Dices,
  Camera,
  ShieldCheck,
} from "lucide-react";
import { Navbar, type NavTab } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { IndiaMap } from "@/components/IndiaMap";
import { StatePanel } from "@/components/StatePanel";
import { PlaceDetail } from "@/components/PlaceDetail";
import { StateGuide } from "@/components/StateGuide";
import { TripListView } from "@/components/TripListView";
import { ItineraryPlanner } from "@/components/ItineraryPlanner";
import { DestinationsGrid, type DestinationsGridFilters } from "@/components/DestinationsGrid";
import { ImageGallery } from "@/components/ImageGallery";
import { TourGuidesView } from "@/components/TourGuidesView";
import { PlaceCard } from "@/components/PlaceCard";
import { YatraChatbot } from "@/components/YatraChatbot";
import { PLACES_DATA } from "@/data/places";
import { STATES_DATA, stateById } from "@/data/states";
import { useDestinations } from "@/services/destinationService";
import type { Place, StateData, Region, Category } from "@/types";
import { cn } from "@/lib/utils";

interface NavContextEntry {
  tab: NavTab;
  place: Place | null;
  state: StateData | null;
  panelStateId: string | null;
  label: string;
}

export default function App() {
  const { places, loading: isPlacesLoading, isUsingSupabase, refresh: refreshDestinations } = useDestinations();
  const [activeTab, setActiveTab] = useState<NavTab>("map");
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [activeState, setActiveState] = useState<StateData | null>(null);
  const [panelStateId, setPanelStateId] = useState<string | null>(null);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);
  const [navStack, setNavStack] = useState<NavContextEntry[]>([]);

  // Map filters (preserved across navigation)
  const [selectedRegion, setSelectedRegion] = useState<Region | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "iconic" | "hidden">("all");

  // Destinations Grid filters (preserved across navigation)
  const [gridFilters, setGridFilters] = useState<DestinationsGridFilters>({
    category: "all",
    selectedRegion: "all",
    selectedTag: "all",
    searchQuery: "",
  });

  const featured = useMemo(() => places.filter((p) => p.featured), [places]);

  // Synchronize initial URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#/place/")) {
      const placeId = hash.replace("#/place/", "");
      const found = places.find((p) => p.id === placeId) || PLACES_DATA.find((p) => p.id === placeId);
      if (found) {
        setActivePlace(found);
      }
    } else if (hash.startsWith("#/state/")) {
      const stateId = hash.replace("#/state/", "");
      const found = STATES_DATA.find((s) => s.id === stateId);
      if (found) {
        setActiveState(found);
      }
    } else if (hash.startsWith("#/tab/")) {
      const tab = hash.replace("#/tab/", "") as NavTab;
      if (["map", "destinations", "gallery", "guides", "planner", "my-list"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [places]);

  // Listen to native browser Back and Forward button events
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const hash = window.location.hash;
      if (hash.startsWith("#/place/")) {
        const placeId = hash.replace("#/place/", "");
        const found = places.find((p) => p.id === placeId) || PLACES_DATA.find((p) => p.id === placeId);
        if (found) {
          setActivePlace(found);
          return;
        }
      } else if (hash.startsWith("#/state/")) {
        const stateId = hash.replace("#/state/", "");
        const found = STATES_DATA.find((s) => s.id === stateId);
        if (found) {
          setActivePlace(null);
          setActiveState(found);
          return;
        }
      } else if (hash.startsWith("#/tab/")) {
        const tab = hash.replace("#/tab/", "") as NavTab;
        if (["map", "destinations", "gallery", "guides", "planner", "my-list"].includes(tab)) {
          setActiveTab(tab);
          setActivePlace(null);
          setActiveState(null);
          return;
        }
      }

      if (e.state) {
        if (e.state.placeId) {
          const found = places.find((p) => p.id === e.state.placeId) || PLACES_DATA.find((p) => p.id === e.state.placeId);
          setActivePlace(found || null);
        } else {
          setActivePlace(null);
        }

        if (e.state.stateId) {
          const found = STATES_DATA.find((s) => s.id === e.state.stateId);
          setActiveState(found || null);
        } else {
          setActiveState(null);
        }

        if (e.state.tab) {
          setActiveTab(e.state.tab);
        }
        if (e.state.panelStateId !== undefined) {
          setPanelStateId(e.state.panelStateId);
        }
      } else {
        // Fallback pop
        setActivePlace(null);
        setActiveState(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab, activePlace?.id, activeState?.id]);

  const handleSelectPlace = useCallback(
    (place: Place, customOriginLabel?: string) => {
      // Determine human-friendly context label for the back button
      let label = customOriginLabel;
      if (!label) {
        if (activePlace) {
          label = `Back to ${activePlace.name}`;
        } else if (activeState) {
          label = `Back to ${activeState.name}`;
        } else if (activeTab === "gallery") {
          label = "Back to Photo Gallery";
        } else if (activeTab === "destinations") {
          label = gridFilters.searchQuery.trim()
            ? `Back to Search`
            : gridFilters.category !== "all" || gridFilters.selectedRegion !== "all" || gridFilters.selectedTag !== "all"
            ? `Back to Filtered Results`
            : `Back to Destinations`;
        } else if (activeTab === "planner") {
          label = "Back to Planner";
        } else if (activeTab === "my-list") {
          label = "Back to My List";
        } else {
          label = panelStateId ? `Back to Map` : "Back to Map";
        }
      }

      const snapshot: NavContextEntry = {
        tab: activeTab,
        place: activePlace,
        state: activeState,
        panelStateId,
        label,
      };

      setNavStack((prev) => [...prev, snapshot]);
      setActivePlace(place);

      // Update browser history
      try {
        window.history.pushState(
          {
            type: "place",
            placeId: place.id,
            tab: activeTab,
            stateId: activeState?.id || null,
            panelStateId,
          },
          "",
          `#/place/${place.id}`
        );
      } catch {
        // ignore in restrictive environments
      }
    },
    [activePlace, activeState, activeTab, panelStateId, gridFilters]
  );

  const handleSelectStateFromMap = (state: StateData) => {
    setPanelStateId(state.id);
  };

  const handleOpenFullStateGuide = (state: StateData) => {
    const snapshot: NavContextEntry = {
      tab: activeTab,
      place: null,
      state: null,
      panelStateId,
      label: "Back to Map",
    };
    setNavStack((prev) => [...prev, snapshot]);
    setPanelStateId(null);
    setActiveState(state);
    setActivePlace(null);

    try {
      window.history.pushState(
        {
          type: "state",
          stateId: state.id,
          tab: activeTab,
        },
        "",
        `#/state/${state.id}`
      );
    } catch {
      // ignore
    }
  };

  const handleBack = () => {
    if (navStack.length > 0) {
      const lastEntry = navStack[navStack.length - 1];
      setNavStack((prev) => prev.slice(0, -1));
      setActiveTab(lastEntry.tab);
      setActivePlace(lastEntry.place);
      setActiveState(lastEntry.state);
      setPanelStateId(lastEntry.panelStateId);

      try {
        if (lastEntry.place) {
          window.history.replaceState(null, "", `#/place/${lastEntry.place.id}`);
        } else if (lastEntry.state) {
          window.history.replaceState(null, "", `#/state/${lastEntry.state.id}`);
        } else {
          window.history.replaceState(null, "", `#/tab/${lastEntry.tab}`);
        }
      } catch {
        // ignore
      }
    } else {
      setActivePlace(null);
      setActiveState(null);
      try {
        window.history.replaceState(null, "", `#/tab/${activeTab}`);
      } catch {
        // ignore
      }
    }
  };

  const handleClosePlace = () => {
    // Find the base root view before any place detail stack
    const baseEntry = [...navStack].reverse().find((e) => !e.place) || navStack[0];
    if (baseEntry) {
      setActiveTab(baseEntry.tab);
      setActiveState(baseEntry.state);
      setPanelStateId(baseEntry.panelStateId);
    }
    setActivePlace(null);
    setNavStack([]);

    try {
      if (baseEntry?.state) {
        window.history.replaceState(null, "", `#/state/${baseEntry.state.id}`);
      } else {
        window.history.replaceState(null, "", `#/tab/${baseEntry?.tab || activeTab}`);
      }
    } catch {
      // ignore
    }
  };

  const handleSurpriseMe = () => {
    // Pick a random place from dynamic destinations, ensuring it's different from the active one
    const candidates = places.filter((p) => !activePlace || p.id !== activePlace.id);
    const pool = candidates.length > 0 ? candidates : places;
    const randomPlace = pool[Math.floor(Math.random() * pool.length)];

    handleSelectPlace(randomPlace, "Back to Previous View");
  };

  const handleAskYatra = (prompt: string) => {
    setChatInitialPrompt(prompt);
  };

  // Determine current contextual back label
  const currentBackLabel =
    navStack.length > 0
      ? navStack[navStack.length - 1].label
      : activeState
      ? `Back to ${activeState.name}`
      : activeTab === "gallery"
      ? "Back to Photo Gallery"
      : activeTab === "destinations"
      ? "Back to Destinations"
      : activeTab === "planner"
      ? "Back to Planner"
      : activeTab === "my-list"
      ? "Back to My List"
      : "Back to Map";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/25 selection:text-primary">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setActivePlace(null);
          setActiveState(null);
          setNavStack([]);
          try {
            window.history.pushState({ type: "tab", tab }, "", `#/tab/${tab}`);
          } catch {
            // ignore
          }
        }}
        onSelectPlace={(place) => handleSelectPlace(place, "Back to Search")}
        onSelectState={handleOpenFullStateGuide}
        onSurpriseMe={handleSurpriseMe}
      />

      {/* Main Dynamic View Switching */}
      <div className="flex-1">
        {/* VIEW 1: Immersive Place Detail */}
        {activePlace ? (
          <PlaceDetail
            place={activePlace}
            backLabel={currentBackLabel}
            onBack={handleBack}
            onClose={handleClosePlace}
            onSelectPlace={(place) => handleSelectPlace(place, `Back to ${activePlace.name}`)}
            onSelectState={handleOpenFullStateGuide}
            onAskYatra={handleAskYatra}
          />
        ) : activeState ? (
          /* VIEW 2: Dedicated State Travel Guide */
          <StateGuide
            state={activeState}
            places={places}
            onBack={handleBack}
            onClose={() => {
              setActiveState(null);
              setNavStack([]);
            }}
            onSelectPlace={(place) => handleSelectPlace(place, `Back to ${activeState.name}`)}
            onAskYatra={handleAskYatra}
          />
        ) : activeTab === "planner" ? (
          /* VIEW 3: AI Expedition / Itinerary Planner */
          <ItineraryPlanner
            onSelectPlace={(place) => handleSelectPlace(place, "Back to Planner")}
            onSelectState={handleOpenFullStateGuide}
          />
        ) : activeTab === "my-list" ? (
          /* VIEW 4: My Bhraman Saved Trip List */
          <TripListView
            onSelectPlace={(place) => handleSelectPlace(place, "Back to My List")}
            onSelectState={handleOpenFullStateGuide}
            onBack={() => setActiveTab("map")}
          />
        ) : activeTab === "gallery" ? (
          /* VIEW 5: Photographic Image Gallery */
          <ImageGallery
            places={places}
            onSelectPlace={(place) => handleSelectPlace(place, "Back to Photo Gallery")}
            onSelectState={handleOpenFullStateGuide}
            onAskYatra={handleAskYatra}
          />
        ) : activeTab === "guides" ? (
          /* VIEW 6: Verified Tour Guides & Travel Price Ratings */
          <TourGuidesView
            onSelectPlace={(place) => handleSelectPlace(place, "Back to Tour Guides")}
            onAskYatra={handleAskYatra}
          />
        ) : activeTab === "destinations" ? (
          /* VIEW 7: All Curated Destinations Grid */
          <DestinationsGrid
            places={places}
            isUsingSupabase={isUsingSupabase}
            isLoading={isPlacesLoading}
            filters={gridFilters}
            onFiltersChange={setGridFilters}
            onSelectPlace={(place) =>
              handleSelectPlace(
                place,
                gridFilters.searchQuery.trim()
                  ? "Back to Search"
                  : gridFilters.category !== "all" || gridFilters.selectedRegion !== "all" || gridFilters.selectedTag !== "all"
                  ? "Back to Filtered Results"
                  : "Back to Destinations"
              )
            }
            onSelectState={handleOpenFullStateGuide}
            onSurpriseMe={handleSurpriseMe}
          />
        ) : (
          /* VIEW 6: Home / Interactive Map Explorer */
          <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-8">
            {/* Editorial Hero Header */}
            <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/70 to-secondary/30 p-6 md:p-12 mb-8 shadow-2xl grain">
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs uppercase tracking-[0.2em] text-primary font-semibold backdrop-blur-md">
                  <Compass className="size-3.5" />
                  <span>Cinematic India Travel Atlas</span>
                </div>

                <h1 className="display-font text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[0.98]">
                  Discover the Soul of India
                </h1>

                <p className="text-sm md:text-base leading-relaxed text-muted-foreground max-w-2xl font-sans">
                  From high-altitude Himalayan monasteries and golden desert citadels to secret tropical lagoons and thousand-year-old rock-cut sanctuaries.
                </p>

                {/* Quick Explorer Category Toggles, Surprise Me & Ask Yatra Banner */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    id="hero-surprise-me-btn"
                    onClick={handleSurpriseMe}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/80 bg-primary/15 px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-md active:scale-95 group cursor-pointer"
                  >
                    <Dices className="size-3.5 transition-transform group-hover:rotate-180 duration-500" />
                    <span>Surprise Me</span>
                  </button>

                  <button
                    onClick={() => {
                      setCategoryFilter("all");
                    }}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold transition-all shadow-md cursor-pointer",
                      categoryFilter === "all"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Globe className="size-3.5" />
                    <span>All ({places.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setCategoryFilter("hidden");
                    }}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold transition-all shadow-md cursor-pointer",
                      categoryFilter === "hidden"
                        ? "border border-primary bg-primary text-primary-foreground"
                        : "border border-primary/50 bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    <Sparkles className="size-3.5" />
                    <span>Hidden Gems</span>
                  </button>

                  <button
                    onClick={() => {
                      setCategoryFilter("iconic");
                    }}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold transition-all shadow-md cursor-pointer",
                      categoryFilter === "iconic"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Flame className="size-3.5" />
                    <span>Iconic Wonders</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("gallery");
                      try {
                        window.history.pushState({ type: "tab", tab: "gallery" }, "", "#/tab/gallery");
                      } catch {}
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold text-muted-foreground hover:border-primary hover:text-foreground transition-all shadow-md cursor-pointer"
                  >
                    <Camera className="size-3.5 text-primary" />
                    <span>Photo Gallery</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("guides");
                      try {
                        window.history.pushState({ type: "tab", tab: "guides" }, "", "#/tab/guides");
                      } catch {}
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold text-muted-foreground hover:border-primary hover:text-foreground transition-all shadow-md cursor-pointer"
                  >
                    <ShieldCheck className="size-3.5 text-primary" />
                    <span>Tour Guides & Tariffs</span>
                  </button>

                  <button
                    onClick={() =>
                      handleAskYatra("Hi Yatra! I'd like a curated recommendation based on my current travel mood.")
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-[#F2A93B]/60 bg-[#17233D] px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-bold text-[#F2A93B] hover:bg-[#101A30] transition-all shadow-md cursor-pointer"
                  >
                    <Sparkles className="size-3.5 text-[#F2A93B]" />
                    <span>Chat with Yatra AI</span>
                  </button>
                </div>
              </div>

              {/* Stat Highlights */}
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 sm:grid-cols-4">
                <div>
                  <p className="display-font text-2xl font-bold text-primary">28+</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">States & Territories</p>
                </div>
                <div>
                  <p className="display-font text-2xl font-bold text-foreground">100%</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Field Verified</p>
                </div>
                <div>
                  <p className="display-font text-2xl font-bold text-primary">Dual Mode</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Iconic & Secret</p>
                </div>
                <div>
                  <p className="display-font text-2xl font-bold text-foreground">Yatra AI</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Travel Companion</p>
                </div>
              </div>
            </section>

            {/* Interactive Cartography Map Section */}
            <section className="space-y-4 mb-16">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="eyebrow flex items-center gap-1.5 text-primary">
                    <MapPin className="size-3.5" /> Interactive Explorer
                  </p>
                  <h2 className="display-font text-2xl md:text-3xl font-extrabold text-foreground">
                    Tap Any State to Reveal Curated Places
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pan & zoom freely or click state outlines for instant drawer guides
                </p>
              </div>

              <IndiaMap
                places={places}
                selectedStateId={panelStateId || undefined}
                onSelectState={handleSelectStateFromMap}
                onSelectPlace={(place) => handleSelectPlace(place, "Back to Map")}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                categoryFilter={categoryFilter}
              />
            </section>

            {/* Featured Wonders Carousel / Grid */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div>
                  <p className="eyebrow flex items-center gap-1.5 text-primary">
                    <Sparkles className="size-3.5" /> Curators&apos; Pick
                  </p>
                  <h2 className="display-font text-2xl md:text-3xl font-extrabold text-foreground">
                    Unmissable Highlights of India
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab("destinations")}
                  className="group inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-primary font-semibold hover:underline cursor-pointer"
                >
                  <span>View All ({places.length})</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featured.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onSelect={(p) => handleSelectPlace(p, "Back to Highlights")}
                  />
                ))}
              </div>
            </section>
          </main>
        )}
      </div>

      {/* Slide-in State Panel Drawer */}
      <AnimatePresence>
        {panelStateId && (
          <StatePanel
            stateId={panelStateId}
            places={places}
            onClose={() => setPanelStateId(null)}
            onSelectPlace={(p) => handleSelectPlace(p, "Back to Map")}
            onOpenFullGuide={handleOpenFullStateGuide}
          />
        )}
      </AnimatePresence>

      {/* Yatra Floating India Travel Chatbot */}
      <YatraChatbot
        onSelectPlace={(p) => handleSelectPlace(p, "Back to Travel Chat")}
        onSelectState={handleOpenFullStateGuide}
        initialPrompt={chatInitialPrompt}
        onClearInitialPrompt={() => setChatInitialPrompt(null)}
      />

      {/* Global Footer */}
      <Footer onSelectState={handleOpenFullStateGuide} onDataRefreshed={refreshDestinations} />
    </div>
  );
}
