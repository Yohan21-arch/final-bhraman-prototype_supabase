import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAccountService } from "@/services/userAccountService";
import type { BookingRecord } from "@/types";
import {
  CalendarCheck2,
  Ticket,
  Copy,
  Check,
  Sparkles,
  Info,
  Calendar,
  Users,
  Compass,
  MapPin,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { NavTab } from "@/components/Navbar";

export function BookingHistoryView({
  onSelectTab,
  onAskYatra,
}: {
  onSelectTab: (tab: NavTab) => void;
  onAskYatra?: (prompt: string) => void;
}) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await userAccountService.getBookings(user?.id || "");
      setBookings(data);
    } catch (err) {
      console.warn("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const handleCopy = (ref: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ref);
      setCopiedRef(ref);
      setTimeout(() => setCopiedRef(null), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarCheck2 className="size-5" />
            </div>
            <h1 className="display-font text-2xl md:text-3xl font-bold text-foreground">
              Booking History
            </h1>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              Demo / Illustrative
            </span>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Review simulated booking references generated during itinerary planning and guide inquiries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onAskYatra) {
              onAskYatra("Can you help me generate a simulated itinerary booking for visiting Udaipur and Jodhpur?");
            } else {
              onSelectTab("map");
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Sparkles className="size-3.5" />
          <span>Book with Yatra AI</span>
        </button>
      </div>

      {/* Prominent Educational / Demo Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-300">
        <Info className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950 dark:text-amber-200">
            Illustrative / Demo Booking Records
          </p>
          <p className="text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
            Bhraman provides intelligent travel curation and simulated itinerary booking estimates. Real-world payment gateway transactions, official monument tickets (ASI), and commercial hotel vouchers are not processed on this platform. Use these reference records when planning your actual trip with official gate counters or accredited operators.
          </p>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-border/80 bg-card/60 p-6 space-y-3"
            >
              <div className="h-5 w-1/4 rounded bg-muted/80" />
              <div className="h-4 w-1/2 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Ticket className="size-7" />
          </div>
          <h3 className="display-font text-lg font-semibold text-foreground">
            No booking records yet
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">
            When you ask Yatra AI to plan and confirm an illustrative trip, your simulated booking vouchers and reference numbers will appear here automatically.
          </p>
          <button
            type="button"
            onClick={() => {
              if (onAskYatra) {
                onAskYatra("Plan a 3-day trip to Varanasi with official boat tour and temple entry pass.");
              }
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            <span>Generate Demo Booking with Yatra AI</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs hover:border-primary/40 transition-all"
            >
              {/* Card Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Confirmed (Demo)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Type: <strong className="text-foreground">{b.booking_type}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    Ref: <strong className="text-foreground">{b.reference_id}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(b.reference_id)}
                    className="flex size-6 items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Copy reference code"
                  >
                    {copiedRef === b.reference_id ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3 text-primary" />
                    Destination
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {b.destination_name}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3 text-primary" />
                    Dates
                  </span>
                  <p className="text-sm text-foreground">
                    {b.dates || "Flexible / Unscheduled"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="size-3 text-primary" />
                    Travelers
                  </span>
                  <p className="text-sm text-foreground">
                    {b.travelers || "2 Adults"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
