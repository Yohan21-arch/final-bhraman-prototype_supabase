import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { PLACES_DATA } from "../src/data/places.ts";

const SYSTEM_PROMPT = `You are Yatra, a friendly AI travel assistant embedded on an India-only tourism website.

SCOPE: Only India. If asked about destinations outside India, politely redirect to Indian alternatives.

YOU HELP WITH THREE THINGS:
1. Destination info — history, best season, how to reach, what to see, typical budget, ideal trip length. Keep answers focused and scannable (short paragraphs or a few bullet points), not encyclopedic.
2. Mood-based recommendations — when the user shares a mood/vibe (adventurous, relaxed, spiritual, romantic, family, nightlife, etc.), suggest 2-3 specific Indian destinations that fit, each with a one-line reason. Ask a quick follow-up (budget, region of India, trip length) only if it would meaningfully change the recommendation.
3. Ticket/trip booking — when the user wants to book (train, flight, hotel, entry tickets, tour package), gather these in a natural conversational way, one or two questions at a time, not as a rigid form: destination, travel dates, number of travelers, and what they want to book (transport / stay / experience). Once you have destination, dates, and traveler count, produce a confirmation.

BOOKING CONFIRMATION FORMAT: once you have enough details, end your reply with a fenced block exactly like this (this is parsed by the website, the user won't see the raw block):
\`\`\`booking
{"destination": "...", "dates": "...", "travelers": 2, "type": "Train tickets", "reference": "YAT-4 random alphanumeric chars"}
\`\`\`
Only emit this block once you actually have destination + dates + traveler count. Before that, keep asking naturally. Never emit it speculatively.

TONE: warm, concise, knowledgeable local-friend energy. Use plain language, minimal formatting, no markdown headers. Keep most replies under 120 words unless the user asks for depth. Never invent real-time prices, availability, or seat numbers — this is a demo, so booking confirmations are illustrative, not real transactions.`;

