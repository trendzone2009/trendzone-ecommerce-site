import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's orders
    const { data: ordersToday, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (ordersError) throw ordersError;

    // Fetch pending orders
    const { data: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // Fetch low stock items (stock < 5)
    const { data: lowStockItems, error: stockError } = await supabase
      .from('product_variants')
      .select('*')
      .lt('stock_quantity', 5);

    if (stockError) throw stockError;

    // Fetch recent orders (last 10)
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    // Calculate totals
    const ordersCount = ordersToday?.length || 0;
    const revenueToday = ordersToday?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const pendingCount = pendingOrders?.length || 0;
    const lowStockCount = lowStockItems?.length || 0;

    return NextResponse.json({
      stats: {
        ordersToday: ordersCount,
        revenueToday,
        pendingOrders: pendingCount,
        lowStockItems: lowStockCount,
      },
      recentOrders: recentOrders || [],
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
