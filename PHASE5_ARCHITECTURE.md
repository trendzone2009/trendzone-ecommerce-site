# Phase 5: Architecture & Flow Diagrams

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     E-COMMERCE PLATFORM                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   IMAGE UPLOAD       │         │   PRODUCT SEARCH     │
│   SUBSYSTEM          │         │   SUBSYSTEM          │
└──────────────────────┘         └──────────────────────┘
         │                                  │
         ├─ Upload API                      ├─ Search API
         ├─ Storage (Supabase)              ├─ Results Page
         ├─ Component (UI)                  ├─ Header Dropdown
         └─ Product Integration             └─ Database Integration

                    ↓                              ↓

         ┌──────────────────────────────┐
         │   DATABASE (Supabase)        │
         │                              │
         │  - Products Table            │
         │  - Categories Table          │
         │  - Images (JSONB)            │
         │  - Variants Table            │
         └──────────────────────────────┘
```

---

## Image Upload Flow

### User Interaction Flow

```
User Action Flow:
────────────────

    Admin User
        │
        ├─→ Navigate to /admin/products/new or /admin/products/[id]
        │
        ├─→ Find "Product Images" section
        │
        ├─→ Drag & Drop OR Click to Select
        │        │
        │        ├─ Drag-and-drop file
        │        └─ Click to open file browser
        │
        ├─→ Client-Side Validation
        │        │
        │        ├─ Check file type (JPG, PNG, WebP)
        │        └─ Check file size (< 5MB)
        │
        ├─→ Upload to Server (POST /api/admin/upload)
        │        │
        │        ├─ Server receives FormData
        │        ├─ Server validates again
        │        └─ Generate unique filename
        │
        ├─→ Supabase Storage Upload
        │        │
        │        ├─ Upload to 'product-images' bucket
        │        ├─ Check/create bucket if needed
        │        └─ Get public URL
        │
        ├─→ Display Image Preview
        │        │
        │        ├─ Show thumbnail
        │        ├─ Show delete button
        │        └─ Enable reordering
        │
        ├─→ Repeat for more images
        │
        └─→ Submit Product Form
                 │
                 ├─ Save images array to database
                 └─ Images persist for product
```

### Component Integration

```
Product Add/Edit Form
        │
        ├─ ImageUploader Component
        │        │
        │        ├─ State Management
        │        │  ├─ images: string[]
        │        │  ├─ uploading: boolean
        │        │  └─ progress: number
        │        │
        │        ├─ Drag-Drop Zone
        │        │  ├─ onDragOver
        │        │  ├─ onDragLeave
        │        │  └─ onDrop
        │        │
        │        ├─ File Input
        │        │  └─ onClick (open file browser)
        │        │
        │        ├─ Upload Handler
        │        │  ├─ Validation (type, size)
        │        │  ├─ POST to /api/admin/upload
        │        │  └─ onImagesChange callback
        │        │
        │        ├─ Progress Display
        │        │  └─ Progress bar (0-100%)
        │        │
        │        ├─ Image Grid
        │        │  ├─ Thumbnail display
        │        │  ├─ Delete button (X)
        │        │  ├─ Move up/down buttons
        │        │  └─ Main image badge
        │        │
        │        └─ Error Messages
        │           ├─ File too large
        │           ├─ Invalid file type
        │           └─ Upload failed
        │
        └─ Form Submission
           └─ Save images array with product
```

### Data Flow

```
Image Upload Data Flow:
──────────────────────

Client Side:
  User selects file
       │
       ├─ FormData { file: File }
       │
       └─→ fetch('/api/admin/upload', {
             method: 'POST',
             body: formData
           })

Server Side (/api/admin/upload):
       │
       ├─ Parse FormData
       │
       ├─ Validate:
       │  ├─ File exists?
       │  ├─ Correct MIME type?
       │  └─ Size < 5MB?
       │
       ├─ Generate filename:
       │  └─ ${Date.now()}-${random}.ext
       │
       ├─ Ensure bucket exists:
       │  ├─ List buckets
       │  ├─ If missing, create 'product-images'
       │  └─ Set public: true
       │
       ├─ Upload to Supabase:
       │  └─ .storage.from('product-images').upload()
       │
       └─ Get public URL
            │
            └─ Return to client:
               {
                 "url": "https://...",
                 "message": "Success"
               }

Client Side (Response):
       │
       ├─ Display preview
       │
       ├─ Add to images array
       │
       └─ Call onImagesChange()