// Comprehensive India destination knowledge base for instant fallback
const INDIA_DESTINATION_KB: Record<string, { title: string; season: string; highlights: string[]; tip: string }> = {
  rajasthan: {
    title: "Rajasthan — The Land of Maharajas",
    season: "October to March (cool sunny days & pleasant desert nights)",
    highlights: ["Amer Fort & Hawa Mahal (Jaipur)", "City Palace & Lake Pichola (Udaipur)", "Golden Fort & Sam Dunes (Jaisalmer)", "Mehrangarh Fort (Jodhpur)"],
    tip: "Experience an evening desert camp in Jaisalmer with folk Kalbelia music under the stars.",
  },
  jaipur: {
    title: "Jaipur (The Pink City), Rajasthan",
    season: "October to March",
    highlights: ["Amer Fort mirror palace (Sheesh Mahal)", "Hawa Mahal facade & city bazaar", "Jantar Mantar astronomical observatory", "Nahargarh Fort sunset view"],
    tip: "Try traditional Pyaaz Kachori at Rawat Mishtan Bhandar and take an early morning hot air balloon ride.",
  },
  udaipur: {
    title: "Udaipur (The City of Lakes), Rajasthan",
    season: "September to March",
    highlights: ["Lake Pichola sunset boat ride", "City Palace museum", "Saheliyon-ki-Bari fountains", "Monsoon Palace mountain top"],
    tip: "Dine by the lakeside ghats with a view of illuminated Taj Lake Palace.",
  },
  kerala: {
    title: "Kerala — God's Own Country",
    season: "September to March for travel; June to August for traditional Ayurvedic monsoon retreats",
    highlights: ["Overnight wooden houseboat in Alleppey backwaters", "Munnar rolling tea plantations", "Fort Kochi colonial streets & Chinese fishing nets", "Varkala cliffside beach"],
    tip: "Enjoy a traditional Kerala Sadya feast served on a fresh banana leaf.",
  },
  goa: {
    title: "Goa — Sun, Heritage & Coastal Serenity",
    season: "November to February for beach weather; June to September for lush green monsoons",
    highlights: ["Palolem & Agonda serene beaches in South Goa", "UNESCO churches of Old Goa (Basilica of Bom Jesus)", "Dudhsagar Waterfalls trek", "Fontainhas Latin Quarter heritage walk"],
    tip: "Rent a scooter to explore the quiet heritage villages of Divar Island and South Goa spice plantations.",
  },
  ladakh: {
    title: "Ladakh — Land of High Passes",
    season: "May to September (when Khardung La & Rohtang Pass are snow-free)",
    highlights: ["Turquoise Pangong Tso Lake (14,270 ft)", "Nubra Valley sand dunes & double-humped camels", "Hemis & Thiksey ancient cliffside gompas", "Magnetic Hill phenomenon"],
    tip: "Spend the first 48 hours resting in Leh for proper altitude acclimatization.",
  },
  himachal: {
    title: "Himachal Pradesh — Abode of Snow & Cedar Valleys",
    season: "March to June for pleasant weather; December to February for skiing and snow in Solang/Kufri",
    highlights: ["Manali & Solang Valley adventure sports", "Dharamshala & McLeodGanj (home of Dalai Lama)", "Shimla colonial Mall Road & Toy Train", "Spiti Valley high-altitude cold desert"],
    tip: "Take the UNESCO Kalka-Shimla Toy Train ride across 103 Himalayan tunnels.",
  },
  uttarakhand: {
    title: "Uttarakhand — Devbhoomi & Himalayan Trails",
    season: "March to June and September to November",
    highlights: ["Rishikesh Ganga Aarti & white-water rafting", "Valley of Flowers UNESCO trek", "Nainital & Mussoorie hill retreats", "Jim Corbett National Park tiger safaris"],
    tip: "Attend the twilight Ganga Aarti at Triveni Ghat in Rishikesh for deep spiritual peace.",
  },
  varanasi: {
    title: "Varanasi (Kashi), Uttar Pradesh",
    season: "October to March",
    highlights: ["Dawn rowing boat ride on River Ganga", "Dashashwamedh Ghat evening Maha Aarti", "Kashi Vishwanath sacred temple corridor", "Sarnath Buddhist peace stupas"],
    tip: "Take a morning walking trail through the historic ancient gullies and try Malaiyyo dessert.",
  },
  tamilnadu: {
    title: "Tamil Nadu — Land of Living Chola Temples & Carnatic Heritage",
    season: "November to March",
    highlights: ["Brihadisvara Temple (Thanjavur)", "Meenakshi Amman Temple (Madurai)", "Nilgiri Mountain Railway (Ooty)", "Mahabalipuram shore temples"],
    tip: "Wake up early in Madurai to experience the divine morning temple chants and authentic filter coffee.",
  },
  karnataka: {
    title: "Karnataka — Silicon Hub to Vijayanagara Grandeur",
    season: "October to March",
    highlights: ["Hampi UNESCO ruins and boulder landscapes", "Mysore Palace illumination & silk bazaars", "Coorg coffee estates & Abbey Falls", "Gokarna pristine Om Beach"],
    tip: "Rent a bicycle in Hampi to discover the Royal Enclosure and riverside Vittala temple at your own pace.",
  },
  meghalaya: {
    title: "Meghalaya — Abode of the Clouds",
    season: "October to April for clear skies; May to September for roaring waterfalls",
    highlights: ["Cherrapunji & Nohkalikai Falls", "Nongriat Double Decker Living Root Bridges", "Dawki crystal-clear Umngot River", "Mawlynnong cleanest village in Asia"],
    tip: "Boating on Dawki River feels like floating on glass in winter months.",
  },
  kashmir: {
    title: "Kashmir — Paradise on Earth",
    season: "April to October for blooming gardens; December to February for Gulmarg powder snow",
    highlights: ["Srinagar Dal Lake shikara ride & floating vegetable market", "Gulmarg Gondola ride to Apharwat Peak", "Pahalgam Betaab & Aru Valleys", "Sonamarg Thajiwas Glacier"],
    tip: "Sip warm Kashmiri Kahwa tea brewed with saffron, almonds, and cardamom.",
  },
  andaman: {
    title: "Andaman & Nicobar Islands",
    season: "October to May",
    highlights: ["Radhanagar Beach (Havelock) — voted Asia's best beach", "Scuba diving & snorkeling in Neil Island", "Historic Cellular Jail sound & light show", "Baratang limestone caves"],
    tip: "Take the speed catamaran ferry between Port Blair, Havelock, and Neil Island.",
  },
};

