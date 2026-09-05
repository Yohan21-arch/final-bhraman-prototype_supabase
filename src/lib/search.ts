import { getLoadedPlaces, PLACES_DATA } from "@/data/places";
import { STATES_DATA } from "@/data/states";
import type { SearchResult, Place } from "@/types";

export function searchAll(query: string, customPlaces?: Place[]): SearchResult[] {
  if (!query || !query.trim()) return [];

  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Match states
  for (const s of STATES_DATA) {
    if (
      s.name.toLowerCase().includes(q) ||
      s.capital.toLowerCase().includes(q) ||
      s.region.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    ) {
      results.push({
        kind: "state",
        id: s.id,
        name: s.name,
        subtitle: `${s.region.toUpperCase()} · Capital: ${s.capital}`,
        state: s,
      });
    }
  }

  // Match places from dynamic Supabase store or provided pool
  const placesPool = customPlaces && customPlaces.length > 0 ? customPlaces : getLoadedPlaces();
  for (const p of placesPool) {
    const matchedTag = p.tags.some((t) => t.toLowerCase().includes(q));
    if (
      p.name.toLowerCase().includes(q) ||
      p.shortDesc.toLowerCase().includes(q) ||
      p.whyVisit.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      matchedTag
    ) {
      results.push({
        kind: "place",
        id: p.id,
        name: p.name,
        subtitle: p.shortDesc,
        place: p,
      });
    }
  }

  return results.slice(0, 10);
}
