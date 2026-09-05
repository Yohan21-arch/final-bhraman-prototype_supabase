import fs from "fs";
import path from "path";
import { PLACES_DATA } from "../src/data/places.ts";

function escapeSqlString(val: string): string {
  if (!val) return "''";
  return "'" + val.replace(/'/g, "''") + "'";
}

function escapeJson(val: any): string {
  return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
}

let sql = `-- ==============================================================================
-- BHRAMAN: SUPABASE DESTINATIONS MIGRATION SCRIPT
-- Contains all 83 hand-scouted historical monuments, natural wonders & hidden gems
-- ==============================================================================

-- 1. Ensure the destinations table exists with proper types & constraints
CREATE TABLE IF NOT EXISTS destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('iconic', 'hidden')),
  short_desc TEXT,
  why_visit TEXT,
  best_time_to_visit TEXT,
  how_to_reach TEXT,
  entry_info TEXT,
  traveler_tip TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  image_attributions JSONB DEFAULT '[]'::jsonb,
  coordinates JSONB DEFAULT '{"lat": 20.5937, "lng": 78.9629}'::jsonb,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Configure Row Level Security (RLS)
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Allow public read access to everyone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'destinations' AND policyname = 'Allow public read access to destinations'
  ) THEN
    CREATE POLICY "Allow public read access to destinations"
      ON destinations FOR SELECT
      USING (true);
  END IF;
END
$$;

-- Allow public/authenticated insert and update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'destinations' AND policyname = 'Allow public write to destinations'
  ) THEN
    CREATE POLICY "Allow public write to destinations"
      ON destinations FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- 3. Upsert all 83 destinations into the destinations table
`;

PLACES_DATA.forEach((p, index) => {
  sql += `
INSERT INTO destinations (
  id,
  name,
  state,
  category,
  short_desc,
  why_visit,
  best_time_to_visit,
  how_to_reach,
  entry_info,
  traveler_tip,
  tags,
  images,
  image_attributions,
  coordinates,
  featured
) VALUES (
  ${escapeSqlString(p.id)},
  ${escapeSqlString(p.name)},
  ${escapeSqlString(p.state)},
  ${escapeSqlString(p.category)},
  ${escapeSqlString(p.shortDesc)},
  ${escapeSqlString(p.whyVisit)},
  ${escapeSqlString(p.bestTimeToVisit)},
  ${escapeSqlString(p.howToReach)},
  ${escapeSqlString(p.entryInfo)},
  ${escapeSqlString(p.travelerTip)},
  ${escapeJson(p.tags)},
  ${escapeJson(p.images)},
  ${escapeJson(p.imageAttributions || [])},
  ${escapeJson(p.coordinates)},
  ${p.featured ? "true" : "false"}
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  state = EXCLUDED.state,
  category = EXCLUDED.category,
  short_desc = EXCLUDED.short_desc,
  why_visit = EXCLUDED.why_visit,
  best_time_to_visit = EXCLUDED.best_time_to_visit,
  how_to_reach = EXCLUDED.how_to_reach,
  entry_info = EXCLUDED.entry_info,
  traveler_tip = EXCLUDED.traveler_tip,
  tags = EXCLUDED.tags,
  images = EXCLUDED.images,
  image_attributions = EXCLUDED.image_attributions,
  coordinates = EXCLUDED.coordinates,
  featured = EXCLUDED.featured;
`;
});

sql += `
-- Verification Query
SELECT count(*) AS total_migrated_destinations FROM destinations;
`;

const outputPath = path.resolve(process.cwd(), "supabase-destinations-migration.sql");
fs.writeFileSync(outputPath, sql, "utf-8");
console.log(`Successfully generated migration SQL with ${PLACES_DATA.length} destinations at: ${outputPath}`);
