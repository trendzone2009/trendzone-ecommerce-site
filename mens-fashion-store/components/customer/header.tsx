'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-context';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string;
}

const categories = [
  { name: 'T-Shirts', slug: 't-shirts' },
  { name: 'Shirts', slug: 'shirts' },
  { name: 'Trousers & Pants', slug: 'trousers-pants' },
  { name: 'Jeans', slug: 'jeans' },
  { name: 'Casual Wear', slug: 'casual-wear' },
  { name: 'Winter Wear', slug: 'winter-wear' },
  { name: 'Ethnic Wear', slug: 'ethnic-wear' },
  { name: 'Accessories', slug: 'accessories' },
];

export function Header() {
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}&limit=6`
      );
      const data = await response.json();
      setSearchResults(data.products || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setShowDropdown(false);
    }
  };

  const handleResultClick = (slug: string) => {
    window.location.href = `/products/${slug}`;
    setShowDropdown(false);
  };

  return (
    <header className="border-b sticky top-0 bg-white z-50">
      {/* Top Bar */}
      <div className="bg-black text-white text-xs py-2">
        <div className="container mx-auto px-4 text-center">
          Free Shipping on orders above ₹999 | COD Available
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            Men's Fashion
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full" ref={searchRef}>
              <Input
                type="search"
                placeholder="Search for products..."
                className="pr-10"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Search Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result.slug)}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0"
                        >
                          {result.image && (
                            <div className="relative h-12 w-12 flex-shrink-0">
                              <Image
                                src={result.image}
                                alt={result.name}
                                fill
                                className="object-cover rounded"
                                sizes="48px"
                              />
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">{result.name}</p>
                            <p className="text-xs text-gray-600">{result.category}</p>
                            <p className="text-sm font-semibold text-gray-900">₹{result.price}</p>
                          </div>
                        </button>
                      ))}
                      {searchResults.length > 0 && (
                        <div className="p-3 border-t">
                          <button
                            onClick={handleSearchSubmit}
                            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-600 text-sm">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>

          {/* Cart Button */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Search Bar - Mobile */}
        <form onSubmit={handleSearchSubmit} className="md:hidden mt-4">
          <div className="relative" ref={searchRef}>
            <Input
              type="search"
              placeholder="Search for products..."
              className="pr-10"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Search Dropdown - Mobile */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.slug)}
                        className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0"
                      >
                        {result.image && (
                          <div className="relative h-12 w-12 flex-shrink-0">
                            <Image
                              src={result.image}
                              alt={result.name}
                              fill
                              className="object-cover rounded"
                              sizes="48px"
                            />
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{result.name}</p>
                          <p className="text-xs text-gray-600">{result.category}</p>
                          <p className="text-sm font-semibold text-gray-900">₹{result.price}</p>
                        </div>
                      </button>
                    ))}
                    {searchResults.length > 0 && (
                      <div className="p-3 border-t">
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-600 text-sm">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="border-t">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-6 py-3">
            <Link href="/products" className="text-sm hover:text-primary">
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="text-sm hover:text-primary whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <Link
                href="/products"
                className="block py-2 text-sm hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="block py-2 text-sm hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
