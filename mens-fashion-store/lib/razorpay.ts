// Razorpay utility functions for client-side integration

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export async function initiateRazorpayPayment(
  amount: number,
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string
): Promise<RazorpayPaymentResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create order on backend
      const orderResponse = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderNumber,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const orderData = await orderResponse.json();
      const razorpayOrderId = orderData.id;

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: razorpayOrderId,
        amount: orderData.amount, // Use amount from Razorpay order (already in paise)
        currency: 'INR',
        name: "Men's Fashion Store",
        description: `Order ${orderNumber}`,
        image: '/logo.png', // Optional: Add your logo
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        notes: {
          orderNumber: orderNumber,
        },
        theme: {
          color: '#1a1a1a',
        },
        handler: function (response: any) {
          resolve({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled'));
          },
          escape: true,
          backdropclose: false,
        },
      });

      razorpay.open();
    } catch (error) {
      reject(error);
    }
  });
}

export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  orderNumber: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/payments/razorpay/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderNumber,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();
    return data.verified;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}
