'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/admin/stats-card';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    pendingOrders: 0,
    lowStockItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch dashboard stats from API
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set dummy data for demonstration
      setStats({
        ordersToday: 5,
        revenueToday: 12500,
        pendingOrders: 8,
        lowStockItems: 3,
      });
      setRecentOrders([
        {
          id: '1',
          order_number: 'ORD-20251126-00001',
          customer_name: 'John Doe',
          total: 2500,
          status: 'pending',
          payment_method: 'COD',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price == null || isNaN(price)) {
      return '₹0.00';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your admin panel</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Orders Today"
          value={stats.ordersToday}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          trend={{ value: 12, label: 'vs yesterday', isPositive: true }}
        />
        <StatsCard
          title="Revenue Today"
          value={formatPrice(stats.revenueToday)}
          icon={DollarSign}
          iconColor="text-green-600"
          trend={{ value: 8, label: 'vs yesterday', isPositive: true }}
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Package}
          iconColor="text-orange-600"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          iconColor="text-red-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Package className="w-10 h-10 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Manage Products</p>
                  <p className="text-sm text-gray-600">Add, edit, delete products</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <ShoppingCart className="w-10 h-10 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">View Orders</p>
                  <p className="text-sm text-gray-600">Process & track orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/inventory">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-10 h-10 text-purple-600" />
                <div>
                  <p className="font-semibold text-gray-900">Inventory</p>
                  <p className="text-sm text-gray-600">Check stock levels</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Order Number
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Payment
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-blue-600">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{order.customer_name}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                          {order.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

