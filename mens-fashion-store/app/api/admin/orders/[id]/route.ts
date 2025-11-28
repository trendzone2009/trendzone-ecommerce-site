import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return NextResponse.json(
        { message: 'Failed to fetch order items' },
        { status: 500 }
      );
    }

    // Transform shipping_address JSONB to flat structure for frontend
    const shippingAddress = order.shipping_address || {};
    
    return NextResponse.json({
      order: {
        ...order,
        // Map shipping_address fields to expected frontend fields
        customer_address: shippingAddress.addressLine1 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        pincode: shippingAddress.pincode || '',
        items: items || [],
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      );
    }

    // Get current order to check old status and customer info
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    const oldStatus = currentOrder.status;

    // Update order status
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !order) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json(
        { message: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Send status update email (don't fail if email fails)
    try {
      const estimatedDelivery = body.status === 'shipped'
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : undefined;

      await sendOrderStatusUpdateEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        oldStatus: oldStatus,
        newStatus: body.status,
        estimatedDelivery,
      });
      console.log('Order status update email sent successfully');
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    return NextResponse.json({
      order,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
