// Haversine distance in kilometers (rounded to 1 decimal place)
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default async function handler(req: any, res: any) {
  // Set CORS headers so API calls work reliably
  res.setHeader?.("Access-Control-Allow-Origin", "*");
  res.setHeader?.("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader?.("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status?.(200)?.end?.() ?? res.end?.();
  }

  try {
    // Support both GET query parameters and POST body
    const latVal = req.method === "POST" ? req.body?.lat : req.query?.lat;
    const lngVal = req.method === "POST" ? req.body?.lng : req.query?.lng;
    const radiusVal = req.method === "POST" ? req.body?.radius : req.query?.radius;

    const lat = Number(latVal);
    const lng = Number(lngVal);
    const parsedRadius = Number(radiusVal);
    const radius = !isNaN(parsedRadius) && parsedRadius > 0 ? Math.min(parsedRadius, 50000) : 15000;

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        hotels: [],
        error: "INVALID_COORDINATES",
        message: "Valid destination latitude and longitude are required.",
      });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        hotels: [],
        error: "NO_API_KEY",
        message: "Nearby hotel information is temporarily unavailable (API key not configured).",
      });
    }

    const searchUrl = "https://places.googleapis.com/v1/places:searchNearby";
    const requestBody = {
      includedTypes: [
        "hotel",
        "resort_hotel",
        "guest_house",
        "hostel",
        "bed_and_breakfast",
        "inn",
        "motel",
        "lodging",
      ],
      maxResultCount: 8,
      locationRestriction: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng,
          },
          radius: radius,
        },
      },
    };

    const placesResponse = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.photos,places.types,places.primaryTypeDisplayName",
      },
      body: JSON.stringify(requestBody),
    });

    if (!placesResponse.ok) {
      const errorText = await placesResponse.text();
      console.error("[Nearby Hotels] Google Places API error:", placesResponse.status, errorText);
      return res.status(502).json({
        hotels: [],
        error: "PLACES_API_ERROR",
        message: "Nearby hotel information is temporarily unavailable.",
      });
    }

    const data = (await placesResponse.json()) as { places?: any[] };
    const rawPlaces = Array.isArray(data.places) ? data.places : [];

    // For each place, fetch photo media URL server-side (without exposing key to browser)
    const hotels = await Promise.all(
      rawPlaces.map(async (p: any) => {
        const hotelLat = p.location?.latitude;
        const hotelLng = p.location?.longitude;
        const distanceKm =
          typeof hotelLat === "number" && typeof hotelLng === "number"
            ? calculateDistanceKm(lat, lng, hotelLat, hotelLng)
            : undefined;

        let photoUrl: string | undefined = undefined;
        let photoAttributions: string[] = [];

        if (Array.isArray(p.photos) && p.photos.length > 0 && p.photos[0].name) {
          const firstPhoto = p.photos[0];
          if (Array.isArray(firstPhoto.authorAttributions)) {
            photoAttributions = firstPhoto.authorAttributions
              .map((a: any) => a.displayName)
              .filter(Boolean);
          }

          try {
            const photoRes = await fetch(
              `https://places.googleapis.com/v1/${firstPhoto.name}/media?maxHeightPx=400&maxWidthPx=600&skipHttpRedirect=true`,
              {
                headers: {
                  "X-Goog-Api-Key": apiKey,
                },
              }
            );
            if (photoRes.ok) {
              const photoData = (await photoRes.json()) as { photoUri?: string };
              if (photoData?.photoUri) {
                photoUrl = photoData.photoUri;
              }
            }
          } catch {
            // Silently fall back to no photo if single photo media fails
          }
        }

        const primaryType =
          p.primaryTypeDisplayName?.text ||
          (Array.isArray(p.types) && p.types.length > 0
            ? p.types[0].replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
            : "Hotel");

        return {
          id: p.id,
          name: p.displayName?.text || "Hotel Accommodation",
          address: p.formattedAddress || undefined,
          rating: typeof p.rating === "number" ? p.rating : undefined,
          userRatingCount: typeof p.userRatingCount === "number" ? p.userRatingCount : undefined,
          distanceKm,
          googleMapsUri: p.googleMapsUri || undefined,
          websiteUri: p.websiteUri || undefined,
          photoUrl,
          photoAttributions,
          types: Array.isArray(p.types) ? p.types : [],
          primaryType,
        };
      })
    );

    return res.json({ hotels, destinationCoords: { lat, lng } });
  } catch (err: any) {
    console.error("[Nearby Hotels] Unexpected server error:", err?.message || err);
    return res.status(500).json({
      hotels: [],
      error: "SERVER_ERROR",
      message: "Nearby hotel information is temporarily unavailable.",
    });
  }
}
