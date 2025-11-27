'use server';

import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { ProductGrid } from '@/components/customer/product-grid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface SearchParams {
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string;
  sort?: string;
  page?: string;
}

async function searchProducts(searchParams: SearchParams) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  // Redirect empty query to /products
  if (!query.trim()) {
    return { products: [], total: 0, redirect: true };
  }

  const searchTerm = `%${query}%`;

  let baseQuery = supabase
    .from('products')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('is_active', true);

  // Search by name first (primary match)
  const { data: nameResults, error: nameError, count: nameCount } = await baseQuery
    .ilike('name', searchTerm)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (nameError) {
    console.error('Error searching by name:', nameError);
    return { products: [], total: 0 };
  }

  // If we have enough results, return them
  if (nameResults && nameResults.length >= limit) {
    return { products: nameResults as Product[], total: nameCount || 0 };
  }

  // Otherwise, search by description to supplement results
  const resultIds = nameResults ? nameResults.map((p) => p.id) : [];
  let descriptionQuery = supabase
    .from('products')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('is_active', true)
    .ilike('description', searchTerm)
    .order('created_at', { ascending: false });

  // Exclude products already found by name search
  if (resultIds.length > 0) {
    descriptionQuery = descriptionQuery.not(
      'id',
      'in',
      `(${resultIds.map((id) => `'${id}'`).join(',')})`
    );
  }

  const { data: descriptionResults } = await descriptionQuery.range(
    0,
    limit - (nameResults?.length || 0) - 1
  );

  // Combine results
  const allProducts = [
    ...(nameResults || []),
    ...(descriptionResults || []),
  ];

  return {
    products: allProducts.slice(0, limit) as Product[],
    total: Math.max(nameCount || 0, (nameCount || 0) + (descriptionResults?.length || 0)),
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  // Redirect if no query
  if (!query.trim()) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>
          <p className="text-gray-600 mb-8">Please enter a search term to find products.</p>
          <Link href="/products">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { products, total } = await searchProducts(params);
  const page = parseInt(params.page || '1');
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {products.length > 0
                ? `${total} result${total === 1 ? '' : 's'} for "${query}"`
                : `No products found for "${query}"`}
            </h1>
            {products.length === 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-gray-600">Try:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Checking your spelling</li>
                  <li>• Using different keywords</li>
                  <li>• Being less specific</li>
                </ul>
                <Link href="/products" className="inline-block mt-4">
                  <Button variant="outline">Browse All Products</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 && (
        <div className="mb-8">
          <ProductGrid
            products={products}
            currentPage={page}
            totalPages={totalPages}
            searchParams={{ ...params, q: query }}
          />
        </div>
      )}
    </div>
  );
}
