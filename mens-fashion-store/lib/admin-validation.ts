import { z } from 'zod';

// Product form schema
export const productFormSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(100),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  compareAtPrice: z.coerce.number().optional(),
  sizes: z.array(z.string()).min(1, 'Select at least one size'),
  stockPerSize: z.record(z.coerce.number().nonnegative()),
  status: z.enum(['active', 'draft']).default('draft'),
  mainImageIndex: z.number().default(0),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

// Product validation schema
export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  category: z.string(),
  price: z.number(),
  compare_at_price: z.number().optional().nullable(),
  status: z.enum(['active', 'draft']),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Order status update schema
export const orderStatusUpdateSchema = z.object({
  orderId: z.string(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;

// Settings schema
export const settingsSchema = z.object({
  storeName: z.string().min(2),
  storeEmail: z.string().email(),
  storePhone: z.string(),
  storeAddress: z.string(),
  freeShippingThreshold: z.coerce.number().positive().default(999),
  shippingCharge: z.coerce.number().nonnegative().default(99),
  defaultShippingDays: z.coerce.number().positive().default(5),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
