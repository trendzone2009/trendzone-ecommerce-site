import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function ProductGrid({
  products,
  currentPage,
  totalPages,
  searchParams,
}: ProductGridProps) {
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value);
      }
    });
    params.set('page', page.toString());
    return `/products?${params.toString()}`;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found.</p>
        <Link href="/products">
          <Button variant="outline" className="mt-4">
            View All Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {products.map((product) => {
          const images = Array.isArray(product.images) ? product.images : [];
          const mainImage =
            images[0] ||
            'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=500&fit=crop';

          const discount = product.compare_at_price
            ? Math.round(
                ((product.compare_at_price - product.base_price) /
                  product.compare_at_price) *
                  100
              )
            : 0;

          return (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="relative h-72">
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {discount}% OFF
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {formatPrice(product.base_price)}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.compare_at_price)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <Link href={buildPageUrl(currentPage - 1)}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Link key={page} href={buildPageUrl(page)}>
                    <Button
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="icon"
                    >
                      {page}
                    </Button>
                  </Link>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2 py-2">...</span>;
              }
              return null;
            })}
          </div>

          {currentPage < totalPages && (
            <Link href={buildPageUrl(currentPage + 1)}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
