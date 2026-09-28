import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Place } from "@/types";

/** Homepage photography: only fall back to another photo of the same place.
 * The parent can choose a different destination after all its photos fail.
 * Mount with a keyed parent when changing destinations.
 */
export function DiscoveryImage({ place, priority = false, className, onUnavailable, onImageChange }: {
  place: Place;
  priority?: boolean;
  className?: string;
  onUnavailable?: () => void;
  onImageChange?: (index: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const source = place.images[index];
  return (
    <div className={cn("overflow-hidden bg-secondary", className)}>
      {source ? <img key={source} src={source} alt={place.name}
        loading={priority ? "eager" : "lazy"} decoding="async"
        fetchPriority={priority ? "high" : "auto"} referrerPolicy="no-referrer"
        onLoad={() => { setLoaded(true); onImageChange?.(index); }}
        onError={() => {
          setLoaded(false);
          onImageChange?.(index + 1);
          setIndex((previous) => previous + 1);
          if (index + 1 >= place.images.length) onUnavailable?.();
        }}
        className={cn("h-full w-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")} />
        : <div className="grain h-full w-full" role="img" aria-label={"Photograph unavailable for " + place.name} />}
    </div>
  );
}

