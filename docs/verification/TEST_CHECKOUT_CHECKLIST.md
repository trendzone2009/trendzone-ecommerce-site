# ✅ CHECKOUT FLOW - TESTING CHECKLIST

**Use this checklist to verify the checkout flow works correctly.**

---

## 🔧 SETUP STEPS (Do These First)

### Step 1: Fix Database RLS Policies
- [ ] Open Supabase Console
- [ ] Go to SQL Editor
- [ ] Create new query
- [ ] Copy SQL from `FIX_RLS_POLICIES.sql`
- [ ] Run the query
- [ ] Wait for "Success" message

### Step 2: Add Sample Products
- [ ] Run product insertion SQL (provided in documentation)
- [ ] Verify products appear in Supabase console
- [ ] Verify products have variants with stock

### Step 3: Check Environment Variables
- [ ] Verify `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Verify `.env.local` has `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Verify `.env.local` has `NEXT_PUBLIC_RAZORPAY_KEY_ID` (test key)

### Step 4: Start Development Server
```bash
cd mens-fashion-store
npm run dev
```
- [ ] Server running on http://localhost:3000
- [ ] No errors in terminal

---

## 🛒 TEST COD (Cash on Delivery) FLOW

### Test Case 1: Complete COD Checkout

**Test Data:**
```
Name: Test User
Email: test@example.com
Phone: 9876543210
Address Line 1: 123 Main Street
Address Line 2: (leave empty)
City: Delhi
State: Delhi
Pincode: 110001
Landmark: (optional)
Payment: Cash on Delivery
```

**Steps:**
1. [ ] Go to http://localhost:3000/products
2. [ ] Click "Add to Cart" on any product
3. [ ] Click "Proceed to Checkout"
4. [ ] Verify checkout page loads
5. [ ] Verify order summary shows:
   - [ ] Cart items with images
   - [ ] Item quantity and size
   - [ ] Subtotal amount
   - [ ] Shipping charge (free if ≥ ₹999, ₹99 otherwise)
   - [ ] Total amount
6. [ ] Fill shipping form with test data above
7. [ ] Verify form validates as you type
8. [ ] Select "Cash on Delivery"
9. [ ] Click "Place Order"
10. [ ] Verify loading spinner appears
11. [ ] Wait for redirect (should be automatic)
12. [ ] **Expected Result:** See order confirmation page

### Test Case 2: Verify Order Confirmation Page

