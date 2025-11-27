# Phase 5: Quick Start Guide

## What's New?

Two major features have been added to the e-commerce platform:

### 1. Product Image Upload
Upload and manage product images with drag-and-drop support, reordering, and deletion.

**Where to find it:**
- Add Product: `/admin/products/new`
- Edit Product: `/admin/products/[id]`

**How to use:**
1. Go to product form
2. Find "Product Images" section
3. Drag and drop images or click to select
4. Reorder images using up/down arrows
5. Delete images with X button
6. First image is marked as "Main"

### 2. Product Search
Real-time product search with autocomplete dropdown and dedicated search results page.

**Where to find it:**
- Header search bar (visible on all pages)
- Search results page: `/search?q=query`

**How to use:**
1. Type in header search box (2+ characters)
2. See autocomplete results with images
3. Click result to go to product page
4. Click "View all results" to see all results
5. Use pagination on search results page

---

## Files Modified/Created

### New Files
```
/app/api/admin/upload/route.ts
/components/admin/image-uploader.tsx
/app/api/products/search/route.ts
/app/(customer)/search/page.tsx
```

### Modified Files
```
/components/customer/header.tsx
/app/admin/products/new/page.tsx
/app/admin/products/[id]/page.tsx
```

---

## Setup Instructions

### 1. Image Upload - Supabase Storage Setup

**Important:** You must setup Supabase Storage for image uploads to work.

**Steps:**
1. Go to Supabase Dashboard
2. Click **Storage** in left sidebar
3. Click **Create new bucket**
4. Name it: `product-images`
5. Make it **Public**
6. Set file size limit to **5 MB** or higher
7. Click **Create bucket**

**That's it!** The code will automatically:
- Create the bucket if missing
- Set up proper permissions
- Handle file uploads

See `IMAGE_UPLOAD_SETUP.md` for detailed setup instructions.

---

## Environment Variables

Make sure your `.env.local` has these Supabase variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

These should already be configured from previous phases.

---

## Database Requirements

Your products table must have:
- `images` column (JSONB array type) - stores image URLs
- `name` column (text) - for search
- `description` column (text) - for search fallback
- `is_active` column (boolean) - to filter products
- `base_price` column (numeric) - product price
- `category_id` column (uuid) - link to categories

If any of these are missing, contact the development team.

---

## Testing the Features

### Test Image Upload
1. Go to `/admin/products/new`
2. Fill in product details
3. In "Product Images" section:
   - Drag an image file
   - Watch progress bar
   - See image preview
4. Click "Create Product"
5. Go to `/admin/products` and edit the product
6. Verify images are still there

### Test Search
1. Go to homepage
2. Find search box in header
3. Type a product name (e.g., "shirt")
4. See dropdown with results
5. Click a result → goes to product page
6. Click "View all results" → goes to search page
7. Verify pagination works on search page

---

## Troubleshooting

### Image Upload Issues

**Problem:** "Failed to upload image"
- ✅ Check Supabase bucket is created and is named `product-images`
- ✅ Check bucket is set to PUBLIC
- ✅ Check file is JPG, PNG, or WebP
- ✅ Check file size < 5MB

**Problem:** Images don't show after creating product
- ✅ Check browser console for errors
- ✅ Verify images are saving in Supabase Storage
- ✅ Check database has `images` column

### Search Issues

**Problem:** Dropdown doesn't show results
- ✅ Check you typed 2+ characters
- ✅ Check browser console for API errors
- ✅ Wait 300ms for debounce delay

**Problem:** Search page shows no results
- ✅ Check query parameter in URL: `/search?q=test`
- ✅ Check products exist in database with `is_active = true`
- ✅ Try searching for product name or description

---

## API Reference

### Upload Image
```
POST /api/admin/upload
Content-Type: multipart/form-data

Request:
  file: [File object]

Response (200):
  {
    "url": "https://...",
    "message": "Image uploaded successfully"
  }

Response (400/500):
  {
    "message": "Error description"
  }
```

### Delete Image
```
DELETE /api/admin/upload
Content-Type: application/json

Request:
  {
    "url": "https://..."
  }

Response (200):
  {
    "message": "Image deleted successfully"
  }
```

### Search Products
```
GET /api/products/search?q=query&limit=10

Response:
  {
    "products": [
      {
        "id": "uuid",
        "name": "Product Name",
        "slug": "product-slug",
        "price": 999,
        "image": "https://...",
        "category": "T-Shirts"
      }
    ],
    "total": 1
  }
```

---

## Component Usage

### Image Uploader Component

```tsx
import ImageUploader from '@/components/admin/image-uploader';

export function MyComponent() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <ImageUploader
      images={images}
      onImagesChange={setImages}
      maxImages={5}
    />
  );
}
```

**Props:**
- `images` - Array of image URLs
- `onImagesChange` - Callback when images change
- `maxImages` - Maximum images allowed (default 5)

---

## Code Patterns

### Using Search in Header
The header component automatically includes search. No additional setup needed.

```tsx
// In any page:
<Header /> // Search is included
```

### Navigating to Search Results
```tsx
// From any component:
window.location.href = `/search?q=${encodeURIComponent(query)}`;

// Or use Next.js router:
router.push(`/search?q=${encodeURIComponent(query)}`);
```

### Getting Search Results Server-Side
```tsx
// In app/(customer)/search/page.tsx:
async function searchProducts(query: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .ilike('name', `%${query}%`)
    .eq('is_active', true);

  return data;
}
```

---

## Performance Tips

1. **Search:** Results are debounced by 300ms - this is optimal for UX
2. **Images:** Consider adding image optimization for large files
3. **Pagination:** Search results page shows 20 per page - good balance
4. **Database:** Ensure `name` and `description` columns are indexed for fast search

---

## Security Notes

1. **Images:** Only JPG, PNG, WebP allowed. Size limit 5MB.
2. **Search:** Minimum 2 characters required. No special characters needed.
3. **Data:** Only active products shown. No sensitive data exposed.

---

## Next Steps

### Optional Enhancements
1. Add image compression/resizing
2. Add advanced filters to search page
3. Add search analytics
4. Add typo tolerance to search
5. Implement search caching

See `PHASE5_COMPLETION_STATUS.md` for full feature roadmap.

---

## Documentation Files

- **`IMAGE_UPLOAD_SETUP.md`** - Complete image upload guide
- **`PHASE5_SEARCH_IMPLEMENTATION.md`** - Complete search implementation details
- **`PHASE5_COMPLETION_STATUS.md`** - Overall Phase 5 status and future roadmap
- **`PHASE5_QUICK_START.md`** - This file

---

## Support

For issues or questions:

1. Check troubleshooting section above
2. Check error messages in browser console
3. Check server logs with `npm run dev`
4. Review related documentation files
5. Check code comments in component files

---

**Last Updated:** 2025-11-27
**Status:** ✅ Production Ready
**Version:** 1.0
