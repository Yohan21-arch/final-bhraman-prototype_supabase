import { getLoadedPlaces, PLACES_DATA } from "@/data/places";
import { stateById } from "@/data/states";
import type { Place, GalleryImage, Region, Category, Tag } from "@/types";

/**
 * Extracts and normalizes all authentic photos across India destinations.
 */
export function getAllGalleryImages(customPlaces?: Place[]): GalleryImage[] {
  const images: GalleryImage[] = [];
  const pool = customPlaces && customPlaces.length > 0 ? customPlaces : getLoadedPlaces();

  for (const place of pool) {
    const stateObj = stateById(place.state);
    const stateName = stateObj?.name || place.state;
    const region: Region = stateObj?.region || "north";

    const placeImages = place.images || [];
    placeImages.forEach((url, idx) => {
      if (!url || typeof url !== "string" || !url.trim()) return;

      const attr = place.imageAttributions?.[idx] || place.imageAttributions?.[0];

      images.push({
        id: `${place.id}-${idx}`,
        url: url.trim(),
        placeId: place.id,
        placeName: place.name,
        stateId: place.state,
        stateName,
        region,
        category: place.category,
        tags: place.tags || [],
        index: idx,
        totalForPlace: placeImages.length,
        attribution: attr,
        shortDesc: place.shortDesc,
        place,
      });
    });
  }

  return images;
}

/**
 * Extracts all gallery images belonging to a specific place.
 */
export function getPlaceGalleryImages(place: Place): GalleryImage[] {
  const stateObj = stateById(place.state);
  const stateName = stateObj?.name || place.state;
  const region: Region = stateObj?.region || "north";

  return (place.images || []).map((url, idx) => {
    const attr = place.imageAttributions?.[idx] || place.imageAttributions?.[0];
    return {
      id: `${place.id}-${idx}`,
      url: url.trim(),
      placeId: place.id,
      placeName: place.name,
      stateId: place.state,
      stateName,
      region,
      category: place.category,
      tags: place.tags || [],
      index: idx,
      totalForPlace: place.images.length,
      attribution: attr,
      shortDesc: place.shortDesc,
      place,
    };
  });
}

/**
 * Gallery filter criteria
 */
export interface GalleryFilters {
  region: Region | "all";
  category: Category | "all";
  tag: Tag | "all";
  searchQuery: string;
}

/**
 * Filters gallery images based on region, category, tag, and search query.
 */
export function filterGalleryImages(
  images: GalleryImage[],
  filters: GalleryFilters
): GalleryImage[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return images.filter((img) => {
    // Region filter
    if (filters.region !== "all" && img.region !== filters.region) {
      return false;
    }

    // Category filter
    if (filters.category !== "all" && img.category !== filters.category) {
      return false;
    }

    // Tag filter
    if (filters.tag !== "all" && !img.tags.includes(filters.tag)) {
      return false;
    }

    // Search query
    if (query) {
      const matchName = img.placeName.toLowerCase().includes(query);
      const matchState = img.stateName.toLowerCase().includes(query);
      const matchAttr = img.attribution?.title?.toLowerCase().includes(query);
      const matchTag = img.tags.some((t) => t.toLowerCase().includes(query));
      if (!matchName && !matchState && !matchAttr && !matchTag) {
        return false;
      }
    }

    return true;
  });
}
