import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAccountService } from "@/services/userAccountService";
import type { TravelPlan, Place } from "@/types";
import {
  Compass,
  Calendar,
  Plus,
  Trash2,
  MapPin,
  Sparkles,
  ArrowRight,
  Loader2,
  CalendarDays,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { NavTab } from "@/components/Navbar";

export function MyTripsView({
  onSelectTab,
  places,
}: {
  onSelectTab: (tab: NavTab) => void;
  places?: Place[];
}) {
  const { user } = useAuth();
  const tripOpener = useRef<HTMLElement | null>(null);
  const openTripDialog = () => { tripOpener.current = document.activeElement as HTMLElement; setFormError(""); setModalOpen(true); };
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await userAccountService.getTravelPlans(user?.id || "");
      setPlans(data);
    } catch (err) {
      console.warn("Failed to load travel plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [user]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setFormError("");
    if (startDate && endDate && endDate < startDate) { setFormError("Choose an end date on or after your start date."); return; }
    setIsSubmitting(true);
    const created = await userAccountService.createTravelPlan(user?.id || "guest", {
      name: name.trim(),
      description: description.trim(),
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      destinations: [],
    }).catch(() => null);

    setIsSubmitting(false);
    if (created) {
      setPlans((prev) => [created, ...prev]);
      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setModalOpen(false);
    } else { setFormError("We couldn’t save this trip. Please try again."); }
  };

  const handleDeletePlan = async (planId: string) => {
    await userAccountService.deleteTravelPlan(user?.id || "guest", planId);
    setPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Compass className="size-5" />
            </div>
            <h1 className="display-font text-2xl md:text-3xl font-bold text-foreground">
              My Travel Plans
            </h1>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {plans.length}
            </span>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Manage your custom itineraries, travel dates, and expedition routes across India.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab("planner")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span>Itinerary Planner</span>
          </button>
          <button
            type="button"
            onClick={openTripDialog}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>New Trip Plan</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-border/80 bg-card/60 p-6 space-y-3"
            >
              <div className="h-5 w-1/3 rounded bg-muted/80" />
              <div className="h-4 w-2/3 rounded bg-muted/60" />
              <div className="h-4 w-1/4 rounded bg-muted/40" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <CalendarDays className="size-7" />
          </div>
          <h3 className="display-font text-lg font-semibold text-foreground">
            No travel plans created yet
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">
            Design your upcoming journey to Ladakh, Rajasthan, Kerala, or the Northeast using the draft itinerary planner or by creating a custom trip plan.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={openTripDialog}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Create First Trip</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab("planner")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>Launch Trip Planner</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="display-font text-lg font-bold text-foreground line-clamp-1">
                    {plan.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                    title="Delete plan"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {plan.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {plan.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  <span>
                    {plan.start_date
                      ? `${new Date(plan.start_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - ${
                          plan.end_date
                            ? new Date(plan.end_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                            : "Open ended"
                        }`
                      : "Dates flexible"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTab("planner")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <span>Open Planner</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Trip Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onCloseAutoFocus={event => { event.preventDefault(); tripOpener.current?.focus(); }} className="account-trip-dialog sm:max-w-md rounded-2xl border-border/80 bg-background/98 p-6 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="display-font text-xl font-bold text-foreground flex items-center gap-2">
              <Compass className="size-5 text-primary" />
              <span>Create New Trip Plan</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the outline for your next journey through India.
            </DialogDescription>
          </DialogHeader>

          {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
          <form onSubmit={handleCreatePlan} className="space-y-4 pt-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Trip Name *
              </label>
              <input
                type="text"
                required
                aria-label="Trip name" value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Forts of Rajasthan"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Description / Goals
              </label>
              <textarea
                rows={3}
                aria-label="Description or goals" value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Exploring ancient stepwells, local Mewari cuisine, and palace architecture..."
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Start Date
                </label>
                <input
                  type="date"
                  aria-label="Start date" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  End Date
                </label>
                <input
                  type="date"
                  aria-label="End date" min={startDate || undefined} value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Create Trip</span>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
