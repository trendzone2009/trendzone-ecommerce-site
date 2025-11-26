# Product Requirements Document (PRD)
## Men's Clothing E-Commerce Platform

**Version:** 1.0  
**Date:** November 20, 2025  
**Owner:** Naveen  
**Timeline:** 2 weeks to MVP launch

---

## 1. EXECUTIVE SUMMARY

### Who is this for?
**Primary Users:**
- Local and national customers in India looking for men's clothing across all categories (formal, casual, ethnic, gym wear)
- Age group: 18-45 years
- Comfort with online shopping but prefer COD option
- Value variety and quality over single-category stores

**Secondary User:**
- Store owner (Naveen) managing inventory and orders from existing offline store

### What's the ONE problem it solves?
Customers cannot browse and purchase from your comprehensive offline store inventory online, limiting your reach to only walk-in customers.

### How will we know if it works?
**Success Metrics (First 30 days):**
- 50+ products successfully listed online
- 10+ completed orders (COD + Online payment combined)
- 5+ customers complete checkout without support
- Average order value ≥ ₹1,500
- 3+ repeat customers within 30 days

---

## 2. CORE USER LOOP

### Customer Journey (MVP):
1. **Browse** → Customer visits site and browses categories
2. **Select** → Views product details, selects size, adds to cart
3. **Checkout** → Enters shipping address, chooses payment method (COD or Razorpay)
4. **Confirm** → Receives order confirmation with order number
5. **Track** → (Post-MVP: Can check order status)

### Admin Journey (MVP):
1. **Add Products** → Upload product with images, sizes, prices, stock
2. **Manage Inventory** → Update stock levels, prices, availability
3. **Process Orders** → View new orders, update status (processing → shipped → delivered)
4. **Dashboard** → Quick view of daily sales and pending orders

---

## 3. MVP FEATURES (Week 1-2)

### 3.1 Frontend (Customer-Facing)

#### Homepage
- Hero section with featured categories
- Category grid (8 main categories)
- Featured products section
- Quick navigation to all categories
- Search bar (simple text search)
- Mobile-responsive design

#### Product Listing Page
- Grid view of products (4 cols desktop, 2 cols mobile)
- Product card: image, name, price, sizes available
- Filter by: Category, Price range, Size
- Sort by: Price (low-high, high-low), Newest first
- Pagination (20 products per page)
- "Quick view" on hover (optional)

#### Product Detail Page
- Product image gallery (main image + thumbnails)
- Product name and price
- Size selector (S, M, L, XL, XXL, XXXL)
- Stock status indicator
- "Add to Cart" button
- Product description
- Size chart link
- Category breadcrumb navigation

#### Shopping Cart
- List of items with image, name, size, quantity, price
- Update quantity (+ / - buttons)
- Remove item option
- Subtotal calculation
- "Continue Shopping" button
- "Proceed to Checkout" button
- Empty cart state with CTA

#### Checkout Flow
**Step 1: Shipping Information**
- Full name (required)
- Mobile number (required)
- Email (required)
- Complete address (line 1, line 2, city, state, pincode)
- Landmark (optional)

**Step 2: Payment Method**
- Radio button: Cash on Delivery (COD)
- Radio button: Pay Online (Razorpay)
- COD info text: "Pay when you receive your order"
- Order summary sidebar (items, subtotal, shipping, total)

**Step 3: Order Confirmation**
- Order number display
- Order details summary
- Estimated delivery date
- "Continue Shopping" button
- (Future: Email confirmation)

#### Search & Navigation
- Main navigation: All Categories dropdown
- Search bar with basic text matching
- Category pages for each main category
- Footer with: About, Contact, Shipping Policy, Return Policy, Privacy Policy

### 3.2 Admin Panel

#### Dashboard (Home)
- Today's stats:
  - Total orders today
  - Total revenue today
  - Pending orders count
  - Low stock alerts count
- Recent orders table (last 10)
- Quick actions: Add Product, View All Orders

#### Product Management
**Product List View:**
- Table with: Image, Name, Category, Price, Stock, Status, Actions
- Search by product name
- Filter by category, stock status
- Bulk actions: Delete selected, Update stock
- "Add New Product" button

