// Admin authentication utilities
import { supabase } from './supabase';

// Simple admin credentials stored in environment variables
// In production, use a proper user management system
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mensfashion.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  loggedInAt: Date;
}

/**
 * Verify admin credentials
 * In production, integrate with proper authentication system
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ valid: boolean; message: string }> {
  // Basic validation
  if (!email || !password) {
    return {
      valid: false,
      message: 'Email and password are required',
    };
  }

  // Check credentials (in production, use bcrypt and database)
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return {
      valid: true,
      message: 'Login successful',
    };
  }

  return {
    valid: false,
    message: 'Invalid email or password',
  };
}

/**
 * Create admin session
 */
export function createAdminSession(email: string): AdminSession {
  return {
    id: `admin_${Date.now()}`,
    email,
    name: 'Admin',
    isAdmin: true,
    loggedInAt: new Date(),
  };
}

/**
 * Get admin session from localStorage
 */
export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;

  const sessionStr = localStorage.getItem('adminSession');
  if (!sessionStr) return null;

  try {
    return JSON.parse(sessionStr);
  } catch {
    return null;
  }
}

/**
 * Save admin session to localStorage
 */
export function saveAdminSession(session: AdminSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('adminSession', JSON.stringify(session));
}

/**
 * Clear admin session
 */
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminSession');
}

/**
 * Check if user is authenticated admin
 */
export function isAdminLoggedIn(): boolean {
  const session = getAdminSession();
  return session !== null && session.isAdmin;
}

/**
 * Get current admin session or null
 */
export function getCurrentAdminSession(): AdminSession | null {
  return getAdminSession();
}
