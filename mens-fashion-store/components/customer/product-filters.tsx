'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductFiltersProps {
  categories: Category[];
  searchParams: Record<string, string | undefined>;
}

const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40', '42'];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export function ProductFilters({ categories, searchParams }: ProductFiltersProps) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(searchParams.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice || '');

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();

    // Merge existing params with updates
    const allParams = { ...searchParams, ...updates };

    Object.entries(allParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value);
      }
    });

    return `/products?${params.toString()}`;
  };

  const handleCategoryChange = (slug: string) => {
    const url = buildUrl({ category: searchParams.category === slug ? undefined : slug });
    router.push(url);
  };

  const handleSortChange = (sort: string) => {
    const url = buildUrl({ sort });
    router.push(url);
  };

  const handlePriceFilter = () => {
    const url = buildUrl({
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });
    router.push(url);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    router.push('/products');
  };

  const hasActiveFilters =
    searchParams.category ||
    searchParams.minPrice ||
    searchParams.maxPrice ||
    searchParams.size ||
    (searchParams.sort && searchParams.sort !== 'newest');

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}

      {/* Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sort By</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 ${
                (searchParams.sort || 'newest') === option.value
                  ? 'bg-gray-100 font-semibold'
                  : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 ${
                searchParams.category === category.slug
                  ? 'bg-gray-100 font-semibold'
                  : ''
              }`}
            >
              {category.name}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Min Price</label>
            <Input
              type="number"
              placeholder="₹0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Max Price</label>
            <Input
              type="number"
              placeholder="₹10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <Button onClick={handlePriceFilter} className="w-full" size="sm">
            Apply
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
