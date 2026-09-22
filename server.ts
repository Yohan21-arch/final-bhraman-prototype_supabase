import "dotenv/config";
import path from "path";
import fs from "fs";
import express from "express";
import chatHandler from "./api/chat.ts";
import nearbyHotelsHandler from "./api/places/nearby-hotels.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount API routes for local development
app.all("/api/chat", chatHandler);
app.all("/api/places/nearby-hotels", nearbyHotelsHandler);

// Endpoint to stream or download the complete 83-destination PostgreSQL migration script
app.get("/api/supabase/migration-sql", (req, res) => {
  const filePath = path.join(process.cwd(), "supabase-destinations-migration.sql");
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", 'inline; filename="supabase-destinations-migration.sql"');
    res.sendFile(filePath);
  } else {
    res.status(404).send("-- Error: Migration SQL script file not found");
  }
});

// Server-side endpoint to migrate destinations safely using SUPABASE_SERVICE_ROLE_KEY
app.post("/api/destinations/migrate", async (req, res) => {
  try {
    const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseUrl = rawUrl.trim().replace(/\/+$/, "").replace(/\/rest\/v1\/?$/, "");
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      return res.status(400).json({ success: false, error: "Missing Supabase configuration" });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const { PLACES_DATA } = await import("./src/data/places.ts");

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

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bhraman server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
