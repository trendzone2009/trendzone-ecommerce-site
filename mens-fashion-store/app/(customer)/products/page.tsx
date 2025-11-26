import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/types';
import { ProductGrid } from '@/components/customer/product-grid';
import { ProductFilters } from '@/components/customer/product-filters';

interface SearchParams {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string;
  sort?: string;
  page?: string;
}

async function getProducts(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('products')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('is_active', true);

  // Filter by category
  if (searchParams.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single();

    if (category) {
      query = query.eq('category_id', category.id);
    }
  }

  // Filter by price range
  if (searchParams.minPrice) {
    query = query.gte('base_price', parseFloat(searchParams.minPrice));
  }
  if (searchParams.maxPrice) {
    query = query.lte('base_price', parseFloat(searchParams.maxPrice));
  }

  // Sort
  const sort = searchParams.sort || 'newest';
  switch (sort) {
    case 'price-low':
      query = query.order('base_price', { ascending: true });
      break;
    case 'price-high':
      query = query.order('base_price', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0 };
  }

  return { products: data as Product[], total: count || 0 };
}

async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data as Category[];
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await searchParams in Next.js 16
  const params = await searchParams;
  
  const [{ products, total }, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  const page = parseInt(params.page || '1');
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {params.category
          ? categories.find((c) => c.slug === params.category)?.name || 'Products'
          : 'All Products'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <ProductFilters categories={categories} searchParams={params} />
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <ProductGrid
            products={products}
            currentPage={page}
            totalPages={totalPages}
            searchParams={params}
          />
        </div>
      </div>
    </div>
  );
}