Database (on form submit):
       │
       └─ Save images array to products.images (JSONB)
```

---

## Search Flow

### User Interaction Flow

```
Search User Flow:
─────────────────

    Customer
        │
        ├─→ See search box in header (all pages)
        │
        ├─→ Type search term (e.g., "shirt")
        │        │
        │        ├─ Type 1st char: Nothing happens
        │        ├─ Type 2nd char: Start 300ms timer
        │        └─ Keep typing: Reset timer each time
        │
        ├─→ After 300ms debounce delay
        │        │
        │        ├─ Fetch /api/products/search?q=shirt&limit=6
        │        │
        │        └─ Show loading spinner
        │
        ├─→ API Returns Results
        │        │
        │        ├─ Display up to 6 results
        │        ├─ Show product image, name, category, price
        │        └─ Show "View all results" link
        │
        ├─→ User Can Click
        │        │
        │        ├─ Click result → Go to product detail
        │        │
        │        └─ Click "View all results" → Go to /search?q=shirt
        │
        └─→ Search Results Page
                 │
                 ├─ Display all results (20 per page)
                 ├─ Show result count
                 ├─ Show "No results" if empty
                 ├─ Pagination controls
                 └─ Can navigate back
```

### Dropdown Component Flow

```
Header Search Component
        │
        ├─ Input Field
        │  └─ onChange → handleSearchInputChange()
        │
        ├─ Debounce Logic (300ms)
        │  └─ Set timeout → performSearch()
        │
        ├─ performSearch()
        │  ├─ Check minimum 2 chars
        │  ├─ Set isSearching = true
        │  ├─ Fetch /api/products/search
        │  ├─ Set searchResults from response
        │  ├─ Set isSearching = false
        │  └─ Set showDropdown = true
        │
        └─ Dropdown UI
           ├─ If isSearching → Show Loader2 spinner
           │
           ├─ Else if searchResults.length > 0
           │  ├─ Map results
           │  │  └─ Display image, name, category, price
           │  │
           │  └─ Show "View all results" button
           │
           └─ Else → Show "No products found"

Click Handling:
        │
        ├─ Click result → handleResultClick(slug)
        │  └─ window.location.href = `/products/${slug}`
        │
        ├─ Click "View all" → handleSearchSubmit()
        │  └─ window.location.href = `/search?q=${query}`
        │
        └─ Click outside → handleClickOutside()
           └─ Close dropdown
```

### API Request/Response Flow

```
GET /api/products/search?q=shirt&limit=6

Request Processing:
        │
        ├─ Parse query: q = "shirt", limit = 6
        │
        ├─ Validate:
        │  └─ Length >= 2? If not, return empty results
        │
        ├─ Database Query 1 - Search by Name:
        │  └─ SELECT * FROM products
        │     WHERE name ilike '%shirt%'
        │     AND is_active = true
        │     ORDER BY created_at DESC
        │     LIMIT 6
        │
        ├─ Check results count:
        │  │
        │  ├─ If >= 6: Return results
        │  │
        │  └─ Else: Database Query 2 - Search by Description
        │     └─ SELECT * FROM products
        │        WHERE description ilike '%shirt%'
        │        AND is_active = true
        │        AND id NOT IN (previous results)
        │        ORDER BY created_at DESC
        │        LIMIT (6 - previous count)
        │
        ├─ Transform Response:
        │  ├─ Map base_price → price
        │  ├─ Extract first image from images array
        │  ├─ Get category.name from join
        │  └─ Keep id, name, slug
        │
        └─ Return JSON:
           {
             "products": [
               {
                 "id": "...",
                 "name": "Blue Shirt",
                 "slug": "blue-shirt",
                 "price": 599,
                 "image": "https://...",
                 "category": "Shirts"
               }
             ],
             "total": 25
           }
```

### Search Results Page Flow

```
/search?q=shirt&page=1

