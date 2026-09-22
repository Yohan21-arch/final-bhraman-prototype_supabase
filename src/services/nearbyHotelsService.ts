import type { NearbyHotel } from "@/types";

export interface NearbyHotelsResult {
  hotels: NearbyHotel[];
  error?: string;
  message?: string;
}

/**
 * Client-side service to retrieve real nearby hotel businesses
 * via the secure server-side Google Places API proxy.
 *
 * Coordinates are passed directly from the destination's real lat/lng.
 */
export async function fetchNearbyHotels(
  lat: number,
  lng: number,
  radiusMeters: number = 15000
): Promise<NearbyHotelsResult> {
  try {
    const response = await fetch(
      `/api/places/nearby-hotels?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radiusMeters)}`
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        hotels: [],
        error: data.error || `HTTP_${response.status}`,
        message: data.message || "Nearby hotel information is temporarily unavailable.",
      };
    }

    const data = await response.json();
    return {
      hotels: Array.isArray(data.hotels) ? data.hotels : [],
      message: data.message,
    };
  } catch {
    return {
      hotels: [],
      error: "NETWORK_ERROR",
      message: "Nearby hotel information is temporarily unavailable.",
    };
  }
}
