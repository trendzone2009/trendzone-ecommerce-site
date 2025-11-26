# ⚡ Quick Fix: Order Error

## The Problem
Order creation failing with: `{"message":"Failed to create order"}`

## The Fix (2 Minutes)

### 1️⃣ Go to Supabase SQL Editor
- https://supabase.com
- Open your project
- Click **SQL Editor**
- Click **New Query**

### 2️⃣ Copy-Paste This SQL

```sql
-- Fix RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can create orders" ON orders;
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can create order items" ON order_items;
CREATE POLICY "Public can create order items" ON order_items FOR INSERT WITH CHECK (true);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can update variants" ON product_variants;
CREATE POLICY "Public can update variants" ON product_variants FOR UPDATE USING (true) WITH CHECK (true);
```

### 3️⃣ Click Run (or Ctrl+Enter)

### 4️⃣ Reload Your App
- Refresh http://localhost:3000
- Try placing an order again ✅

## That's It!

If still having issues, see **TROUBLESHOOT_ORDER_ERROR.md** for detailed debugging.
