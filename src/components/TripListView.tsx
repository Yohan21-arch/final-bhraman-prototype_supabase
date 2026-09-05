import { useState, useMemo } from "react";
import {
  Bookmark,
  Trash2,
  Share2,
  Download,
  Calendar,
  Sparkles,
  ArrowLeft,
  Check,
  MapPin,
  FileText
} from "lucide-react";
import { useTripList } from "@/lib/trip-list";
import { placeById } from "@/data/places";
import { stateById } from "@/data/states";
import type { Place, StateData } from "@/types";
import { PlaceImage } from "@/components/PlaceCard";
import { cn } from "@/lib/utils";

export function TripListView({
  onSelectPlace,
  onSelectState,
  onBack,
}: {
  onSelectPlace: (place: Place) => void;
  onSelectState: (state: StateData) => void;
  onBack: () => void;
}) {
  const { items, remove, clear, updateNotes, setDay } = useTripList();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [exported, setExported] = useState(false);

  // Group saved items with their place details
  const savedPlaces = useMemo(() => {
    return items
      .map((item) => {
        const place = placeById(item.placeId);
        return place ? { ...item, place } : null;
      })
      .filter((item): item is { placeId: string; addedAt: number; notes?: string; customDay?: number; place: Place } => item !== null);
  }, [items]);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedPlaces, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bhraman-itinerary-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-28 pt-8 md:px-8">
      <button
        onClick={onBack}
        className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary mb-6"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Explorer</span>
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-6">
        <div>
          <p className="eyebrow flex items-center gap-1.5 text-primary">
            <Bookmark className="size-3.5" /> Curated Travel Wishlist
          </p>
          <h1 className="display-font mt-1 text-3xl font-extrabold text-foreground sm:text-4xl">
            My Bhraman Itinerary
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {savedPlaces.length} {savedPlaces.length === 1 ? "destination" : "destinations"} saved for your journey across India
          </p>
        </div>

        {savedPlaces.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:border-primary transition-colors"
            >
              {exported ? <Check className="size-3.5 text-green-400" /> : <Download className="size-3.5" />}
              <span>{exported ? "Exported" : "Export JSON"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:border-primary transition-colors"
            >
              <FileText className="size-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear your saved itinerary?")) {
                  clear();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-3.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="size-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {savedPlaces.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
            <Bookmark className="size-7" />
          </div>
          <h2 className="display-font mt-4 text-2xl font-bold text-foreground">
            Your travel list is empty
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs md:text-sm text-muted-foreground">
            Explore India&apos;s iconic monuments and offbeat hidden gems on the map, and click the bookmark icon to save places to your custom travel list.
          </p>
          <button
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold text-primary-foreground transition-all hover:opacity-90 shadow-lg"
          >
            <Sparkles className="size-4" />
            <span>Discover Places Now</span>
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {savedPlaces.map(({ place, notes, customDay }, index) => {
            const state = stateById(place.state);
            const isEditing = editingId === place.id;

            return (
              <div
                key={place.id}
                className="group relative flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Left Thumbnail & Info */}
                <div
                  onClick={() => onSelectPlace(place)}
                  className="flex flex-1 cursor-pointer items-center gap-4"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <PlaceImage place={place} className="h-full w-full object-cover" />
                    <span className="absolute left-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-[10px] font-bold text-foreground">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                        {place.category === "hidden" ? "Hidden Gem" : "Iconic"}
                      </span>
                      {state && (
                        <span className="text-[10px] text-muted-foreground">
                          · {state.name}
                        </span>
                      )}
                    </div>
                    <h3 className="display-font text-lg font-bold text-foreground transition-colors group-hover:text-primary truncate">
                      {place.name}
                    </h3>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {place.shortDesc}
                    </p>

                    {/* Notes Preview */}
                    {notes && !isEditing && (
                      <p className="mt-1 text-xs italic text-primary/80 line-clamp-1">
                        &ldquo;{notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions & Day Assignment */}
                <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3 sm:border-t-0 sm:pt-0">
                  {/* Day Picker */}
                  <select
                    value={customDay || ""}
                    onChange={(e) => setDay(place.id, e.target.value ? Number(e.target.value) : undefined)}
                    className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="">Any Day</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                      <option key={d} value={d}>
                        Day {d}
                      </option>
                    ))}
                  </select>

                  {/* Note Toggle */}
                  <button
                    onClick={() => {
                      if (isEditing) {
                        updateNotes(place.id, activeNoteText);
                        setEditingId(null);
                      } else {
                        setActiveNoteText(notes || "");
                        setEditingId(place.id);
                      }
                    }}
                    className="rounded-lg border border-border bg-secondary/80 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                  >
                    {isEditing ? "Save Note" : notes ? "Edit Note" : "+ Add Note"}
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => remove(place.id)}
                    title="Remove from list"
                    className="rounded-lg border border-border/60 p-1.5 text-muted-foreground hover:border-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Expanded Inline Note Input */}
                {isEditing && (
                  <div className="w-full pt-3 sm:hidden">
                    <textarea
                      value={activeNoteText}
                      onChange={(e) => setActiveNoteText(e.target.value)}
                      placeholder="Add personal notes..."
                      className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
