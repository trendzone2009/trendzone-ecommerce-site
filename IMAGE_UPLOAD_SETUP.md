# Product Image Upload - Setup Guide

**Feature:** Image upload functionality for products with drag-and-drop, image reordering, and management.

**Status:** Implementation Complete - Awaiting Supabase Storage Configuration

---

## 🎯 What Was Implemented

### Files Created (3 new files):

1. **`app/api/admin/upload/route.ts`** - Image upload/delete API
   - Handles multipart/form-data file uploads
   - Validates file type (JPG, PNG, WebP only)
   - Validates file size (max 5MB)
   - Uploads to Supabase Storage
   - Returns public URL

2. **`components/admin/image-uploader.tsx`** - Reusable image uploader component
   - Drag and drop interface
   - Click to select files
   - Upload progress indicator (0-100%)
   - Preview grid of uploaded images
   - Delete button on each image
   - Drag to reorder images
   - Main image indicator (first image)
   - Error and success messages
   - Responsive design

3. **Product Forms Updated:**
   - `app/admin/products/new/page.tsx` - Add product form with image upload
   - `app/admin/products/[id]/page.tsx` - Edit product form with image upload

---

## 🛠️ Setup Instructions

### Step 1: Create Supabase Storage Bucket

**In Supabase Dashboard:**

1. Go to **Storage** section (left sidebar)
2. Click **Create new bucket**
3. Configure:
   - **Bucket name:** `product-images` (must match code)
   - **Public bucket:** ✅ YES (enable public access)
   - **File size limit:** 5 MB (or higher)
4. Click **Create bucket**

### Step 2: Configure Bucket Policies (Public Read)

**In Supabase Dashboard:**

1. Click on the `product-images` bucket
2. Go to **Policies** tab
3. Click **New Policy** or **Add Auth Policy**
4. Configure for **SELECT (Read)** with:
   ```
   Create a policy for SELECT
   - Who can access: Public
   - With: (leave blank for public read)
   ```
5. Click **Review** → **Save policy**

If you want to restrict uploads to authenticated admins, add another policy for **INSERT**:
```
Create a policy for INSERT
- Who can access: Authenticated
- With: auth.role() = 'authenticated'
```

### Step 3: Verify Environment Variables

Check that your `.env.local` has Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Test the Upload Feature

1. Start your dev server: `npm run dev`
2. Navigate to `/admin/products/new` (add new product)
3. Scroll to "Product Images" section
4. Try uploading an image:
   - Drag and drop a JPG/PNG/WebP file
   - Or click to select from computer
5. Verify:
   - Image appears in preview grid
   - File size < 5MB
   - Upload progresses to 100%
   - Image URL is displayed

---

## 📝 API Endpoints

### Upload Image

**Endpoint:** `POST /api/admin/upload`

**Request:**
```
Content-Type: multipart/form-data

file: <File object>
```

**Response (Success - 200):**
```json
{
  "url": "https://your-project.supabase.co/storage/v1/object/public/product-images/timestamp-random.jpg",
  "message": "Image uploaded successfully"
}
```

**Response (Error - 400/500):**
```json
{
  "message": "Only JPG, PNG, and WebP images are allowed"
}
```

**Validation:**
- File type must be: `image/jpeg`, `image/png`, or `image/webp`
- File size must be < 5MB
- File is required

---

### Delete Image

**Endpoint:** `DELETE /api/admin/upload`

**Request:**
```json
{
  "url": "https://your-project.supabase.co/storage/v1/object/public/product-images/timestamp-random.jpg"
}
```

**Response (Success - 200):**
```json
{
  "message": "Image deleted successfully"
}
```

---

## 🎨 Component Usage

### Basic Usage

