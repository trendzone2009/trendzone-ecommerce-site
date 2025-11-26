# Checkout Flow - Complete Guide

## Overview

The checkout flow has been fully implemented with support for both **Cash on Delivery (COD)** and **Online Payment (Razorpay)**.

## Flow Diagram

```
Cart Page
    ↓
Proceed to Checkout
    ↓
Checkout Page (/checkout)
    ├─ Shipping Information Form
    ├─ Order Summary Sidebar
    └─ Payment Method Selection (COD / ONLINE)
    ↓
Place Order
    ↓
API: POST /api/orders (Create Order)
    ├─ Generate Order Number (ORD-YYYYMMDD-XXXXX)
    ├─ Create Order in Database
    ├─ Create Order Items
    └─ Update Product Stock
    ↓
    ├─ If COD: Redirect to Confirmation
    └─ If ONLINE: Initiate Razorpay Payment
         ↓
         Razorpay Checkout Modal
         ↓
         Payment Verification (API: /api/payments/razorpay/verify)
         ↓
         Redirect to Confirmation
    ↓
Order Confirmation Page (/order-confirmation/[orderId])
    ↓
Continue Shopping
```

## Components

### 1. Checkout Page (`/checkout`)
- **File:** `app/(customer)/checkout/page.tsx`
- **Purpose:** Main checkout page with form and order summary
- **Features:**
  - Redirect to cart if cart is empty
  - Display order summary with live totals
  - Handle form submission
  - Process both COD and online payments

### 2. Checkout Form
- **File:** `components/customer/checkout-form.tsx`
- **Purpose:** Shipping information and payment method form
- **Features:**
  - React Hook Form for state management
  - Zod validation schema
  - Indian states dropdown
  - Error messages for each field
  - Payment method radio buttons (COD/ONLINE)

### 3. API Routes

#### Create Order (`/api/orders`)
- **File:** `app/api/orders/route.ts`
- **Method:** POST
- **Purpose:** Create order in database

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "name": "Product Name",
      "price": 499.99,
      "size": "L",
      "quantity": 2,
      "image": "image-url"
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "addressLine1": "House 123, Main Street",
    "addressLine2": "Near Park",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "landmark": "Near ABC Store"
  },
  "subtotal": 999.98,
  "shippingCharge": 0,
  "total": 999.98,
  "paymentMethod": "COD"
}
```

**Response:**
```json
{
  "orderId": "uuid",
  "orderNumber": "ORD-20251120-00001",
  "message": "Order created successfully"
}
```

**What it does:**
1. Generates unique order number
2. Creates order in `orders` table
3. Creates items in `order_items` table
4. Updates product stock in `product_variants` table

#### Create Razorpay Order (`/api/payments/razorpay/create-order`)
- **File:** `app/api/payments/razorpay/create-order/route.ts`
- **Method:** POST
- **Purpose:** Create Razorpay order before payment

**Request Body:**
```json
{
  "amount": 999.98,
  "orderNumber": "ORD-20251120-00001"
}
```

**Response:**
```json
{
  "id": "order_XXXXX",
  "entity": "order",
  "amount": 99998,
  "currency": "INR",
  "receipt": "ORD-20251120-00001",
  "status": "created"
}
```

#### Verify Payment (`/api/payments/razorpay/verify`)
- **File:** `app/api/payments/razorpay/verify/route.ts`
- **Method:** POST
- **Purpose:** Verify payment signature and update order

**Request Body:**
```json
{
  "razorpay_order_id": "order_XXXXX",
  "razorpay_payment_id": "pay_XXXXX",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "verified": true
}
```

**What it does:**
1. Verifies Razorpay signature
2. Updates order with payment details
3. Changes order status to 'processing'

### 4. Order Confirmation Page
- **File:** `app/(customer)/order-confirmation/[orderId]/page.tsx`
- **Purpose:** Display order confirmation details
- **Features:**
  - Order number display
  - Shipping address
  - Order summary
  - Payment method display
  - Expected delivery date (5-7 business days)
  - Next steps information
  - Continue shopping button

## Form Validation

### Shipping Address Schema

Using Zod for validation:

```typescript
{
  name: string (min 2 chars)
  email: string (valid email)
  phone: string (exactly 10 digits)
  addressLine1: string (min 5 chars, required)
  addressLine2: string (optional)
  city: string (min 2 chars)
  state: string (selected from 28 Indian states)
  pincode: string (exactly 6 digits)
  landmark: string (optional)
}
```

## Database Operations

### Order Creation Process

1. **Generate Order Number**
   - Format: `ORD-YYYYMMDD-XXXXX`
   - Example: `ORD-20251120-00001`

2. **Insert Order**
   ```sql
   INSERT INTO orders (
     order_number, customer_name, customer_email, customer_phone,
     shipping_address, subtotal, shipping_charge, total,
     payment_method, payment_status, status
   )
   ```

3. **Insert Order Items**
   ```sql
   INSERT INTO order_items (
     order_id, product_id, product_name, product_image,
     size, quantity, price
   )
   ```

4. **Update Stock**
   ```sql
   UPDATE product_variants
   SET stock_quantity = stock_quantity - quantity
   WHERE product_id = ? AND size = ?
   ```

## Payment Flow

### COD (Cash on Delivery)
1. User fills shipping form
2. Selects COD as payment method
3. Order created in database
4. Cart cleared
5. Redirected to confirmation page
6. Status: `pending` → Admin changes to `processing` when ready to ship

### Online Payment (Razorpay)
1. User fills shipping form
2. Selects Online Payment
3. Order created with `payment_status: pending`
4. Razorpay checkout modal opens
5. User completes payment
6. Payment signature verified
7. Order status updated to `processing`
8. Cart cleared
9. Redirected to confirmation page

## Razorpay Integration

### Setup Required

1. **Install Dependencies**
   ```bash
   npm install razorpay
   ```

2. **Environment Variables**
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

3. **Create Razorpay Account**
   - Sign up at [razorpay.com](https://razorpay.com)
   - Go to Settings → API Keys
   - Copy Key ID and Key Secret

### Testing

**Test Card Details (Razorpay Sandbox)**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: 123456 (if 3D Secure is enabled)

**Test UPI**
- UPI: success@razorpay
- Status: Will succeed

**Test Phone**
- Any 10 digit number

### Security

1. **Signature Verification**
   - Uses HMAC SHA256
   - Verifies payment authenticity
   - Prevents tampering

2. **Secure Data Flow**
   - Payment details never stored on server
   - Only Razorpay payment IDs stored
   - Signature verified before updating order

## Error Handling

### Common Errors

1. **Missing Cart Items**
   - Redirects from checkout to cart
   - Shows empty state message

2. **Form Validation Errors**
   - Shows field-specific error messages
   - Highlights invalid fields
   - Prevents submission

3. **Order Creation Failed**
   - Shows error alert
   - User can retry
   - Cart data preserved

4. **Payment Verification Failed**
   - Order created but payment not verified
   - User sees error message
   - Can retry payment

5. **Razorpay Script Load Error**
   - Falls back to showing error
   - User can retry

## Shipping Calculation

```javascript
if (subtotal >= ₹999) {
  shipping = 0 // Free shipping
} else {
  shipping = ₹99 // Flat charge
}
```

### Frontend Display
- Shows "FREE" in green if free shipping
- Shows amount in rupees if charged
- Shows progress message if user is ₹X away from free shipping

## Order Status Flow

```
PENDING (Order placed)
  ↓
