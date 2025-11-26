# Men's Fashion E-Commerce Store

A full-stack e-commerce platform for men's clothing built with Next.js 14, Supabase, and Razorpay.

## Features

### Customer Features
- Browse products by 8 categories
- Search and filter products
- Product detail pages with image gallery
- Shopping cart with localStorage persistence
- Guest checkout (no login required)
- COD and online payment options
- Mobile-responsive design

### Admin Features
- Dashboard with sales statistics
- Product management (CRUD operations)
- Order management with status updates
- Inventory tracking with low stock alerts
- Secure admin authentication

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Payments:** Razorpay
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account ([sign up](https://supabase.com))
- Razorpay account ([sign up](https://razorpay.com))

### Installation

1. **Install dependencies:**
   ```bash
   cd mens-fashion-store
   npm install
   ```

2. **Setup Supabase:**
   - Create a new project on Supabase
   - Go to SQL Editor and run the schema from `../database-schema.sql`
   - Go to Settings > API to get your project URL and anon key

3. **Setup Environment Variables:**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
mens-fashion-store/
├── app/
│   ├── (customer)/         # Customer-facing pages
│   │   ├── page.tsx        # Homepage
│   │   ├── products/       # Product listing & details
│   │   ├── cart/           # Shopping cart
│   │   └── checkout/       # Checkout flow
│   ├── (admin)/            # Admin panel
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── products/       # Product management
│   │   └── orders/         # Order management
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── customer/           # Customer components
│   └── admin/              # Admin components
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── cart-context.tsx    # Cart state management
│   └── utils.ts            # Utility functions
└── types/                  # TypeScript types
```

## Database Schema

The database includes:
- `categories` - Product categories
- `products` - Product information
- `product_variants` - Size and stock data
- `orders` - Order information
- `order_items` - Order line items
- `settings` - Store settings
- `admin_users` - Admin authentication

## Key Configuration

### Shipping Charges
- Free shipping above ₹999
- Flat ₹99 shipping below ₹999

### COD Settings
- COD available for all orders
- Maximum COD order value: ₹10,000

### Product Categories
1. T-Shirts
2. Shirts
3. Trousers & Pants
4. Jeans
5. Casual Wear
6. Winter Wear
7. Ethnic Wear
8. Accessories

## Deployment

### Vercel Deployment

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables
   - Deploy

3. **Switch Razorpay to Live Mode:**
   - Update Razorpay keys in environment variables
   - Test payment flow in production

## Admin Setup

1. **Create Admin User:**
   Run this SQL in Supabase SQL Editor:
   ```sql
   INSERT INTO admin_users (email, password_hash, name)
   VALUES (
     'admin@mensfashion.com',
     '$2a$10$example_hash_here',
     'Admin'
   );
   ```

2. **Access Admin Panel:**
   Navigate to `/admin` and login with your credentials

## Adding Products

1. Login to admin panel
2. Go to Products > Add New Product
3. Fill in product details:
   - Name, category, description
   - Base price and compare at price (for discounts)
   - Upload up to 5 images
   - Add sizes with stock quantities
4. Set as Active and Save

## Payment Testing

### Test Cards (Razorpay Test Mode)
- **Success:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### Test UPI
- **UPI ID:** success@razorpay
- **Status:** Approved

## Support

For issues or questions:
- Check documentation in `../START-HERE.md`
- Review PRD in `../mens-clothing-ecommerce-prd.md`
- See Razorpay guide in `../razorpay-integration-guide.md`

## License

Private project - All rights reserved
