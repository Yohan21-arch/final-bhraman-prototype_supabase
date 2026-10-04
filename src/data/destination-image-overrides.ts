import type { ImageAttribution, Place } from "@/types";

type ImageOverride = {
  images: string[];
  imageAttributions: ImageAttribution[];
};

const DIRECT_COMMONS_IMAGES: Record<string, string> = {
  "Pangong Tso lake banner.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Pangong_Tso_lake_banner.jpg",
  "Pangong Tso Lake.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/be/Pangong_Tso_Lake.jpg",
  "Marble Rocks at Bhedaghat.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Marble_Rocks_at_Bhedaghat.jpg",
  "Dhuandhar Falls in Bhedaghat.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Dhuandhar_Falls_in_Bhedaghat.jpg",
  "Waterfall at Tirathgarh.jpg": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Waterfall_at_Tirathgarh.jpg",
  "Mangalajodi Wetland.jpg": "https://upload.wikimedia.org/wikipedia/commons/3/3d/Mangalajodi_Wetland.jpg",
  "Netarhat, Jharkhand.jpg": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Netarhat%2C_Jharkhand.jpg",
  "Habba Khatoon.jpg": "https://upload.wikimedia.org/wikipedia/commons/7/76/Habba_Khatoon.jpg",
  "Kangla Fort Imphal.jpg": "https://upload.wikimedia.org/wikipedia/commons/1/17/Kangla_Fort_Imphal.jpg",
  "The rann of kutch.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/b2/The_rann_of_kutch.jpg",
};

const commonsImage = (filename: string) => DIRECT_COMMONS_IMAGES[filename];

const commonsAttribution = (
  filename: string,
  title: string,
  author: string,
  license: string
): ImageAttribution => ({
  author,
  license,
  sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename).replace(/%2F/g, "/")}`,
  title,
  sourceName: "Wikimedia Commons",
});

/**
 * Frontend-only corrections for destination photography.
 *
 * These overrides deliberately live outside Supabase. They are applied to both
 * the bundled catalogue and rows loaded from the hosted destinations table, so
 * correcting photography never requires a database migration or production-data write.
 */
export const DESTINATION_IMAGE_OVERRIDES: Record<string, ImageOverride> = {
  "pangong-tso": {
    images: [
      commonsImage("Pangong Tso lake banner.jpg"),
      commonsImage("Pangong Tso Lake.jpg"),
    ],
    imageAttributions: [
      commonsAttribution("Pangong Tso lake banner.jpg", "Pangong Tso lake banner", "Wikimedia Commons contributor", "See source page"),
      commonsAttribution("Pangong Tso Lake.jpg", "Pangong Tso Lake", "Parth Patel", "CC BY-SA 4.0"),
    ],
  },
  "bhedaghat-marble-rocks": {
    images: [
      commonsImage("Marble Rocks at Bhedaghat.jpg"),
      commonsImage("Dhuandhar Falls in Bhedaghat.jpg"),
    ],
    imageAttributions: [
      commonsAttribution("Marble Rocks at Bhedaghat.jpg", "Marble Rocks at Bhedaghat", "Sandyadav080", "See source page"),
      commonsAttribution("Dhuandhar Falls in Bhedaghat.jpg", "Dhuandhar Falls in Bhedaghat", "Shivam Agrawal", "CC BY-SA 4.0"),
    ],
  },
  "kanger-valley-kutumsar": {
    images: [commonsImage("Waterfall at Tirathgarh.jpg")],
    imageAttributions: [
      commonsAttribution("Waterfall at Tirathgarh.jpg", "Waterfall at Tirathgarh", "Pranabk", "CC BY-SA 4.0"),
    ],
  },
  "chilika-lake-manglajodi": {
    images: [commonsImage("Mangalajodi Wetland.jpg")],
    imageAttributions: [
      commonsAttribution("Mangalajodi Wetland.jpg", "Mangalajodi Wetland", "Phadke09", "CC BY-SA 4.0"),
    ],
  },
  "netarhat-queen-chotanagpur": {
    images: [commonsImage("Netarhat, Jharkhand.jpg")],
    imageAttributions: [
      commonsAttribution("Netarhat, Jharkhand.jpg", "Netarhat, Jharkhand", "Tourism Department, Government of Jharkhand", "CC0 1.0"),
    ],
  },
  "gurez-valley": {
    images: [commonsImage("Habba Khatoon.jpg")],
    imageAttributions: [
      commonsAttribution("Habba Khatoon.jpg", "Habba Khatoon mountain and Kishanganga River, Gurez Valley", "Zahid samoon", "CC BY 3.0"),
    ],
  },
  "kangla-fort-imphal": {
    images: [commonsImage("Kangla Fort Imphal.jpg")],
    imageAttributions: [
      commonsAttribution("Kangla Fort Imphal.jpg", "Kangla Fort Imphal", "Neilsatyam", "CC BY-SA 4.0"),
    ],
  },
  "rann-of-kutch": {
    images: [commonsImage("The rann of kutch.jpg")],
    imageAttributions: [
      commonsAttribution("The rann of kutch.jpg", "The Rann of Kutch salt marshes", "Ranjith Kumar Inbasekaran", "CC BY-SA 4.0"),
    ],
  },
};

export function applyDestinationImageOverride(place: Place): Place {
  const override = DESTINATION_IMAGE_OVERRIDES[place.id];
  if (!override) return place;

  return {
    ...place,
    images: override.images,
    imageAttributions: override.imageAttributions,
  };
}