PROCESSING (Admin confirmed, preparing order)
  ↓
SHIPPED (Dispatched with tracking number)
  ↓
DELIVERED (Successfully delivered)

  OR

CANCELLED (Order cancelled)
```

## Testing the Checkout Flow

### Manual Testing Steps

1. **Add to Cart**
   - Browse products
   - Add items to cart
   - Verify cart updates

2. **Go to Checkout**
   - Click "Proceed to Checkout"
   - Verify order summary displays correctly
   - Check shipping calculation

3. **Fill Form (COD)**
   - Enter shipping information
   - Select COD as payment method
   - Click "Place Order"
   - Should redirect to confirmation page
   - Verify order details display

4. **Fill Form (Online)**
   - Enter shipping information
   - Select "Pay Online"
   - Click "Place Order"
   - Razorpay modal should open
   - Use test card: 4111 1111 1111 1111
   - Complete payment
   - Should redirect to confirmation page

5. **Verify Database**
   - Check `orders` table for new order
   - Check `order_items` for items
   - Verify stock reduced in `product_variants`

## Files Created

```
checkout/
├── app/(customer)/
│   ├── checkout/
│   │   └── page.tsx              ✓ Checkout page
│   └── order-confirmation/
│       └── [orderId]/page.tsx    ✓ Confirmation page
├── components/customer/
│   └── checkout-form.tsx         ✓ Form component
├── app/api/
│   ├── orders/
│   │   └── route.ts              ✓ Create order API
│   └── payments/razorpay/
│       ├── create-order/
│       │   └── route.ts          ✓ Razorpay order creation
│       └── verify/
│           └── route.ts          ✓ Payment verification
├── components/ui/
│   ├── label.tsx                 ✓ Form label component
│   └── select.tsx                ✓ Select dropdown component
├── lib/
│   ├── validation.ts             ✓ Zod schemas
│   └── razorpay.ts               ✓ Razorpay utilities
└── CHECKOUT_GUIDE.md             ✓ This file
```

## Next Steps

1. **Setup Supabase**
   - Create database
   - Run schema migration
   - Enable RLS policies

2. **Get Razorpay Keys**
   - Create test account
   - Get API keys
   - Update `.env.local`

3. **Test the Flow**
   - Add items to cart
   - Test COD flow
   - Test Razorpay flow with test card

4. **Deploy**
   - Add production Razorpay keys
   - Deploy to Vercel
   - Test in production

5. **Admin Panel** (Next phase)
   - Build admin dashboard
   - Create order management
   - Add product management

## Support

For issues or questions:
- Check Razorpay docs: https://razorpay.com/docs
- Check Supabase docs: https://supabase.com/docs
- Review error messages in browser console and server logs
