# Admin Panel API Reference

**Version:** 1.0
**Last Updated:** November 26, 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [Dashboard](#dashboard)
3. [Products](#products)
4. [Orders](#orders)
5. [Inventory](#inventory)
6. [Settings](#settings)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Base URL

```
http://localhost:3000/api/admin
http://yourapp.com/api/admin (production)
```

---

## Authentication

### Login

Create an admin session.

**Endpoint:** `POST /api/admin/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
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
  "loggedInAt": "2025-11-26T10:30:00Z"
}
```

**Response (Error - 401):**
```json
{
  "message": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mensfashion.com",
    "password": "admin123"
  }'
```

---

## Dashboard

### Get Dashboard Statistics

Fetch dashboard metrics and recent orders.

**Endpoint:** `GET /api/admin/dashboard/stats`

**Headers:**
```
Authorization: Bearer {session_token}
```

**Query Parameters:**
None

**Response (Success - 200):**
```json
{
  "stats": {
    "ordersToday": 5,
    "revenueToday": 15000,
    "pendingOrders": 2,
    "lowStockItems": 3
  },
  "recentOrders": [
    {
      "id": "uuid",
      "order_number": "ORD-20251126-00001",
      "customer_name": "John Doe",
      "total_amount": 2500,
      "payment_method": "razorpay",
      "status": "pending",
      "created_at": "2025-11-26T10:00:00Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/admin/dashboard/stats
```

---

## Products

### List Products

Get paginated list of products with filters and search.

**Endpoint:** `GET /api/admin/products`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| search | string | No | Search by product name |
| category | string | No | Filter by category |
| status | string | No | Filter by status (active/draft) |

**Response (Success - 200):**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Cotton T-Shirt",
      "category": "T-Shirts",
      "price": 499.99,
      "status": "active",
      "created_at": "2025-11-26T09:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

**cURL Example:**
```bash
# Get page 1
curl "http://localhost:3000/api/admin/products?page=1"

# Search for products
curl "http://localhost:3000/api/admin/products?search=shirt&category=T-Shirts"

# Filter by status
curl "http://localhost:3000/api/admin/products?status=active"
```

---

### Create Product

Create a new product with variants (sizes and stock).

**Endpoint:** `POST /api/admin/products`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Premium Cotton T-Shirt",
  "description": "High quality 100% cotton",
  "category": "T-Shirts",
  "price": 599.99,
  "compareAtPrice": 899.99,
  "sizes": ["M", "L", "XL"],
  "stockPerSize": {
    "M": 10,
    "L": 15,
    "XL": 12
  },
  "status": "active"
}
```

**Response (Success - 201):**
```json
{
  "id": "uuid",
  "name": "Premium Cotton T-Shirt",
  "category": "T-Shirts",
  "price": 599.99,
  "status": "active",
  "created_at": "2025-11-26T10:30:00Z"
}
```

**Response (Error - 400):**
```json
{
  "message": "Missing required fields"
}
```

**Validation Rules:**
- `name`: Required, min 2 characters, max 100 characters
- `category`: Required, must be valid category
- `price`: Required, must be positive number
- `sizes`: Required, must have at least 1
- `stockPerSize`: Must match sizes array

---

### Update Product

Update an existing product.

**Endpoint:** `PUT /api/admin/products`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "product-uuid",
  "name": "Premium Cotton T-Shirt",
  "description": "Updated description",
  "category": "T-Shirts",
  "price": 699.99,
  "compareAtPrice": 999.99,
  "sizes": ["M", "L", "XL", "XXL"],
  "stockPerSize": {
    "M": 20,
    "L": 25,
    "XL": 20,
    "XXL": 15
  },
  "status": "active"
}
```

**Response (Success - 200):**
```json
{
  "id": "product-uuid",
  "message": "Product updated successfully"
}
```

---

### Delete Product

Delete a product and all its variants.

**Endpoint:** `DELETE /api/admin/products`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Product ID to delete |

**Response (Success - 200):**
```json
{
  "message": "Product deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "message": "Product not found"
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:3000/api/admin/products?id=product-uuid"
```

---

## Orders

### List Orders

Get paginated list of orders with filters and search.

**Endpoint:** `GET /api/admin/orders`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| search | string | No | Search by order number |
| status | string | No | Filter by status |
| paymentMethod | string | No | Filter by payment method (cod/razorpay) |

**Response (Success - 200):**
```json
{
  "orders": [
    {
      "id": "uuid",
      "order_number": "ORD-20251126-00001",
      "customer_name": "John Doe",
      "total_amount": 2500,
      "payment_method": "razorpay",
      "payment_status": "paid",
      "status": "pending",
      "created_at": "2025-11-26T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

**Filter Examples:**
```bash
# Get pending orders
curl "http://localhost:3000/api/admin/orders?status=pending"

# Get Razorpay orders
curl "http://localhost:3000/api/admin/orders?paymentMethod=razorpay"

# Search by order number
curl "http://localhost:3000/api/admin/orders?search=ORD-20251126"

# Combine filters
curl "http://localhost:3000/api/admin/orders?status=processing&paymentMethod=cod&page=2"
```

---

### Get Order Details

Get full details of a specific order including items.

**Endpoint:** `GET /api/admin/orders/{orderId}`

**Response (Success - 200):**
```json
{
  "order": {
    "id": "uuid",
    "order_number": "ORD-20251126-00001",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+91-9876543210",
    "customer_address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "total_amount": 2500,
    "payment_method": "razorpay",
    "payment_status": "paid",
    "status": "pending",
    "razorpay_order_id": "order_xxxxx",
    "razorpay_payment_id": "pay_xxxxx",
    "created_at": "2025-11-26T10:00:00Z",
    "items": [
      {
        "id": "uuid",
        "product_name": "Cotton T-Shirt",
        "size": "M",
        "quantity": 2,
        "price": 499.99
      }
    ]
  }
}
```

**Response (Error - 404):**
```json
{
  "message": "Order not found"
}
```

---

### Update Order Status

Update the status of an order.

**Endpoint:** `PUT /api/admin/orders`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": "order-uuid",
  "status": "processing"
}
```

**Valid Statuses:**
- `pending` - Order received
- `processing` - Being prepared
- `shipped` - On the way
- `delivered` - Completed
- `cancelled` - Order cancelled

**Response (Success - 200):**
```json
{
  "order": {
    "id": "order-uuid",
    "status": "processing",
    "updated_at": "2025-11-26T10:30:00Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "message": "Invalid status"
}
```

---

## Inventory

### Get Inventory

Get paginated inventory with stock levels by product and size.

**Endpoint:** `GET /api/admin/inventory`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| search | string | No | Search by product name |
| stockLevel | string | No | Filter: all/low/out |

**Response (Success - 200):**
```json
{
  "inventory": [
    {
      "id": "product-uuid",
      "name": "Cotton T-Shirt",
      "category": "T-Shirts",
      "price": 499.99,
      "totalStock": 45,
      "sizes": [
        {
          "size": "XS",
          "stock": 5
        },
        {
          "size": "S",
          "stock": 8
        },
        {
          "size": "M",
          "stock": 10
        },
        {
          "size": "L",
          "stock": 15
        },
        {
          "size": "XL",
          "stock": 7
        },
        {
          "size": "XXL",
          "stock": 0
        },
        {
          "size": "XXXL",
          "stock": 0
        }
      ]
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

**Filter Examples:**
```bash
# Get low stock items
curl "http://localhost:3000/api/admin/inventory?stockLevel=low"

# Get out of stock items
curl "http://localhost:3000/api/admin/inventory?stockLevel=out"

# Search and filter
curl "http://localhost:3000/api/admin/inventory?search=shirt&stockLevel=low"
```

---

### Update Stock

Update stock quantity for a specific product size.

**Endpoint:** `PUT /api/admin/inventory`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "variantId": "variant-uuid",
  "quantity": 20
}
```

**Response (Success - 200):**
```json
{
  "variant": {
    "id": "variant-uuid",
    "size": "M",
    "stock_quantity": 20,
    "updated_at": "2025-11-26T10:30:00Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "message": "Quantity cannot be negative"
}
```

---

## Settings

### Get Store Settings

Get current store settings. Returns defaults if none exist.

**Endpoint:** `GET /api/admin/settings`

**Response (Success - 200):**
```json
{
  "settings": {
    "id": "settings-uuid",
    "store_name": "Men's Fashion Store",
    "store_email": "contact@mensfashion.com",
    "store_phone": "+91-9999-999-999",
    "store_address": "123 Fashion Street, Mumbai",
    "store_city": "Mumbai",
    "store_state": "Maharashtra",
    "store_pincode": "400001",
    "shipping_cost": 50,
    "free_shipping_above": 500,
    "business_hours_open": "09:00",
    "business_hours_close": "22:00",
    "currency": "INR",
    "created_at": "2025-11-26T09:00:00Z",
    "updated_at": "2025-11-26T10:00:00Z"
  }
}
```

---

### Update Store Settings

Update store settings.

**Endpoint:** `PUT /api/admin/settings`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "store_name": "Men's Fashion Store",
  "store_email": "contact@mensfashion.com",
  "store_phone": "+91-8888-888-888",
  "store_address": "123 Fashion Street, Mumbai",
  "store_city": "Mumbai",
  "store_state": "Maharashtra",
  "store_pincode": "400001",
  "shipping_cost": 75,
  "free_shipping_above": 750,
  "business_hours_open": "10:00",
  "business_hours_close": "21:00"
}
```

**Response (Success - 200):**
```json
{
  "settings": {
    "id": "settings-uuid",
    "store_name": "Men's Fashion Store",
    "store_email": "contact@mensfashion.com",
    ...
  },
  "message": "Settings updated successfully"
}
```

**Response (Error - 400):**
```json
{
  "message": "Missing required fields"
}
```

**Required Fields:**
- `store_name`
- `store_email`
- `store_phone`
- `store_address`
- `store_city`
- `store_state`
- `store_pincode`

---

## Error Handling

### Standard Error Response Format

All errors follow this format:

```json
{
  "message": "User-friendly error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

### HTTP Status Codes

| Status | Meaning | When Used |
|--------|---------|-----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid authentication |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

### Common Error Messages

| Message | Status | Solution |
|---------|--------|----------|
| "Invalid credentials" | 401 | Check email/password |
| "Missing required fields" | 400 | Fill in all required fields |
| "Product not found" | 404 | Check product ID |
| "Invalid status" | 400 | Use valid status value |
| "Quantity cannot be negative" | 400 | Enter positive quantity |
| "Failed to update" | 500 | Try again, check database |

---

## Rate Limiting

### Current Implementation

- **Login Endpoint:** 10 requests per minute per IP
- **Other Endpoints:** 100 requests per minute per session

### In Production

Implement rate limiting using:
- Redis with express-rate-limit
- API Gateway rate limiting
- CloudFlare rate limiting

---

## Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mensfashion.com","password":"admin123"}'

# Get dashboard stats
curl http://localhost:3000/api/admin/dashboard/stats

# List products
curl "http://localhost:3000/api/admin/products?page=1&status=active"

# Get orders
curl "http://localhost:3000/api/admin/orders?status=pending"

# Get inventory
curl "http://localhost:3000/api/admin/inventory?stockLevel=low"
```

### Using Postman

1. Create collection: "Admin Panel API"
2. Add requests for each endpoint
3. Set up environment variables for base URL
4. Save session token in environment
5. Use token in Authorization header for protected routes

### Using VS Code REST Client

Create `admin-api.rest` file:

```rest
### Login
POST http://localhost:3000/api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@mensfashion.com",
  "password": "admin123"
}

### Get Dashboard Stats
GET http://localhost:3000/api/admin/dashboard/stats

### List Products
GET http://localhost:3000/api/admin/products?page=1&status=active

### Create Product
POST http://localhost:3000/api/admin/products
Content-Type: application/json

{
  "name": "Test Product",
  "category": "T-Shirts",
  "price": 499.99,
  "sizes": ["M", "L"],
  "stockPerSize": {"M": 10, "L": 15},
  "status": "active"
}
```

---

**API Reference Complete!**

For questions or additional documentation, contact the development team.

