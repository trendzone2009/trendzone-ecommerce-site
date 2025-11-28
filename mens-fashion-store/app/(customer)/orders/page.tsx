'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Package, Calendar, CreditCard, Truck, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  items_count?: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/orders');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch orders for this user
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setError('Failed to load orders');
        return;
      }

      // Fetch item counts for each order
      const ordersWithCounts = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { count } = await supabase
            .from('order_items')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', order.id);

          return {
            ...order,
            items_count: count || 0,
          };
        })
      );

      setOrders(ordersWithCounts);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shipped':
      case 'delivered':
        return <Truck className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">View and track your orders</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-start gap-2 mb-6">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
              <Button onClick={() => router.push('/products')}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1 space-y-3">
                      {/* Order Number and Date */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">
                            Order #{order.order_number}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Items:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-600">Payment:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {order.payment_method}
                            </span>
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                              order.payment_status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Action Button */}
                    <div className="flex md:flex-col gap-2">
                      <Link
                        href={`/order-confirmation/${order.id}`}
                        className="flex-1 md:flex-none"
                      >
                        <Button variant="outline" className="w-full whitespace-nowrap">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to Profile */}
        <div className="mt-8 text-center">
          <Link href="/profile" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
