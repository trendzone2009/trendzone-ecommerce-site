-- ================================================================
-- USER ACCOUNTS DATABASE SETUP
-- Run this SQL in your Supabase SQL Editor
-- ================================================================

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create saved_addresses table
CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- e.g., "Home", "Office", "Default"
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Link orders to users (modify existing orders table)
-- Add user_id column to orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON public.saved_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_is_default ON public.saved_addresses(is_default);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- 5. Row Level Security (RLS) Policies

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Enable RLS on saved_addresses
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own addresses
CREATE POLICY "Users can view own addresses" ON public.saved_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own addresses
CREATE POLICY "Users can insert own addresses" ON public.saved_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own addresses
CREATE POLICY "Users can update own addresses" ON public.saved_addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own addresses
CREATE POLICY "Users can delete own addresses" ON public.saved_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update RLS policy for orders to allow users to view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IS NULL -- Allow viewing guest orders
  );

-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_addresses_updated_at
  BEFORE UPDATE ON public.saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Create function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    -- Set all other addresses for this user to not default
    UPDATE public.saved_addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for default address enforcement
CREATE TRIGGER enforce_single_default_address
  BEFORE INSERT OR UPDATE ON public.saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check if tables were created successfully
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_profiles', 'saved_addresses');

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'saved_addresses');

-- Check if indexes were created
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'saved_addresses');

-- ================================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================================

-- Note: User profiles will be created automatically when users register
-- This is just an example of the data structure

-- Example: Insert a saved address (replace user_id with actual user UUID)
-- INSERT INTO public.saved_addresses (
--   user_id,
--   label,
--   name,
--   phone,
--   address_line1,
--   city,
--   state,
--   pincode,
--   is_default
-- ) VALUES (
--   'your-user-uuid-here',
--   'Home',
--   'John Doe',
--   '+91-9876543210',
--   '123 Main Street',
--   'Mumbai',
--   'Maharashtra',
--   '400001',
--   true
-- );

-- ================================================================
-- CLEANUP (Use only if you need to remove everything)
-- ================================================================

-- DROP TABLE IF EXISTS public.saved_addresses CASCADE;
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
-- DROP FUNCTION IF EXISTS ensure_single_default_address() CASCADE;
