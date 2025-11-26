import { Database } from './database';

export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductVariant = Database['public']['Tables']['product_variants']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Setting = Database['public']['Tables']['settings']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  category?: Category;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export type PaymentMethod = 'COD' | 'ONLINE';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
