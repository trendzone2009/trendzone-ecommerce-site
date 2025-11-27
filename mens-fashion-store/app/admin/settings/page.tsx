'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Save } from 'lucide-react';

interface StoreSettings {
  id?: string;
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  store_city: string;
  store_state: string;
  store_pincode: string;
  shipping_cost: number;
  free_shipping_above: number;
  business_hours_open: string;
  business_hours_close: string;
  currency: string;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<StoreSettings>({
    store_name: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    store_city: '',
    store_state: '',
    store_pincode: '',
    shipping_cost: 50,
    free_shipping_above: 500,
    business_hours_open: '09:00',
    business_hours_close: '22:00',
    currency: 'INR',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (response.ok) {
        setFormData(data.settings);
      } else {
        setError('Failed to load settings');
      }
    } catch (err) {
      setError('An error occurred while loading settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.store_name || !formData.store_email || !formData.store_phone || !formData.store_address || !formData.store_city || !formData.store_state || !formData.store_pincode) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (err) {
      setError('An error occurred while saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><p className="text-gray-600">Loading settings...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-600 mt-1">Manage your store information and configuration</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div><h3 className="font-semibold text-green-900">Success</h3><p className="text-sm text-green-700">Settings saved successfully</p></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div><h3 className="font-semibold text-red-900">Error</h3><p className="text-sm text-red-700">{error}</p></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Store Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="store_name">Store Name *</Label>
              <Input id="store_name" name="store_name" value={formData.store_name} onChange={handleInputChange} placeholder="e.g., Men's Fashion Store" className="mt-1" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="store_email">Email Address *</Label>
                <Input id="store_email" name="store_email" type="email" value={formData.store_email} onChange={handleInputChange} placeholder="contact@store.com" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="store_phone">Phone Number *</Label>
                <Input id="store_phone" name="store_phone" value={formData.store_phone} onChange={handleInputChange} placeholder="+91-9999-999-999" className="mt-1" required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Address Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="store_address">Address *</Label>
              <textarea id="store_address" name="store_address" value={formData.store_address} onChange={handleInputChange} placeholder="Full address including street" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label htmlFor="store_city">City *</Label><Input id="store_city" name="store_city" value={formData.store_city} onChange={handleInputChange} placeholder="e.g., Mumbai" className="mt-1" required /></div>
              <div><Label htmlFor="store_state">State *</Label><Input id="store_state" name="store_state" value={formData.store_state} onChange={handleInputChange} placeholder="e.g., Maharashtra" className="mt-1" required /></div>
              <div><Label htmlFor="store_pincode">Pincode *</Label><Input id="store_pincode" name="store_pincode" value={formData.store_pincode} onChange={handleInputChange} placeholder="e.g., 400001" className="mt-1" required /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Shipping Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="shipping_cost">Shipping Cost (₹)</Label><Input id="shipping_cost" name="shipping_cost" type="number" step="0.01" min="0" value={formData.shipping_cost} onChange={handleInputChange} placeholder="50" className="mt-1" /></div>
              <div><Label htmlFor="free_shipping_above">Free Shipping Above (₹)</Label><Input id="free_shipping_above" name="free_shipping_above" type="number" step="0.01" min="0" value={formData.free_shipping_above} onChange={handleInputChange} placeholder="500" className="mt-1" /></div>
            </div>
            <p className="text-sm text-gray-600">Shipping will be free for orders above the specified amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Business Hours</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="business_hours_open">Opening Time</Label><Input id="business_hours_open" name="business_hours_open" type="time" value={formData.business_hours_open} onChange={handleInputChange} className="mt-1" /></div>
              <div><Label htmlFor="business_hours_close">Closing Time</Label><Input id="business_hours_close" name="business_hours_close" type="time" value={formData.business_hours_close} onChange={handleInputChange} className="mt-1" /></div>
            </div>
            <p className="text-sm text-gray-600">Set your store's business hours for customer reference</p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}

