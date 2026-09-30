import { useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoProps {
  key?: string; sources: string[]; alt: string; className?: string; priority?: boolean;
  initialIndex?: number; onPhotoChange?: (index: number | null) => void;
}
/** Falls back only to photographs already supplied for this destination. */
export function DestinationPhoto(props: PhotoProps) {
  return <PhotoFrame key={props.sources.join("|") + ":" + (props.initialIndex || 0)} {...props} />;
}
function PhotoFrame({ sources, alt, className, priority, initialIndex = 0, onPhotoChange }: PhotoProps) {
  const order = sources.map((_, i) => (initialIndex + i) % sources.length);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const index = order[attempt];
  const source = sources[index];
  return <div className={cn("destination-photo", className)} aria-busy={!!source && !loaded}>
    {source ? <img key={source} src={source} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer"
      onLoad={() => { setLoaded(true); onPhotoChange?.(index); }}
      onError={() => { setLoaded(false); setAttempt(value => value + 1); onPhotoChange?.(null); }}
      className={cn("destination-photo-image", loaded && "is-loaded")} />
      : <div className="destination-photo-fallback" role="img" aria-label={"Photograph unavailable for " + alt}><Camera aria-hidden="true" className="size-7 text-primary/60" /><span>Photograph unavailable</span></div>}
  </div>;
}

