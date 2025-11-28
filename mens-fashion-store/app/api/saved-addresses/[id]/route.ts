import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Helper to extract access token from Supabase cookies
function getAccessTokenFromCookies(request: NextRequest): string | null {
  const allCookies = request.cookies.getAll();

  // Try to find Supabase auth cookie (format: sb-{project-ref}-auth-token)
  const authCookie = allCookies.find(cookie =>
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  );

  if (!authCookie) {
    return null;
  }

  try {
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

// DELETE - Delete a saved address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const addressId = params.id;

    // Delete the address (only if it belongs to the user)
    const { error } = await supabaseAdmin
      .from('saved_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.id); // Ensure user can only delete their own address

    if (error) {
      console.error('Error deleting saved address:', error);
      return NextResponse.json(
        { message: 'Failed to delete address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