// Fallback intelligent response generator for India travel
function generateFallbackResponse(messages: Array<{ role: string; content: string }>): string {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content?.toLowerCase() || "";

  // 1. Booking intent check
  if (
    lastUserMsg.includes("book") ||
    lastUserMsg.includes("ticket") ||
    lastUserMsg.includes("flight") ||
    lastUserMsg.includes("train") ||
    lastUserMsg.includes("hotel") ||
    lastUserMsg.includes("reserve") ||
    lastUserMsg.includes("package")
  ) {
    const hasDates = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|next week|tomorrow|days|202|weekend|month)\b/i.test(lastUserMsg);
    const hasTravelers = /\b(\d+|two|three|four|five|one|couple|family|friends|people|person|travelers|adults)\b/i.test(lastUserMsg);

    if (hasDates && hasTravelers) {
      const refCode = "YAT-" + Math.random().toString(36).substring(2, 6).toUpperCase();
      let dest = "Rajasthan Heritage Circuit";
      for (const [key, val] of Object.entries(INDIA_DESTINATION_KB)) {
        if (lastUserMsg.includes(key)) {
          dest = val.title.split("—")[0].trim();
          break;
        }
      }
      return `Shandaar! I have generated your provisional booking request for **${dest}**. Here is your confirmation reference:\n\n\`\`\`booking\n{"destination": "${dest}", "dates": "Upcoming Travel Window", "travelers": 2, "type": "Curated Stay & Sightseeing Pass", "reference": "${refCode}"}\n\`\`\`\n\nWould you like me to recommend top local culinary spots, private heritage guides, or traditional transport for your itinerary?`;
    } else {
      return `I'm ready to help you plan and book your trip across India! Could you please share:\n\n• **Destination**: Which state or city in India?\n• **Dates**: When are you planning to travel?\n• **Travelers**: How many people will be traveling?`;
    }
  }

  // 2. Specific Destination Match in Knowledge Base
  for (const [key, data] of Object.entries(INDIA_DESTINATION_KB)) {
    if (lastUserMsg.includes(key)) {
      return `**${data.title}**\n\n• **Best Season**: ${data.season}\n• **Key Highlights**: ${data.highlights.join(", ")}\n• **Insider Tip**: ${data.tip}\n\nWould you like me to draft a day-by-day itinerary or help you check booking options for your trip?`;
    }
  }

  // 3. Mood-Based Recommendations
  if (lastUserMsg.includes("adventur") || lastUserMsg.includes("trek") || lastUserMsg.includes("raft") || lastUserMsg.includes("thrill")) {
    return `For high adrenaline and thrilling landscapes:\n\n• **Ladakh (Zanskar & Pangong)**: High mountain passes, white-water rafting, and surreal moonscapes.\n• **Rishikesh, Uttarakhand**: Rafting on the Holy Ganges and bungee jumping in the Shivalik foothills.\n• **Spiti Valley, Himachal**: Rugged off-road 4x4 trails, ancient monasteries, and starry dark skies.\n\nWhich landscape excites you more — snow-capped Himalayan ridges or gushing river canyons?`;
  }
  if (lastUserMsg.includes("relax") || lastUserMsg.includes("unwind") || lastUserMsg.includes("calm") || lastUserMsg.includes("peace")) {
    return `To slow down and unwind peacefully:\n\n• **Kumarakom & Alleppey, Kerala**: Drift gently on a wooden kettuvallam houseboat through mirror-still backwaters.\n• **Coorg, Karnataka**: Fragrant coffee plantations wrapped in cool morning mist.\n• **Havelock Island, Andaman**: Powder-white sands and turquoise shallows at Radhanagar Beach.\n\nWould you prefer lush hill retreats or tropical coastal waters?`;
  }
  if (lastUserMsg.includes("spirit") || lastUserMsg.includes("sacred") || lastUserMsg.includes("temple") || lastUserMsg.includes("aarti")) {
    return `For a deeply serene and spiritual experience:\n\n• **Varanasi Ghats, Uttar Pradesh**: The timeless evening Ganga Aarti illuminated by a thousand brass lamps.\n• **Golden Temple, Amritsar**: Sacred serenity at the Amrit Sarovar with round-the-clock soul-stirring kirtan.\n• **Madurai & Thanjavur, Tamil Nadu**: Ancient Dravidian gopurams and thousand-year-old Chola architectural marvels.\n\nAre you looking to stay in a peaceful ashram or explore ancient temple architecture?`;
  }
  if (lastUserMsg.includes("romantic") || lastUserMsg.includes("couple") || lastUserMsg.includes("honeymoon") || lastUserMsg.includes("partner")) {
    return `For an enchanting romantic getaway in India:\n\n• **Udaipur, Rajasthan**: The City of Lakes with glowing marble palaces reflecting on Lake Pichola.\n• **Munnar, Kerala**: Rolling emerald tea estates draped in cool evening fog.\n• **Gulmarg & Pahalgam, Kashmir**: Pine valleys, gondola rides over fresh snow, and cozy wooden chalets.\n\nAre you thinking of royal heritage luxury or misty mountain views?`;
  }
  if (lastUserMsg.includes("family") || lastUserMsg.includes("kids") || lastUserMsg.includes("parents")) {
    return `Great family-friendly destinations in India:\n\n• **Jaipur, Rajasthan**: Amer Fort elephant views, science marvels at Jantar Mantar, and vibrant puppet shows.\n• **Kaziranga National Park, Assam**: Exciting jeep safaris spotting Great One-Horned Rhinos and wild elephants.\n• **South Goa & Palolem**: Gentle shallow beaches, spice plantation lunches, and dolphin boat cruises.\n\nWhat age group are the travelers, and what region do you want to explore?`;
  }
  if (lastUserMsg.includes("food") || lastUserMsg.includes("culinary") || lastUserMsg.includes("eat") || lastUserMsg.includes("street food")) {
    return `India is a culinary wonderland! Here are top food trails:\n\n• **Old Delhi & Chandni Chowk**: Paranthe Wali Gali, succulent kebabs, jalebis, and fragrant rabri falooda.\n• **Amritsar, Punjab**: Amritsari kulchas dripping with butter, slow-cooked Dal Makhani, and creamy sweet lassi.\n• **Kochi & Kozhikode, Kerala**: Malabar biryani, banana chips, and appam with vegetable stew.\n\nWhich cuisine are you eager to taste first?`;
  }

  // 4. Default welcoming response
  return `Namaste! I am Yatra, your AI India travel companion 🙏\n\nIndia is filled with wondrous journeys — from Himalayan peaks in Ladakh to sun-kissed lagoons in Kerala. Tell me what kind of trip you are envisioning, tap one of the mood chips above, or ask me about any Indian state, monument, or booking!`;
}