Page Load:
        │
        ├─ Extract searchParams:
        │  ├─ q = "shirt"
        │  └─ page = "1"
        │
        ├─ Validate:
        │  ├─ If q is empty: Show suggestion to go to /products
        │  └─ Else: Continue
        │
        ├─ Database Query:
        │  └─ Two-tier search (same as API)
        │
        ├─ Calculate pagination:
        │  ├─ limit = 20
        │  ├─ offset = (page - 1) * 20
        │  └─ totalPages = Math.ceil(total / 20)
        │
        ├─ Render Results:
        │  ├─ Show heading: "25 results for 'shirt'"
        │  │
        │  ├─ If no results:
        │  │  ├─ Show "No products found for 'shirt'"
        │  │  ├─ Show suggestions
        │  │  └─ Link to /products
        │  │
        │  └─ Else:
        │     ├─ ProductGrid component
        │     │  ├─ Display products in grid
        │     │  ├─ Show pagination controls
        │     │  └─ Maintain search params on pagination
        │     │
        │     └─ Each result clickable → product detail
        │
        └─ Back button → /products
```

---

## Database Schema

### Products Table Schema

```
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  images JSONB DEFAULT '[]'::jsonb,  -- Array of image URLs
  is_active BOOLEAN DEFAULT true,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ...
);

Example images column:
[
  "https://bucket.supabase.co/storage/v1/object/public/product-images/1701234567-abc123.jpg",
  "https://bucket.supabase.co/storage/v1/object/public/product-images/1701234568-def456.jpg"
]
```

### Categories Table Schema

```
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  ...
);
```

### Database Relationships

```
          ┌─────────────┐
          │ categories  │
          └─────────────┘
                 △
                 │
                 │ 1:N
                 │
                 │ (category_id)
                 │
          ┌─────────────┐
          │  products   │
          └─────────────┘
                 │
                 ├─ images (JSONB array)
                 │   └─ Supabase Storage URLs
                 │
                 └─ variants (1:N relationship)
                    └─ product_variants table
```

---

## File Structure

```
mens-fashion-store/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── upload/
│   │   │       └── route.ts           ← Image upload/delete
│   │   │
│   │   └── products/
│   │       └── search/
│   │           └── route.ts           ← Search API
│   │
│   ├── admin/
│   │   └── products/
│   │       ├── new/
│   │       │   └── page.tsx           ← Add product (+ image upload)
│   │       │
│   │       └── [id]/
│   │           └── page.tsx           ← Edit product (+ image upload)
│   │
│   └── (customer)/
│       └── search/
│           └── page.tsx               ← Search results page
│
├── components/
│   ├── admin/
│   │   └── image-uploader.tsx         ← Image uploader component
│   │
│   └── customer/
│       └── header.tsx                 ← Header with search
│
└── lib/
    ├── supabase.ts                    ← Supabase client
    └── ...
```

---

## Component Dependencies

### Image Uploader Component

```
ImageUploader
├── Imports
│   ├─ React hooks (useState, useRef, useEffect)
│   ├─ Lucide icons (Upload, X, ChevronUp, ChevronDown)
│   ├─ Button, Input components
│   └─ Image component
│
├─ State
│   ├─ images: string[]
│   ├─ uploading: boolean
│   ├─ progress: number
│   ├─ dragActive: boolean
│   └─ error: string
│
├─ Functions
│   ├─ handleDrop()
│   ├─ handleChange()
│   ├─ uploadFile()
│   ├─ deleteImage()
│   ├─ moveImage()
│   └─ onImagesChange() [callback]
│
└─ UI Elements
   ├─ Drag-drop zone
   ├─ File input
   ├─ Progress bar
   ├─ Image grid
   ├─ Delete buttons
   ├─ Move buttons
   └─ Error messages
```

### Header Search Component

```
Header
├── Imports
│   ├─ React hooks (useState, useRef, useEffect, useCallback)
│   ├─ Lucide icons (Search, ShoppingCart, Menu, Loader2)
│   ├─ Button, Input components
│   ├─ Image component
│   ├─ Link from Next.js
│   └─ useCart hook
│
├─ State
│   ├─ searchQuery: string
│   ├─ searchResults: SearchResult[]
│   ├─ isSearching: boolean
│   ├─ showDropdown: boolean
│   └─ mobileMenuOpen: boolean
│
├─ Refs
│   ├─ searchRef
│   └─ debounceTimer
│
├─ Functions
│   ├─ performSearch() [useCallback]
│   ├─ handleSearchInputChange()
│   ├─ handleSearchSubmit()
│   ├─ handleResultClick()
│   └─ useEffect (click-outside)
│
└─ UI Elements
   ├─ Desktop search form
   ├─ Mobile search form
   ├─ Dropdown (desktop)
   ├─ Dropdown (mobile)
   └─ Categories navigation
