import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  PLACES_DATA,
  placeById as fallbackPlaceById,
  placesByState as fallbackPlacesByState,
  featuredPlaces as fallbackFeaturedPlaces,
  setLoadedPlaces,
} from "@/data/places";
import type { Place, Category, Tag, GeoCoordinates, ImageAttribution } from "@/types";

/**
 * Safely parse JSON or array fields that might be stored as text, JSON, or arrays in Supabase.
 */
function parseArrayField<T>(field: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(field)) return field as T[];
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Safely maps any database row from the Supabase "destinations" table
 * (supporting both snake_case and camelCase column naming schemas)
 * to the Bhraman `Place` interface.
 */
export function mapDestinationRow(row: Record<string, any>): Place {
  // Normalize coordinates: can be stored as JSON object {lat, lng} or separate lat / lng columns
  let coordinates: GeoCoordinates = { lat: 20.5937, lng: 78.9629 };
  if (row.coordinates && typeof row.coordinates === "object") {
    coordinates = {
      lat: Number(row.coordinates.lat) || 20.5937,
      lng: Number(row.coordinates.lng) || 78.9629,
    };
  } else if (typeof row.lat === "number" && typeof row.lng === "number") {
    coordinates = { lat: row.lat, lng: row.lng };
  } else if (typeof row.coordinates === "string") {
    try {
      const parsed = JSON.parse(row.coordinates);
      if (parsed && typeof parsed.lat === "number") {
        coordinates = { lat: parsed.lat, lng: parsed.lng };
      }
    } catch {
      // Keep default
    }
  }

  const tags = parseArrayField<Tag>(row.tags, ["Heritage"]);
  const images = parseArrayField<string>(row.images, []);
  const imageAttributions = parseArrayField<ImageAttribution>(
    row.image_attributions ?? row.imageAttributions,
    []
  );

  return {
    id: String(row.id || "").trim(),
    name: String(row.name || "Unnamed Landmark").trim(),
    state: String(row.state || "").trim().toLowerCase(),
    category: (row.category === "hidden" ? "hidden" : "iconic") as Category,
    shortDesc: String(row.short_desc ?? row.shortDesc ?? "").trim(),
    whyVisit: String(row.why_visit ?? row.whyVisit ?? "").trim(),
    bestTimeToVisit: String(row.best_time_to_visit ?? row.bestTimeToVisit ?? "October to March").trim(),
    howToReach: String(row.how_to_reach ?? row.howToReach ?? "").trim(),
    entryInfo: String(row.entry_info ?? row.entryInfo ?? "Open daily").trim(),
    travelerTip: String(row.traveler_tip ?? row.travelerTip ?? "").trim(),
    tags: tags.length > 0 ? tags : ["Heritage"],
    images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"],
    imageAttributions: imageAttributions.length > 0 ? imageAttributions : undefined,
    coordinates,
    featured: Boolean(row.featured),
  };
}

let _lastSourceIsSupabase = false;

/**
 * Service for fetching destinations from Supabase "destinations" table,
 * with graceful fallback to hardcoded PLACES_DATA.
 */
