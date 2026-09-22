export type Category = "iconic" | "hidden";

export type Tag =
  | "Heritage"
  | "Nature"
  | "Spiritual"
  | "Trek"
  | "Architecture"
  | "Culinary"
  | "Wildlife"
  | "Beach"
  | "Culture"
  | "High Altitude"
  | "Photography"
  | "Scenic";

export type Region = "north" | "south" | "east" | "west" | "northeast" | "central";

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface ImageAttribution {
  author?: string;
  license?: string;
  sourceUrl?: string;
  title?: string;
  sourceName?: string;
}

export interface Place {
  id: string;
  name: string;
  state: string; // state id, e.g. "rajasthan"
  category: Category;
  shortDesc: string;
  whyVisit: string;
  bestTimeToVisit: string;
  howToReach: string;
  entryInfo: string;
  travelerTip: string;
  tags: Tag[];
  images: string[];
  imageAttributions?: ImageAttribution[];
  coordinates: GeoCoordinates;
  featured?: boolean;
}

export interface NearbyHotel {
  id: string;
  name: string;
  address?: string;
  rating?: number;
  userRatingCount?: number;
  distanceKm?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  photoUrl?: string;
  photoAttributions?: string[];
  types?: string[];
  primaryType?: string;
}

export interface StateData {
  id: string;
  name: string;
  slug: string;
  capital: string;
  region: Region;
  description: string;
  d: string; // SVG path data
  bbox: [number, number, number, number]; // [minX, minY, width, height]
  labelPos?: [number, number]; // [x, y] for map label
  highlights?: string[];
  bestSeasons?: string;
}

export interface SearchResult {
  kind: "place" | "state";
  id: string;
  name: string;
  subtitle?: string;
  place?: Place;
  state?: StateData;
}

export interface TripItem {
  placeId: string;
  addedAt: number;
  notes?: string;
  customDay?: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  placeId: string;
  placeName: string;
  stateId: string;
  stateName: string;
  region: Region;
  category: Category;
  tags: Tag[];
  index: number;
  totalForPlace: number;
  attribution?: ImageAttribution;
  shortDesc: string;
  place: Place;
}

export type PriceRatingTier = "$" | "$$" | "$$$" | "$$$$";

export type TravelType = "solo" | "couple" | "family" | "friends" | "photography";

export interface Review {
  id: string;
  placeId: string;
  placeName?: string;
  author: string;
  authorLocation?: string;
  date: string;
  rating: number; // 1 to 5
  priceRating: number; // 1 to 5 (Value for money)
  travelType: TravelType;
  title: string;
  comment: string;
  tourGuideHired?: boolean;
  tourGuideCost?: string;
  upvotes: number;
  verified?: boolean;
}

export type GuideLicenseType =
  | "ASI Official"
  | "State Tourism Board"
  | "Certified Naturalist"
  | "Certified Trek Leader"
  | "Heritage Walk Curator"
  | "Community Storyteller";

export interface TourGuidePricing {
  priceRating: PriceRatingTier;
  priceTierName: "Budget" | "Moderate" | "Premium" | "Luxury Expedition";
  halfDayInr: number;
  fullDayInr: number;
  groupSizeLimit: number;
  audioGuideAlternativeInr?: number;
  heritageWalkInr?: number;
  languageAllowanceInr?: number;
  tippingGuideline: string;
}

export interface TourGuide {
  id: string;
  name: string;
  title: string;
  licenseType: GuideLicenseType;
  licenseNumber?: string;
  location: string;
  stateId: string;
  region: Region;
  placesCovered: string[]; // place IDs
  experienceYears: number;
  rating: number; // e.g. 4.9
  reviewCount: number;
  languages: string[];
  avatar: string;
  badge: string;
  pricing: TourGuidePricing;
  specialties: string[];
  bookingType: "Official Gate Counter" | "Advance Reservation" | "Tourism Reception Centre";
  bio: string;
  contactHint: string;
}

export interface Profile {
  id: string; // references auth.users(id)
  full_name?: string | null;
  avatar_url?: string | null;
  preferred_language?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SavedDestination {
  id: string;
  user_id: string;
  destination_id: string;
  notes?: string | null;
  created_at?: string;
  destination?: Place;
}

export interface TravelPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  destinations: string[]; // destination IDs
  created_at?: string;
  updated_at?: string;
}

export interface BookingRecord {
  id: string;
  user_id: string;
  reference_id: string;
  destination_id?: string | null;
  destination_name: string;
  booking_type: string;
  dates?: string | null;
  travelers?: string | null;
  status: "confirmed" | "pending" | "cancelled";
  notes?: string | null;
  details?: Record<string, any>;
  created_at?: string;
  isDemo?: boolean;
}
