import { createClient } from "@supabase/supabase-js";
import { PLACES_DATA } from "../src/data/places.ts";

const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseUrl = rawUrl.trim().replace(/\/+$/, "").replace(/\/rest\/v1\/?$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

async function runMigration() {
  console.log("----------------------------------------------------------------");
  console.log("BHRAMAN -> SUPABASE DESTINATIONS MIGRATION");
  console.log("----------------------------------------------------------------");

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Missing Supabase credentials.");
    console.error("Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) are defined.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`📡 Connecting to Supabase project: ${supabaseUrl}`);
  console.log(`📦 Preparing ${PLACES_DATA.length} destinations for migration...`);

  // Transform into table payload
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

  // Upsert in batches of 20 to avoid payload size constraints
  const batchSize = 20;
  let successCount = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from("destinations")
      .upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
    } else {
      successCount += batch.length;
      console.log(`✅ Migrated batch ${Math.floor(i / batchSize) + 1} (${successCount}/${rows.length} places)`);
    }
  }

  // Verify total count in table
  const { count, error: countError } = await supabase
    .from("destinations")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.warn("⚠️ Could not verify exact count:", countError.message);
  } else {
    console.log(`🎉 Migration complete! Total rows in 'destinations' table: ${count}`);
  }
}

runMigration().catch((err) => {
  console.error("Fatal migration error:", err);
  process.exit(1);
});
