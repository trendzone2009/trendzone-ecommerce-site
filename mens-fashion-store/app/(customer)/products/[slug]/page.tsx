import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product, ProductVariant } from '@/types';
import { ProductDetail } from '@/components/customer/product-detail';

async function getProduct(slug: string) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    return null;
  }

  // Get variants (sizes and stock)
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', product.id)
    .order('size');

  return {
    ...product,
    variants: variants || [],
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Await params in Next.js 16
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
