# 🔧 Fix: "Failed to create order" Error

## Problem
When you try to place an order, you get: `{"message":"Failed to create order"}`

## Root Cause
**Supabase Row Level Security (RLS) policies** are preventing the order API from creating orders.

---

## Solution (3 Steps)

### Step 1: Run the RLS Fix SQL

1. **Open Supabase Console**
   - Go to https://supabase.com
   - Open your project

2. **Go to SQL Editor**
   - Click the SQL Editor icon on the left
   - Click "New Query"

3. **Copy and paste this SQL:**

```sql
-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public to insert orders
DROP POLICY IF EXISTS "Public can create orders" ON orders;
CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Allow public to read orders
DROP POLICY IF EXISTS "Public can read orders" ON orders;
CREATE POLICY "Public can read orders"
  ON orders FOR SELECT
  USING (true);

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
```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Wait for success** - You should see "Success" message

---

### Step 2: Verify RLS Policies

1. In **Supabase Console**, go to **Authentication → Policies**
2. Select table: **orders**
3. You should see policy: "Public can create orders" ✅

4. Select table: **order_items**
5. You should see policy: "Public can create order items" ✅

---

### Step 3: Test Again

1. **Go to your app** - http://localhost:3000/products
2. **Add product to cart**
3. **Go to checkout**
4. **Fill the form:**
   ```
   Name: Test User
   Email: test@example.com
   Phone: 9876543210
   Address: 123 Main Street
   City: Delhi
   State: Delhi
   Pincode: 110001
   ```
5. **Select "Cash on Delivery"**
6. **Click "Place Order"**
7. ✅ **Should see order confirmation page!**

---

## Verify It Worked

### In Supabase Console:

1. **Click "orders" table**
   - You should see your new order
   - Shows order_number, customer_name, total, etc.

2. **Click "order_items" table**
   - Shows items from your order
   - product_name, size, quantity, price

3. **Click "product_variants" table**
   - Stock should have decreased
   - For example, if you ordered 1 unit of M size, it reduced from 15 to 14

---

## Still Getting Error?

### Check Server Logs:

1. **Look at terminal where you ran `npm run dev`**
2. **Find error message** in the console output
3. **Common errors:**
   - `relation "orders" does not exist` → Schema wasn't imported
   - `permission denied for table orders` → RLS policy issue
   - `Invalid JWT` → Wrong Supabase keys in .env.local

### Debug Steps:

1. **Verify Supabase keys are correct**
   ```bash
   cat .env.local | grep SUPABASE
   ```
   Make sure they match your Supabase project

2. **Check database schema exists**
   - Go to Supabase Console
   - Click "Database" → "Tables"
   - You should see:
     - orders ✅
     - order_items ✅
     - product_variants ✅
     - products ✅
     - categories ✅

3. **Verify RLS policies are enabled**
   - Go to "Authentication" → "Policies"
   - For each table, check if policies exist

---

## Alternative: Disable RLS (Not Recommended)

If RLS policies still don't work, you can temporarily disable RLS:

```sql
-- TEMPORARY: Disable RLS for debugging
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
```

Then test again. If it works, the issue was RLS policies. Re-enable them and fix the policies.

---

## After Fix: Test Checkout Flow

### 1. Test with COD (Cash on Delivery)
```
✓ Add item to cart
✓ Go to checkout
✓ Fill form
✓ Select "Cash on Delivery"
✓ Click "Place Order"
✓ See confirmation page
```

### 2. Test with Razorpay (if keys added)
```
✓ Add item to cart
✓ Go to checkout
✓ Fill form
✓ Select "Pay Online"
✓ Razorpay modal opens
✓ Use test card: 4111 1111 1111 1111
✓ See confirmation page
```

---

## 🎯 Summary

**The fix is simple:**
1. Copy the SQL above
2. Run in Supabase SQL Editor
3. Reload your app
4. Try placing an order again
5. Should work! ✅

---

## Need More Help?

- Check server logs in terminal
- Verify Supabase keys in .env.local
- Make sure database tables exist
- Make sure RLS policies are created

If still stuck, provide the **exact error message from the server console** and I can debug further.
