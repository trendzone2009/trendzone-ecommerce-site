'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Package } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  totalStock: number;
  sizes: Array<{
    size: string;
    stock: number;
  }>;
}

export default function InventoryPage() {
  const searchParams = useSearchParams();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [stockLevel, setStockLevel] = useState(searchParams.get('stockLevel') || 'all');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, [search, stockLevel, page]);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(stockLevel !== 'all' && { stockLevel }),
      });

      const response = await fetch(`/api/admin/inventory?${params}`);
      const data = await response.json();

      if (response.ok) {
        setInventory(data.inventory);
        setTotal(data.total);
        setPages(data.pages);
      } else {
        setError('Failed to load inventory');
      }
    } catch (err) {
      setError('An error occurred while loading inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const startEdit = (variantId: string, currentQuantity: number) => {
    setEditingVariantId(variantId);
    setEditingQuantity(currentQuantity.toString());
  };

  const cancelEdit = () => {
    setEditingVariantId(null);
    setEditingQuantity('');
  };

  const handleUpdateStock = async (variantId: string) => {
    const quantity = parseInt(editingQuantity);
    if (isNaN(quantity) || quantity < 0) {
      setError('Invalid quantity');
      return;
    }

    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity }),
      });

      if (response.ok) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
        fetchInventory();
        setEditingVariantId(null);
      } else {
        setError('Failed to update stock');
      }
    } catch (err) {
      setError('An error occurred while updating stock');
      console.error('Error updating stock:', err);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity < 5) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null || isNaN(amount)) {
      return '₹0.00';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage product stock levels</p>
      </div>

      {updateSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900">Success</h3>
            <p className="text-sm text-green-700">Stock updated successfully</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Search</Button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['all', 'low', 'out'].map((level) => (
                <button
                  key={level}
                  onClick={() => { setStockLevel(level); setPage(1); }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    stockLevel === level
                      ? level === 'out' ? 'bg-red-600 text-white' : level === 'low' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level === 'all' ? 'All Products' : level === 'low' ? 'Low Stock (<5)' : 'Out of Stock'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory List</CardTitle>
            <span className="text-sm text-gray-600">Total: {total} product{total !== 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading inventory...</div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No products found</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {inventory.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-gray-600">Category: {item.category}</span>
                          <span className="text-gray-600">Price: {formatCurrency(item.price)}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStockStatus(item.totalStock).color}`}>
                            {getStockStatus(item.totalStock).label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{item.totalStock}</p>
                        <p className="text-sm text-gray-600">Total Stock</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {item.sizes.map((sizeItem) => (
                        <div key={`${item.id}-${sizeItem.size}`} className="border border-gray-200 rounded p-2">
                          {editingVariantId === `${item.id}-${sizeItem.size}` ? (
                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-700">{sizeItem.size}</label>
                              <Input type="number" min="0" value={editingQuantity} onChange={(e) => setEditingQuantity(e.target.value)} className="h-8 px-2 py-1 text-xs" />
                              <div className="flex gap-1 mt-1">
                                <Button size="sm" onClick={() => handleUpdateStock(`${item.id}-${sizeItem.size}`)} className="flex-1 h-6 text-xs bg-blue-600 hover:bg-blue-700">Save</Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit} className="flex-1 h-6 text-xs">Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">{sizeItem.size}</p>
                              <p className="text-lg font-bold text-gray-900">{sizeItem.stock}</p>
                              <button onClick={() => startEdit(`${item.id}-${sizeItem.size}`, sizeItem.stock)} className="text-xs text-blue-600 hover:text-blue-700 mt-1">Edit</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
                  <span className="text-sm text-gray-600">Page {page} of {pages}</span>
                  <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === pages}>Next</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

