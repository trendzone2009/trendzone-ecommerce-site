'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingAddressSchema, ShippingAddressFormData, indianStates } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, MapPin, Plus, Trash2, Edit2, Check, Home, Briefcase } from 'lucide-react';
import { SavedAddress } from '@/types';

interface CheckoutFormProps {
  onSubmit: (data: ShippingAddressFormData, paymentMethod: string) => Promise<void>;
  isLoading?: boolean;
}

export function CheckoutForm({ onSubmit, isLoading = false }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [error, setError] = useState<string>('');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [userIdentifier, setUserIdentifier] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema),
  });

  // Get or create user identifier from localStorage
  useEffect(() => {
    let identifier = localStorage.getItem('userIdentifier');
    if (!identifier) {
      identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userIdentifier', identifier);
    }
    setUserIdentifier(identifier);
  }, []);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!userIdentifier) return;
      
      try {
        const response = await fetch(`/api/addresses?userIdentifier=${encodeURIComponent(userIdentifier)}`);
        if (response.ok) {
          const data = await response.json();
          setSavedAddresses(data);
          
          // Auto-select default address
          const defaultAddr = data.find((addr: SavedAddress) => addr.is_default);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            fillFormWithAddress(defaultAddr);
          } else if (data.length === 0) {
            setShowNewAddressForm(true);
          }
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [userIdentifier]);

  const fillFormWithAddress = (address: SavedAddress) => {
    setValue('name', address.name);
    setValue('email', address.email);
    setValue('phone', address.phone);
    setValue('addressLine1', address.address_line1);
    setValue('addressLine2', address.address_line2 || '');
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('pincode', address.pincode);
    setValue('landmark', address.landmark || '');
  };

  const handleAddressSelect = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setShowNewAddressForm(false);
    fillFormWithAddress(address);
  };

  const handleNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
    reset();
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedAddresses(prev => prev.filter(addr => addr.id !== addressId));
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
          setShowNewAddressForm(true);
          reset();
        }
      }
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const handleFormSubmit = async (data: ShippingAddressFormData) => {
    setError('');
    
    try {
      // Save new address if checkbox is checked
      if (saveAddress && showNewAddressForm && userIdentifier) {
        const addressResponse = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIdentifier,
            name: data.name,
            email: data.email,
            phone: data.phone,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            landmark: data.landmark,
            isDefault: savedAddresses.length === 0,
            label: addressLabel,
          }),
        });

        if (addressResponse.ok) {
          const newAddress = await addressResponse.json();
          setSavedAddresses(prev => [newAddress, ...prev]);
        }
      }

      await onSubmit(data, paymentMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'Home': return <Home className="w-4 h-4" />;
      case 'Work': return <Briefcase className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Saved Addresses Section */}
      {!loadingAddresses && savedAddresses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Saved Addresses
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNewAddress}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedAddressId === address.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAddressSelect(address)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getLabelIcon(address.label)}
                      <span className="font-semibold">{address.label}</span>
                      {address.is_default && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                      {selectedAddressId === address.id && (
                        <Check className="w-5 h-5 text-green-600 ml-auto" />
                      )}
                    </div>
                    <p className="font-medium">{address.name}</p>
                    <p className="text-sm text-gray-600">
                      {address.address_line1}
                      {address.address_line2 && `, ${address.address_line2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">📞 {address.phone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(address.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* New Address Form */}
      {(showNewAddressForm || savedAddresses.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {savedAddresses.length > 0 ? 'New Shipping Address' : 'Shipping Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="9876543210"
                maxLength={10}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
              <p className="text-xs text-gray-500">10 digit mobile number</p>
            </div>

            {/* Address Line 1 */}
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                placeholder="House number, Building name"
                {...register('addressLine1')}
              />
              {errors.addressLine1 && (
                <p className="text-sm text-red-600">{errors.addressLine1.message}</p>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                placeholder="Road name, Area, Colony"
                {...register('addressLine2')}
              />
            </div>

            {/* City and State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Delhi"
                  {...register('city')}
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select {...register('state')}>
                  <option value="">Select a state</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </Select>
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                placeholder="110001"
                maxLength={6}
                {...register('pincode')}
              />
              {errors.pincode && (
                <p className="text-sm text-red-600">{errors.pincode.message}</p>
              )}
              <p className="text-xs text-gray-500">6 digit postal code</p>
            </div>

            {/* Landmark */}
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                placeholder="Near ABC Store"
                {...register('landmark')}
              />
            </div>

            {/* Save Address Option */}
            <div className="border-t pt-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium">Save this address for future orders</span>
              </label>

              {saveAddress && (
                <div className="flex gap-2 ml-7">
                  {(['Home', 'Work', 'Other'] as const).map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setAddressLabel(label)}
                      className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1.5 transition-colors ${
                        addressLabel === label
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getLabelIcon(label)}
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Address Display (when not showing form) */}
      {selectedAddressId && !showNewAddressForm && (
        <div className="hidden">
          {/* Hidden form fields to maintain form state */}
        </div>
      )}

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors"
              style={{ borderColor: paymentMethod === 'COD' ? 'rgb(0, 0, 0)' : 'rgb(229, 231, 235)' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={(e) => setPaymentMethod(e.target.value as 'COD' | 'ONLINE')}
                className="w-4 h-4"
              />
              <div className="ml-4">
                <p className="font-semibold">Cash on Delivery (COD)</p>
                <p className="text-sm text-gray-600">Pay when you receive your order</p>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors"
              style={{ borderColor: paymentMethod === 'ONLINE' ? 'rgb(0, 0, 0)' : 'rgb(229, 231, 235)' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="ONLINE"
                checked={paymentMethod === 'ONLINE'}
                onChange={(e) => setPaymentMethod(e.target.value as 'COD' | 'ONLINE')}
                className="w-4 h-4"
              />
              <div className="ml-4">
                <p className="font-semibold">Pay Online</p>
                <p className="text-sm text-gray-600">UPI, Cards, NetBanking, Wallets</p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Place Order'
        )}
      </Button>
    </form>
  );
}