**Add/Edit Product Form:**
- Product name (required)
- Category (dropdown: T-Shirts, Shirts, Trousers, Jeans, etc.)
- Description (textarea)
- Price (required)
- Compare at price (optional - for showing discounts)
- Available sizes (multi-select: S, M, L, XL, XXL, XXXL)
- Stock quantity per size
- Product images upload (up to 5 images)
- Main image selector
- Status: Active / Draft
- Save & Publish button

#### Order Management
**Orders List View:**
- Table: Order #, Date, Customer Name, Total, Payment Method, Status, Actions
- Filter by: Status (All, Pending, Processing, Shipped, Delivered, Cancelled)
- Filter by: Payment method (All, COD, Online)
- Date range filter
- Search by order number or customer name

**Order Detail View:**
- Order number and date
- Customer information (name, phone, email, address)
- Order items list (product, size, quantity, price)
- Order total breakdown
- Payment method
- Current status with timeline
- Update status dropdown: Pending → Processing → Shipped → Delivered
- Add tracking number field (for shipped status)
- Cancel order button
- Print invoice button (future)

#### Inventory Management
- Stock level view (all products)
- Low stock alerts (products with < 5 items)
- Quick stock update interface
- Stock history log (future)

#### Settings (Basic)
- Store name and logo
- Contact information
- Shipping charges configuration
- COD availability toggle
- Admin password change

### 3.3 Technical Features

#### Authentication
**Admin Only (MVP):**
- Simple email/password login for admin panel
- Protected routes for admin pages
- Session management

**Customer:**
- NO authentication required for MVP (guest checkout only)
- Email collection for order updates

#### Payment Integration
**Razorpay Implementation:**
- Razorpay checkout integration
- Support for: UPI, Cards, NetBanking, Wallets
- Order creation before payment
- Payment verification webhook
- Failed payment handling
- COD option (no payment processing)

#### Database Schema
**Tables:**

1. **categories**
   - id, name, slug, image_url, sort_order, is_active

2. **products**
   - id, name, slug, description, category_id, base_price, compare_at_price
   - images (JSON array), is_active, created_at, updated_at

3. **product_variants**
   - id, product_id, size, stock_quantity, sku

4. **orders**
   - id, order_number, customer_name, customer_email, customer_phone
   - shipping_address (JSON), subtotal, shipping_charge, total
   - payment_method (COD/ONLINE), payment_status, razorpay_order_id
   - razorpay_payment_id, status, created_at, updated_at

5. **order_items**
   - id, order_id, product_id, product_name, size, quantity, price

6. **settings**
   - id, key, value

---

## 4. TECH STACK

### Frontend & Backend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React Context API (for cart)
- **Forms:** React Hook Form + Zod validation

### Database & Storage
- **Database:** Supabase (PostgreSQL)
- **Image Storage:** Supabase Storage
- **Real-time:** Supabase Realtime (for order updates in admin)

### Payments
- **Payment Gateway:** Razorpay
- **Supported Methods:** UPI, Cards, NetBanking, Wallets, COD

### Hosting & Deployment
- **Hosting:** Vercel (free tier)
- **Domain:** Custom domain (already owned)
- **SSL:** Automatic via Vercel
- **CDN:** Vercel Edge Network

### Development Tools
- **AI Coding:** Claude Code (primary), Cursor (refinement)
- **Version Control:** Git + GitHub
- **Package Manager:** npm or pnpm

---

## 5. MVP SCOPE BOUNDARIES

### ✅ IN SCOPE (Must Have)
- Product catalog with categories
- Shopping cart functionality
- Guest checkout (no user accounts)
- COD + Razorpay payment options
- Basic admin panel for products and orders
- Mobile-responsive design
- Basic search and filtering
- Order status management

### ❌ OUT OF SCOPE (Post-MVP)
- User accounts and login
- Wishlist functionality
- Product reviews and ratings
- Email notifications
- SMS notifications
- Advanced search (filters, facets)
- Recommendation engine
- Loyalty program
- Discount codes and coupons
- Blog or content pages
- Social media integration
- Live chat support
- Return/refund management system
- Analytics dashboard
- SEO optimization tools
- Multi-language support
- Gift wrapping options
- Size recommendations based on fit

