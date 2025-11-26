'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { ShippingAddressFormData } from '@/lib/validation';
import { CheckoutForm } from '@/components/customer/checkout-form';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, calculateShipping } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Track if checkout is being completed to prevent cart redirect
  const isCompletingCheckout = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to cart if empty (but not if we're completing checkout)
  useEffect(() => {
    if (mounted && items.length === 0 && !isCompletingCheckout.current) {
      router.push('/cart');
    }
  }, [items, mounted, router]);

  if (!mounted) {
    return null;
  }

  if (items.length === 0 && !isCompletingCheckout.current) {
    return null;
  }

  const shipping = calculateShipping(total);
  const finalTotal = total + shipping;

  const handleCheckoutSubmit = async (
    shippingData: ShippingAddressFormData,
    paymentMethod: string
  ) => {
    setIsLoading(true);

    try {
      // First, create the order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingAddress: {
            name: shippingData.name,
            email: shippingData.email,
            phone: shippingData.phone,
            addressLine1: shippingData.addressLine1,
            addressLine2: shippingData.addressLine2,
            city: shippingData.city,
            state: shippingData.state,
            pincode: shippingData.pincode,
            landmark: shippingData.landmark,
          },
          subtotal: total,
          shippingCharge: shipping,
          total: finalTotal,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const { orderId, orderNumber } = await response.json();

      // If payment method is COD, proceed directly to confirmation
      if (paymentMethod === 'COD') {
        // Set flag to prevent cart redirect
        isCompletingCheckout.current = true;
        clearCart();
        router.push(`/order-confirmation/${orderId}?orderNumber=${orderNumber}`);
        return;
      }

      // If payment method is ONLINE, initiate Razorpay payment
      if (paymentMethod === 'ONLINE') {
        try {
          const { initiateRazorpayPayment, verifyPayment } = await import('@/lib/razorpay');

          const paymentResponse = await initiateRazorpayPayment(
            finalTotal,
            orderNumber,
            shippingData.name,
            shippingData.email,
            shippingData.phone
          );

          // Verify payment and update order status
          const isVerified = await verifyPayment(
            paymentResponse.razorpay_order_id,
            paymentResponse.razorpay_payment_id,
            paymentResponse.razorpay_signature,
            orderNumber
          );

          if (!isVerified) {
            throw new Error('Payment verification failed');
          }

          // Set flag to prevent cart redirect before clearing
          isCompletingCheckout.current = true;
          
          // Clear cart after successful payment
          clearCart();

          // Redirect to confirmation page
          router.push(`/order-confirmation/${orderId}?orderNumber=${orderNumber}`);
        } catch (paymentError) {
          setIsLoading(false);
          throw paymentError;
        }
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <CheckoutForm onSubmit={handleCheckoutSubmit} isLoading={isLoading} />
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3 pb-3 border-b">
                    <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        Size: {item.size} × {item.quantity}
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                {shipping > 0 && total < 999 && (
                  <p className="text-xs text-primary bg-blue-50 p-2 rounded">
                    Add {formatPrice(999 - total)} more for FREE shipping!
                  </p>
                )}

                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                <p className="font-semibold mb-1">Secure Checkout</p>
                <p>Your information is encrypted and secure. We accept COD and online payments.</p>
              </div>

              {/* Back to Cart */}
              <Link href="/cart" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Back to Cart
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
