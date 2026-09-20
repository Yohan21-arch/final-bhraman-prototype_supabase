-- ==============================================================================
-- BHRAMAN: SUPABASE AUTH & USER ACCOUNT SCHEMA
-- Tables: profiles, saved_destinations, travel_plans, bookings
-- Row Level Security (RLS) enabled on all tables
-- ==============================================================================

-- 1. PROFILES TABLE
-- References auth.users(id) directly
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- Trigger: Automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    'en'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = CASE WHEN public.profiles.avatar_url IS NULL OR public.profiles.avatar_url = '' THEN EXCLUDED.avatar_url ELSE public.profiles.avatar_url END,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. SAVED DESTINATIONS TABLE
-- Connects authenticated users with saved destination records
CREATE TABLE IF NOT EXISTS public.saved_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, destination_id)
);

-- Index for quick lookup by user
CREATE INDEX IF NOT EXISTS idx_saved_destinations_user ON public.saved_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_destinations_dest ON public.saved_destinations(destination_id);

-- Enable RLS on saved_destinations
ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;

-- Saved Destinations Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_destinations' AND policyname = 'Users can view their own saved destinations'
  ) THEN
    CREATE POLICY "Users can view their own saved destinations"
      ON public.saved_destinations FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_destinations' AND policyname = 'Users can add their own saved destinations'
  ) THEN
    CREATE POLICY "Users can add their own saved destinations"
      ON public.saved_destinations FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_destinations' AND policyname = 'Users can remove their own saved destinations'
  ) THEN
    CREATE POLICY "Users can remove their own saved destinations"
      ON public.saved_destinations FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;


-- 3. TRAVEL PLANS TABLE (ITINERARIES)
CREATE TABLE IF NOT EXISTS public.travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  destinations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for lookup by user
CREATE INDEX IF NOT EXISTS idx_travel_plans_user ON public.travel_plans(user_id);

-- Enable RLS on travel_plans
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;

-- Travel Plans Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'travel_plans' AND policyname = 'Users can view their own travel plans'
  ) THEN
    CREATE POLICY "Users can view their own travel plans"
      ON public.travel_plans FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'travel_plans' AND policyname = 'Users can create their own travel plans'
  ) THEN
    CREATE POLICY "Users can create their own travel plans"
      ON public.travel_plans FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'travel_plans' AND policyname = 'Users can update their own travel plans'
  ) THEN
    CREATE POLICY "Users can update their own travel plans"
      ON public.travel_plans FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'travel_plans' AND policyname = 'Users can delete their own travel plans'
  ) THEN
    CREATE POLICY "Users can delete their own travel plans"
      ON public.travel_plans FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;


-- 4. BOOKINGS TABLE (ILLUSTRATIVE / DEMO BOOKING RECORDS)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference_id TEXT NOT NULL,
  destination_id TEXT,
  destination_name TEXT NOT NULL,
  booking_type TEXT NOT NULL,
  dates TEXT,
  travelers TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  notes TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for lookup by user
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can view their own bookings'
  ) THEN
    CREATE POLICY "Users can view their own bookings"
      ON public.bookings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can create their own bookings'
  ) THEN
    CREATE POLICY "Users can create their own bookings"
      ON public.bookings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can update their own bookings'
  ) THEN
    CREATE POLICY "Users can update their own bookings"
      ON public.bookings FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can delete their own bookings'
  ) THEN
    CREATE POLICY "Users can delete their own bookings"
      ON public.bookings FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;
