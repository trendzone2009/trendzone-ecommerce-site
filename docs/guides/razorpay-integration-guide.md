# RAZORPAY INTEGRATION GUIDE
## For Indian E-Commerce (COD + Online Payments)

---

## WHY RAZORPAY?

✅ **Best for Indian Market**
- Supports all payment methods Indians use: UPI, Cards, NetBanking, Wallets
- 2% transaction fee (no setup cost)
- Instant settlements available
- Excellent documentation
- Great support

✅ **Features You Get**
- Payment gateway
- Instant refunds
- Auto-capture or manual capture
- Webhook support
- Test mode for development
- Dashboard for tracking

---

## STEP 1: CREATE RAZORPAY ACCOUNT

### Sign Up (5 minutes):
1. Go to https://razorpay.com
2. Click "Sign Up" → Enter business details
3. Verify email and phone
4. Complete KYC (can test before KYC approval)

### Get API Keys:
1. Login to Razorpay Dashboard
2. Go to Settings → API Keys
3. Generate Test Keys:
   - **Test Key ID:** `rzp_test_xxxxxxxxxxxxx`
   - **Test Key Secret:** `xxxxxxxxxxxxxxxxxxxxxxxx`
4. Save these - you'll need them!

### Important:
- Start with **Test Mode** for development
- Switch to **Live Mode** after testing
- Live keys available after KYC approval

---

## STEP 2: SETUP IN YOUR NEXT.JS APP

### Install Package:
```bash
npm install razorpay
```

### Environment Variables:
Create `.env.local`:
```env
# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Your App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (you already have these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## STEP 3: BACKEND SETUP

### Create Razorpay Instance:
**File:** `lib/razorpay.ts`
```typescript
import Razorpay from 'razorpay';

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

### Create Order API:
**File:** `app/api/payments/create-order/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { razorpayInstance } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount } = await req.json();
    
    // amount should be in paise (multiply by 100)
    const amountInPaise = Math.round(amount * 100);
    
    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId,
      notes: {
        order_id: orderId,
      }
    });
    
    // Update order in database with razorpay_order_id
    const supabase = createClient();
    await supabase
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', orderId);
    
    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
    
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
```

### Verify Payment API:
**File:** `app/api/payments/verify/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = await req.json();
    
    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");
    
    const isAuthentic = expectedSign === razorpay_signature;
    
    if (isAuthentic) {
      // Update order in database
      const supabase = createClient();
      await supabase
        .from('orders')
        .update({
          razorpay_payment_id,
          payment_status: 'paid',
          status: 'pending' // Will be updated by admin
        })
        .eq('id', orderId);
      
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
```

---

## STEP 4: FRONTEND INTEGRATION

### Load Razorpay Script:
Add to `app/layout.tsx`:
```typescript
<Script
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="lazyOnload"
/>
```

### Checkout Component:
**File:** `components/checkout/PaymentSection.tsx`
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PaymentSectionProps {
  orderTotal: number;
  orderId: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentId?: string) => void;
}

export default function PaymentSection({
  orderTotal,
  orderId,
  customerDetails,
  onSuccess
}: PaymentSectionProps) {
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCOD = async () => {
    setIsProcessing(true);
    try {
      // For COD, just mark as placed and let admin handle it
      // Update order payment method to COD
      const response = await fetch('/api/orders/update-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentMethod: 'COD',
          paymentStatus: 'pending'
        })
      });
      
      if (response.ok) {
        onSuccess(); // Redirect to order confirmation
      }
    } catch (error) {
      console.error('COD order error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleOnlinePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Step 1: Create Razorpay order
      const createResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: orderTotal
        })
      });
      
      const orderData = await createResponse.json();
      
      if (!orderData.success) {
        throw new Error('Failed to create payment order');
      }
      
      // Step 2: Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Men\'s Fashion Store',
        description: `Order #${orderId}`,
        order_id: orderData.orderId,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: {
          color: '#000000' // Your brand color
        },
        handler: async function (response: any) {
          // Step 3: Verify payment on backend
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId
            })
          });
          
          const verifyData = await verifyResponse.json();
          
          if (verifyData.success) {
            onSuccess(response.razorpay_payment_id);
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            alert('Payment cancelled. You can retry or choose COD.');
          }
        }
      };
      
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again or choose COD.');
      setIsProcessing(false);
    }
  };
  
  const handlePlaceOrder = () => {
    if (paymentMethod === 'COD') {
      handleCOD();
    } else {
      handleOnlinePayment();
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Payment Method</h3>
      
      <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'COD' | 'ONLINE')}>
        <div className="flex items-center space-x-2 border p-4 rounded-lg">
          <RadioGroupItem value="COD" id="cod" />
          <Label htmlFor="cod" className="flex-1 cursor-pointer">
            <div className="font-medium">Cash on Delivery (COD)</div>
            <div className="text-sm text-gray-500">Pay when you receive your order</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border p-4 rounded-lg">
          <RadioGroupItem value="ONLINE" id="online" />
          <Label htmlFor="online" className="flex-1 cursor-pointer">
            <div className="font-medium">Pay Online</div>
            <div className="text-sm text-gray-500">UPI, Cards, NetBanking, Wallets</div>
          </Label>
        </div>
      </RadioGroup>
      
      <Button 
        onClick={handlePlaceOrder}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? 'Processing...' : `Place Order - ₹${orderTotal.toFixed(2)}`}
      </Button>
    </div>
  );
}
```

---

## STEP 5: COD IMPLEMENTATION

### COD Order Flow:
1. Customer selects COD at checkout
2. Order created with `payment_method: 'COD'` and `payment_status: 'pending'`
3. Order appears in admin panel as "Pending"
4. Admin verifies and ships order
5. Payment collected on delivery
6. Admin marks order as "Delivered" and `payment_status: 'paid'`

### COD Settings:
Store in `settings` table:
```sql
INSERT INTO settings (key, value) VALUES
('cod_enabled', 'true'),
('cod_max_amount', '10000'),
('cod_charge', '0'); -- Optional COD charge
```

### COD Validation:
```typescript
// In checkout API
const settings = await supabase.from('settings').select('*');
const codEnabled = settings.find(s => s.key === 'cod_enabled')?.value;
const codMaxAmount = settings.find(s => s.key === 'cod_max_amount')?.value;

