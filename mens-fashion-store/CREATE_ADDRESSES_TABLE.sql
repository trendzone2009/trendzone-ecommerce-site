-- CREATE ADDRESSES TABLE FOR SAVED SHIPPING ADDRESSES
-- Run this in your Supabase SQL Editor

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL, -- Can be email, phone, or session ID
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN DEFAULT false,
  label TEXT DEFAULT 'Home', -- 'Home', 'Work', 'Other'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Allow public to insert addresses
DROP POLICY IF EXISTS "Public can create addresses" ON addresses;
CREATE POLICY "Public can create addresses"
  ON addresses FOR INSERT
  WITH CHECK (true);

-- Allow public to read addresses
DROP POLICY IF EXISTS "Public can read addresses" ON addresses;
CREATE POLICY "Public can read addresses"
  ON addresses FOR SELECT
  USING (true);

-- Allow public to update addresses
DROP POLICY IF EXISTS "Public can update addresses" ON addresses;
CREATE POLICY "Public can update addresses"
  ON addresses FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow public to delete addresses
DROP POLICY IF EXISTS "Public can delete addresses" ON addresses;
CREATE POLICY "Public can delete addresses"
  ON addresses FOR DELETE
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_identifier);

-- Verify table creation
SELECT * FROM addresses LIMIT 0;

