import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate query
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { products: [], total: 0 },
        { status: 200 }
      );
    }

    const searchTerm = `%${query}%`;

    // Search products by name and description
    // Join with categories to get category name
    const { data: products, error: productsError, count } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        slug,
        base_price,
        images,
        is_active,
        created_at,
        categories:category_id(name)
        `,
        { count: 'exact' }
      )
      .ilike('name', searchTerm)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productsError) {
      console.error('Search error:', productsError);
      return NextResponse.json(
        { message: 'Search failed' },
        { status: 500 }
      );
    }

    // Also search in description if we didn't get enough results
    let allProducts = products || [];
    if (allProducts.length < limit) {
      const { data: descriptionProducts, error: descError } = await supabase
        .from('products')
        .select(
          `
          id,
          name,
          slug,
          base_price,
          images,
          is_active,
          created_at,
          categories:category_id(name)
          `
        )
        .ilike('description', searchTerm)
        .eq('is_active', true)
        .not('id', 'in', `(${allProducts.map((p: any) => `'${p.id}'`).join(',')})`)
        .order('created_at', { ascending: false })
        .limit(limit - allProducts.length);

      if (!descError && descriptionProducts) {
        allProducts = [...allProducts, ...descriptionProducts];
      }
    }

    // Transform products to match frontend expectations
    const transformedProducts = allProducts.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.base_price) || 0,
      image: product.images && Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : null,
      category: product.categories?.name || 'Uncategorized',
    }));

    return NextResponse.json({
      products: transformedProducts,
      total: count || 0,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
