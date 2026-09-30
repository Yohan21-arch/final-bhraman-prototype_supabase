import { useState } from "react";
import { Bookmark, BookmarkCheck, MapPin, ArrowUpRight } from "lucide-react";
import type { Place } from "@/types";
import { stateById } from "@/data/states";
import { useTripList } from "@/lib/trip-list";
import { useAuth } from "@/contexts/AuthContext";
import { userAccountService } from "@/services/userAccountService";
import { DestinationPhoto } from "@/components/DestinationPhoto";
import { cn } from "@/lib/utils";

export interface PlaceCardProps {
  place: Place; onSelect?: (place: Place) => void; key?: string | number; featured?: boolean;
}
export function PlaceImage({ place, className, priority = false }: { place: Place; className?: string; priority?: boolean }) {
  return <DestinationPhoto sources={place.images || []} alt={place.name + " in " + (stateById(place.state)?.name || "India")} className={className} priority={priority} />;
}
export function PlaceCard({ place, onSelect, featured = false }: PlaceCardProps) {
  const { user } = useAuth();
  const { has, toggle } = useTripList();
  const saved = has(place.id);
  const state = stateById(place.state);
  const [saveError, setSaveError] = useState("");
  const handleSave = async () => {
    toggle(place.id);
    setSaveError("");
    if (user) {
      try {
        if (!saved) await userAccountService.addSavedDestination(user.id, place.id);
        else await userAccountService.removeSavedDestination(user.id, place.id);
      } catch { setSaveError("Saved on this device. Cloud sync is unavailable."); }
    }
  };
  return <article className={cn("destination-card", featured && "destination-card--feature")}>
    <div className="destination-card-photo">
      <PlaceImage place={place} className="h-full w-full" />
      <span className="destination-card-category">{place.category === "hidden" ? "Hidden gem" : "Iconic wonder"}</span>
    </div>
    <div className="destination-card-copy">
      <p className="destination-card-state"><MapPin className="size-3 shrink-0" aria-hidden="true" />{state?.name || place.state}{featured && <span className="ml-auto">In focus</span>}</p>
      <h3 className="display-font"><button id={"place-card-" + place.id} className="destination-card-link" onClick={() => onSelect?.(place)}>{place.name}<ArrowUpRight aria-hidden="true" className="size-4 shrink-0" /></button></h3>
      <p className="destination-card-description">{place.shortDesc}</p>
      <p className="destination-card-tags">{place.tags.slice(0, 3).join(" · ")}{place.tags.length > 3 && <span aria-label={place.tags.slice(3).join(", ")}> +{place.tags.length - 3}</span>}</p>
      {saveError && <p role="status" className="mt-2 text-xs text-muted-foreground">{saveError}</p>}
    </div>
    <button onClick={handleSave} aria-label={(saved ? "Remove from list: " : "Save to list: ") + place.name} aria-pressed={saved} className={cn("destination-card-save", saved && "is-saved")}>{saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}</button>
  </article>;
}

