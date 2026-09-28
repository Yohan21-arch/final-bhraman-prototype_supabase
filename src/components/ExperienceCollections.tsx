import { useState } from "react";
import { ArrowUpRight, Compass } from "lucide-react";
import { DiscoveryImage } from "@/components/DiscoveryImage";
import type { Place, Tag } from "@/types";

const EXPERIENCES: { title: string; caption: string; tag?: Tag; hidden?: boolean }[] = [
  { title: "Stories in stone", caption: "Heritage & architecture", tag: "Heritage" },
  { title: "A little closer to the sky", caption: "Mountains & high places", tag: "High Altitude" },
  { title: "Take the slower road", caption: "Coasts & quiet shores", tag: "Beach" },
  { title: "Beyond the familiar", caption: "India's hidden gems", hidden: true },
];

export function ExperienceCollections({ places, onExplore }: {
  places: Place[];
  onExplore: (filter: { tag?: Tag; category?: "hidden" }) => void;
}) {
  const [unavailableIds, setUnavailableIds] = useState<string[]>([]);
  return (
    <section className="home-section" aria-labelledby="experiences-heading">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="eyebrow mb-3 text-primary">Follow your curiosity</p><h2 id="experiences-heading" className="section-heading">Many ways to find yourself here.</h2></div>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Choose a feeling. Discover the places that bring it to life.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 lg:grid-cols-4">
        {EXPERIENCES.map((experience) => {
          const matches = places.filter((place) => experience.hidden ? place.category === "hidden" : !!experience.tag && place.tags.includes(experience.tag));
          const available = matches.filter((place) => place.images.length && !unavailableIds.includes(place.id));
          const cover = available.find((place) => place.featured) || available[0];
          return (
            <button key={experience.title} className="experience-card group" disabled={!matches.length}
              onClick={() => onExplore(experience.hidden ? { category: "hidden" } : { tag: experience.tag })}>
              {cover ? <span key={cover.id} className="absolute inset-0 -z-20"><DiscoveryImage place={cover} className="h-full w-full" onUnavailable={() => setUnavailableIds((ids) => [...ids, cover.id])} /></span> : <Compass className="absolute right-6 top-6 size-10 text-primary/35" />}
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />
              <span className="mb-3 text-xs text-ivory/80">{experience.caption}</span>
              <span className="font-display text-xl leading-tight sm:text-2xl">{experience.title}</span>
              <span className="mt-5 flex items-center justify-between border-t border-ivory/25 pt-3 text-xs text-ivory/85">
                {matches.length ? matches.length + " places to explore" : "More places coming soon"}
                <ArrowUpRight className="size-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

