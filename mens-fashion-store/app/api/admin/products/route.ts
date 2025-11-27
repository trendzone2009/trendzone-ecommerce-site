import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    // Use admin client to bypass RLS for admin operations
    const supabase = getSupabaseAdmin();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    // Join with categories to get category name
    let query = supabase
      .from('products')
      .select('*, category:categories(id, name, slug)', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category && category !== 'all') {
      // Find category ID by name
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', category)
        .single();
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }
    if (status && status !== 'all') {
      // Map status to is_active boolean
      const isActive = status === 'active';
      query = query.eq('is_active', isActive);
    }

    // Apply pagination
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform data to match frontend expectations
    const products = (data || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category?.name || 'Uncategorized',
      category_id: product.category_id,
      price: product.base_price || 0,
      compare_at_price: product.compare_at_price,
      images: product.images,
      status: product.is_active ? 'active' : 'draft',
      featured: product.featured,
      created_at: product.created_at,
      updated_at: product.updated_at,
    }));

    return NextResponse.json({
      products,
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
    // Use admin client to bypass RLS for admin operations
    const supabase = getSupabaseAdmin();
    
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
      images,
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

    // Find category ID by name
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', category)
      .single();

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Create product with correct column names
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([
        {
          name,
          slug,
          description: description || null,
          category_id: categoryData?.id || null,
          base_price: parseFloat(price),
          compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
          is_active: status === 'active',
          featured: false,
          images: images || [],
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
    // Use admin client to bypass RLS for admin operations
    const supabase = getSupabaseAdmin();
    
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
      images,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Find category ID by name
    let categoryId = null;
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', category)
        .single();
      categoryId = categoryData?.id || null;
    }

    // Update product with correct column names
    const { error: updateError } = await supabase
      .from('products')
      .update({
        name,
        description: description || null,
        category_id: categoryId,
        base_price: price ? parseFloat(price) : undefined,
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        is_active: status === 'active',
        images: images || [],
        updated_at: new Date().toISOString(),
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
    // Use admin client to bypass RLS for admin operations
    const supabase = getSupabaseAdmin();
    
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
