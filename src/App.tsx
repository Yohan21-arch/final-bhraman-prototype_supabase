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
import { TourGuidesView } from "@/components/TourGuidesView";
import { HeroSlideshow } from "@/components/HeroSlideshow";
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
      if (VALID_NAV_TABS.includes(tab)) {
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
        const tabPart = hash.replace("#/tab/", "");
        if (tabPart === "gallery" || tabPart === "destinations/gallery") {
          setActiveTab("destinations");
          setDestinationSubView("gallery");
          setActivePlace(null);
          setActiveState(null);
          return;
        }
        const tab = tabPart as NavTab;
        if (VALID_NAV_TABS.includes(tab)) {
          if (tab === "gallery") {
            setActiveTab("destinations");
            setDestinationSubView("gallery");
          } else {
            setActiveTab(tab);
          }
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
          label = destinationSubView === "gallery"
            ? "Back to Photo Gallery"
            : gridFilters.searchQuery.trim()
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
      {/* Top Navigation */}
      <Navbar
        places={places}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === "gallery") {
            setActiveTab("destinations");
            setDestinationSubView("gallery");
          } else {
            setActiveTab(tab);
          }
          setActivePlace(null);
          setActiveState(null);
          setNavStack([]);
          try {
            window.history.pushState(
              { type: "tab", tab },
              "",
              tab === "gallery" ? "#/tab/destinations/gallery" : `#/tab/${tab}`
            );
          } catch {
            // ignore
          }
        }}
        onSelectPlace={(place) => handleSelectPlace(place, "Back to Search")}
        onSelectState={handleOpenFullStateGuide}
        onSurpriseMe={handleSurpriseMe}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Dynamic View Switching with Slide Change Animation */}
      <div className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeViewKey}
            initial={{ opacity: 0, scale: 0.96, x: -40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{
              opacity: 0,
              scale: 0.92,
              x: 90,
              transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
          <main className="mx-auto w-full max-w-[1536px] px-4 pb-24 pt-6 md:px-6 lg:px-8">
            {/* Cinematic Destination Slideshow Hero Header with integrated search */}
            <HeroSlideshow
              places={places}
              onSelectPlace={(place) => handleSelectPlace(place, "Back to Hero Search")}
              onSelectState={handleOpenFullStateGuide}
            />

            {/* Interactive Cartography Map Section */}
            <section className="space-y-4 mb-16">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="eyebrow flex items-center gap-1.5 text-primary">
                    <MapPin className="size-3.5" /> Interactive Explorer
                  </p>
                  <h2 className="display-font text-2xl md:text-3xl font-extrabold text-foreground">
                    Tap Any State to Reveal Curated Places
                  </h2>
                </div>

                {/* Quick Map & Destination Search Bar */}
                <div className="w-full sm:w-80 lg:w-96">
                  <SearchBar
                    places={places}
                    onSelectPlace={(place) => handleSelectPlace(place, "Back to Map")}
                    onSelectState={handleOpenFullStateGuide}
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
                Pan & zoom freely or click state outlines for instant drawer guides
              </p>

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
          </motion.div>
        </AnimatePresence>
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
        places={places}
        onSelectPlace={(p) => handleSelectPlace(p, "Back to Travel Chat")}
        onSelectState={handleOpenFullStateGuide}
        initialPrompt={chatInitialPrompt}
        onClearInitialPrompt={() => setChatInitialPrompt(null)}
      />

      {/* Global Footer */}
      <Footer onSelectState={handleOpenFullStateGuide} onDataRefreshed={refreshDestinations} />

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
    <AuthProvider>
      <BhramanApp />
    </AuthProvider>
  );
}
