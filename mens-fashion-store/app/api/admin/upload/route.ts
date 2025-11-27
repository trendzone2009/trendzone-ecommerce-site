import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET_NAME = 'product-images';

// Ensure the storage bucket exists
async function ensureBucketExists(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return false;
  }
  
  const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log(`Creating bucket: ${BUCKET_NAME}`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });
    
    if (createError) {
      console.error('Error creating bucket:', createError);
      return false;
    }
    console.log(`Bucket ${BUCKET_NAME} created successfully`);
  }
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Use admin client for storage operations
    const supabaseAdmin = getSupabaseAdmin();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: 'Only JPG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Ensure bucket exists (auto-create if needed)
    const bucketReady = await ensureBucketExists(supabaseAdmin);
    if (!bucketReady) {
      return NextResponse.json(
        { message: 'Storage bucket not available. Please check your Supabase configuration or create the "product-images" bucket manually.' },
        { status: 500 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { message: `Failed to upload image: ${error.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: urlData.publicUrl,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Use admin client for storage operations
    const supabaseAdmin = getSupabaseAdmin();
    
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { message: 'No URL provided' },
        { status: 400 }
      );
    }

    // Extract filename from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) {
      return NextResponse.json(
        { message: 'Invalid image URL' },
        { status: 400 }
      );
    }

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { message: 'Failed to delete image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