// Fallback model list ordered by speed & availability
const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
];

// Helper to call Gemini with automatic fallback on 503/429/overload
async function callGeminiWithFallback(apiKey: string, contents: any[]): Promise<string | null> {
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  for (const modelName of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      const isCapacityError =
        err?.status === 503 ||
        err?.code === 503 ||
        err?.status === "UNAVAILABLE" ||
        err?.message?.includes("503") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("RESOURCE_EXHAUSTED") ||
        err?.message?.includes("429");

      if (isCapacityError) {
        console.warn(`[Yatra AI] Model ${modelName} temporarily busy/unavailable. Trying next model...`);
        continue;
      } else {
        console.warn(`[Yatra AI] Error with model ${modelName}:`, err?.message || err);
        continue;
      }
    }
  }

  return null;
}

// Haversine distance in kilometers (rounded to 1 decimal place)
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// API Router setup (supports both /api/* and direct /* if rewritten by Vercel)
const apiRouter = express.Router();

apiRouter.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const fallbackReply = generateFallbackResponse(messages);
      return res.json({ reply: fallbackReply });
    }

    const formattedContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const reply = await callGeminiWithFallback(apiKey, formattedContents);

    if (reply) {
      return res.json({ reply });
    }

    const fallbackReply = generateFallbackResponse(messages);
    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error("Yatra API chat error:", error?.message || error);
    const fallbackReply = generateFallbackResponse(req.body.messages || []);
    return res.json({ reply: fallbackReply });
  }
});

// Endpoint to stream or download the complete 83-destination PostgreSQL migration script
apiRouter.get("/supabase/migration-sql", (req, res) => {
  const filePath = path.join(process.cwd(), "supabase-destinations-migration.sql");
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", "inline; filename=\"supabase-destinations-migration.sql\"");
    res.sendFile(filePath);
  } else {
    res.status(404).send("-- Error: Migration SQL script file not found");
  }
});

// Server-side endpoint to migrate destinations safely using SUPABASE_SERVICE_ROLE_KEY
apiRouter.post("/destinations/migrate", async (req, res) => {
  try {
    const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseUrl = rawUrl.trim().replace(/\/+$/, "").replace(/\/rest\/v1\/?$/, "");
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      return res.status(400).json({ success: false, error: "Missing Supabase configuration" });
    }

    const { createClient } = await import("@supabase/supabase-js");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const rows = PLACES_DATA.map((p) => ({
      id: p.id,
      name: p.name,
      state: p.state,
      category: p.category,
      short_desc: p.shortDesc,
      why_visit: p.whyVisit,
      best_time_to_visit: p.bestTimeToVisit,
      how_to_reach: p.howToReach,
      entry_info: p.entryInfo,
      traveler_tip: p.travelerTip,
      tags: p.tags,
      images: p.images,
      image_attributions: p.imageAttributions || [],
      coordinates: p.coordinates,
      featured: Boolean(p.featured),
    }));

    const batchSize = 20;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase.from("destinations").upsert(batch, { onConflict: "id" });
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
    }

    const { count } = await supabase.from("destinations").select("*", { count: "exact", head: true });
    return res.json({ success: true, count: count ?? rows.length, total: rows.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Migration failed" });
  }
});

// Server-side Google Places API (New) endpoint for real nearby accommodation search
apiRouter.all("/places/nearby-hotels", async (req, res) => {
  try {
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
});

const app = express();
app.use(express.json());

// Mount the API router on both /api (standard path) and root / (in case of Vercel path rewrite)
app.use("/api", apiRouter);
app.use(apiRouter);

export { app, apiRouter };
export default app;
