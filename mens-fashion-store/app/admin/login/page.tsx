'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@mensfashion.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Store session
      localStorage.setItem('adminSession', JSON.stringify(data.session));

      // Redirect to dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Men's Fashion</h1>
          <p className="text-gray-400">Admin Panel</p>
        </div>

        {/* Login Card */}
        <Card className="bg-gray-800 border-gray-700 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-white text-2xl">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mensfashion.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 gap-2"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>

              {/* Test Credentials Info */}
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 text-xs text-blue-300 space-y-1">
                <p className="font-semibold">Test Credentials:</p>
                <p>Email: admin@mensfashion.com</p>
                <p>Password: admin123</p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 Men's Fashion Store. All rights reserved.
        </p>
      </div>
    </div>
  );
}

