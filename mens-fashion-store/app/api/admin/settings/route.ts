import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Default settings
const DEFAULT_SETTINGS = {
  store_name: "Men's Fashion Store",
  store_email: 'contact@mensfashion.com',
  store_phone: '+91-9999-999-999',
  store_address: '123 Fashion Street',
  store_city: 'Mumbai',
  store_state: 'Maharashtra',
  store_pincode: '400001',
  shipping_cost: 50,
  free_shipping_above: 500,
  business_hours_open: '09:00',
  business_hours_close: '22:00',
  currency: 'INR',
};

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from store_settings table first
    const { data: storeSettings, error: storeError } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (!storeError && storeSettings) {
      return NextResponse.json({ settings: storeSettings });
    }

    // Fallback: try to fetch from settings table (key-value format)
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('key, value');

    if (!settingsError && settingsData && settingsData.length > 0) {
      // Convert key-value pairs to object
      const settings = { ...DEFAULT_SETTINGS };
      settingsData.forEach((item: { key: string; value: any }) => {
        if (item.key === 'store_name') settings.store_name = item.value;
        if (item.key === 'shipping_charge') settings.shipping_cost = parseFloat(item.value) || 50;
        if (item.key === 'shipping_free_above') settings.free_shipping_above = parseFloat(item.value) || 500;
      });
      return NextResponse.json({ settings });
    }

    // Return default settings if nothing found
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return defaults on error instead of failing
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
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

    // Try to use store_settings table first
    const { data: existingSettings } = await supabase
      .from('store_settings')
      .select('id')
      .single();

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('store_settings')
        .update({
          store_name,
          store_email,
          store_phone,
          store_address,
          store_city,
          store_state,
          store_pincode,
          shipping_cost: parseFloat(shipping_cost) || 50,
          free_shipping_above: parseFloat(free_shipping_above) || 500,
          business_hours_open,
          business_hours_close,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSettings.id)
        .select();

      if (!error) {
        return NextResponse.json({
          settings: data?.[0],
          message: 'Settings updated successfully',
        });
      }
    }

    // Try to insert into store_settings
    const { data: newSettings, error: insertError } = await supabase
      .from('store_settings')
      .insert({
        store_name,
        store_email,
        store_phone,
        store_address,
        store_city,
        store_state,
        store_pincode,
        shipping_cost: parseFloat(shipping_cost) || 50,
        free_shipping_above: parseFloat(free_shipping_above) || 500,
        business_hours_open,
        business_hours_close,
        currency: 'INR',
      })
      .select();

    if (!insertError) {
      return NextResponse.json({
        settings: newSettings?.[0],
        message: 'Settings saved successfully',
      });
    }

    // Fallback: Update key-value settings table
    const settingsToUpdate = [
      { key: 'store_name', value: JSON.stringify(store_name) },
      { key: 'shipping_charge', value: String(shipping_cost || 50) },
      { key: 'shipping_free_above', value: String(free_shipping_above || 500) },
    ];

    for (const setting of settingsToUpdate) {
      await supabase
        .from('settings')
        .upsert({ key: setting.key, value: setting.value }, { onConflict: 'key' });
    }

    return NextResponse.json({
      settings: body,
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
