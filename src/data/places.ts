import type { Place, Tag, Category } from "@/types";
import { northPlaces } from "./destinations/north";
import { southPlaces } from "./destinations/south";
import { westPlaces } from "./destinations/west";
import { eastPlaces } from "./destinations/east";
import { centralPlaces } from "./destinations/central";
import { northeastPlaces } from "./destinations/northeast";
import { applyDestinationImageOverride } from "./destination-image-overrides";

export const allTags: Tag[] = [
  "Heritage",
  "Nature",
  "Spiritual",
  "Trek",
  "Architecture",
  "Culinary",
  "Wildlife",
  "Beach",
  "Culture",
  "High Altitude",
  "Photography",
  "Scenic",
];

// Unified Master Places Database across all 36 States & Union Territories of India
export const PLACES_DATA: Place[] = [
  ...northPlaces,
  ...southPlaces,
  ...westPlaces,
  ...eastPlaces,
  ...centralPlaces,
  ...northeastPlaces,
].map(applyDestinationImageOverride);

// Active destinations repository (defaults to PLACES_DATA, updated dynamically when Supabase loads)
let dynamicPlacesStore: Place[] = PLACES_DATA;

export function getLoadedPlaces(): Place[] {
  return dynamicPlacesStore;
}

export function setLoadedPlaces(places: Place[]): void {
  if (Array.isArray(places) && places.length > 0) {
    dynamicPlacesStore = places.map(applyDestinationImageOverride);
  }
}

export function placeById(id: string): Place | undefined {
  return dynamicPlacesStore.find((p) => p.id === id) || PLACES_DATA.find((p) => p.id === id);
}

export function placesByState(stateId: string): Place[] {
  return dynamicPlacesStore.filter((p) => p.state.toLowerCase() === stateId.toLowerCase());
}

export function placesByCategory(category: Category): Place[] {
  return dynamicPlacesStore.filter((p) => p.category === category);
}

export function placesByTag(tag: Tag): Place[] {
  return dynamicPlacesStore.filter((p) => p.tags.includes(tag));
}

export function featuredPlaces(): Place[] {
  return dynamicPlacesStore.filter((p) => p.featured);
}

export function relatedPlaces(current: Place, pool?: Place[]): Place[] {
  const source = pool && pool.length > 0 ? pool : dynamicPlacesStore;
  return source
    .filter(
      (p) =>
        p.id !== current.id &&
        (p.state === current.state || p.tags.some((t) => current.tags.includes(t)))
    )
    .slice(0, 4);
}
