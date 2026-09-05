import { useState } from "react";
import {
  ShieldCheck,
  Award,
  Star,
  Users,
  Clock,
  DollarSign,
  Languages,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Headphones,
  Calculator,
} from "lucide-react";
import type { Place, TourGuide } from "@/types";
import { getGuidesForPlace, OFFICIAL_ASI_RATES } from "@/data/tour-guides";
import { calculateGuideFee } from "@/lib/guide-pricing";
import { cn } from "@/lib/utils";

interface PlaceTourGuideSectionProps {
  place: Place;
  onSelectGuide?: (guide: TourGuide) => void;
  onAskYatra?: (prompt: string) => void;
}

export function PlaceTourGuideSection({ place, onSelectGuide, onAskYatra }: PlaceTourGuideSectionProps) {
  const guides = getGuidesForPlace(place.id);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTariffDetails, setShowTariffDetails] = useState(false);

  // Calculator State
  const [groupSize, setGroupSize] = useState<number>(2);
  const [duration, setDuration] = useState<"halfDay" | "fullDay">("halfDay");
  const [foreignLang, setForeignLang] = useState(false);

  const estimate = calculateGuideFee({
    groupSize,
    duration,
    foreignLanguage: foreignLang,
    metroConveyance: false,
    outstation: false,
  });

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-card/60 p-6 md:p-8 shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <p className="eyebrow flex items-center gap-1.5 text-primary font-semibold">
            <ShieldCheck className="size-3.5" /> Verified Tour Guides & Official Tariffs
          </p>
          <h3 className="display-font text-2xl font-bold text-foreground">
            Tour Guide & Travel Price Ratings for {place.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/60 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-xs"
          >
            <Calculator className="size-3.5" />
            <span>{showCalculator ? "Hide Fee Estimator" : "Calculate Guide Fee"}</span>
          </button>
        </div>
      </div>

      {/* Official Government / ASI Tariff Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Award className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                Official ASI & Ministry of Tourism Approved Guide Rates
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Fixed 2024-2025 Tariff
                </span>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Regulated by the agreement between Tourist Guides Federation of India & IATO.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTariffDetails(!showTariffDetails)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            <span>{showTariffDetails ? "Collapse Tariff Grid" : "View Full Government Rate Card"}</span>
            {showTariffDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>

        {/* Quick Rate Highlights */}
        <div className="grid gap-3 sm:grid-cols-3 pt-1">
          <div className="rounded-lg border border-border/70 bg-background/80 p-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">Half-Day (up to 4 hrs)</p>
            <p className="mt-1 text-lg font-extrabold text-foreground">
              ₹2,050 <span className="text-xs font-normal text-muted-foreground">(1-5 pax)</span>
            </p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Price Rating: $$ (Moderate)</p>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/80 p-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">Full-Day (4 to 8 hrs)</p>
            <p className="mt-1 text-lg font-extrabold text-foreground">
              ₹2,500 <span className="text-xs font-normal text-muted-foreground">(1-5 pax)</span>
            </p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Price Rating: $$ (Best Value)</p>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/80 p-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Headphones className="size-3" /> Audio Guide Alternative
            </p>
            <p className="mt-1 text-lg font-extrabold text-foreground">
              ₹150 - ₹250 <span className="text-xs font-normal text-muted-foreground">per device</span>
            </p>
            <p className="text-[10px] text-primary font-medium mt-0.5">Price Rating: $ (Budget Solo)</p>
          </div>
        </div>

        {/* Expandable Tariff Grid */}
        {showTariffDetails && (
          <div className="mt-3 border-t border-primary/20 pt-3 space-y-2.5 text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] text-muted-foreground uppercase">
                    <th className="py-2 pr-4">Party Size</th>
                    <th className="py-2 px-4">Half-Day (≤4h)</th>
                    <th className="py-2 px-4">Full-Day (≤8h)</th>
                    <th className="py-2 pl-4">Allowance / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {OFFICIAL_ASI_RATES.tiers.map((t, idx) => (
                    <tr key={idx} className="hover:bg-background/40">
                      <td className="py-2 pr-4 font-semibold text-foreground">{t.groupSize}</td>
                      <td className="py-2 px-4 font-bold text-foreground">₹{t.halfDayInr.toLocaleString("en-IN")}</td>
                      <td className="py-2 px-4 font-bold text-foreground">₹{t.fullDayInr.toLocaleString("en-IN")}</td>
                      <td className="py-2 pl-4 text-muted-foreground text-[11px]">{t.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg bg-background/60 p-2.5 text-[11px] text-muted-foreground space-y-1">
              <p>
                <strong className="text-foreground">Language Allowance:</strong> +₹600 half-day / +₹800 full-day for French, German, Spanish, Japanese, Russian, etc.
              </p>
              <p>
                <strong className="text-foreground">Tipping Guideline:</strong> {OFFICIAL_ASI_RATES.tippingEtiquette}.
              </p>
              <p>
                <strong className="text-foreground">Security Advice:</strong> Always check for the Ministry of Tourism laminated card with green/blue neck lanyard.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Guide Cost Calculator Panel */}
      {showCalculator && (
        <div className="rounded-xl border border-border/80 bg-background/90 p-5 shadow-inner space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calculator className="size-4 text-primary" /> Live Tour Guide Fee Calculator
            </h4>
            <span className="text-[11px] text-muted-foreground">Estimate official tariff in INR</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Group Size */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Travelers: <span className="text-primary">{groupSize} Person{groupSize > 1 ? "s" : ""}</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>1 (Solo)</span>
                <span>5 (Family)</span>
                <span>14 (Group)</span>
                <span>20+</span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Duration</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDuration("halfDay")}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer",
                    duration === "halfDay"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  Half-Day (4h)
                </button>
                <button
                  type="button"
                  onClick={() => setDuration("fullDay")}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer",
                    duration === "fullDay"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  Full-Day (8h)
                </button>
              </div>
            </div>

            {/* Foreign Language */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Foreign Language</label>
              <button
                type="button"
                onClick={() => setForeignLang(!foreignLang)}
                className={cn(
                  "w-full rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer",
                  foreignLang
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {foreignLang ? "✓ Foreign Language Guide" : "English / Hindi Guide"}
              </button>
            </div>
          </div>

          {/* Result Output Bar */}
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Estimated Official Guide Tariff:</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-primary">
                  ₹{estimate.totalOfficialFee.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-muted-foreground">
                  (₹{estimate.perPersonCost.toLocaleString("en-IN")}/person for {groupSize} pax)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Customary tip recommendation: ₹{estimate.tipRange[0]} - ₹{estimate.tipRange[1]}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-xs font-bold text-foreground border border-border shadow-xs">
                Price Rating: <span className="text-emerald-600">{estimate.priceRatingTier} ({estimate.tierLabel})</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Tour Guides Cards for this destination */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Users className="size-4 text-primary" /> Recommended Certified Guides for {place.name}
        </h4>

        {guides.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center bg-background/50">
            <p className="text-xs text-muted-foreground">
              Official ASI guides for {place.name} can be hired directly at the monument ticket counter booth under standard Ministry rates (₹2,050 half-day).
            </p>
            {onAskYatra && (
              <button
                onClick={() =>
                  onAskYatra(
                    `How do I hire an official certified tour guide for ${place.name}, what are the rates and where is the booth?`
                  )
                }
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Ask Yatra how to book a guide here →
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className="group rounded-xl border border-border/80 bg-background/90 p-5 shadow-xs transition-all hover:border-primary/60 hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={guide.avatar}
                      alt={guide.name}
                      referrerPolicy="no-referrer"
                      className="size-14 rounded-full object-cover border-2 border-primary/40 shadow-xs"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h5 className="font-bold text-foreground text-sm truncate">{guide.name}</h5>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {guide.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{guide.title}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center text-amber-500 font-bold">
                          <Star className="size-3.5 fill-amber-500 mr-1" />
                          <span>{guide.rating}</span>
                        </div>
                        <span className="text-muted-foreground">({guide.reviewCount} reviews)</span>
                        <span className="text-muted-foreground">• {guide.experienceYears} yrs exp</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {guide.bio}
                  </p>

                  {/* Languages */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Languages className="size-3 text-muted-foreground" />
                    {guide.languages.map((l, i) => (
                      <span key={i} className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-foreground">
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* Pricing Details Card */}
                  <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Official Guide Tariff:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {guide.pricing.priceRating} ({guide.pricing.priceTierName})
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Half-Day Tour: <strong>₹{guide.pricing.halfDayInr.toLocaleString("en-IN")}</strong></span>
                      <span>Full-Day Tour: <strong>₹{guide.pricing.fullDayInr.toLocaleString("en-IN")}</strong></span>
                    </div>
                    {guide.pricing.audioGuideAlternativeInr ? (
                      <p className="text-[10px] text-muted-foreground">
                        Audio guide alternative: ₹{guide.pricing.audioGuideAlternativeInr}/device
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-muted-foreground truncate">
                    <CheckCircle2 className="size-3 text-emerald-500 inline mr-1" />
                    {guide.bookingType}
                  </div>

                  {onAskYatra && (
                    <button
                      onClick={() =>
                        onAskYatra(
                          `Can you provide details on hiring ${guide.name} (${guide.title}) for visiting ${place.name}, including booking contacts and availability tips?`
                        )
                      }
                      className="rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-xs"
                    >
                      Booking Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
