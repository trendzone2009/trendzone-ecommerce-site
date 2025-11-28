'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Check } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  city: string;
  state: string;
  pincode: string;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  items: OrderItem[];
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
        setNewStatus(data.order.status);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to load order');
      console.error('Error fetching order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order?.status) return;

    setIsUpdatingStatus(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/orders/${order?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrder((prev) => prev ? { ...prev, status: newStatus } : null);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        setError(data.message || 'Failed to update order status');
      }
    } catch (err) {
      setError('An error occurred while updating status');
      console.error('Error updating status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error || 'Order not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const itemSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
          <p className="text-gray-600 mt-1">Order details and management</p>
        </div>
      </div>

      {/* Success Alert */}
      {updateSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900">Success</h3>
            <p className="text-sm text-green-700">Order status updated successfully</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900">
                    {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{order.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pincode</p>
                  <p className="font-medium text-gray-900">{order.pincode}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{order.customer_address}</p>
                <p className="text-sm text-gray-700">
                  {order.city}, {order.state}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Size</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Price
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{item.product_name}</td>
                        <td className="py-3 px-4 text-gray-700">{item.size}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information (if Razorpay) */}
          {order.payment_method === 'razorpay' && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-medium mt-1 ${getPaymentStatusColor(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                  {order.razorpay_payment_id && (
                    <div>
                      <p className="text-sm text-gray-600">Payment ID</p>
                      <p className="font-mono text-xs text-gray-900 break-all">
                        {order.razorpay_payment_id}
                      </p>
                    </div>
                  )}
                </div>
                {order.razorpay_order_id && (
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-mono text-xs text-gray-900 break-all">
                      {order.razorpay_order_id}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Order Summary & Status Update */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">{formatCurrency(itemSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(order.total - itemSubtotal)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={isUpdatingStatus}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-600"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleStatusUpdate}
                disabled={isUpdatingStatus || newStatus === order.status}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isUpdatingStatus ? 'Updating...' : 'Update Status'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