**Expected Content:**
- [ ] Order number (ORD-YYYYMMDD-XXXXX format)
- [ ] Order date (today's date)
- [ ] Payment method: "Cash on Delivery"
- [ ] Shipping address with all details
- [ ] Order summary with:
  - [ ] Subtotal
  - [ ] Shipping charge
  - [ ] Total amount
- [ ] Expected delivery date (5-7 business days)
- [ ] "What's Next?" steps
- [ ] Support contact information
- [ ] "Continue Shopping" button

**Steps:**
1. [ ] Note the order number from confirmation page
2. [ ] Verify address is correct
3. [ ] Verify totals are correct
4. [ ] Click "Continue Shopping"
5. [ ] **Expected Result:** Redirect to products page

### Test Case 3: Verify Order in Database

**Steps:**
1. [ ] Open Supabase Console
2. [ ] Click "orders" table
3. [ ] [ ] Find your test order by:
   - [ ] Order number
   - [ ] Customer name
   - [ ] Date (today)
4. [ ] Verify columns:
   - [ ] order_number: ORD-YYYYMMDD-XXXXX ✅
   - [ ] customer_name: Test User ✅
   - [ ] customer_email: test@example.com ✅
   - [ ] customer_phone: 9876543210 ✅
   - [ ] shipping_address: JSON with full address ✅
   - [ ] subtotal: Correct amount ✅
   - [ ] shipping_charge: Correct amount ✅
   - [ ] total: Correct amount ✅
   - [ ] payment_method: "COD" ✅
   - [ ] status: "pending" ✅

### Test Case 4: Verify Order Items

**Steps:**
1. [ ] Open Supabase Console
2. [ ] Click "order_items" table
3. [ ] Filter by order_id from Test Case 3
4. [ ] Verify each item:
   - [ ] product_name: Correct product name ✅
   - [ ] product_image: Image URL ✅
   - [ ] size: Correct size ✅
   - [ ] quantity: Correct quantity ✅
   - [ ] price: Price at time of order ✅

### Test Case 5: Verify Stock Reduced

**Steps:**
1. [ ] Note product and size added to cart
2. [ ] Open Supabase Console
3. [ ] Click "product_variants" table
4. [ ] Find the variant (product + size)
5. [ ] Verify stock_quantity reduced by order quantity
   - Example: If ordered 2 units and stock was 15, should now be 13

---

## 💳 TEST RAZORPAY INTEGRATION

### Setup: Add Razorpay Test Keys

**Get Test Keys from Razorpay Dashboard:**
1. [ ] Log in to Razorpay dashboard
2. [ ] Go to Settings → API Keys
3. [ ] Copy test Key ID
4. [ ] Add to `.env.local`:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_test_key_here
   ```
5. [ ] Restart dev server

### Test Case 6: Complete Razorpay Checkout

**Steps:**
1. [ ] Go to http://localhost:3000/products
2. [ ] Click "Add to Cart" on any product
3. [ ] Click "Proceed to Checkout"
4. [ ] Fill shipping form with test data
5. [ ] Select "Pay Online"
6. [ ] Click "Place Order"
7. [ ] [ ] Verify Razorpay modal opens showing:
   - [ ] Amount to pay
   - [ ] UPI/Cards/NetBanking options
   - [ ] Close button
8. [ ] Click on "Cards" tab
9. [ ] Enter test card details:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
   - Name: Test User
10. [ ] Click "Pay" button
11. [ ] **Expected Result:** Modal closes and redirects to confirmation
12. [ ] **Expected URL:** `/order-confirmation/[orderId]?orderNumber=ORD-...`

### Test Case 7: Verify Razorpay Order in Database

**Steps:**
1. [ ] Open Supabase Console
2. [ ] Click "orders" table
3. [ ] Find order from Test Case 6
4. [ ] Verify columns:
   - [ ] order_number: ORD-YYYYMMDD-XXXXX ✅
   - [ ] payment_method: "RAZORPAY" ✅
   - [ ] status: "processing" ✅ (different from COD!)
   - [ ] razorpay_order_id: Present ✅
   - [ ] razorpay_payment_id: Present ✅
   - [ ] razorpay_signature: Present ✅

---

## ❌ TEST ERROR HANDLING

### Test Case 8: Empty Cart Redirect

**Steps:**
1. [ ] Clear your browser's localStorage (or open in incognito)
2. [ ] Try accessing http://localhost:3000/checkout directly
3. [ ] **Expected Result:** Redirected to cart page (empty)

### Test Case 9: Form Validation Errors

**Test Empty Fields:**
1. [ ] Go to checkout page
2. [ ] Click "Place Order" without filling form
3. [ ] **Expected Result:** See error messages for each field

**Test Invalid Email:**
1. [ ] Fill form with test data
2. [ ] Change email to "notanemail"
3. [ ] Click "Place Order"
4. [ ] **Expected Result:** Error: "Invalid email address"

**Test Invalid Phone (< 10 digits):**
1. [ ] Fill form
2. [ ] Change phone to "987654321" (9 digits)
3. [ ] Click "Place Order"
4. [ ] **Expected Result:** Error: "Phone number must be 10 digits"

**Test Invalid Phone (> 10 digits):**
1. [ ] Fill form
2. [ ] Change phone to "98765432101" (11 digits)
3. [ ] Click "Place Order"
4. [ ] **Expected Result:** Error: "Phone number must be 10 digits"

**Test Invalid Pincode:**
1. [ ] Fill form
2. [ ] Change pincode to "11001" (5 digits)
3. [ ] Click "Place Order"
4. [ ] **Expected Result:** Error: "Pincode must be 6 digits"

**Test Short Address:**
1. [ ] Fill form
2. [ ] Change address to "123" (3 chars)
3. [ ] Click "Place Order"
4. [ ] **Expected Result:** Error: "Address must be at least 5 characters"

### Test Case 10: Network Error Recovery

**Steps:**
1. [ ] Open DevTools (F12)
2. [ ] Go to Network tab
3. [ ] Check "Offline" to simulate network error
4. [ ] Try to place order
5. [ ] **Expected Result:** Error message displayed
6. [ ] Uncheck "Offline"
7. [ ] Try again
8. [ ] **Expected Result:** Order succeeds

---

## 📱 TEST RESPONSIVE DESIGN

### Test Case 11: Mobile View (375px)

**Steps:**
1. [ ] Open DevTools
2. [ ] Toggle device toolbar (Ctrl+Shift+M)
3. [ ] Set device: iPhone SE (375px)
4. [ ] Go through checkout flow
5. [ ] **Expected Results:**
   - [ ] Form fields stack vertically
   - [ ] Order summary visible (may be below form)
   - [ ] Payment options readable
   - [ ] Buttons large enough (44px+) to tap
   - [ ] No horizontal scrolling

### Test Case 12: Tablet View (768px)

**Steps:**
1. [ ] Set device: iPad (768px)
2. [ ] Go through checkout flow
3. [ ] **Expected Results:**
   - [ ] Layout adjusted for medium screen
   - [ ] All content readable
   - [ ] Buttons appropriately sized

### Test Case 13: Desktop View (1920px)

**Steps:**
1. [ ] Set device: Desktop (1920px)
2. [ ] Go through checkout flow
3. [ ] **Expected Results:**
   - [ ] Form on left, order summary on right
   - [ ] Side-by-side layout
   - [ ] Professional appearance

---

## 🎯 FINAL VERIFICATION

| Feature | COD | Razorpay | Desktop | Mobile |
|---------|-----|----------|---------|--------|
| Checkout page loads | ✅ | ✅ | ✅ | ✅ |
| Form fields display | ✅ | ✅ | ✅ | ✅ |
| Order summary shows | ✅ | ✅ | ✅ | ✅ |
| Validation works | ✅ | ✅ | ✅ | ✅ |
| Order placement | ✅ | ✅ | ✅ | ✅ |
| Confirmation page | ✅ | ✅ | ✅ | ✅ |
| Database order created | ✅ | ✅ | ✅ | ✅ |
| Stock reduced | ✅ | ✅ | ✅ | ✅ |
| Cart cleared | ✅ | ✅ | ✅ | ✅ |

---

## 📊 SUMMARY

**After completing all tests above, you can confirm:**

✅ Checkout flow is working
✅ Form validation is working
✅ Order creation is working
✅ Order confirmation is working
✅ Database operations are working
✅ Payment methods are working
✅ Responsive design is working
✅ Error handling is working

---

## 🐛 IF TESTS FAIL

### Common Issues & Solutions

**Issue 1: "Failed to create order" error**
- **Solution:** Run RLS policy SQL from `FIX_RLS_POLICIES.sql`

**Issue 2: No products showing**
- **Solution:** Add sample products using provided SQL

**Issue 3: Supabase keys error**
- **Solution:** Check `.env.local` has correct keys

**Issue 4: Razorpay modal not opening**
- **Solution:** Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env.local`

**Issue 5: Form not validating**
- **Solution:** Check browser console for errors

**For More Help:** See `TROUBLESHOOT_ORDER_ERROR.md`

---

## ✅ COMPLETION CHECKLIST

- [ ] RLS policies fixed
- [ ] Sample products added
- [ ] Environment variables set
- [ ] Dev server running
- [ ] COD flow tested
- [ ] Razorpay flow tested
- [ ] Orders verified in database
- [ ] Stock reduction verified
- [ ] Mobile responsive verified
- [ ] Error handling tested
- [ ] All tests passed ✅

---

**When all tests pass, your checkout flow is production-ready! 🚀**