### 🔄 PHASE 2 (After First 20 Orders)
Based on customer feedback, prioritize:
1. User accounts (if customers request it)
2. Email order confirmations
3. Wishlist (if customers ask)
4. Product reviews
5. Discount codes

---

## 6. CATEGORIES STRUCTURE

### Main Categories (8):
1. **T-Shirts** (Round neck, V-neck, Polo)
2. **Shirts** (Formal, Casual, Denim)
3. **Trousers & Pants** (Formal trousers, Chinos)
4. **Jeans** (Slim fit, Regular fit, Relaxed)
5. **Casual Wear** (Cargo pants, Joggers, Lowers, Shorts)
6. **Winter Wear** (Jackets, Hoodies, Sweatshirts, Overshirts)
7. **Ethnic Wear** (Kurtas, Sherwanis)
8. **Accessories** (Belts, Sunglasses, Perfumes, Watches)

### Size Chart (Standard):
- **T-Shirts/Shirts:** S, M, L, XL, XXL, XXXL
- **Pants/Jeans:** 28, 30, 32, 34, 36, 38, 40, 42
- **Accessories:** One Size / Multiple options

---

## 7. PAYMENT & PRICING

### Razorpay Setup
- Create Razorpay account
- Enable UPI, Cards, NetBanking, Wallets
- Set up webhooks for payment verification
- Test mode for development
- Production keys for launch

### COD Implementation
- COD available for all pin codes initially
- Max COD order value: ₹10,000 (configurable)
- COD handling charge: ₹50 (optional, configurable)

### Shipping Charges
- Free shipping above ₹999
- Flat ₹99 shipping below ₹999
- (Configurable in admin settings)

### Pricing Strategy
- All prices inclusive of taxes
- Display compare_at_price for discounts
- Clear pricing breakdown at checkout

---

## 8. ORDER WORKFLOW

### Customer Side:
1. **Cart Review** → Customer reviews items
2. **Address Entry** → Fills shipping information
3. **Payment Selection** → Chooses COD or Online
4. **Order Placement** → Gets order confirmation number

### Admin Side:
1. **Order Received** → New order appears in admin
2. **Order Verification** → Admin verifies payment (if online)
3. **Processing** → Admin prepares order for shipping
4. **Shipped** → Admin updates status + adds tracking
5. **Delivered** → Admin marks as delivered

### Order Statuses:
- **Pending:** Just placed, awaiting admin action
- **Processing:** Admin preparing the order
- **Shipped:** Order dispatched with courier
- **Delivered:** Successfully delivered
- **Cancelled:** Cancelled by admin or customer

---

## 9. LAUNCH CHECKLIST

### Pre-Launch (Day -1):
- [ ] All 50+ products uploaded with images
- [ ] Test orders (COD and Razorpay) completed successfully
- [ ] Mobile responsive check on real devices
- [ ] Admin panel fully functional
- [ ] Razorpay in production mode
- [ ] Domain configured and SSL active
- [ ] Basic policies pages added (Shipping, Returns, Privacy)
- [ ] Contact information updated

### Launch Day:
- [ ] Deploy to Vercel production
- [ ] Verify all pages loading correctly
- [ ] Test complete purchase flow
- [ ] Monitor for errors in Vercel logs
- [ ] Place test order yourself
- [ ] Announce to existing customers

---

## 10. SUCCESS CRITERIA

### Week 1-2 (MVP Launch):
- ✅ Site live with 50+ products
- ✅ First 5 orders completed successfully
- ✅ Zero critical bugs
- ✅ Mobile experience working smoothly

### Month 1:
- ✅ 50+ total orders
- ✅ < 20% order cancellation rate
- ✅ Average cart value > ₹1,500
- ✅ 5+ repeat customers

---

**Document End**

This PRD serves as the single source of truth for the MVP. Any feature not explicitly listed in the "IN SCOPE" section should be deferred to post-MVP phases.
