// User authentication utilities using Supabase Auth
import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Register a new user
export async function registerUser(data: RegisterData) {
  try {
    // 1. Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone || '',
        },
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // 2. Create user profile in database
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        phone: data.phone || null,
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      // Don't fail registration if profile creation fails
      // User can still use the account
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name: data.name,
        phone: data.phone,
      },
      session: authData.session,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Login user
export async function loginUser(data: LoginData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error('Login error:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user || !authData.session) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name: profile?.name || authData.user.user_metadata?.name || '',
        phone: profile?.phone || authData.user.user_metadata?.phone || '',
      },
      session: authData.session,
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Logout user
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, user: null };
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email!,
        name: profile?.name || user.user_metadata?.name || '',
        phone: profile?.phone || user.user_metadata?.phone || '',
        created_at: user.created_at,
      },
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { success: false, user: null };
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return { success: true, session };
  } catch (error) {
    console.error('Get session error:', error);
    return { success: false, session: null };
  }
}

// Update user profile
export async function updateUserProfile(userId: string, data: Partial<{ name: string; phone: string }>) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', userId);

    if (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }

    // Also update auth metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data,
    });

    if (metadataError) {
      console.error('Update metadata error:', metadataError);
    }

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Password reset request
export async function requestPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update password
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Update password error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
