import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const paymentMethod = searchParams.get('paymentMethod') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    let query = supabase.from('orders').select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.ilike('order_number', `%${search}%`);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (paymentMethod !== 'all') {
      query = query.eq('payment_method', paymentMethod);
    }

    // Order by creation date descending and apply pagination
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      return NextResponse.json(
        { message: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const pages = Math.ceil(total / pageSize);

    return NextResponse.json({
      orders: data || [],
      total,
      page,
      pages,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status: newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { message: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: data?.[0] });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
