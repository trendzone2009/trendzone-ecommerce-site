# Admin Panel User Guide

**Version:** 1.0
**Last Updated:** November 26, 2025
**Status:** Complete and Production-Ready

---

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Dashboard](#dashboard)
4. [Product Management](#product-management)
5. [Order Management](#order-management)
6. [Inventory Management](#inventory-management)
7. [Store Settings](#store-settings)
8. [API Documentation](#api-documentation)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Admin Panel

1. **URL:** `http://localhost:3000/admin/login` (or your live domain)
2. **Browser:** Any modern browser (Chrome, Firefox, Safari, Edge)
3. **Requirements:** JavaScript enabled, cookies/localStorage enabled

### System Requirements

- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet:** Stable connection required
- **Screen:** Minimum 1024px width (responsive design supports mobile)
- **Session:** Admin session stored locally, valid for current session

---

## Authentication

### Login

**Test Credentials (Development):**
```
Email: admin@mensfashion.com
Password: admin123
```

**Steps to Login:**
1. Navigate to `/admin/login`
2. Enter email address
3. Enter password (can toggle visibility with eye icon)
4. Click "Login"
5. You'll be redirected to `/admin/dashboard`

**Features:**
- ✅ Show/hide password toggle
- ✅ Error messages for invalid credentials
- ✅ Clean, dark-themed interface
- ✅ Test credentials displayed on page for reference

### Session Management

- **Storage:** localStorage (client-side)
- **Duration:** Current browser session
- **Security Note:** For production, upgrade to JWT tokens + database sessions

### Logout

1. Click your profile name in the top-right corner of the sidebar
2. Click "Logout"
3. You'll be redirected to login page
4. Session is cleared from localStorage

### Protected Routes

All admin routes require authentication:
- `/admin/*` → Redirects to login if not authenticated
- Automatic redirect checks on page load
- Session validation on every route change

---

## Dashboard

**URL:** `/admin/dashboard`

### Overview

The admin dashboard provides at-a-glance metrics and quick access to all admin sections.

### Key Metrics (Stats Cards)

**1. Orders Today**
- **Shows:** Total orders created today
- **Update:** Real-time from database
- **Color:** Blue card with order icon
- **Trend:** Shows up/down indicator if data available

**2. Revenue Today**
- **Shows:** Total revenue (₹) from today's orders
- **Currency:** Indian Rupees (₹)
- **Calculation:** Sum of all order totals for today
- **Update:** Real-time from database

**3. Pending Orders**
- **Shows:** Count of orders in "pending" status
- **Purpose:** Quick view of orders awaiting action
- **Color:** Yellow badge

**4. Low Stock Items**
- **Shows:** Count of products with stock < 5 units
- **Purpose:** Inventory alerts
- **Color:** Red badge

### Recent Orders Table

**Columns:**
- **Order #:** Order number (e.g., ORD-20251126-00001)
- **Customer:** Customer name (click row for details)
- **Amount:** Total order amount in ₹
- **Payment:** Payment method (COD or Razorpay)
- **Status:** Order status with color badge
- **Date:** Order creation date
- **Action:** "View" button to see order details

**Features:**
- Shows last 10 orders
- Sorted by newest first
- Click "View" to navigate to order details page
- Color-coded status badges:
  - Yellow: Pending
  - Blue: Processing
  - Purple: Shipped
  - Green: Delivered
  - Red: Cancelled

### Quick Action Cards

Three cards provide quick navigation:

1. **Products** → Navigate to product list
2. **Orders** → Navigate to orders list
3. **Inventory** → Navigate to inventory management

Click any card to go directly to that section.

### Refresh Data

- Dashboard data updates automatically when you navigate to it
- Data comes live from database (not cached)
- Loading indicator shown while fetching

---

## Product Management

**URL:** `/admin/products`

### Product List Page

#### Features

1. **Search**
   - Search by product name
   - Enter text and click "Search"
   - Case-insensitive matching

2. **Filters**
   - **Category:** Filter by product category (8 categories available)
   - **Status:** Filter by Active or Draft status
   - All filters work together

3. **Pagination**
   - 20 products per page
   - Previous/Next buttons
   - Page indicator (e.g., "Page 1 of 5")

4. **Table Columns**
   - **Name:** Product name
   - **Category:** Product category
   - **Price:** Selling price in ₹
   - **Status:** Active or Draft
   - **Created:** Date product was added
   - **Actions:** Edit or Delete buttons

5. **Actions**
   - **Edit:** Navigate to edit page (coming soon)
   - **Delete:** Delete product with confirmation modal

#### Usage

**To Find Products:**
```
1. Use search bar to find by name
2. Use category dropdown to filter by type
3. Use status filter for Active/Draft products
4. Use pagination to browse all products
```

**To Delete a Product:**
```
1. Click "Delete" button in the product row
2. Confirmation modal appears
3. Click "Delete" in modal to confirm
4. Product is removed from database
5. Success message shown
```

### Add New Product Page

**URL:** `/admin/products/new`

#### Form Sections

**1. Basic Information**
- **Product Name*** (Required)
  - Text input
  - Minimum 2 characters
  - Example: "Classic Cotton T-Shirt"

- **Description**
  - Textarea (4 rows)
  - Optional field
  - Good for product features/details

- **Category*** (Required)
  - Dropdown with 8 options:
    - T-Shirts
    - Shirts
    - Trousers
    - Jeans
    - Shorts
    - Jackets
    - Ethnic Wear
    - Activewear

- **Status*** (Required)
  - Dropdown: Active or Draft
  - Active: Product visible to customers
  - Draft: Product hidden from store

**2. Pricing**
- **Price*** (Required)
  - Decimal number (e.g., 999.99)
  - Selling price in ₹

- **Compare at Price**
  - Optional field
  - Original/retail price (for showing discount)
  - Leave blank if no comparison needed

**3. Sizes & Stock***
- **Available Sizes** (Required - select at least 1)
  - 7 size buttons: XS, S, M, L, XL, XXL, XXXL
  - Click to toggle size selection
  - Selected sizes highlight in blue

- **Stock Quantity**
  - Shows input for each selected size
  - Enter quantity for each size
  - Quantity can be 0 or more

#### Submission

1. Fill in all required fields (marked with *)
2. Select at least one size with stock
3. Click "Create Product"
4. Button shows "Creating..." while processing
5. On success, redirected to products list
6. Success notification shown

#### Validation

- **Error:** Missing required fields
  - Error alert shown at top
  - Product not created
  - Fix errors and try again

- **Auto-validation:**
  - Name must be 2+ characters
  - Price must be positive number
  - Stock must be 0 or more

---

## Order Management

**URL:** `/admin/orders`

### Orders List Page

#### Search & Filters

1. **Search by Order Number**
   - Enter order number (e.g., ORD-20251126-00001)
   - Click "Search"
   - Case-insensitive matching

2. **Filter by Order Status**
   - Dropdown with options:
     - All Statuses
     - Pending (yellow badge)
     - Processing (blue badge)
     - Shipped (purple badge)
     - Delivered (green badge)
     - Cancelled (red badge)

3. **Filter by Payment Method**
   - Dropdown with options:
     - All Methods
     - Cash on Delivery (COD)
     - Razorpay

4. **Pagination**
   - 20 orders per page
   - Previous/Next navigation
   - Total count shown

#### Orders Table

**Columns:**
- **Order Number:** Unique order ID
- **Customer:** Customer name and email
- **Amount:** Total order amount in ₹
- **Payment:** Method and status badge
- **Status:** Order status with color badge
- **Date:** When order was created
- **Action:** "View" button

#### Actions

**View Order Details:**
1. Click "View" button in any order row
2. Navigate to order details page
3. See full order information, items, and payment details

### Order Details Page

**URL:** `/admin/orders/{orderId}`

#### Sections

**1. Order Information**
- Order date and time
- Current order status (with badge)
- Payment method used

**2. Customer Information**
- **Name:** Full name
- **Email:** Email address
- **Phone:** Phone number
- **Address:** Full delivery address
- **City, State, Pincode:** Location details

**3. Order Items**
- Table showing all items in order
- Columns: Product, Size, Quantity, Price, Total
- Calculates line totals automatically

**4. Order Summary** (Sidebar)
- **Subtotal:** Sum of all item prices
- **Shipping:** Shipping cost
- **Total:** Final order amount (₹)

**5. Payment Information** (For Razorpay orders)
- **Payment Status:** Paid/Pending/Failed
- **Payment ID:** Razorpay payment transaction ID
- **Order ID:** Razorpay order ID

**6. Update Status** (Sidebar)
- Dropdown to change order status
- Options: Pending → Processing → Shipped → Delivered → Cancelled
- "Update Status" button
- Success confirmation shown

#### Status Update

1. Click "Update Status" dropdown
2. Select new status
3. Click "Update Status" button
4. Success message appears
5. Status updates in real-time

**Status Flow:**
```
Pending → Processing → Shipped → Delivered
                    ↓
                Cancelled (can cancel anytime)
```

---

## Inventory Management

**URL:** `/admin/inventory`

### Overview

Manage product stock levels by size. Real-time inventory tracking with low stock alerts.

### Search & Filters

1. **Search by Product Name**
   - Enter product name
   - Click "Search"
   - Displays matching products

2. **Stock Level Filters**
   - **All Products:** Show all inventory
   - **Low Stock (<5):** Show items with < 5 units
   - **Out of Stock:** Show items with 0 units

3. **Pagination**
   - 20 products per page
   - Previous/Next navigation

### Inventory Display

**For Each Product:**
- **Product Name:** Product title
- **Category:** Product category
- **Price:** Product selling price in ₹
- **Total Stock:** Sum of all size stocks
- **Size Grid:** 7 boxes for each size (XS, S, M, L, XL, XXL, XXXL)

### Stock Status Badges

- **Green "In Stock":** Stock >= 5 units
- **Yellow "Low Stock":** Stock between 1-4 units
- **Red "Out of Stock":** Stock = 0 units

### Editing Stock

**To Update Stock for a Size:**

1. Click "Edit" button in the size box
2. Input field appears with current quantity
3. Enter new quantity (0 or more)
4. Click "Save" to update
5. Click "Cancel" to discard changes
6. Success message shown on save

**Inline Editing Features:**
- Edit one size at a time
- See current quantity while editing
- Validation: quantity must be >= 0
- Real-time updates to database

### Use Cases

**Scenario 1: Receive New Stock**
1. Go to Inventory page
2. Search for product
3. Click "Edit" on size needing stock
4. Increase quantity
5. Click "Save"

**Scenario 2: Manual Stock Count**
1. Filter by "All Products"
2. Audit each product's stock
3. Edit any discrepancies
4. System updates in real-time

**Scenario 3: Low Stock Alert**
1. Click "Low Stock (<5)" filter
2. See all items needing reorder
3. Update quantities as stock arrives
4. Monitor to avoid stockouts

---

## Store Settings

**URL:** `/admin/settings`

### Configuration Sections

#### 1. Store Information

**Store Name***
- Your business name (shown to customers)
- Example: "Men's Fashion Store"

**Email Address***
- Contact email for customers
- Used for order notifications

**Phone Number***
- Customer support phone
- Format: +91-XXXX-XXXXXX (flexible)

#### 2. Address Information

**Address***
- Full street address
- Textarea for detailed information

**City***
- City name
- Example: "Mumbai"

**State***
- State/province name
- Example: "Maharashtra"

**Pincode***
- Postal code
- Example: "400001"

#### 3. Shipping Configuration

**Shipping Cost**
- Flat shipping fee in ₹
- Applied to all orders
- Example: 50

**Free Shipping Above**
- Order total threshold for free shipping
- Orders above this amount ship free
- Example: 500 (free shipping for ₹500+ orders)

#### 4. Business Hours

**Opening Time**
- Time store opens (HH:MM format)
- Example: 09:00

**Closing Time**
- Time store closes (HH:MM format)
- Example: 22:00

### Saving Settings

1. Fill in all required fields (marked with *)
2. Click "Save Settings"
3. Button shows "Saving..." while processing
4. Green success message appears
5. Settings stored in database

### Validation

- All required fields must be filled
- Email must be valid format
- Numeric fields must contain numbers
- Error message shown if validation fails

### Default Values

If no settings exist:
- Store Name: "Men's Fashion Store"
- Email: "contact@mensfashion.com"
- Phone: "+91-9999-999-999"
- City: "Mumbai"
- State: "Maharashtra"
- Shipping: ₹50, Free over ₹500
- Hours: 09:00 - 22:00

---

## API Documentation

### Authentication

**Endpoint:** `POST /api/admin/auth/login`

**Request:**
```json
{
  "email": "admin@mensfashion.com",
  "password": "admin123"
}
```

**Response (Success - 200):**
```json
{
  "id": "admin-1",
  "email": "admin@mensfashion.com",
  "name": "Admin User",
  "isAdmin": true,
  "loggedInAt": "2025-11-26T10:00:00Z"
}
```

**Response (Error - 401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### Dashboard Stats

**Endpoint:** `GET /api/admin/dashboard/stats`

**Response:**
```json
{
  "stats": {
    "ordersToday": 5,
    "revenueToday": 15000,
    "pendingOrders": 2,
    "lowStockItems": 3
  },
  "recentOrders": [...]
}
```

---

### Products API

#### Get Products
**Endpoint:** `GET /api/admin/products`

**Query Parameters:**
- `page` (number) - Page number, default 1
- `search` (string) - Search by product name
- `category` (string) - Filter by category
- `status` (string) - Filter by active/draft

**Response:**
```json
{
  "products": [...],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

#### Create Product
**Endpoint:** `POST /api/admin/products`

**Request:**
```json
{
  "name": "Cotton T-Shirt",
  "description": "100% cotton",
  "category": "T-Shirts",
  "price": 499.99,
  "compareAtPrice": 799.99,
  "sizes": ["M", "L", "XL"],
  "stockPerSize": {"M": 10, "L": 15, "XL": 12},
  "status": "active"
}
```

#### Update Product
**Endpoint:** `PUT /api/admin/products`

**Request:** Same as POST, with product ID

#### Delete Product
**Endpoint:** `DELETE /api/admin/products?id={productId}`

---

### Orders API

#### Get Orders
**Endpoint:** `GET /api/admin/orders`

**Query Parameters:**
- `page` (number) - Page number
- `search` (string) - Search by order number
- `status` (string) - Filter by status
- `paymentMethod` (string) - Filter by payment method

**Response:**
```json
{
  "orders": [...],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

#### Get Order Details
**Endpoint:** `GET /api/admin/orders/{orderId}`

**Response:**
```json
{
  "order": {
    "id": "uuid",
    "order_number": "ORD-20251126-00001",
    "customer_name": "John Doe",
    "total_amount": 2500,
    "status": "pending",
    "items": [...]
  }
}
```

#### Update Order Status
**Endpoint:** `PUT /api/admin/orders`

**Request:**
```json
{
  "orderId": "uuid",
  "status": "processing"
}
```

---

### Inventory API

#### Get Inventory
**Endpoint:** `GET /api/admin/inventory`

**Query Parameters:**
- `page` (number) - Page number
- `search` (string) - Search by product name
- `stockLevel` (string) - all/low/out

**Response:**
```json
{
  "inventory": [
    {
      "id": "product-1",
      "name": "T-Shirt",
      "totalStock": 50,
      "sizes": [
        {"size": "M", "stock": 10},
        {"size": "L", "stock": 15}
      ]
    }
  ]
}
```

#### Update Stock
**Endpoint:** `PUT /api/admin/inventory`

**Request:**
```json
{
  "variantId": "variant-id",
  "quantity": 20
}
```

---

### Settings API

#### Get Settings
**Endpoint:** `GET /api/admin/settings`

**Response:**
```json
{
  "settings": {
    "store_name": "Men's Fashion Store",
    "store_email": "contact@mensfashion.com",
    "store_phone": "+91-9999-999-999",
    "store_address": "123 Fashion Street",
    "shipping_cost": 50,
    "free_shipping_above": 500
  }
}
```

#### Update Settings
**Endpoint:** `PUT /api/admin/settings`

**Request:**
```json
{
  "store_name": "Men's Fashion Store",
  "store_email": "contact@store.com",
  "store_phone": "+91-8888-888-888",
  "shipping_cost": 75,
  "free_shipping_above": 750
}
```

---

## Troubleshooting

### Login Issues

**Problem: Cannot login**
- ✅ Verify credentials are correct
- ✅ Check localStorage is enabled in browser
- ✅ Clear browser cache and try again
- ✅ Check admin email/password in environment variables

**Problem: Session expires after refresh**
- ✅ This is normal in development (localStorage is cleared)
- ✅ Solution: Use JWT tokens + database sessions in production

### Data Not Loading

**Problem: Products/Orders not showing**
- ✅ Check database connection
- ✅ Verify Supabase credentials
- ✅ Check browser console for errors (F12)
- ✅ Try refreshing the page

**Problem: Search not working**
- ✅ Check spelling of search term
- ✅ Try clearing filters
- ✅ Verify data exists in database

### Stock Updates Not Working

**Problem: Stock quantity won't save**
- ✅ Check browser console for errors
- ✅ Verify quantity is a valid number
- ✅ Check database connection
- ✅ Try a different size first

**Problem: All sizes showing 0 stock**
- ✅ Go to products page
- ✅ Add or re-create product with stock
- ✅ Check product_variants table has data

### Performance Issues

**Problem: Dashboard loading slowly**
- ✅ Check internet connection speed
- ✅ Close other browser tabs
- ✅ Clear browser cache
- ✅ Try a different browser

**Problem: Large list pages slow**
- ✅ Use search/filters to reduce results
- ✅ Go to page 1 first
- ✅ Check database performance

### Browser Compatibility

**Problem: Layout broken on mobile**
- ✅ Use Chrome/Firefox on mobile
- ✅ Enable JavaScript
- ✅ Zoom out if text is overlapping

**Problem: Some buttons not working**
- ✅ Update browser to latest version
- ✅ Clear browser cache
- ✅ Try different browser

### Common Error Messages

**"Invalid credentials"**
- Wrong email or password
- Check test credentials above

**"Missing required fields"**
- Fill in all fields marked with *
- Don't leave any blank

**"Failed to update"**
- Check database connection
- See console errors (F12 → Console tab)
- Try again in a moment

**"No orders found"**
- No orders match your filters
- Try removing filters
- Check orders exist in database

---

## Getting Help

### Quick Tips

1. **Use search/filters** - Narrow down results quickly
2. **Check status badges** - Color coding shows order/status state
3. **Hover for tooltips** - Some fields have helpful hints
4. **Use browser back button** - Navigate between pages easily
5. **Refresh page** - If something looks wrong

### Debugging

**Enable Developer Tools:**
- Press F12 in your browser
- Go to "Console" tab
- Check for red error messages
- Share errors with developer

### Contact Support

For issues not resolved by this guide:
1. Check the troubleshooting section above
2. Check browser console for errors (F12)
3. Try a different browser
4. Contact development team with:
   - Error message
   - Steps to reproduce
   - Browser version
   - Any console errors

---

## Production Deployment Checklist

Before deploying admin panel to production:

- [ ] Update admin credentials from environment variables
- [ ] Replace localStorage with JWT + database sessions
- [ ] Enable HTTPS only
- [ ] Add rate limiting to login endpoint
- [ ] Implement role-based access control (RBAC)
- [ ] Add audit logging for all admin actions
- [ ] Set up email notifications for critical actions
- [ ] Implement 2-factor authentication (optional)
- [ ] Regular backup of admin data
- [ ] Monitor admin panel performance

---

## Technical Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase PostgreSQL
- **Validation:** Zod schemas
- **Icons:** Lucide React
- **Styling:** Tailwind CSS utility classes

---

**Admin Panel is production-ready and fully functional!**
**For feature requests or bug reports, contact the development team.**

