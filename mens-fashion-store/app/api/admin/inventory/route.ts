import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const stockLevel = searchParams.get('stockLevel') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    // First, fetch products with search filter
    let productsQuery = supabase.from('products').select('id, name, category, price', { count: 'exact' });
    
    if (search) {
      productsQuery = productsQuery.ilike('name', `%${search}%`);
    }

    const { data: products, count: productCount, error: productsError } = await productsQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (productsError) {
      console.error('Products query error:', productsError);
      return NextResponse.json(
        { message: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        inventory: [],
        total: 0,
        page,
        pages: 0,
      });
    }

    // Fetch variants for these products
    const productIds = products.map(p => p.id);
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, product_id, size, stock_quantity')
      .in('product_id', productIds);

    if (variantsError) {
      console.error('Variants query error:', variantsError);
      // Return products without variant data if variants table doesn't exist
      const inventory = products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        totalStock: 0,
        sizes: [],
      }));

      return NextResponse.json({
        inventory,
        total: productCount || 0,
        page,
        pages: Math.ceil((productCount || 0) / pageSize),
      });
    }

    // Group variants by product
    const variantsByProduct: { [key: string]: any[] } = {};
    variants?.forEach((variant: any) => {
      if (!variantsByProduct[variant.product_id]) {
        variantsByProduct[variant.product_id] = [];
      }
      variantsByProduct[variant.product_id].push({
        size: variant.size,
        stock: variant.stock_quantity || 0,
      });
    });

    // Build inventory with stock info
    let inventory = products.map(product => {
      const productVariants = variantsByProduct[product.id] || [];
      const totalStock = productVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        totalStock,
        sizes: productVariants,
      };
    });

    // Filter by stock level after aggregation
    if (stockLevel === 'low') {
      inventory = inventory.filter(item => item.totalStock > 0 && item.totalStock < 5);
    } else if (stockLevel === 'out') {
      inventory = inventory.filter(item => item.totalStock === 0);
    }

    const total = productCount || 0;
    const pages = Math.ceil(total / pageSize);

    return NextResponse.json({
      inventory,
      total,
      page,
      pages,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, quantity } = body;

    if (!variantId || quantity === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { message: 'Quantity cannot be negative' },
        { status: 400 }
      );
    }

    // variantId format is "productId-size" (e.g., "uuid-M")
    const lastDashIndex = variantId.lastIndexOf('-');
    if (lastDashIndex === -1) {
      return NextResponse.json(
        { message: 'Invalid variant ID format' },
        { status: 400 }
      );
    }

    const productId = variantId.substring(0, lastDashIndex);
    const size = variantId.substring(lastDashIndex + 1);

    // Update by product_id and size
    const { data, error } = await supabase
      .from('product_variants')
      .update({ stock_quantity: quantity })
      .eq('product_id', productId)
      .eq('size', size)
      .select();

    if (error) {
      console.error('Error updating stock:', error);
      return NextResponse.json(
        { message: 'Failed to update stock' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      // Variant doesn't exist, try to create it
      const { data: newVariant, error: insertError } = await supabase
        .from('product_variants')
        .insert({ product_id: productId, size, stock_quantity: quantity })
        .select();

      if (insertError) {
        console.error('Error creating variant:', insertError);
        return NextResponse.json(
          { message: 'Failed to create variant' },
          { status: 500 }
        );
      }

      return NextResponse.json({ variant: newVariant?.[0] });
    }

    return NextResponse.json({ variant: data?.[0] });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