export const destinationService = {
  isCurrentSourceSupabase(): boolean {
    return _lastSourceIsSupabase;
  },

  /**
   * Fetches all destinations from the Supabase "destinations" table.
   * If Supabase is unconfigured or returns an error/empty set, falls back to PLACES_DATA.
   */
  async fetchDestinations(): Promise<Place[]> {
    if (!isSupabaseConfigured()) {
      _lastSourceIsSupabase = false;
      return PLACES_DATA;
    }

    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.warn("[destinationService] Error fetching from Supabase 'destinations':", error.message);
        _lastSourceIsSupabase = false;
        return PLACES_DATA;
      }

      if (!data || data.length === 0) {
        _lastSourceIsSupabase = false;
        console.info("[destinationService] 'destinations' table is empty. Attempting auto-migration...");
        const migration = await destinationService.migrateExistingDestinations({ force: true });
        if (migration.success) {
          const { data: migratedData, error: reError } = await supabase
            .from("destinations")
            .select("*")
            .order("name", { ascending: true });

          if (!reError && migratedData && migratedData.length > 0) {
            const mapped = migratedData.map(mapDestinationRow);
            setLoadedPlaces(mapped);
            _lastSourceIsSupabase = true;
            return mapped;
          }
        }
        return PLACES_DATA;
      }

      const mapped = data.map(mapDestinationRow);
      // Sync into loaded places cache for synchronous lookups
      setLoadedPlaces(mapped);
      _lastSourceIsSupabase = true;
      return mapped;
    } catch (err: any) {
      console.warn("[destinationService] Exception fetching destinations:", err?.message || err);
      _lastSourceIsSupabase = false;
      return PLACES_DATA;
    }
  },

  /**
   * Fetches a single destination by its unique ID.
   */
  async fetchDestinationById(id: string): Promise<Place | undefined> {
    if (!isSupabaseConfigured()) {
      return fallbackPlaceById(id);
    }

    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        return fallbackPlaceById(id);
      }

      return mapDestinationRow(data);
    } catch {
      return fallbackPlaceById(id);
    }
  },

  /**
   * Fetches destinations for a specific state ID.
   */
  async fetchDestinationsByState(stateId: string): Promise<Place[]> {
    if (!isSupabaseConfigured()) {
      return fallbackPlacesByState(stateId);
    }

    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .ilike("state", stateId.toLowerCase());

      if (error || !data || data.length === 0) {
        return fallbackPlacesByState(stateId);
      }

      return data.map(mapDestinationRow);
    } catch {
      return fallbackPlacesByState(stateId);
    }
  },

  /**
   * Fetches featured destinations (for highlights / showcase).
   */
  async fetchFeaturedDestinations(): Promise<Place[]> {
    if (!isSupabaseConfigured()) {
      return fallbackFeaturedPlaces();
    }

    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("featured", true);

      if (error || !data || data.length === 0) {
        return fallbackFeaturedPlaces();
      }

      return data.map(mapDestinationRow);
    } catch {
      return fallbackFeaturedPlaces();
    }
  },

  /**
   * Diagnostic check for Supabase connectivity and table presence.
   */
  async checkSupabaseStatus(): Promise<{
    configured: boolean;
    connected: boolean;
    count: number;
    error?: string;
  }> {
    if (!isSupabaseConfigured()) {
      return { configured: false, connected: false, count: 0 };
    }

    try {
      const { count, error } = await supabase
        .from("destinations")
        .select("*", { count: "exact", head: true });

      if (error) {
        return {
          configured: true,
          connected: false,
          count: 0,
          error: error.message,
        };
      }

      return {
        configured: true,
        connected: true,
        count: count ?? 0,
      };
    } catch (err: any) {
      return {
        configured: true,
        connected: false,
        count: 0,
        error: err?.message || "Failed to connect to Supabase",
      };
    }
  },

  /**
   * Comprehensive migration tool to migrate all existing 83 destinations from
   * the project's local catalog into the Supabase "destinations" table.
   * If force is true, upserts all records regardless of existing table row count.
   */
  async migrateExistingDestinations(options: { force?: boolean } = {}): Promise<{
    success: boolean;
    count: number;
    total: number;
    error?: string;
  }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        count: 0,
        total: PLACES_DATA.length,
        error: "Supabase credentials are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      };
    }

    try {
      if (!options.force) {
        // Check existing count first
        const { count } = await supabase
          .from("destinations")
          .select("*", { count: "exact", head: true });

        if (count && count >= PLACES_DATA.length) {
          return {
            success: true,
            count,
            total: PLACES_DATA.length,
            error: `Table already contains ${count} destinations.`,
          };
        }
      }

      // Try server-side migration first (which has access to SUPABASE_SERVICE_ROLE_KEY)
      try {
        const serverRes = await fetch("/api/destinations/migrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (serverRes.ok) {
          const serverJson = await serverRes.json();
          if (serverJson.success) {
            // Re-fetch from Supabase to sync memory store
            const { data } = await supabase
              .from("destinations")
              .select("*")
              .order("name", { ascending: true });
            if (data && data.length > 0) {
              setLoadedPlaces(data.map(mapDestinationRow));
              _lastSourceIsSupabase = true;
            }
            return {
              success: true,
              count: serverJson.count || PLACES_DATA.length,
              total: PLACES_DATA.length,
            };
          }
        }
      } catch (e) {
        console.warn("[destinationService] Server migration route unreachable, attempting direct client upsert...", e);
      }

      // Prepare payload formatted for Supabase table
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

      // Upsert in batches of 20 to respect payload limits
      const batchSize = 20;
      let upsertedCount = 0;

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await supabase
          .from("destinations")
          .upsert(batch, { onConflict: "id" });

        if (error) {
          console.error(`[destinationService] Migration batch failed:`, error.message);
          let userMsg = error.message;
          if (error.message.includes("violates row-level security policy") || (error as any).code === "42501") {
            userMsg = "Row-Level Security (RLS) is preventing writes via the public anon key. In your Supabase SQL Editor, run: CREATE POLICY \"Allow public write to destinations\" ON destinations FOR ALL USING (true) WITH CHECK (true);";
          }
          return {
            success: false,
            count: upsertedCount,
            total: rows.length,
            error: userMsg,
          };
        }
        upsertedCount += batch.length;
      }

      // Re-query table count to confirm
      const { count: finalCount } = await supabase
        .from("destinations")
        .select("*", { count: "exact", head: true });

      // Refresh memory store with latest Supabase rows
      const { data } = await supabase
        .from("destinations")
        .select("*")
        .order("name", { ascending: true });

      if (data && data.length > 0) {
        setLoadedPlaces(data.map(mapDestinationRow));
        _lastSourceIsSupabase = true;
      }

      return {
        success: true,
        count: finalCount ?? upsertedCount,
        total: rows.length,
      };
    } catch (err: any) {
      console.error("[destinationService] Migration exception:", err);
      return {
        success: false,
        count: 0,
        total: PLACES_DATA.length,
        error: err?.message || "Failed to migrate destinations to Supabase.",
      };
    }
  },

  /**
   * Helper utility to seed/sync the baseline destinations into the Supabase
   * "destinations" table if it has been created and is currently empty.
   */
  async seedDestinationsTable(): Promise<{ success: boolean; count: number; error?: string }> {
    const res = await this.migrateExistingDestinations({ force: true });
    return { success: res.success, count: res.count, error: res.error };
  },
};

/**
 * Custom React Hook for fetching destinations from Supabase with instant fallback,
 * loading state, and revalidation.
 */
export function useDestinations() {
  const [places, setPlaces] = useState<Place[]>(PLACES_DATA);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);
  const [isUsingSupabase, setIsUsingSupabase] = useState<boolean>(false);

  const loadDestinations = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setPlaces(PLACES_DATA);
      setLoading(false);
      setIsUsingSupabase(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await destinationService.fetchDestinations();
      setPlaces(data);
      setIsUsingSupabase(destinationService.isCurrentSourceSupabase());
    } catch (err: any) {
      console.warn("useDestinations failed, falling back to local data:", err);
      setError(err?.message || "Failed to load from Supabase");
      setPlaces(PLACES_DATA);
      setIsUsingSupabase(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  return {
    places,
    loading,
    error,
    isUsingSupabase,
    refresh: loadDestinations,
    migrate: destinationService.migrateExistingDestinations,
    totalCount: places.length,
  };
}