```

---

## API Endpoints

### Upload Endpoint
```
POST /api/admin/upload

Consumes: multipart/form-data
Produces: application/json

Request:
  Form Data {
    file: File
  }

Response (200):
  {
    "url": "https://...",
    "message": "Image uploaded successfully"
  }

Response (400):
  {
    "message": "Only JPG, PNG, and WebP images are allowed"
  }

Response (500):
  {
    "message": "Failed to upload image: ..."
  }
```

### Delete Endpoint
```
DELETE /api/admin/upload

Consumes: application/json
Produces: application/json

Request:
  {
    "url": "https://..."
  }

Response (200):
  {
    "message": "Image deleted successfully"
  }

Response (400):
  {
    "message": "Invalid image URL"
  }

Response (500):
  {
    "message": "Failed to delete image"
  }
```

### Search Endpoint
```
GET /api/products/search?q=query&limit=10

Query Parameters:
  q: string (required, min 2 chars)
  limit: number (optional, default 10)

Produces: application/json

Response (200):
  {
    "products": [
      {
        "id": "uuid",
        "name": "Product Name",
        "slug": "product-slug",
        "price": 999.99,
        "image": "https://...",
        "category": "Category Name"
      }
    ],
    "total": 25
  }

Response (500):
  {
    "message": "Search failed"
  }
```

---

## Performance Considerations

### Image Upload
```
Performance Timeline:
────────────────────

User Select File
  ├─ 0ms: File selected
  │
  ├─ 10ms: Client validation (type, size)
  │
  ├─ 20ms: Create FormData object
  │
  ├─ 50ms: Start network request
  │
  ├─ 50-500ms: Upload to Supabase
  │   └─ Progress updates every 100ms
  │
  ├─ 500ms: Response received
  │
  ├─ 510ms: Update UI with image
  │
  └─ 520ms: Ready for next upload

Optimization:
  • Client-side validation (pre-request check)
  • Parallel uploads (multiple files)
  • Progress tracking (user feedback)
  • Efficient state management
```

### Search
```
Performance Timeline:
────────────────────

User Types "shirt"
  ├─ 0ms: Type 's'
  ├─ 100ms: Type 'h' → Start 300ms debounce timer
  ├─ 200ms: Type 'i' → Reset timer
  ├─ 300ms: Type 'r' → Reset timer
  ├─ 400ms: Type 't' → Reset timer
  ├─ 500ms: Timer ends → Debounce prevents extra query!
  │
  ├─ 510ms: Fetch /api/products/search?q=shirt
  │
  ├─ 510-650ms: Database query
  │   └─ Primary search: index on name
  │   └─ Secondary search: index on description
  │
  ├─ 650ms: Response received (results)
  │
  ├─ 660ms: Update dropdown UI
  │
  └─ 670ms: User sees results

Optimization:
  • 300ms debounce reduces queries by ~75%
  • Limit 6 results per dropdown (fast rendering)
  • Index on searchable columns (fast queries)
  • Two-tier search (comprehensive results)
```

---

## Security Architecture

### Image Upload Security

```
Client Side Validation:
  ├─ File type check
  │  └─ Only JPEG, PNG, WebP allowed
  │
  └─ File size check
     └─ < 5MB only

Server Side Validation:
  ├─ Request validation
  │  ├─ File exists in FormData?
  │  ├─ File MIME type correct?
  │  └─ File size < 5MB?
  │
  ├─ Storage security
  │  ├─ Unique filenames (no collision)
  │  ├─ Supabase Storage permissions
  │  └─ Public read, authenticated write
  │
  └─ Error handling
     └─ No sensitive data in errors

Supabase Security:
  ├─ HTTPS only
  ├─ Bucket permissions
  ├─ Public URLs (no auth needed to view)
  └─ Admin key only for upload/delete
```

### Search Security

```
Input Validation:
  ├─ Minimum 2 characters
  ├─ Whitespace trimming
  └─ URL encoding in requests

Query Security:
  ├─ Parameterized queries
  │  └─ Using Supabase client (no raw SQL)
  │
  ├─ No SQL injection
  │  └─ Built-in protection from client library
  │
  └─ Data filtering
     └─ Only active products (is_active = true)

Response Security:
  ├─ Only public data returned
  ├─ No user information
  ├─ No sensitive product data
  └─ Rate limiting recommended (external)
```

---

**Last Updated:** 2025-11-27
**Status:** ✅ COMPLETE
