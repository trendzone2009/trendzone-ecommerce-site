import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email';

interface OrderRequest {
  items: Array<{
    productId: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
    image: string;
  }>;
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  subtotal: number;
  shippingCharge: number;
  total: number;
  paymentMethod: 'COD' | 'ONLINE';
}

// Generate order number in format: ORD-YYYYMMDD-XXXXX
async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Count orders created today
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-${month}-${day}T00:00:00`)
    .lt('created_at', `${year}-${month}-${day}T23:59:59`);

  const counter = (count || 0) + 1;
  const counterStr = String(counter).padStart(5, '0');

  return `ORD-${dateStr}-${counterStr}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();

    // Validate request
    if (!body.items || !body.shippingAddress || !body.paymentMethod) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (body.items.length === 0) {
      return NextResponse.json(
        { message: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: body.shippingAddress.name,
        customer_email: body.shippingAddress.email,
        customer_phone: body.shippingAddress.phone,
        shipping_address: body.shippingAddress,
        subtotal: body.subtotal,
        shipping_charge: body.shippingCharge,
        total: body.total,
        payment_method: body.paymentMethod,
        payment_status: body.paymentMethod === 'COD' ? 'pending' : 'pending',
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { message: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = body.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Delete order if items creation fails
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { message: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Update product stock
    for (const item of body.items) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', item.productId)
        .eq('size', item.size)
        .single();

      if (variant) {
        const newStock = Math.max(0, variant.stock_quantity - item.quantity);
        await supabase
          .from('product_variants')
          .update({ stock_quantity: newStock })
          .eq('id', variant.id);
      }
    }

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail({
        orderNumber: order.order_number,
        customerName: body.shippingAddress.name,
        customerEmail: body.shippingAddress.email,
        items: body.items.map(item => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        shippingAddress: body.shippingAddress,
        subtotal: body.subtotal,
        shippingCharge: body.shippingCharge,
        total: body.total,
        paymentMethod: body.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment',
      });
      console.log('Order confirmation email sent successfully');
    } catch (emailError) {
      // Don't fail the order if email fails
      console.error('Failed to send order confirmation email:', emailError);
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
