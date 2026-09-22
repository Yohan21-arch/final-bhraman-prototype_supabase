import { getLoadedPlaces, PLACES_DATA } from "@/data/places";
import { STATES_DATA, stateById } from "@/data/states";
import type { SearchResult, Place } from "@/types";

export function searchAll(query: string, customPlaces?: Place[]): SearchResult[] {
  if (!query || !query.trim()) return [];

  const rawQ = query.toLowerCase().trim();
  const q = rawQ.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!q) return [];

  const stateResults: SearchResult[] = [];
  const placeResults: Array<SearchResult & { score: number }> = [];

  // Match states
  for (const s of STATES_DATA) {
    const sName = s.name.toLowerCase();
    const sNameNorm = sName.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    const sCap = s.capital.toLowerCase();
    const sRegion = s.region.toLowerCase();

    const isExact = sName === rawQ || sNameNorm === q;
    const isStart = sName.startsWith(rawQ) || sNameNorm.startsWith(q);
    const isInclude = sName.includes(rawQ) || sNameNorm.includes(q) || sCap.includes(rawQ) || sRegion.includes(rawQ);

    if (isExact || isStart || isInclude || s.description.toLowerCase().includes(rawQ)) {
      stateResults.push({
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
    const pName = p.name.toLowerCase();
    const pNameNorm = pName.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    const stateObj = stateById(p.state);
    const stateName = stateObj ? stateObj.name.toLowerCase() : "";
    const stateNorm = stateName.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    const pStateSlug = p.state.toLowerCase();

    let score = 0;

    if (pName === rawQ || pNameNorm === q) {
      score += 100;
    } else if (pName.startsWith(rawQ) || pNameNorm.startsWith(q)) {
      score += 70;
    } else if (pName.includes(rawQ) || pNameNorm.includes(q)) {
      score += 50;
    }

    if (stateName === rawQ || stateNorm === q) {
      score += 40;
    } else if (stateName.includes(rawQ) || stateNorm.includes(q) || pStateSlug.includes(rawQ)) {
      score += 25;
    }

    const matchedTag = p.tags.some((t) => {
      const tNorm = t.toLowerCase();
      return tNorm === rawQ || tNorm.includes(rawQ);
    });
    if (matchedTag) score += 20;

    if (p.shortDesc.toLowerCase().includes(rawQ)) score += 10;
    if (p.whyVisit && p.whyVisit.toLowerCase().includes(rawQ)) score += 5;

    if (score > 0) {
      placeResults.push({
        kind: "place",
        id: p.id,
        name: p.name,
        subtitle: `${stateObj ? stateObj.name + " · " : ""}${p.shortDesc}`,
        place: p,
        score,
      });
    }
  }

  // Sort places by match score
  placeResults.sort((a, b) => b.score - a.score);

  // Combine results with states first if exact match, otherwise top places
  const combined: SearchResult[] = [];
  
  // If query closely matches a state, place state at top
  const matchedExactState = stateResults.filter(
    (s) => s.name.toLowerCase().includes(rawQ) || rawQ.includes(s.name.toLowerCase())
  );
  combined.push(...matchedExactState);

  for (const pr of placeResults) {
    if (combined.length >= 12) break;
    combined.push({
      kind: pr.kind,
      id: pr.id,
      name: pr.name,
      subtitle: pr.subtitle,
      place: pr.place,
    });
  }

  // Add remaining state matches if space permits
  for (const sr of stateResults) {
    if (combined.length >= 12) break;
    if (!combined.some((item) => item.id === sr.id)) {
      combined.push(sr);
    }
  }

  return combined.slice(0, 10);
}

