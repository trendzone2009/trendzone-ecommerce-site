'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { updateUserProfile } from '@/lib/auth';
import { AlertCircle, CheckCircle, User, Mail, Phone, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      const result = await updateUserProfile(user.id, {
        name: formData.name,
        phone: formData.phone,
      });

      if (!result.success) {
        setError(result.error || 'Failed to update profile');
        return;
      }

      setSuccess(true);
      setIsEditing(false);
      await refreshUser();

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Update profile error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-start gap-2">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Profile updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10"
                    disabled={!isEditing || isSaving}
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    className="pl-10 bg-gray-50"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                    placeholder="+91-9876543210"
                    disabled={!isEditing || isSaving}
                  />
                </div>
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={new Date(user.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    className="pl-10 bg-gray-50"
                    disabled
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!isEditing ? (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 sm:flex-none"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/orders')}>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-1">Order History</h3>
              <p className="text-sm text-gray-600">View your past orders and track shipments</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/addresses')}>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-1">Saved Addresses</h3>
              <p className="text-sm text-gray-600">Manage your shipping addresses</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
