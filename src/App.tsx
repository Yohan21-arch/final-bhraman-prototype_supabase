import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
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
import { ExplorerShell } from "@/components/ExplorerShell";
import { DEFAULT_MAP_VIEW, fitState, type MapViewState } from "@/lib/map-camera";
import { DEFAULT_PANEL_VIEW, type PanelViewState } from "@/components/StatePanel";
import { PlaceDetail } from "@/components/PlaceDetail";
import { StateGuide } from "@/components/StateGuide";
import { TripListView } from "@/components/TripListView";
import { ItineraryPlanner } from "@/components/ItineraryPlanner";
import { DestinationsGrid, type DestinationsGridFilters } from "@/components/DestinationsGrid";
import { TourGuidesView } from "@/components/TourGuidesView";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { ExperienceCollections } from "@/components/ExperienceCollections";
import { SearchBar } from "@/components/SearchBar";
import { PlaceCard } from "@/components/PlaceCard";
import { YatraChatbot } from "@/components/YatraChatbot";
import { IntroAnimationSketch } from "@/components/IntroAnimationSketch";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/account/AuthModal";
import { ProfileView } from "@/components/account/ProfileView";
import { SavedPlacesView } from "@/components/account/SavedPlacesView";
import { MyTripsView } from "@/components/account/MyTripsView";
import { BookingHistoryView } from "@/components/account/BookingHistoryView";
import { SettingsView } from "@/components/account/SettingsView";
import { PLACES_DATA } from "@/data/places";
import { STATES_DATA, stateById, MAP_WIDTH, MAP_HEIGHT } from "@/data/states";
import { useDestinations } from "@/services/destinationService";
import type { Place, StateData, Region, Category } from "@/types";
import { cn } from "@/lib/utils";

interface NavContextEntry {
  tab: NavTab;
  place: Place | null;
  state: StateData | null;
  panelStateId: string | null;
  label: string;
  scrollY: number; focusId: string; mapView: MapViewState; panelView: PanelViewState;
  selectedRegion: Region | "all"; categoryFilter: "all" | "iconic" | "hidden";
  gridFilters: DestinationsGridFilters; destinationSubView: "cards" | "gallery";
}

const VALID_NAV_TABS: NavTab[] = [
  "map",
  "destinations",
  "gallery",
  "guides",
  "planner",
  "my-list",
  "profile",
  "saved-places",
  "my-trips",
  "booking-history",
  "settings",
];

