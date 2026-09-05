import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Bookmark, BookmarkCheck, Sparkles, MapPin } from "lucide-react";
import type { Place } from "@/types";
import { stateById } from "@/data/states";
import { useTripList } from "@/lib/trip-list";
import { cn } from "@/lib/utils";

export interface PlaceCardProps {
  place: Place;
  onSelect?: (place: Place) => void;
  key?: string | number;
}

export function PlaceImage({
  place,
  className,
  priority = false,
}: {
  place: Place;
  className?: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);
  const src = place.images && place.images[0];

  if (!src || error) {
    const stateObj = stateById(place.state);
    return (
      <div
        className={cn(
          "grain flex flex-col items-center justify-center bg-secondary/90 text-center p-4 border border-dashed border-border/80",
          className
        )}
        aria-label={`Placeholder for ${place.name}`}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          <MapPin className="size-5" />
        </div>
        <span className="display-font text-base font-semibold text-foreground tracking-tight line-clamp-1 px-2">
          {place.name}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
          {stateObj?.name}
        </span>
        <span className="mt-2 inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
          Authentic photo unavailable &bull; Verified Placeholder
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${place.name} in ${stateById(place.state)?.name || "India"}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={cn("object-cover", className)}
    />
  );
}

export function PlaceCard({
  place,
  onSelect,
}: PlaceCardProps) {
  const { has, toggle } = useTripList();
  const saved = has(place.id);
  const state = stateById(place.state);

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-all hover:border-primary/60 hover:shadow-xl"
    >
      <div
        onClick={() => onSelect?.(place)}
        className="relative aspect-[16/10] overflow-hidden cursor-pointer bg-secondary"
      >
        <PlaceImage
          place={place}
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/20" />

        {place.category === "hidden" ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-primary backdrop-blur-md">
            <Sparkles className="size-3 text-primary" /> Off the beaten path
          </span>
        ) : (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground/80 backdrop-blur-md">
            Iconic Wonder
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(place.id);
          }}
          aria-label={saved ? "Remove from list" : "Save to list"}
          className={cn(
            "absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full border backdrop-blur-md transition-all",
            saved
              ? "border-primary bg-primary text-primary-foreground shadow-md"
              : "border-border/80 bg-background/70 text-foreground/80 hover:border-primary hover:text-primary"
          )}
        >
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
        </button>

        {state && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] font-medium text-foreground/90 drop-shadow-sm">
            <MapPin className="size-3 text-primary" />
            <span>{state.name}</span>
          </div>
        )}
      </div>

      <div
        onClick={() => onSelect?.(place)}
        className="flex flex-1 flex-col justify-between p-4 cursor-pointer"
      >
        <div className="space-y-1.5">
          <h3 className="display-font text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {place.name}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {place.shortDesc}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
          {place.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/60 bg-secondary/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {place.tags.length > 3 && (
            <span className="rounded-full px-1.5 py-0.5 text-[9px] text-muted-foreground/70">
              +{place.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
