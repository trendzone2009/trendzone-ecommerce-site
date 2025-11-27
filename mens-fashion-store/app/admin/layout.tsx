'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSession {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');

  // Check if we're on the login page - skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  // Check auth on mount
  useEffect(() => {
    setMounted(true);
    // Set date on client side only to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }));

    // Skip auth check on login page
    if (isLoginPage) {
      return;
    }

    const sessionStr = localStorage.getItem('adminSession');

    if (!sessionStr) {
      router.push('/admin/login');
      return;
    }

    try {
      const parsedSession = JSON.parse(sessionStr);
      if (parsedSession.isAdmin) {
        setSession(parsedSession);
      } else {
        router.push('/admin/login');
      }
    } catch {
      router.push('/admin/login');
    }
  }, [router, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  // Show nothing while mounting
  if (!mounted) {
    return null;
  }

  // For login page, render children directly without the admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For other pages, wait for session
  if (!session) {
    return null;
  }

  const navItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
    },
    {
      name: 'Products',
      icon: Package,
      href: '/admin/products',
    },
    {
      name: 'Orders',
      icon: ShoppingCart,
      href: '/admin/orders',
    },
    {
      name: 'Inventory',
      icon: BarChart3,
      href: '/admin/inventory',
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/admin/settings',
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-screen z-40 md:relative`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
              M
            </div>
            {isSidebarOpen && <span className="font-bold text-lg">Admin</span>}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                  {isSidebarOpen && active && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          {isSidebarOpen && (
            <div className="text-xs">
              <p className="text-gray-400">Logged in as</p>
              <p className="text-white font-semibold truncate">{session.email}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-center gap-2 bg-gray-800 border-gray-700 text-red-400 hover:bg-gray-700 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && 'Logout'}
          </Button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex absolute bottom-20 -right-4 bg-gray-800 border border-gray-700 rounded-full p-2 hover:bg-gray-700"
        >
          {isSidebarOpen ? <ChevronRight /> : <ChevronRight className="rotate-180" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          <div className="flex-1" />
          <div className="text-right">
            <p className="text-sm text-gray-600">Admin Panel</p>
            <p className="text-xs text-gray-500">{currentDate}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

