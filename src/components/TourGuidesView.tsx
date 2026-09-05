import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Award,
  Star,
  Search,
  Filter,
  Users,
  DollarSign,
  Languages,
  CheckCircle2,
  ExternalLink,
  Calculator,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  Phone,
  HelpCircle,
  X,
  Compass,
} from "lucide-react";
import type { TourGuide, Region, Place } from "@/types";
import { TOUR_GUIDES_DATA, OFFICIAL_ASI_RATES } from "@/data/tour-guides";
import { calculateGuideFee } from "@/lib/guide-pricing";
import { placeById } from "@/data/places";
import { cn } from "@/lib/utils";

interface TourGuidesViewProps {
  onSelectPlace?: (place: Place) => void;
  onAskYatra?: (prompt: string) => void;
}

export function TourGuidesView({ onSelectPlace, onAskYatra }: TourGuidesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedLicense, setSelectedLicense] = useState<string>("all");
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "experience" | "price-asc" | "price-desc">("rating");

  // Selected guide for details modal
  const [activeGuide, setActiveGuide] = useState<TourGuide | null>(null);

  // Live Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcPartySize, setCalcPartySize] = useState<number>(2);
  const [calcDuration, setCalcDuration] = useState<"halfDay" | "fullDay">("halfDay");
  const [calcForeignLang, setCalcForeignLang] = useState(false);
  const [calcConveyance, setCalcConveyance] = useState(false);

  const feeEstimate = calculateGuideFee({
    groupSize: calcPartySize,
    duration: calcDuration,
    foreignLanguage: calcForeignLang,
    metroConveyance: calcConveyance,
    outstation: false,
  });

  const filteredGuides = useMemo(() => {
    return TOUR_GUIDES_DATA.filter((g) => {
      // Region
      if (selectedRegion !== "all" && g.region !== selectedRegion) return false;

      // License
      if (selectedLicense !== "all" && g.licenseType !== selectedLicense) return false;

      // Price Rating
      if (selectedPriceTier !== "all" && g.pricing.priceRating !== selectedPriceTier) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = g.name.toLowerCase().includes(q);
        const matchesLocation = g.location.toLowerCase().includes(q);
        const matchesTitle = g.title.toLowerCase().includes(q);
        const matchesSpecialties = g.specialties.some((s) => s.toLowerCase().includes(q));
        const matchesLanguages = g.languages.some((l) => l.toLowerCase().includes(q));
        const matchesPlaces = g.placesCovered.some((pid) => pid.toLowerCase().includes(q));
        if (!matchesName && !matchesLocation && !matchesTitle && !matchesSpecialties && !matchesLanguages && !matchesPlaces) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "experience") return b.experienceYears - a.experienceYears;
      if (sortBy === "price-asc") return a.pricing.halfDayInr - b.pricing.halfDayInr;
      if (sortBy === "price-desc") return b.pricing.halfDayInr - a.pricing.halfDayInr;
      return 0;
    });
  }, [searchQuery, selectedRegion, selectedLicense, selectedPriceTier, sortBy]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/80 to-secondary/30 p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-xs">
            <ShieldCheck className="size-4" />
            <span>Ministry of Tourism & ASI Verified Directory</span>
          </div>

          <h1 className="display-font text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Tour Guides & Travel Price Ratings
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Connect with verified Archaeological Survey of India (ASI) historians, Himalayan mountain leaders,
            wildlife naturalists, and local heritage curators. View regulated government tariffs, authentic price ratings, and traveler reviews.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-all shadow-md cursor-pointer"
            >
              <Calculator className="size-4" />
              <span>{showCalculator ? "Close Fee Calculator" : "Live Guide Fee Calculator"}</span>
            </button>

            {onAskYatra && (
              <button
                onClick={() =>
                  onAskYatra(
                    "What are the official tour guide rates for visiting Taj Mahal, Hampi, and Jaipur forts, and how do I avoid unlicensed touts?"
                  )
                }
                className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-5 py-2.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="size-4 text-primary" />
                <span>Ask Yatra About Guide Tariffs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Official Rate & Live Calculator Section */}
      {showCalculator && (
        <div className="rounded-2xl border border-primary/30 bg-card p-6 md:p-8 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <h3 className="display-font text-xl font-bold text-foreground flex items-center gap-2">
                <Calculator className="size-5 text-primary" /> Official ASI Guide Fee Estimator
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Calculates approved rates per TGFI & IATO Accord (2023-2025)
              </p>
            </div>
            <button
              onClick={() => setShowCalculator(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">
                Group Size: <span className="text-primary">{calcPartySize} Person{calcPartySize > 1 ? "s" : ""}</span>
              </label>
              <input
                type="range"
                min={1}
                max={25}
                value={calcPartySize}
                onChange={(e) => setCalcPartySize(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>1-5 (Base Tier)</span>
                <span>6-14 (Med Tier)</span>
                <span>15+ (Large Tier)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-2">Tour Duration</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCalcDuration("halfDay")}
                  className={cn(
                    "flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer",
                    calcDuration === "halfDay"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-background text-muted-foreground"
                  )}
                >
                  Half-Day (Up to 4h)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcDuration("fullDay")}
                  className={cn(
                    "flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer",
                    calcDuration === "fullDay"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-background text-muted-foreground"
                  )}
                >
                  Full-Day (Up to 8h)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-2">Options & Allowances</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcForeignLang}
                    onChange={(e) => setCalcForeignLang(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span>Foreign Language (French, German, Spanish, etc. +₹{calcDuration === "halfDay" ? "600" : "800"})</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcConveyance}
                    onChange={(e) => setCalcConveyance(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span>Early/Late Metro Reporting (+₹700)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Breakdown Box */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Total Official Tariff
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-primary">
                  ₹{feeEstimate.totalOfficialFee.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-muted-foreground">
                  (₹{feeEstimate.perPersonCost.toLocaleString("en-IN")} per traveler)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended Customary Tip: ₹{feeEstimate.tipRange[0]} – ₹{feeEstimate.tipRange[1]} (10-15%)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-lg bg-background px-4 py-2 border border-border text-xs">
                <span className="text-muted-foreground">Price Rating: </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {feeEstimate.priceRatingTier} ({feeEstimate.tierLabel})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, monuments, languages..."
              className="w-full rounded-xl border border-border/80 bg-background/90 pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-background/90 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Regions of India</option>
              <option value="north">North India</option>
              <option value="south">South India</option>
              <option value="west">West India</option>
              <option value="east">East India</option>
              <option value="central">Central India</option>
              <option value="northeast">Northeast India</option>
            </select>
          </div>

          {/* License Type Filter */}
          <div>
            <select
              value={selectedLicense}
              onChange={(e) => setSelectedLicense(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-background/90 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Certifications</option>
              <option value="ASI Official">ASI Official Licensed Guides</option>
              <option value="State Tourism Board">State Tourism Board Certified</option>
              <option value="Certified Naturalist">Wilderness & Safari Naturalists</option>
              <option value="Certified Trek Leader">Himalayan Trek Leaders</option>
              <option value="Heritage Walk Curator">Heritage Walk Curators</option>
              <option value="Community Storyteller">Community Indigenous Guides</option>
            </select>
          </div>

          {/* Price Tier Filter */}
          <div>
            <select
              value={selectedPriceTier}
              onChange={(e) => setSelectedPriceTier(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-background/90 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Price Ratings</option>
              <option value="$">$ (Budget: Under ₹1,500)</option>
              <option value="$$">$$ (Moderate: ₹1,500 - ₹3,000)</option>
              <option value="$$$">$$$ (Premium: ₹3,000 - ₹5,000)</option>
              <option value="$$$$">$$$$ (Expedition: ₹5,000+)</option>
            </select>
          </div>
        </div>

        {/* Sub-bar with Sorting and Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
          <p className="text-muted-foreground">
            Showing <strong className="text-foreground">{filteredGuides.length}</strong> certified tour guides
          </p>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Years of Experience</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guide Directory Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="group rounded-2xl border border-border/80 bg-card/90 p-5 shadow-xs transition-all hover:border-primary/70 hover:shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              {/* Top Profile Header */}
              <div className="flex items-start gap-3.5">
                <img
                  src={guide.avatar}
                  alt={guide.name}
                  referrerPolicy="no-referrer"
                  className="size-16 rounded-full object-cover border-2 border-primary/40 shadow-xs"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-foreground text-base truncate">{guide.name}</h4>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {guide.badge}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium truncate">{guide.title}</p>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="size-3.5 fill-amber-500 mr-1" />
                      <span>{guide.rating}</span>
                    </div>
                    <span className="text-muted-foreground">({guide.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Location and License Details */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 text-primary" /> {guide.location}
                </span>
                <span>•</span>
                <span className="font-semibold text-foreground">{guide.experienceYears} Years Exp</span>
                {guide.licenseNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{guide.licenseNumber}</span>
                  </>
                )}
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {guide.bio}
              </p>

              {/* Languages */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Languages className="size-3.5 text-muted-foreground" />
                {guide.languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-foreground"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              {/* Price Rating & Tariffs Box */}
              <div className="rounded-xl border border-border/70 bg-background/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Government/Standard Tariff</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="size-3" /> Price Rating: {guide.pricing.priceRating} ({guide.pricing.priceTierName})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="rounded-lg bg-card/70 p-2 border border-border/60">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Half-Day</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      ₹{guide.pricing.halfDayInr.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-card/70 p-2 border border-border/60">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Full-Day</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      ₹{guide.pricing.fullDayInr.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {guide.pricing.audioGuideAlternativeInr ? (
                  <p className="text-[11px] text-muted-foreground">
                    Audio guide alternative: ₹{guide.pricing.audioGuideAlternativeInr}/device
                  </p>
                ) : null}
              </div>

              {/* Places Covered */}
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Places Guided:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {guide.placesCovered.map((pid) => {
                    const place = placeById(pid);
                    return (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => place && onSelectPlace && onSelectPlace(place)}
                        className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/90 px-2.5 py-0.5 text-[11px] text-foreground hover:border-primary hover:text-primary transition-all cursor-pointer"
                      >
                        <span>{place ? place.name : pid}</span>
                        {place && <ExternalLink className="size-2.5 opacity-60" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
              <div className="text-[11px] text-muted-foreground">
                <CheckCircle2 className="size-3 text-emerald-500 inline mr-1" />
                {guide.bookingType}
              </div>

              <button
                onClick={() => setActiveGuide(guide)}
                className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                Guide Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Guide Details / Booking Modal */}
      {activeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setActiveGuide(null)}
              className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-start gap-4">
              <img
                src={activeGuide.avatar}
                alt={activeGuide.name}
                referrerPolicy="no-referrer"
                className="size-20 rounded-full object-cover border-2 border-primary shadow-md"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="display-font text-xl font-bold text-foreground">{activeGuide.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {activeGuide.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{activeGuide.title}</p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="size-4 fill-amber-500 mr-1" />
                    <span>{activeGuide.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({activeGuide.reviewCount} reviews)</span>
                  <span className="text-muted-foreground">• {activeGuide.experienceYears} Years Experience</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                About & Expertise
              </h4>
              <p className="text-xs text-foreground leading-relaxed">
                {activeGuide.bio}
              </p>
            </div>

            {/* Specialties */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Signature Tour Highlights
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {activeGuide.specialties.map((s, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official Rates & Price Rating Breakdown */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">Regulated Fee Breakdown</h4>
                <span className="text-xs font-extrabold text-emerald-600">
                  {activeGuide.pricing.priceRating} ({activeGuide.pricing.priceTierName})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-background/80 p-2.5 border border-border/70">
                  <span className="text-muted-foreground text-[11px]">Half-Day (Up to 4 hrs):</span>
                  <p className="text-base font-bold text-foreground mt-0.5">
                    ₹{activeGuide.pricing.halfDayInr.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-lg bg-background/80 p-2.5 border border-border/70">
                  <span className="text-muted-foreground text-[11px]">Full-Day (Up to 8 hrs):</span>
                  <p className="text-base font-bold text-foreground mt-0.5">
                    ₹{activeGuide.pricing.fullDayInr.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground space-y-1">
                <p>
                  <strong>Tipping etiquette:</strong> {activeGuide.pricing.tippingGuideline}
                </p>
                <p>
                  <strong>How to hire:</strong> {activeGuide.contactHint}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setActiveGuide(null)}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close
              </button>

              {onAskYatra && (
                <button
                  type="button"
                  onClick={() => {
                    onAskYatra(
                      `I want to book a guided tour with ${activeGuide.name} in ${activeGuide.location}. Can you help plan an itinerary and tell me how to reach the official booking counter?`
                    );
                    setActiveGuide(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="size-3.5" />
                  <span>Plan Tour with Yatra AI</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