```tsx
import ImageUploader from '@/components/admin/image-uploader';

export default function MyComponent() {
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

### Component Props

```typescript
interface ImageUploaderProps {
  images: string[];                    // Current image URLs
  onImagesChange: (images: string[]) => void;  // Callback when images change
  maxImages?: number;                  // Max images allowed (default 5)
}
```

### Features

- ✅ Drag and drop upload
- ✅ Click to select files
- ✅ Upload progress (0-100%)
- ✅ Image preview grid
- ✅ Delete individual images
- ✅ Reorder images (move up/down)
- ✅ Main image indicator (first image)
- ✅ File validation (type + size)
- ✅ Error handling with user messages
- ✅ Success notifications
- ✅ Responsive design (2-4 columns)

---

## 🔐 Security Notes

### Current Implementation

- ✅ File type validation (client + server)
- ✅ File size validation (5MB max)
- ✅ Unique filenames (timestamp + random)
- ✅ Public URL generation

### Production Recommendations

1. **Authentication:**
   - Restrict upload to logged-in admins
   - Add RLS policy to check `auth.uid()`

2. **Image Processing:**
   - Consider image resizing (resize large images)
   - Generate thumbnails for performance
   - Add image optimization (WebP conversion)

3. **Virus Scanning:**
   - Use Supabase Edge Functions for malware detection
   - Integrate with ClamAV or similar service

4. **Storage Limits:**
   - Set bucket size limits
   - Monitor storage usage
   - Implement cleanup for unused images

5. **Rate Limiting:**
   - Limit uploads per user/IP
   - Prevent abuse

---

## 🧪 Testing Checklist

- [ ] Supabase bucket "product-images" created
- [ ] Bucket is public (READ policy enabled)
- [ ] Can upload JPG image (drag & drop)
- [ ] Can upload PNG image (click select)
- [ ] Can upload WebP image
- [ ] Upload progress shows 0-100%
- [ ] Image appears in preview grid
- [ ] Can delete image with X button
- [ ] Can reorder images (move up/down)
- [ ] First image marked as "Main"
- [ ] Error shown for file > 5MB
- [ ] Error shown for invalid file type
- [ ] Images saved when creating product
- [ ] Images loaded when editing product
- [ ] Images display on product page (frontend)

---

## 🐛 Troubleshooting

### Problem: "Failed to upload image"

**Solutions:**
1. Check Supabase bucket exists and is named `product-images`
2. Verify bucket is set to PUBLIC
3. Check Supabase credentials in `.env.local`
4. Check browser console for actual error message
5. Verify file size < 5MB

### Problem: "Only JPG, PNG, and WebP images are allowed"

**Solution:**
- Ensure file is one of: JPG, PNG, WebP
- Check file extension matches actual file type
- Try re-exporting the image in correct format

### Problem: Images show but then disappear on refresh

**Solution:**
1. Verify images are actually in Supabase Storage
2. Check that URLs are being saved to database
3. Verify product API includes images field
4. Check browser cache isn't causing issues

### Problem: Can upload but image doesn't show

**Solutions:**
1. Check Supabase bucket public access (READ policy)
2. Verify image URL in browser (direct access)
3. Check CORS settings if loading from different domain
4. Inspect network tab for 403/404 errors

---

## 📊 File Structure

```
/app/api/admin/upload/
├── route.ts              # Upload/delete API endpoints

/components/admin/
├── image-uploader.tsx    # Reusable component

/app/admin/products/
├── new/page.tsx          # Updated with ImageUploader
├── [id]/page.tsx         # Updated with ImageUploader
```

---

## 🚀 Next Steps

1. **Setup Supabase Storage** (follow Step 1-4 above)
2. **Test image upload** (Step 4 above)
3. **Deploy to production:**
   - Update Supabase bucket policies for production
   - Add authentication restrictions if needed
   - Monitor storage usage

4. **Optional enhancements:**
   - Add image optimization
   - Implement image resizing
   - Add thumbnail generation
   - Setup CDN for faster delivery

---

## 📚 Related Files

- **Add Product Form:** `app/admin/products/new/page.tsx`
- **Edit Product Form:** `app/admin/products/[id]/page.tsx`
- **Upload API:** `app/api/admin/upload/route.ts`
- **Component:** `components/admin/image-uploader.tsx`

---

## ✅ Status

- ✅ Upload API created
- ✅ Image component created
- ✅ Product forms integrated
- ⏳ Awaiting Supabase Storage setup (manual step)
- ⏳ Images saving to database (once API updated)
- ⏳ Images displaying on frontend (once database updated)

---

**After completing Supabase setup, the feature is ready to use!**

For questions, see the troubleshooting section above or check component prop types.

