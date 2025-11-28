import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Helper to extract access token from Supabase cookies
function getAccessTokenFromCookies(request: NextRequest): string | null {
  const allCookies = request.cookies.getAll();
  console.log('All cookies:', allCookies.map(c => c.name)); // Debug log

  // Try to find Supabase auth cookie (format: sb-{project-ref}-auth-token)
  const authCookie = allCookies.find(cookie =>
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  );

  if (!authCookie) {
    console.log('No auth cookie found');
    return null;
  }

  try {
    console.log('Auth cookie found:', authCookie.name);
    // Supabase stores the session as JSON in the cookie
    const cookieValue = JSON.parse(decodeURIComponent(authCookie.value));

    // The cookie value can be an array [access_token, refresh_token] or an object
    if (Array.isArray(cookieValue)) {
      return cookieValue[0];
    } else if (cookieValue.access_token) {
      return cookieValue.access_token;
    }

    return null;
  } catch (e) {
    console.error('Error parsing auth cookie:', e);
    return null;
  }
}

// GET - Fetch all saved addresses for logged-in user
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const accessToken = getAccessTokenFromCookies(request);

    if (!accessToken) {
      console.log('No access token, returning empty array');
      return NextResponse.json([]);
    }

    // Get user from access token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return NextResponse.json([]);
    }

    console.log('Fetching addresses for user:', user.id);

    // Fetch addresses for the logged-in user
    const { data, error } = await supabaseAdmin
      .from('saved_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved addresses:', error);
      return NextResponse.json(
        { message: 'Failed to fetch addresses' },
        { status: 500 }
      );
    }

    console.log(`Found ${data?.length || 0} saved addresses`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new saved address
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const accessToken = getAccessTokenFromCookies(request);

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Get user from access token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return NextResponse.json(
        { message: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark,
      isDefault,
      label,
    } = body;

    if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If this address is set as default, unset other defaults
    if (isDefault) {
      await supabaseAdmin
        .from('saved_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data, error } = await supabaseAdmin
      .from('saved_addresses')
      .insert({
        user_id: user.id,
        name,
        phone,
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        state,
        pincode,
        landmark: landmark || null,
        is_default: isDefault || false,
        label: label || 'Home',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating saved address:', error);
      return NextResponse.json(
        { message: 'Failed to create address' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
