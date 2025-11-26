'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductWithVariants } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Check } from 'lucide-react';

interface ProductDetailProps {
  product: ProductWithVariants;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const images = Array.isArray(product.images) ? product.images : [];
  const productImages = images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop'];

  const selectedVariant = product.variants?.find((v) => v.size === selectedSize);
  const stockAvailable = selectedVariant ? selectedVariant.stock_quantity : 0;
  const isInStock = stockAvailable > 0;

  const discount = product.compare_at_price
    ? Math.round(
        ((product.compare_at_price - product.base_price) / product.compare_at_price) * 100
      )
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    if (!isInStock) {
      alert('This size is out of stock');
      return;
    }

    if (quantity > stockAvailable) {
      alert(`Only ${stockAvailable} items available in stock`);
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.base_price,
      size: selectedSize,
      quantity,
      image: productImages[0],
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push('/cart'), 500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-primary">Products</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-primary"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={productImages[selectedImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded font-bold">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? 'border-primary'
                      : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-gray-600 hover:text-primary"
              >
                {product.category.name}
              </Link>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              {formatPrice(product.base_price)}
            </span>
            {product.compare_at_price && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
                <Badge variant="destructive">{discount}% OFF</Badge>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Select Size</h2>
              <button className="text-sm text-primary hover:underline">
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {product.variants?.map((variant) => {
                const isAvailable = variant.stock_quantity > 0;
                const isSelected = selectedSize === variant.size;

                return (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedSize(variant.size)}
                    disabled={!isAvailable}
                    className={`
                      px-4 py-3 rounded border-2 font-semibold transition-colors
                      ${isSelected
                        ? 'border-primary bg-primary text-white'
                        : isAvailable
                        ? 'border-gray-300 hover:border-primary'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {variant.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Status */}
          {selectedSize && (
            <div>
              {isInStock ? (
                <p className="text-green-600 text-sm">
                  <Check className="inline w-4 h-4 mr-1" />
                  {stockAvailable} items available
                </p>
              ) : (
                <p className="text-red-600 text-sm">Out of Stock</p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <h2 className="font-semibold mb-3">Quantity</h2>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(stockAvailable || 1, quantity + 1))}
              >
                +
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAddToCart}
              className="w-full"
              size="lg"
              disabled={!selectedSize || !isInStock}
            >
              {addedToCart ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </>
              )}
            </Button>
            <Button
              onClick={handleBuyNow}
              variant="secondary"
              className="w-full"
              size="lg"
              disabled={!selectedSize || !isInStock}
            >
              Buy Now
            </Button>
          </div>

          {/* Additional Info */}
          <Card className="p-4 bg-gray-50">
            <ul className="space-y-2 text-sm">
              <li>✓ Free shipping on orders above ₹999</li>
              <li>✓ COD available</li>
              <li>✓ 7-day easy returns</li>
              <li>✓ 100% authentic products</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
