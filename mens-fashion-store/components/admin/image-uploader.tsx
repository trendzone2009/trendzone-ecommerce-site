'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, AlertCircle, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setError('');
    setSuccess('');

    // Check if adding these files would exceed max
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await uploadImage(file, i, files.length);
    }
  };

  const uploadImage = async (file: File, index: number, total: number) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Upload failed');
      }

      const data = await response.json();

      // Add the new image to the list
      const newImages = [...images, data.url];
      onImagesChange(newImages);

      // Show progress
      setUploadProgress(Math.round(((index + 1) / total) * 100));

      if (index === total - 1) {
        setSuccess(`Successfully uploaded ${total} image(s)`);
        setUploadProgress(0);
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Clear success after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setUploadProgress(0);
      setUploading(false);
    }
  };

  const deleteImage = async (url: string) => {
    try {
      setDeletingUrl(url);
      setError('');

      const response = await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Delete failed');
      }

      // Remove from images list
      const newImages = images.filter((img) => img !== url);
      onImagesChange(newImages);
      setSuccess('Image deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
    } finally {
      setDeletingUrl(null);
    }
  };

  const moveImageUp = (index: number) => {
    if (index > 0) {
      const newImages = [...images];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      onImagesChange(newImages);
    }
  };

  const moveImageDown = (index: number) => {
    if (index < images.length - 1) {
      const newImages = [...images];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      onImagesChange(newImages);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          ref={dragRef}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 transition ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <Upload className="w-8 h-8 text-gray-400" />
            <div className="text-center">
              <p className="font-medium text-gray-900">
                Drag and drop images here
              </p>
              <p className="text-sm text-gray-600">
                or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  click to select
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supported: JPG, PNG, WebP (Max 5MB each)
              </p>
              <p className="text-xs text-gray-500">
                {images.length}/{maxImages} images
              </p>
            </div>

            {uploading && (
              <div className="w-full max-w-xs">
                <div className="bg-gray-200 rounded-full h-2 w-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 text-center mt-2">
                  {uploadProgress}% uploading...
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={uploading}
            className="hidden"
          />
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">
              Uploaded Images ({images.length}/{maxImages})
            </h3>
            {images.length === maxImages && (
              <p className="text-xs text-amber-600">
                Maximum images reached
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div
                key={url}
                className="relative group bg-gray-100 rounded-lg overflow-hidden"
              >
                {/* Image */}
                <div className="relative w-full h-40">
                  <Image
                    src={url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100px, (max-width: 1024px) 150px, 200px"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {/* Main Image Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Main
                    </div>
                  )}

                  {/* Move Up Button */}
                  {index > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveImageUp(index)}
                      className="bg-white hover:bg-gray-100"
                      title="Move up"
                    >
                      ↑
                    </Button>
                  )}

                  {/* Move Down Button */}
                  {index < images.length - 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveImageDown(index)}
                      className="bg-white hover:bg-gray-100"
                      title="Move down"
                    >
                      ↓
                    </Button>
                  )}

                  {/* Delete Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteImage(url)}
                    disabled={deletingUrl === url}
                    className="bg-red-500 hover:bg-red-600 text-white border-0"
                  >
                    {deletingUrl === url ? (
                      <span className="text-xs">Deleting...</span>
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Reorder Drag Hint */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                  <p className="text-xs text-white text-center">
                    {index === 0 ? '(Main Image)' : `#${index + 1}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reorder Info */}
          <p className="text-xs text-gray-600 mt-4">
            💡 Tip: Hover over images to delete or reorder. The first image will
            be used as the main product image.
          </p>
        </div>
      )}
    </div>
  );
}
