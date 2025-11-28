'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle, MapPin, Plus, Edit, Trash2, Star } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  is_default: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    label: '',
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    is_default: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/addresses');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching addresses:', fetchError);
        setError('Failed to load addresses');
        return;
      }

      setAddresses(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      is_default: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');

    try {
      if (editingId) {
        // Update existing address
        const { error: updateError } = await supabase
          .from('saved_addresses')
          .update(formData)
          .eq('id', editingId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        setSuccess('Address updated successfully');
      } else {
        // Add new address
        const { error: insertError } = await supabase
          .from('saved_addresses')
          .insert({
            ...formData,
            user_id: user.id,
          });

        if (insertError) throw insertError;
        setSuccess('Address added successfully');
      }

      resetForm();
      await fetchAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error saving address:', error);
      setError(error.message || 'Failed to save address');
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      name: address.name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      is_default: address.is_default,
    });
    setEditingId(address.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    setError('');
    try {
      const { error: deleteError } = await supabase
        .from('saved_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (deleteError) throw deleteError;

      setSuccess('Address deleted successfully');
      await fetchAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('saved_addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await fetchAddresses();
    } catch (error: any) {
      console.error('Error setting default:', error);
      setError('Failed to set default address');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading addresses...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Addresses</h1>
            <p className="text-gray-600 mt-1">Manage your shipping addresses</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-start gap-2 mb-6">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-start gap-2 mb-6">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Add/Edit Form */}
        {isAdding && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Address' : 'Add New Address'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Label *</Label>
                    <Input
                      id="label"
                      value={formData.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="Home, Office, etc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91-9876543210"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="400001"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_line1">Address Line 1 *</Label>
                  <Input
                    id="address_line1"
                    value={formData.address_line1}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                    placeholder="House number, Building name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_line2">Address Line 2</Label>
                  <Input
                    id="address_line2"
                    value={formData.address_line2}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                    placeholder="Street, Area"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    value={formData.landmark}
                    onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                    placeholder="Near XYZ"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="is_default" className="cursor-pointer">
                    Set as default address
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit">
                    {editingId ? 'Update Address' : 'Save Address'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Addresses List */}
        {addresses.length === 0 && !isAdding ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Addresses</h3>
              <p className="text-gray-600 mb-6">Add an address for faster checkout</p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <Card key={address.id} className="relative">
                <CardContent className="pt-6">
                  {address.is_default && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Star className="w-3 h-3 fill-current" />
                        Default
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{address.label}</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p className="font-medium">{address.name}</p>
                      <p>{address.phone}</p>
                      <p>{address.address_line1}</p>
                      {address.address_line2 && <p>{address.address_line2}</p>}
                      {address.landmark && <p>Landmark: {address.landmark}</p>}
                      <p>{address.city}, {address.state} {address.pincode}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(address)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {!address.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        className="flex-1"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
