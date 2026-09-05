import type { Review } from "@/types";

export const INITIAL_REVIEWS: Review[] = [
  // TAJ MAHAL / AGRA
  {
    id: "rev-taj-1",
    placeId: "taj-mahal",
    placeName: "Taj Mahal",
    author: "Rohan & Meera Kapoor",
    authorLocation: "Bengaluru, India",
    date: "February 2025",
    rating: 5,
    priceRating: 5,
    travelType: "couple",
    title: "Mesmerizing sunrise experience, official ASI guide is 100% worth it",
    comment:
      "Entered through the East Gate right at 6:00 AM before the crowds arrived. We booked an official ASI licensed guide at the government desk for ₹2,050 for our 3-hour walk. He pointed out optical illusions in the calligraphy and showed us the exact flower inlays made of semi-precious carnelian that glow when lit by a torch. Do not hire random people outside who lack the official badge!",
    tourGuideHired: true,
    tourGuideCost: "₹2,050 (Official ASI Half-Day Rate)",
    upvotes: 42,
    verified: true,
  },
  {
    id: "rev-taj-2",
    placeId: "taj-mahal",
    placeName: "Taj Mahal",
    author: "Elena Rostova",
    authorLocation: "Berlin, Germany",
    date: "January 2025",
    rating: 5,
    priceRating: 4,
    travelType: "solo",
    title: "Audio guide at ₹200 was good, but a human guide gives deeper nuances",
    comment:
      "The ticket for international tourists includes shoe covers and a water bottle. I initially took the audio guide app for ₹200 which is very informative. However, overhearing the licensed guides explaining Shah Jahan's acoustic design made me realize having an ASI historian is superior. Beautiful monument, immaculate gardens.",
    tourGuideHired: false,
    tourGuideCost: "₹200 (Official Audio Guide)",
    upvotes: 19,
    verified: true,
  },

  // VARANASI GHATS
  {
    id: "rev-vns-1",
    placeId: "varanasi-ghats",
    placeName: "Varanasi Ghats",
    author: "Devendra Verma",
    authorLocation: "Pune, India",
    date: "December 2024",
    rating: 5,
    priceRating: 5,
    travelType: "family",
    title: "Morning boat ride from Assi to Manikarnika is soulful beyond words",
    comment:
      "We took a private wooden rowboat at 5:30 AM for ₹1,200 for 5 people. Our guide explained the philosophy of the Ghats and the morning rituals of the pilgrims. The price is extremely reasonable for such an intimate experience. Stay away from motorboats which ruin the sacred quiet.",
    tourGuideHired: true,
    tourGuideCost: "₹1,200 for family boat & guide",
    upvotes: 38,
    verified: true,
  },
  {
    id: "rev-vns-2",
    placeId: "varanasi-ghats",
    placeName: "Varanasi Ghats",
    author: "Chloe & Liam",
    authorLocation: "Melbourne, Australia",
    date: "February 2025",
    rating: 5,
    priceRating: 5,
    travelType: "couple",
    title: "An explosion of spirituality and history",
    comment:
      "We hired Dr. Ananya for an old city alleyway walk leading up to the evening Aarti. Learning about the hidden underground shrines and silk weaver colonies was the highlight of our 3-week trip across Northern India. Incredible value for money.",
    tourGuideHired: true,
    tourGuideCost: "₹1,500 per person walking tour",
    upvotes: 27,
    verified: true,
  },

  // HAMPI
  {
    id: "rev-hampi-1",
    placeId: "hampi",
    placeName: "Hampi (Vijayanagara Ruins)",
    author: "Karthik Subramanian",
    authorLocation: "Chennai, India",
    date: "January 2025",
    rating: 5,
    priceRating: 5,
    travelType: "friends",
    title: "You cannot understand Hampi without a licensed guide",
    comment:
      "Hampi is an open-air museum spread across 40 sq km. Hired Manjunath from the ASI counter for ₹2,050. He tapped the musical pillars at Vittala Temple to show the acoustic notes and explained the gravity-defying irrigation channels in the Royal Enclosure. Without a guide, it's just piles of rocks; with a guide, it's a living empire.",
    tourGuideHired: true,
    tourGuideCost: "₹2,050 (Official ASI half-day)",
    upvotes: 56,
    verified: true,
  },
  {
    id: "rev-hampi-2",
    placeId: "hampi",
    placeName: "Hampi (Vijayanagara Ruins)",
    author: "Sarah Jenkins",
    authorLocation: "London, UK",
    date: "November 2024",
    rating: 5,
    priceRating: 4,
    travelType: "solo",
    title: "Rented a bicycle and explored with the ASI guide map",
    comment:
      "Rented a bicycle for ₹150/day and combined it with an ASI guide for the morning session at Vittala and Lotus Mahal. Sunset from Matanga Hill was breathtaking. Food in Hampi Bazaar was hearty and very affordable.",
    tourGuideHired: true,
    tourGuideCost: "₹2,500 (Full day guide split with 2 travelers)",
    upvotes: 22,
    verified: true,
  },

  // PANGONG TSO / LADAKH
  {
    id: "rev-pangong-1",
    placeId: "pangong-tso",
    placeName: "Pangong Tso",
    author: "Vikram & Sanya Malhotra",
    authorLocation: "Chandigarh, India",
    date: "August 2024",
    rating: 5,
    priceRating: 4,
    travelType: "couple",
    title: "Otherworldly cobalt blue water, make sure to acclimatize!",
    comment:
      "The drive across Chang La pass is rugged. Our local Ladakhi driver-guide Tenzin kept us safe with oxygen cans and briefed us on high-altitude etiquette. Staying in Merak village was much calmer than Spangmik. Stargazing at midnight under zero light pollution was a life experience.",
    tourGuideHired: true,
    tourGuideCost: "₹3,500/day private expedition guide",
    upvotes: 34,
    verified: true,
  },

  // ALLEPPEY BACKWATERS
  {
    id: "rev-alleppey-1",
    placeId: "alleppey-backwaters",
    placeName: "Alleppey Backwaters",
    author: "Ananya Mukherjee",
    authorLocation: "Kolkata, India",
    date: "October 2024",
    rating: 5,
    priceRating: 5,
    travelType: "family",
    title: "Shikara boat through village canals is better than large houseboats",
    comment:
      "Instead of an expensive overnight houseboat (₹9,000+), our local boatman Suresh took us on a wooden canoe through narrow canals for ₹800/hour. We stopped at a village duck farm, tried fresh tender coconut, and had an authentic Karimeen fish lunch at a local toddy shop for ₹350. Unbeatable value.",
    tourGuideHired: true,
    tourGuideCost: "₹1,600 (2-hour guided village canoe)",
    upvotes: 49,
    verified: true,
  },

  // AMBER FORT / JAIPUR
  {
    id: "rev-amber-1",
    placeId: "amber-fort",
    placeName: "Amber Fort",
    author: "Gaurav Joshi",
    authorLocation: "Mumbai, India",
    date: "January 2025",
    rating: 5,
    priceRating: 5,
    travelType: "family",
    title: "The mirror work in Sheesh Mahal is a masterpiece of optics",
    comment:
      "We took the government guide at Jaleb Chowk for ₹2,050. He demonstrated how a single candle placed in the center illuminated the entire hall of mirrors like a night sky. Also took us through the secret tunnel to Jaigarh Fort. Extremely worthwhile for kids and elders alike.",
    tourGuideHired: true,
    tourGuideCost: "₹2,050 (RTDC official rate)",
    upvotes: 31,
    verified: true,
  },

  // KAZIRANGA
  {
    id: "rev-kaziranga-1",
    placeId: "kaziranga",
    placeName: "Kaziranga National Park",
    author: "David & Claire Thornton",
    authorLocation: "Toronto, Canada",
    date: "December 2024",
    rating: 5,
    priceRating: 5,
    travelType: "photography",
    title: "Spotted 14 rhinos in a single afternoon safari!",
    comment:
      "Kaziranga's conservation story is world-class. Our forest naturalist Partha was an eagle-eyed spotter. We paid ₹1,500 guide fee plus the gypsy vehicle charge. He helped our photography group position with the golden hour backlight. Saw two mother rhinos with calves and several hornbills.",
    tourGuideHired: true,
    tourGuideCost: "₹1,500 forest naturalist fee per zone",
    upvotes: 45,
    verified: true,
  },

  // KHAJURAHO
  {
    id: "rev-khajuraho-1",
    placeId: "khajuraho",
    placeName: "Khajuraho Temples",
    author: "Pooja & Sameer Sen",
    authorLocation: "Hyderabad, India",
    date: "November 2024",
    rating: 5,
    priceRating: 5,
    travelType: "couple",
    title: "Don't visit without an ASI art historian!",
    comment:
      "The sculptures are 90% about daily medieval life, music, dance, cosmetic grooming, and sacred cosmology. Hired Sunita at the Western Group gate. She decoded the geometric mandalas of Kandariya Mahadeva temple. Outstanding intellectual experience.",
    tourGuideHired: true,
    tourGuideCost: "₹2,050 (ASI half day)",
    upvotes: 28,
    verified: true,
  },
];

export function getReviewsForPlace(placeId: string, customReviews: Review[] = []): Review[] {
  const defaults = INITIAL_REVIEWS.filter((r) => r.placeId === placeId);
  const userReviews = customReviews.filter((r) => r.placeId === placeId);
  return [...userReviews, ...defaults];
}

export function calculatePlaceRatingMetrics(reviews: Review[]): {
  averageRating: number;
  averagePriceRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  guideHirePercentage: number;
} {
  if (reviews.length === 0) {
    return {
      averageRating: 4.8,
      averagePriceRating: 4.7,
      totalReviews: 1,
      ratingDistribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
      guideHirePercentage: 80,
    };
  }

  const total = reviews.length;
  const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
  const priceRatingSum = reviews.reduce((sum, r) => sum + r.priceRating, 0);
  const guidesHiredCount = reviews.filter((r) => r.tourGuideHired).length;

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[star] = (distribution[star] || 0) + 1;
  });

  return {
    averageRating: Number((ratingSum / total).toFixed(1)),
    averagePriceRating: Number((priceRatingSum / total).toFixed(1)),
    totalReviews: total,
    ratingDistribution: distribution,
    guideHirePercentage: Math.round((guidesHiredCount / total) * 100),
  };
}
