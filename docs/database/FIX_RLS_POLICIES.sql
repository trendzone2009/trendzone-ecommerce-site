-- FIX RLS POLICIES FOR ORDER CREATION
-- Run this in your Supabase SQL Editor

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public to insert orders
DROP POLICY IF EXISTS "Public can create orders" ON orders;
CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Allow public to read orders (optional, for future use)
DROP POLICY IF EXISTS "Public can read orders" ON orders;
CREATE POLICY "Public can read orders"
  ON orders FOR SELECT
  USING (true);

-- Allow public to update orders (for payment status updates)
DROP POLICY IF EXISTS "Public can update orders" ON orders;
CREATE POLICY "Public can update orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public to insert order items
DROP POLICY IF EXISTS "Public can create order items" ON order_items;
CREATE POLICY "Public can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Allow public to read order items
DROP POLICY IF EXISTS "Public can read order items" ON order_items;
CREATE POLICY "Public can read order items"
  ON order_items FOR SELECT
  USING (true);

-- Allow public to update product_variants (for stock)
DROP POLICY IF EXISTS "Public can update variants" ON product_variants;
CREATE POLICY "Public can update variants"
  ON product_variants FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('orders', 'order_items', 'product_variants');
