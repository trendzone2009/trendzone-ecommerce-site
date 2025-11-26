import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { message: 'Missing required fields', verified: false },
        { status: 400 }
      );
    }

    // Verify signature
    const generatedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid signature', verified: false },
        { status: 400 }
      );
    }

    // Update order with payment details
    console.log('Updating order:', body.orderNumber, 'with payment:', razorpay_payment_id);
    
    const { data, error } = await supabase
      .from('orders')
      .update({
        razorpay_order_id,
        razorpay_payment_id,
        payment_status: 'paid',
        status: 'processing',
      })
      .eq('order_number', body.orderNumber)
      .select();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { message: 'Failed to update order', verified: true },
        { status: 500 }
      );
    }

    console.log('Order update result:', data);

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { message: 'Internal server error', verified: false },
      { status: 500 }
    );
  }
}
