import { useState, type ComponentType } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Car,
  ShieldCheck,
  CreditCard,
  UtensilsCrossed,
  Clock,
  Sparkles,
  Camera,
  Shirt,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Place, StateData } from "@/types";
import { cn } from "@/lib/utils";

interface LocalTravelTipsProps {
  place: Place;
  state?: StateData;
  onAskYatra?: (prompt: string) => void;
  defaultExpanded?: boolean;
}

interface TipCategory {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  tips: {
    heading: string;
    description: string;
    type?: "standard" | "highlight" | "caution";
  }[];
}

export function LocalTravelTips({
  place,
  state,
  onAskYatra,
  defaultExpanded = true,
}: LocalTravelTipsProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const tags = place.tags || [];
  const isSpiritual = tags.includes("Spiritual");
  const isHighAltitude = tags.includes("High Altitude") || tags.includes("Trek");
  const isHeritage = tags.includes("Heritage") || tags.includes("Architecture");
  const isBeach = tags.includes("Beach");
  const isWildlife = tags.includes("Wildlife");

  // Dynamically tailor tips based on place tags, category, and state/region
  const transitTips = [
    {
      heading: "Local Commute & Cabs",
      description:
        place.howToReach.includes("taxi") || place.howToReach.includes("cab")
          ? place.howToReach
          : `For local sightseeing in ${place.name}, pre-booked taxis and auto-rickshaws are the most reliable option. In major cities, Uber/Ola work well; in hill stations and heritage towns, standard government taxi unions offer fixed tariff cards.`,
      type: "standard" as const,
    },
    {
      heading: isHighAltitude ? "Mountain Terrain & Vehicles" : "Auto-rickshaws & Meters",
      description: isHighAltitude
        ? "For steep mountain routes and high passes, hire an experienced local 4x4 or high-clearance SUV. Self-driving on icy or gravel curves requires caution."
        : "Always negotiate and agree upon the fare before boarding auto-rickshaws if the meter isn't running, or use prepaid booth stands at railway stations.",
      type: "standard" as const,
    },
  ];

  const customsTips = [
    {
      heading: isSpiritual || isHeritage ? "Sacred Attire & Footwear" : "Modest & Respectful Dress",
      description: isSpiritual
        ? "Dress modestly with shoulders and knees covered. Remove footwear before entering sanctums and shrines; socks are recommended during hot afternoons on stone courtyards."
        : "When visiting local communities, monuments, and rural areas, comfortable and modest cotton clothing is universally welcomed.",
      type: "highlight" as const,
    },
    {
      heading: "Photography Etiquette",
      description: isWildlife
        ? "Turn off camera flash completely during jungle safaris to avoid startling animals. Monopods and telephoto lenses are allowed in most safari zones."
        : isSpiritual
        ? "Photography is generally prohibited inside the innermost sanctum (Garbhagriha). Always ask permission before photographing local residents or priests."
        : "Tripods and drones usually require prior ASI (Archaeological Survey of India) permit tickets at major heritage complexes.",
      type: "standard" as const,
    },
    {
      heading: "Right-Hand Custom & Greetings",
      description:
        "A warm 'Namaste' with palms pressed together is warmly appreciated across India. Use your right hand when offering money, accepting prasad (temple blessings), or passing food.",
      type: "standard" as const,
    },
  ];

  const paymentsTips = [
    {
      heading: "UPI & Digital Payments",
      description:
        "UPI (Google Pay, PhonePe, Paytm) is accepted almost universally across India—from street tea vendors to luxury boutiques. Keep small cash denominations (₹10, ₹20, ₹50, ₹100) for rural stalls, shoe counters, and toll booths.",
      type: "highlight" as const,
    },
    {
      heading: "Bazaars & Souvenir Bargaining",
      description:
        "Bargaining is customary and friendly in unmetered local markets and handicraft street bazaars. In government emporiums (e.g. state handlooms) prices are fixed.",
      type: "standard" as const,
    },
    {
      heading: "Tipping Norms",
      description:
        "In sit-down restaurants, a 5–10% tip is standard if a service charge is not already included on the bill. For heritage guides and safari naturalists, ₹300–₹500 is customary.",
      type: "standard" as const,
    },
  ];

  const timingTips = [
    {
      heading: "Golden Hours & Crowds",
      description:
        place.category === "iconic"
          ? "Arrive right at opening time (typically 6:00 AM or 8:30 AM) to experience the site before tour buses arrive and enjoy the best light for photography."
          : "Early mornings and late afternoons provide pleasant temperatures and calm, uncrowded exploration.",
      type: "standard" as const,
    },
    {
      heading: isHighAltitude ? "Altitude & Acclimatization" : "Hydration & Sun Protection",
      description: isHighAltitude
        ? "Take it easy on day one. Drink 3–4 liters of water daily, avoid strenuous uphill sprints, and carry ginger tea or electrolytes."
        : "Drink sealed bottled or RO-purified water. Carry sunscreen, a light hat, and sunglasses, especially during mid-day stone fort explorations.",
      type: isHighAltitude ? ("caution" as const) : ("standard" as const),
    },
  ];

  const categories: TipCategory[] = [
    {
      id: "transit",
      title: "Transit & Mobility",
      icon: Car,
      tips: transitTips,
    },
    {
      id: "customs",
      title: "Local Customs & Etiquette",
      icon: ShieldCheck,
      badge: "Important",
      tips: customsTips,
    },
    {
      id: "money",
      title: "UPI, Cash & Shopping",
      icon: CreditCard,
      tips: paymentsTips,
    },
    {
      id: "timing",
      title: "Timings & Safety",
      icon: Clock,
      tips: timingTips,
    },
  ];

  const displayedCategories =
    activeCategory === "all"
      ? categories
      : categories.filter((c) => c.id === activeCategory);

  return (
    <section
      id="local-travel-tips-section"
      className="overflow-hidden rounded-2xl border border-primary/30 bg-card/90 shadow-lg backdrop-blur-sm transition-all"
    >
      {/* Collapsible Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="local-travel-tips-content"
        className="w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors hover:bg-secondary/40 focus:outline-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex size-10 md:size-11 items-center justify-center rounded-xl bg-primary/15 border border-primary/40 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-primary">Quick-Access Field Guide</span>
              <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                Local Insider
              </span>
            </div>
            <h3 className="display-font text-lg md:text-xl font-bold text-foreground">
              Local Travel Tips & Cultural Advice
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs text-muted-foreground">
            {isOpen ? "Click to collapse" : "Click to view practical tips"}
          </span>
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-transform duration-300",
              isOpen ? "rotate-180 bg-primary/20 text-primary border-primary/40" : ""
            )}
          >
            <ChevronDown className="size-4" />
          </div>
        </div>
      </button>

      {/* Collapsible Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id="local-travel-tips-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-border/60 overflow-hidden"
          >
            <div className="p-5 md:p-6 space-y-6">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pb-1">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all",
                    activeCategory === "all"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border/80 bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  All Practical Tips
                </button>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border/80 bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <Icon className="size-3.5" />
                      <span>{cat.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Grid of Tip Categories */}
              <div className="grid gap-5 md:grid-cols-2">
                {displayedCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.id}
                      className="rounded-xl border border-border/80 bg-secondary/30 p-4 md:p-5 space-y-3.5"
                    >
                      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 text-primary" />
                          <h4 className="font-semibold text-sm text-foreground">
                            {category.title}
                          </h4>
                        </div>
                        {category.badge && (
                          <span className="rounded-full bg-primary/15 border border-primary/30 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {category.badge}
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        {category.tips.map((tip, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {tip.type === "caution" ? (
                                <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
                              ) : tip.type === "highlight" ? (
                                <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                              ) : (
                                <span className="size-1.5 rounded-full bg-primary/60 shrink-0" />
                              )}
                              <span className="text-xs font-bold text-foreground">
                                {tip.heading}
                              </span>
                            </div>
                            <p className="pl-4 text-xs leading-relaxed text-foreground/80 font-sans">
                              {tip.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Banner with Yatra Integration */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-primary/40 bg-gradient-to-r from-primary/[0.12] to-secondary/40 p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="size-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Have a specific question about visiting {place.name}?
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Ask Yatra AI for customized dress codes, local train routes, or booking assistance.
                    </p>
                  </div>
                </div>

                {onAskYatra && (
                  <button
                    onClick={() =>
                      onAskYatra(
                        `What are the most essential local travel tips, customs, and transportation advice for visiting ${place.name} in ${state?.name || "India"}?`
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs uppercase tracking-wider font-bold text-primary-foreground hover:opacity-90 transition-all shrink-0 shadow-xs active:scale-95"
                  >
                    <Sparkles className="size-3.5" />
                    <span>Ask Yatra for Tips</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
