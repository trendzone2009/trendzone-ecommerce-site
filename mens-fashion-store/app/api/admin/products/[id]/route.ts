import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - Fetch a single product with variants
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use admin client to bypass RLS for admin operations
    const supabase = getSupabaseAdmin();
    
    const { id } = await params;

    // Fetch product with category
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch product variants
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .order('size');

    if (variantsError) {
      console.error('Error fetching variants:', variantsError);
    }

    // Transform to match frontend expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category?.name || '',
      category_id: product.category_id,
      price: product.base_price || 0,
      compare_at_price: product.compare_at_price,
      images: product.images,
      status: product.is_active ? 'active' : 'draft',
      featured: product.featured,
      created_at: product.created_at,
      updated_at: product.updated_at,
      variants: variants || [],
    };

    return NextResponse.json({ product: transformedProduct });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

