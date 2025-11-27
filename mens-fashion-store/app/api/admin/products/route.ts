import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = supabase.from('products').select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      products: data || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      compareAtPrice,
      sizes,
      stockPerSize,
      status,
    } = body;

    // Validate required fields
    if (!name || !category || !price) {
      return NextResponse.json(
        { message: 'Missing required fields: name, category, price' },
        { status: 400 }
      );
    }

    if (!sizes || sizes.length === 0) {
      return NextResponse.json(
        { message: 'Select at least one size' },
        { status: 400 }
      );
    }

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([
        {
          name,
          description: description || null,
          category,
          price,
          compare_at_price: compareAtPrice || null,
          status: status || 'draft',
        },
      ])
      .select()
      .single();

    if (productError) throw productError;

    // Create product variants with stock
    const variants = sizes.map((size: string) => ({
      product_id: product.id,
      size,
      stock_quantity: stockPerSize[size] || 0,
    }));

    const { error: variantsError } = await supabase
      .from('product_variants')
      .insert(variants);

    if (variantsError) throw variantsError;

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { message: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      name,
      description,
      category,
      price,
      compareAtPrice,
      sizes,
      stockPerSize,
      status,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Update product
    const { error: updateError } = await supabase
      .from('products')
      .update({
        name,
        description: description || null,
        category,
        price,
        compare_at_price: compareAtPrice || null,
        status,
      })
      .eq('id', productId);

    if (updateError) throw updateError;

    // Delete old variants
    await supabase.from('product_variants').delete().eq('product_id', productId);

    // Create new variants
    const variants = sizes.map((size: string) => ({
      product_id: productId,
      size,
      stock_quantity: stockPerSize[size] || 0,
    }));

    const { error: variantsError } = await supabase
      .from('product_variants')
      .insert(variants);

    if (variantsError) throw variantsError;

    return NextResponse.json({
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Delete variants first
    await supabase.from('product_variants').delete().eq('product_id', productId);

    // Delete product
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) throw error;

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
