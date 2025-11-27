import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Fetch store settings
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows found" error
      console.error('Error fetching settings:', error);
      return NextResponse.json(
        { message: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // Return default settings if none exist
    return NextResponse.json({
      settings: data || {
        store_name: "Men's Fashion Store",
        store_email: 'contact@mensfashion.com',
        store_phone: '+91-9999-999-999',
        store_address: '123 Fashion Street, Mumbai, MH 400001',
        store_city: 'Mumbai',
        store_state: 'Maharashtra',
        store_pincode: '400001',
        shipping_cost: 50,
        free_shipping_above: 500,
        business_hours_open: '09:00',
        business_hours_close: '22:00',
        currency: 'INR',
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      store_name,
      store_email,
      store_phone,
      store_address,
      store_city,
      store_state,
      store_pincode,
      shipping_cost,
      free_shipping_above,
      business_hours_open,
      business_hours_close,
    } = body;

    if (
      !store_name ||
      !store_email ||
      !store_phone ||
      !store_address ||
      !store_city ||
      !store_state ||
      !store_pincode
    ) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if settings exist
    const { data: existingSettings, error: fetchError } = await supabase
      .from('store_settings')
      .select('id')
      .single();

    let result;

    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('store_settings')
        .update({
          store_name,
          store_email,
          store_phone,
          store_address,
          store_city,
          store_state,
          store_pincode,
          shipping_cost: parseFloat(shipping_cost),
          free_shipping_above: parseFloat(free_shipping_above),
          business_hours_open,
          business_hours_close,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSettings.id)
        .select();
    } else {
      // Insert new settings
      result = await supabase
        .from('store_settings')
        .insert({
          store_name,
          store_email,
          store_phone,
          store_address,
          store_city,
          store_state,
          store_pincode,
          shipping_cost: parseFloat(shipping_cost),
          free_shipping_above: parseFloat(free_shipping_above),
          business_hours_open,
          business_hours_close,
          currency: 'INR',
        })
        .select();
    }

    if (result.error) {
      console.error('Error updating settings:', result.error);
      return NextResponse.json(
        { message: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      settings: result.data?.[0],
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