function BhramanApp() {
  const reduceMotion = useReducedMotion();
  const {
    places,
    loading: isPlacesLoading,
    error: placesError,
    isUsingSupabase,
    refresh: refreshDestinations,
  } = useDestinations();
  const [activeTab, setActiveTab] = useState<NavTab>("map");
  const [destinationSubView, setDestinationSubView] = useState<"cards" | "gallery">("cards");
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [activeState, setActiveState] = useState<StateData | null>(null);
  const [panelStateId, setPanelStateId] = useState<string | null>(null);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);
  const [navStack, setNavStack] = useState<NavContextEntry[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleIntroFinished = useCallback(() => {
    setShowIntro(false);
  }, []);

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

  const [mapView, setMapView] = useState<MapViewState>(DEFAULT_MAP_VIEW);
  const [panelView, setPanelView] = useState<PanelViewState>(DEFAULT_PANEL_VIEW);
  const pendingRestore = useRef<{ scrollY: number; focusId: string } | null>(null);
  const initialRoute = useRef(false);
  const finishedView = useRef("");
  const captureContext = (label = "Back to Map"): NavContextEntry => ({
    tab: activeTab, place: activePlace, state: activeState, panelStateId, label,
    scrollY: window.scrollY, focusId: document.activeElement?.id || "",
    mapView, panelView, selectedRegion, categoryFilter, gridFilters, destinationSubView,
  });
  const restoreContext = (entry: NavContextEntry) => {
    pendingRestore.current = entry;
    setActiveTab(entry.tab); setActivePlace(entry.place); setActiveState(entry.state);
    setPanelStateId(entry.panelStateId); setMapView(entry.mapView); setPanelView(entry.panelView);
    setSelectedRegion(entry.selectedRegion); setCategoryFilter(entry.categoryFilter);
    setGridFilters(entry.gridFilters); setDestinationSubView(entry.destinationSubView);
  };
  const contextUrl = (entry: NavContextEntry) => entry.place ? "#/place/" + entry.place.id
    : entry.state ? "#/state/" + entry.state.id
    : "#/tab/" + entry.tab + (entry.tab === "destinations" && entry.destinationSubView === "gallery" ? "/gallery" : "");
  const saveCurrentHistory = () => {
    try { window.history.replaceState({ bhramanContext: captureContext(), bhramanStack: navStack }, "", window.location.href); } catch {}
  };
  const finishViewTransition = () => {
    if (finishedView.current === activeViewKey && !pendingRestore.current) return;
    finishedView.current = activeViewKey;
    const restore = pendingRestore.current;
    pendingRestore.current = null;
    window.scrollTo({ top: restore?.scrollY || 0, behavior: "instant" });
    const target = (restore?.focusId && document.getElementById(restore.focusId))
      || document.getElementById(restore ? "india-explorer" : "main-content");
    target?.focus({ preventScroll: true });
  };

  const featured = useMemo(() => places.filter((p) => p.featured).slice(0, 8), [places]);

  // Deep links resolve once destinations are available; history retains exploration context.
  useEffect(() => {
    if (initialRoute.current) return;
    const hash = window.location.hash;
    if (hash.startsWith("#/place/")) {
      const id = hash.slice(8);
      const found = places.find(p => p.id === id) || PLACES_DATA.find(p => p.id === id);
      if (!found && isPlacesLoading) return;
      setActivePlace(found || null);
    } else if (hash.startsWith("#/state/")) {
      setActiveState(stateById(hash.slice(8)) || null);
    } else if (hash.startsWith("#/tab/")) {
      const route = hash.slice(6);
      if (route === "gallery" || route === "destinations/gallery") {
        setActiveTab("destinations"); setDestinationSubView("gallery");
      } else if (VALID_NAV_TABS.includes(route as NavTab)) setActiveTab(route as NavTab);
    }
    initialRoute.current = true;
  }, [places, isPlacesLoading]);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.bhramanContext) {
        restoreContext(event.state.bhramanContext);
        setNavStack(event.state.bhramanStack || []);
        return;
      }
      const hash = window.location.hash;
      setActivePlace(hash.startsWith("#/place/") ? places.find(p => p.id === hash.slice(8)) || PLACES_DATA.find(p => p.id === hash.slice(8)) || null : null);
      setActiveState(hash.startsWith("#/state/") ? stateById(hash.slice(8)) || null : null);
      if (hash.startsWith("#/tab/")) {
        const route = hash.slice(6);
        if (route === "gallery" || route === "destinations/gallery") { setActiveTab("destinations"); setDestinationSubView("gallery"); }
        else if (VALID_NAV_TABS.includes(route as NavTab)) setActiveTab(route as NavTab);
      }
      setNavStack([]);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [places]);

  const handleSelectPlace = (place: Place, customOriginLabel?: string) => {
    if (!place) return;
    const label = customOriginLabel || (activeState ? "Back to " + activeState.name : activeTab === "destinations" ? "Back to Destinations" : "Back to Map");
    const snapshot = captureContext(label);
    saveCurrentHistory();
    const nextStack = [...navStack, snapshot];
    const next = { ...snapshot, place, scrollY: 0, focusId: "" };
    setNavStack(nextStack); setActivePlace(place);
    try { window.history.pushState({ bhramanContext: next, bhramanStack: nextStack }, "", "#/place/" + place.id); } catch {}
  };
  const handleSelectStateFromMap = (state: StateData) => {
    setSelectedRegion(region => region === "all" || region === state.region ? region : "all");
    setPanelStateId(state.id);
    setPanelView({ ...DEFAULT_PANEL_VIEW, tab: categoryFilter === "hidden" ? "hidden" : "iconic" });
    setMapView(view => ({ ...view, focusedStateId: state.id, camera: fitState(state.bbox, MAP_WIDTH, MAP_HEIGHT, window.matchMedia("(max-width: 1023px)").matches) }));
  };
  const closeStatePreview = () => {
    const id = panelStateId;
    setPanelStateId(null);
    document.getElementById("map-state-" + id)?.focus({ preventScroll: true });
  };
  const handleOpenFullStateGuide = (state: StateData) => {
    const snapshot = captureContext(activePlace ? "Back to " + activePlace.name : "Back to Map");
    saveCurrentHistory();
    const nextStack = [...navStack, snapshot];
    const next = { ...snapshot, place: null, state, scrollY: 0, focusId: "" };
    setNavStack(nextStack); setActivePlace(null); setActiveState(state);
    try { window.history.pushState({ bhramanContext: next, bhramanStack: nextStack }, "", "#/state/" + state.id); } catch {}
  };
  const handleBack = () => {
    if (navStack.length && window.history.state?.bhramanContext) { window.history.back(); return; }
    const entry = navStack.at(-1);
    if (entry) {
      restoreContext(entry); setNavStack(navStack.slice(0, -1));
      try { window.history.replaceState({ bhramanContext: entry, bhramanStack: navStack.slice(0, -1) }, "", contextUrl(entry)); } catch {}
    } else {
      setActivePlace(null); setActiveState(null);
      try { window.history.replaceState(null, "", "#/tab/" + activeTab); } catch {}
    }
  };
  const handleClosePlace = () => {
    let index = navStack.length - 1;
    while (index >= 0 && navStack[index].place) index--;
    if (index >= 0 && window.history.state?.bhramanContext) { window.history.go(-(navStack.length - index)); return; }
    handleBack();
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

  const handleSelectTab = (tab: NavTab) => {
    saveCurrentHistory();
    const gallery = tab === "gallery";
    setActiveTab(gallery ? "destinations" : tab);
    if (gallery) setDestinationSubView("gallery");
    setActivePlace(null);
    setActiveState(null);
    setPanelStateId(null);
    setNavStack([]);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    try {
      window.history.pushState({ type: "tab", tab }, "", gallery ? "#/tab/destinations/gallery" : `#/tab/${tab}`);
    } catch { /* Navigation still works when browser history is unavailable. */ }
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
      ? destinationSubView === "gallery"
        ? "Back to Photo Gallery"
        : "Back to Destinations"
      : activeTab === "planner"
      ? "Back to Planner"
      : activeTab === "my-list"
      ? "Back to My List"
      : activeTab === "profile"
      ? "Back to Profile"
      : activeTab === "saved-places"
      ? "Back to Saved Places"
      : activeTab === "my-trips"
      ? "Back to Travel Plans"
      : activeTab === "booking-history"
      ? "Back to Booking History"
      : activeTab === "settings"
      ? "Back to Settings"
      : "Back to Map";

  const activeViewKey = activePlace
    ? `place-${activePlace.id}`
    : activeState
    ? `state-${activeState.id}`
    : activeTab === "destinations"
    ? `destinations-${destinationSubView}`
    : activeTab;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/25 selection:text-primary">
      <div inert={showIntro} aria-hidden={showIntro || undefined} className="flex min-h-screen flex-col">
      {/* Top Navigation */}
      <Navbar
        places={places}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onSelectPlace={(place) => handleSelectPlace(place, "Back to Search")}
        onSelectState={handleOpenFullStateGuide}
        onSurpriseMe={handleSurpriseMe}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Dynamic View Switching with Slide Change Animation */}
      <div id="main-content" tabIndex={-1} className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeViewKey}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate="enter"
            variants={{ enter: { opacity: 1, y: 0 } }}
            onAnimationComplete={definition => { if (definition === "enter") finishViewTransition(); }}
            exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.12 } }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
            className="w-full"
          >
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
            onClose={handleBack}
            onSelectPlace={(place) => handleSelectPlace(place, `Back to ${activeState.name}`)}
            onAskYatra={handleAskYatra}
          />
        ) : activeTab === "planner" ? (
          /* VIEW 3: AI Expedition / Itinerary Planner */
          <ItineraryPlanner
            places={places}
            onSelectPlace={(place) => handleSelectPlace(place, "Back to Planner")}
            onSelectState={handleOpenFullStateGuide}
          />
        ) : activeTab === "my-list" ? (
          /* VIEW 4: My Bhraman Saved Trip List */
          <TripListView
            places={places}
            onSelectPlace={(place) => handleSelectPlace(place, "Back to My List")}
            onSelectState={handleOpenFullStateGuide}
            onBack={() => setActiveTab("map")}
          />
        ) : activeTab === "guides" ? (
          /* VIEW 5: Verified Tour Guides & Travel Price Ratings */
          <TourGuidesView
            places={places}
            onSelectPlace={(place) => handleSelectPlace(place, "Back to Tour Guides")}
            onAskYatra={handleAskYatra}
          />
        ) : activeTab === "destinations" || activeTab === "gallery" ? (
          /* VIEW 6: All Curated Destinations & Integrated Photo Gallery */
          <DestinationsGrid
            places={places}
            isUsingSupabase={isUsingSupabase}
            isLoading={isPlacesLoading}
            error={placesError}
            onRetry={refreshDestinations}
            filters={gridFilters}
            onFiltersChange={setGridFilters}
            activeSubView={destinationSubView}
            onSubViewChange={(view) => {
              setDestinationSubView(view);
              try {
                window.history.replaceState(
                  null,
                  "",
                  view === "gallery" ? "#/tab/destinations/gallery" : "#/tab/destinations"
                );
              } catch {}
            }}
            onAskYatra={handleAskYatra}
            onSelectPlace={(place) =>
              handleSelectPlace(
                place,
                destinationSubView === "gallery"
                  ? "Back to Photo Gallery"
                  : gridFilters.searchQuery.trim()
                  ? "Back to Search"
                  : gridFilters.category !== "all" ||
                    gridFilters.selectedRegion !== "all" ||
                    gridFilters.selectedTag !== "all"
                  ? "Back to Filtered Results"
                  : "Back to Destinations"
              )
            }
            onSelectState={handleOpenFullStateGuide}
            onSurpriseMe={handleSurpriseMe}
          />
        ) : activeTab === "profile" ? (
          /* VIEW 8: User Account & Profile Settings */
          <ProfileView
            onSelectTab={(t) => {
              setActiveTab(t);
              try {
                window.history.pushState(null, "", `#/tab/${t}`);
              } catch {}
            }}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        ) : activeTab === "saved-places" ? (
          /* VIEW 9: Cloud-Synced Saved Wishlist */
          <SavedPlacesView
            places={places}
            onSelectPlace={(place) => handleSelectPlace(place, "Back to Saved Places")}
            onSelectState={handleOpenFullStateGuide}
            onSelectTab={(t) => {
              setActiveTab(t);
              try {
                window.history.pushState(null, "", `#/tab/${t}`);
              } catch {}
            }}
          />
        ) : activeTab === "my-trips" ? (
          /* VIEW 10: Travel Plans & Itineraries */
          <MyTripsView
            places={places}
            onSelectTab={(t) => {
              setActiveTab(t);
              try {
                window.history.pushState(null, "", `#/tab/${t}`);
              } catch {}
            }}
          />
        ) : activeTab === "booking-history" ? (
          /* VIEW 11: Demo / Illustrative Booking Records */
          <BookingHistoryView
            onSelectTab={(t) => {
              setActiveTab(t);
              try {
                window.history.pushState(null, "", `#/tab/${t}`);
              } catch {}
            }}
            onAskYatra={handleAskYatra}
          />
        ) : activeTab === "settings" ? (
          /* VIEW 12: Account Settings & Cloud Sync Preferences */
          <SettingsView
            onSelectTab={(t) => {
              setActiveTab(t);
              try {
                window.history.pushState(null, "", `#/tab/${t}`);
              } catch {}
            }}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        ) : (
          /* VIEW 6: Home / Interactive Map Explorer */
          <main className="site-container pb-20 pt-4 sm:pt-6">
            {/* Cinematic Destination Slideshow Hero Header with integrated search */}
            <HeroSlideshow
              places={places}
              onSelectPlace={(place) => handleSelectPlace(place, "Back to Discover India")}
              onSelectState={handleOpenFullStateGuide}
              onExplore={() => {
                const explorer = document.getElementById("india-explorer");
                explorer?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
                explorer?.focus({ preventScroll: true });
              }}
              onAskYatra={() => handleAskYatra("Help me discover India. Ask me about my interests and suggest a place to begin.")}
              onReplayIntro={() => setShowIntro(true)}
            />

            <ExperienceCollections places={places} onExplore={({ tag, category }) => {
              setGridFilters({ category: category || "all", selectedRegion: "all", selectedTag: tag || "all", searchQuery: "" });
              setDestinationSubView("cards");
              handleSelectTab("destinations");
            }} />

            {/* Interactive Cartography Map Section */}
            <section id="india-explorer" tabIndex={-1} aria-labelledby="explorer-heading" className="home-section space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="eyebrow flex items-center gap-1.5 text-primary">
                    <MapPin className="size-3.5" /> Interactive Explorer
                  </p>
                  <h2 id="explorer-heading" className="section-heading mt-3">A country of endless possibilities.</h2>
                  <p className="section-copy">Choose a state. Find its landmarks, local stories, and lesser-known places.</p>
                </div>

                {/* Quick Map & Destination Search Bar */}
                <div className="w-full sm:w-80 lg:w-96">
                  <SearchBar
                    places={places}
                    onSelectPlace={(place) => handleSelectPlace(place, "Back to Map")}
                    onSelectState={handleSelectStateFromMap}
                    placeholder="Search any destination or state on map..."
                  />
                </div>
              </div>

              {/* Map Pin Category Filters (All / Hidden Gems / Iconic Wonders) */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                      categoryFilter === "all"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Globe className="size-3" />
                    <span>All ({places.length})</span>
                  </button>

                  <button
                    onClick={() => setCategoryFilter("hidden")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                      categoryFilter === "hidden"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    <Sparkles className="size-3" />
                    <span>Hidden Gems</span>
                  </button>

                  <button
                    onClick={() => setCategoryFilter("iconic")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                      categoryFilter === "iconic"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Flame className="size-3" />
                    <span>Iconic Wonders</span>
                  </button>
                </div>

                {/* Quick View Options (Triggers Slide Change Animation) */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    id="quick-nav-tour-guides-btn"
                    onClick={() => {
                      setActiveTab("guides");
                      try {
                        window.history.pushState({ type: "tab", tab: "guides" }, "", "#/tab/guides");
                      } catch {}
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Certified ASI Tour Guides & Pricing Rates"
                  >
                    <ShieldCheck className="size-3 text-primary" />
                    <span>Tour Guides</span>
                  </button>

                  <button
                    id="quick-nav-destinations-btn"
                    onClick={() => {
                      setActiveTab("destinations");
                      try {
                        window.history.pushState({ type: "tab", tab: "destinations" }, "", "#/tab/destinations");
                      } catch {}
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
                    title="All Curated Destinations & Photography"
                  >
                    <Layers className="size-3 text-primary" />
                    <span>All Destinations</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Select a state to explore its places without losing your bearings.
              </p>

              <ExplorerShell
                places={places}
                stateId={panelStateId}
                onSelectState={handleSelectStateFromMap}
                onSelectPlace={(place) => handleSelectPlace(place, "Back to Map")}
                selectedRegion={selectedRegion}
                onSelectRegion={region => { setSelectedRegion(region); setPanelStateId(null); setMapView(DEFAULT_MAP_VIEW); }}
                categoryFilter={categoryFilter}
                mapView={mapView} onMapViewChange={setMapView}
                panelView={panelView} onPanelViewChange={setPanelView}
                onClose={closeStatePreview} onOpenFullGuide={handleOpenFullStateGuide}
              />
            </section>

            {/* Featured Wonders Carousel / Grid */}
            <section className="home-section space-y-7" aria-labelledby="highlights-heading">
              <div className="flex flex-wrap items-end justify-between gap-4 pb-3">
                <div>
                  <p className="eyebrow flex items-center gap-1.5 text-primary">
                    <Sparkles className="size-3.5" /> Curators&apos; Pick
                  </p>
                  <h2 id="highlights-heading" className="section-heading mt-3">Some places stay with you.</h2>
                </div>
                <button
                  onClick={() => handleSelectTab("destinations")}
                  className="brand-button brand-button-secondary group"
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

            <section className="journey-panel home-section grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center" aria-labelledby="journey-heading">
              <div>
                <p className="eyebrow mb-3 text-primary">From inspiration to itinerary</p>
                <h2 id="journey-heading" className="section-heading">Make it your journey.</h2>
                <p className="section-copy">Save the places that move you, build a trip around your interests, or let Yatra help you find a starting point.</p>
              </div>
              <div className="flex flex-col gap-3 sm:items-start lg:items-end">
                <button onClick={() => handleSelectTab("planner")} className="brand-button brand-button-primary"><Compass className="size-4" /> Plan a trip <ArrowRight className="size-4" /></button>
                <button onClick={() => handleAskYatra("Help me plan a trip to India based on my interests and the time I have available.")} className="brand-button brand-button-secondary"><Sparkles className="size-4 text-primary" /> Find inspiration with Yatra</button>
                <button onClick={() => handleSelectTab("guides")} className="min-h-11 text-sm text-muted-foreground underline underline-offset-4 hover:text-primary">Explore local tour guides</button>
              </div>
            </section>
          </main>
        )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Yatra Floating India Travel Chatbot */}
      <YatraChatbot
        places={places}
        onSelectPlace={(p) => handleSelectPlace(p, "Back to Travel Chat")}
        onSelectState={handleOpenFullStateGuide}
        initialPrompt={chatInitialPrompt}
        onClearInitialPrompt={() => setChatInitialPrompt(null)}
      />

      {/* Global Footer */}
      <Footer onSelectState={handleOpenFullStateGuide} onDataRefreshed={refreshDestinations} />

      </div>
      {/* Cinematic Monument Silhouette Morph Intro Animation */}
      <AnimatePresence>
        {showIntro && (
          <IntroAnimationSketch onFinished={handleIntroFinished} />
        )}
      </AnimatePresence>

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <BhramanApp />
      </AuthProvider>
    </MotionConfig>
  );
}


