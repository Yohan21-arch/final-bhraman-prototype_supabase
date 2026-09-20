import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { SavedDestination, TravelPlan, BookingRecord, Place } from "@/types";
import { getLoadedPlaces, placeById } from "@/data/places";

const LOCAL_SAVED_KEY = "bhraman_trip_list";
const LOCAL_BOOKINGS_KEY = "bhraman_demo_bookings";

/**
 * Service for managing user-specific cloud data in Supabase with resilient offline fallback
 */
export const userAccountService = {
  // ==========================================
  // SAVED DESTINATIONS
  // ==========================================

  /**
   * Fetch all saved destinations for a user from Supabase, or fallback to local storage
   */
  async getSavedDestinations(userId: string): Promise<SavedDestination[]> {
    if (!isSupabaseConfigured() || !userId) {
      return this.getLocalSavedDestinations(userId);
    }

    try {
      const { data, error } = await supabase
        .from("saved_destinations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not query saved_destinations table:", error.message);
        return this.getLocalSavedDestinations(userId);
      }

      const allPlaces = getLoadedPlaces();
      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        destination_id: row.destination_id,
        notes: row.notes,
        created_at: row.created_at,
        destination: allPlaces.find((p) => p.id === row.destination_id) || placeById(row.destination_id) || undefined,
      }));
    } catch (err) {
      console.warn("Exception fetching saved destinations:", err);
      return this.getLocalSavedDestinations(userId);
    }
  },

  /**
   * Save a destination to the user's account
   */
  async addSavedDestination(userId: string, destinationId: string, notes?: string): Promise<boolean> {
    // Always update local cache for instant UI feedback
    this.addLocalSavedDestination(destinationId, notes);

    if (!isSupabaseConfigured() || !userId) return true;

    try {
      const { error } = await supabase
        .from("saved_destinations")
        .upsert(
          {
            user_id: userId,
            destination_id: destinationId,
            notes: notes || null,
          },
          { onConflict: "user_id,destination_id" }
        );

      if (error) {
        console.warn("Could not save destination to Supabase:", error.message);
      }
      return !error;
    } catch (err) {
      console.warn("Exception saving destination to Supabase:", err);
      return false;
    }
  },

  /**
   * Remove a saved destination from the user's account
   */
  async removeSavedDestination(userId: string, destinationId: string): Promise<boolean> {
    this.removeLocalSavedDestination(destinationId);

    if (!isSupabaseConfigured() || !userId) return true;

    try {
      const { error } = await supabase
        .from("saved_destinations")
        .delete()
        .eq("user_id", userId)
        .eq("destination_id", destinationId);

      if (error) {
        console.warn("Could not remove saved destination from Supabase:", error.message);
      }
      return !error;
    } catch (err) {
      console.warn("Exception removing saved destination:", err);
      return false;
    }
  },

  /**
   * Sync local items to Supabase when user logs in
   */
  async syncLocalItemsToCloud(userId: string): Promise<void> {
    if (!isSupabaseConfigured() || !userId) return;

    try {
      const local = this.getLocalSavedDestinations(userId);
      if (local.length === 0) return;

      const records = local.map((item) => ({
        user_id: userId,
        destination_id: item.destination_id,
        notes: item.notes || null,
      }));

      await supabase
        .from("saved_destinations")
        .upsert(records, { onConflict: "user_id,destination_id" });
    } catch (err) {
      console.warn("Could not sync local saved destinations to cloud:", err);
    }
  },

  // Local fallback helpers
  getLocalSavedDestinations(userId: string): SavedDestination[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LOCAL_SAVED_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const allPlaces = getLoadedPlaces();
      return (parsed || []).map((item: any) => {
        const destinationId = typeof item === "string" ? item : item.placeId;
        return {
          id: `local-${destinationId}`,
          user_id: userId || "guest",
          destination_id: destinationId,
          notes: item.notes || null,
          created_at: new Date(item.addedAt || Date.now()).toISOString(),
          destination: allPlaces.find((p) => p.id === destinationId) || placeById(destinationId) || undefined,
        };
      });
    } catch {
      return [];
    }
  },

  addLocalSavedDestination(destinationId: string, notes?: string) {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LOCAL_SAVED_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const exists = parsed.some((i: any) => (typeof i === "string" ? i : i.placeId) === destinationId);
      if (!exists) {
        parsed.push({ placeId: destinationId, addedAt: Date.now(), notes });
        localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(parsed));
        window.dispatchEvent(new Event("bhraman_trip_list_change"));
      }
    } catch {}
  },

  removeLocalSavedDestination(destinationId: string) {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LOCAL_SAVED_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const filtered = parsed.filter((i: any) => (typeof i === "string" ? i : i.placeId) !== destinationId);
      localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new Event("bhraman_trip_list_change"));
    } catch {}
  },

  // ==========================================
  // TRAVEL PLANS (MY TRIPS)
  // ==========================================

  async getTravelPlans(userId: string): Promise<TravelPlan[]> {
    if (!isSupabaseConfigured() || !userId) {
      return this.getLocalTravelPlans();
    }

    try {
      const { data, error } = await supabase
        .from("travel_plans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not query travel_plans table:", error.message);
        return this.getLocalTravelPlans();
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        description: row.description,
        start_date: row.start_date,
        end_date: row.end_date,
        destinations: Array.isArray(row.destinations) ? row.destinations : [],
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (err) {
      console.warn("Exception fetching travel plans:", err);
      return this.getLocalTravelPlans();
    }
  },

  async createTravelPlan(
    userId: string,
    plan: {
      name: string;
      description?: string;
      start_date?: string;
      end_date?: string;
      destinations?: string[];
    }
  ): Promise<TravelPlan | null> {
    const payload = {
      user_id: userId,
      name: plan.name,
      description: plan.description || null,
      start_date: plan.start_date || null,
      end_date: plan.end_date || null,
      destinations: plan.destinations || [],
    };

    if (!isSupabaseConfigured() || !userId) {
      const localPlan: TravelPlan = {
        id: `local-plan-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.saveLocalTravelPlan(localPlan);
      return localPlan;
    }

    try {
      const { data, error } = await supabase
        .from("travel_plans")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.warn("Could not insert travel plan to Supabase:", error.message);
        // Fallback local save
        const fallback: TravelPlan = {
          id: `local-plan-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString(),
        };
        this.saveLocalTravelPlan(fallback);
        return fallback;
      }

      return data as TravelPlan;
    } catch (err) {
      console.warn("Exception creating travel plan:", err);
      return null;
    }
  },

  async deleteTravelPlan(userId: string, planId: string): Promise<boolean> {
    this.deleteLocalTravelPlan(planId);

    if (!isSupabaseConfigured() || !userId) return true;

    try {
      const { error } = await supabase
        .from("travel_plans")
        .delete()
        .eq("id", planId)
        .eq("user_id", userId);

      return !error;
    } catch {
      return false;
    }
  },

  getLocalTravelPlans(): TravelPlan[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("bhraman_local_travel_plans");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveLocalTravelPlan(plan: TravelPlan) {
    if (typeof window === "undefined") return;
    try {
      const plans = this.getLocalTravelPlans();
      plans.unshift(plan);
      localStorage.setItem("bhraman_local_travel_plans", JSON.stringify(plans));
    } catch {}
  },

  deleteLocalTravelPlan(planId: string) {
    if (typeof window === "undefined") return;
    try {
      const plans = this.getLocalTravelPlans().filter((p) => p.id !== planId);
      localStorage.setItem("bhraman_local_travel_plans", JSON.stringify(plans));
    } catch {}
  },

  // ==========================================
  // BOOKINGS (DEMO / ILLUSTRATIVE BOOKING RECORDS)
  // ==========================================

  async getBookings(userId: string): Promise<BookingRecord[]> {
    if (!isSupabaseConfigured() || !userId) {
      return this.getLocalBookings();
    }

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not query bookings table:", error.message);
        return this.getLocalBookings();
      }

      return (data || []).map((b: any) => ({
        ...b,
        isDemo: true,
      }));
    } catch (err) {
      console.warn("Exception fetching bookings:", err);
      return this.getLocalBookings();
    }
  },

  async recordDemoBooking(
    userId: string,
    booking: {
      reference: string;
      destination: string;
      dates: string;
      travelers: string | number;
      type: string;
      destination_id?: string;
    }
  ): Promise<BookingRecord> {
    const record: BookingRecord = {
      id: `booking-${Date.now()}`,
      user_id: userId || "guest",
      reference_id: booking.reference,
      destination_name: booking.destination,
      destination_id: booking.destination_id || null,
      booking_type: booking.type,
      dates: booking.dates,
      travelers: String(booking.travelers),
      status: "confirmed",
      isDemo: true,
      created_at: new Date().toISOString(),
    };

    // Save in local storage cache
    this.saveLocalBooking(record);

    // Save in Supabase if user is logged in
    if (isSupabaseConfigured() && userId && userId !== "guest") {
      try {
        await supabase.from("bookings").insert({
          user_id: userId,
          reference_id: booking.reference,
          destination_name: booking.destination,
          destination_id: booking.destination_id || null,
          booking_type: booking.type,
          dates: booking.dates,
          travelers: String(booking.travelers),
          status: "confirmed",
          details: { demo: true, createdVia: "Yatra Chatbot" },
        });
      } catch (err) {
        console.warn("Could not save demo booking to Supabase:", err);
      }
    }

    return record;
  },

  getLocalBookings(): BookingRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LOCAL_BOOKINGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveLocalBooking(booking: BookingRecord) {
    if (typeof window === "undefined") return;
    try {
      const bookings = this.getLocalBookings();
      // avoid duplicates by reference_id
      if (!bookings.some((b) => b.reference_id === booking.reference_id)) {
        bookings.unshift(booking);
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
      }
    } catch {}
  },
};
