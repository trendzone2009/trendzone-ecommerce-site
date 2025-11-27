'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Filter } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_METHOD_OPTIONS = ['all', 'cod', 'razorpay'];

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [paymentMethod, setPaymentMethod] = useState(
    searchParams.get('paymentMethod') || 'all'
  );
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [search, status, paymentMethod, page]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(status !== 'all' && { status }),
        ...(paymentMethod !== 'all' && { paymentMethod }),
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFilterChange = (type: string, value: string) => {
    setPage(1);
    if (type === 'status') setStatus(value);
    if (type === 'paymentMethod') setPaymentMethod(value);
  };

  const getStatusBadge = (orderStatus: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[orderStatus] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const colors: { [key: string]: string } = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[paymentStatus] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null || isNaN(amount)) {
      return '₹0.00';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by order number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </form>

            {/* Status & Payment Method Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {PAYMENT_METHOD_OPTIONS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm === 'all'
                        ? 'All Methods'
                        : pm === 'cod'
                          ? 'Cash on Delivery'
                          : 'Razorpay'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Orders</CardTitle>
            <span className="text-sm text-gray-600">
              Total: {total} order{total !== 1 ? 's' : ''}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Order Number
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Payment
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-gray-900">{order.customer_name}</p>
                            <p className="text-gray-600 text-xs">{order.customer_email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-gray-700 text-xs">
                              {order.payment_method === 'cod'
                                ? 'Cash on Delivery'
                                : 'Razorpay'}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium inline-block w-fit ${getPaymentStatusBadge(
                                order.payment_status
                              )}`}
                            >
                              {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