if (paymentMethod === 'COD') {
  if (!codEnabled) {
    throw new Error('COD not available');
  }
  if (orderTotal > codMaxAmount) {
    throw new Error(`COD not available for orders above ₹${codMaxAmount}`);
  }
}
```

---

## STEP 6: TESTING

### Test Cards (Razorpay Test Mode):
```
Success Card:
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
Name: Any name

Failure Card:
Card Number: 4111 1111 1111 1112
```

### Test UPI:
```
UPI ID: success@razorpay
(Will show success)

UPI ID: failure@razorpay
(Will show failure)
```

### Testing Checklist:
- [ ] Place order with COD
- [ ] Place order with test card (success)
- [ ] Place order with test card (failure)
- [ ] Place order with test UPI
- [ ] Verify payment signature
- [ ] Check order status updates
- [ ] Test on mobile devices

---

## STEP 7: GO LIVE

### Switch to Live Mode:
1. Complete Razorpay KYC (submit documents)
2. Wait for approval (usually 24-48 hours)
3. Generate Live API Keys
4. Update `.env.local`:
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```
5. Deploy to Vercel with new keys

### Important for Production:
- [ ] Enable webhooks in Razorpay dashboard
- [ ] Set webhook URL: `https://yourdomain.com/api/payments/webhook`
- [ ] Enable auto-capture or manual capture
- [ ] Set up settlement account (bank details)
- [ ] Test with small real transaction first

---

## STEP 8: WEBHOOKS (Optional but Recommended)

### Setup Webhook:
**File:** `app/api/payments/webhook/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    const event = JSON.parse(body);
    
    // Handle different events
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      
      // Update order in database
      const supabase = createClient();
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          razorpay_payment_id: payment.id
        })
        .eq('razorpay_order_id', payment.order_id);
    }
    
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      
      // Mark payment as failed
      const supabase = createClient();
      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('razorpay_order_id', payment.order_id);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

---

## PRICING & COSTS

### Razorpay Fees:
- **Transaction Fee:** 2% per successful transaction
- **Setup Fee:** ₹0
- **Maintenance:** ₹0
- **No hidden charges**

### Example Calculation:
```
Order value: ₹1,500
Razorpay fee: ₹30 (2%)
You receive: ₹1,470

COD orders: No Razorpay fee (you handle cash)
```

### Settlement:
- Default: T+3 days (3 days after transaction)
- Instant settlement available (small additional fee)

---

## COMMON ISSUES & SOLUTIONS

### Issue 1: Payment fails but amount deducted
**Solution:** Amount auto-refunded by Razorpay within 5-7 business days

### Issue 2: Signature verification fails
**Solution:** Check if webhook secret is correct, verify HMAC implementation

### Issue 3: COD orders not showing
**Solution:** Ensure payment_method is set to 'COD' in database

### Issue 4: Test mode cards not working
**Solution:** Ensure you're using test API keys, not live keys

---

## SECURITY BEST PRACTICES

1. **Never expose** Razorpay Key Secret on frontend
2. **Always verify** payment signature on backend
3. **Use environment variables** for all keys
4. **Enable webhook** signature verification
5. **Log all transactions** for audit trail
6. **Use HTTPS** in production (Vercel provides this)
7. **Validate amounts** before creating order

---

## SUPPORT & RESOURCES

- **Razorpay Documentation:** https://razorpay.com/docs
- **Integration Guide:** https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/
- **Support:** support@razorpay.com
- **Dashboard:** https://dashboard.razorpay.com

---

## QUICK CHECKLIST

### Development Phase:
- [ ] Razorpay account created
- [ ] Test API keys obtained
- [ ] Razorpay package installed
- [ ] Create order API implemented
- [ ] Verify payment API implemented
- [ ] COD flow implemented
- [ ] Frontend integration complete
- [ ] Tested with all payment methods

### Before Launch:
- [ ] KYC submitted and approved
- [ ] Live API keys generated
- [ ] Environment variables updated
- [ ] Webhook configured
- [ ] Test transaction successful
- [ ] Bank account for settlement added

### Post Launch:
- [ ] Monitor first few transactions
- [ ] Check settlement schedule
- [ ] Track failed payments
- [ ] Handle refunds if needed

---

**You're all set! Start with Test Mode, validate everything works, then go Live.** 🚀
