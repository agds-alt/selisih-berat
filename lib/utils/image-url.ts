/**
 * Image URL optimization utilities
 * Automatically applies Cloudinary transformations for optimal delivery
 */

import { optimizeCloudinaryUrl } from './cloudinary'

/**
 * Get optimized image URL for display
 * Automatically applies aggressive compression and format optimization
 *
 * @param url - Original image URL (Cloudinary or regular)
 * @param options - Optimization options
 * @returns Optimized URL with transformations applied
 */
export function getOptimizedImageUrl(
  url: string,
  options?: {
    width?: number
    height?: number
    quality?: 'auto:low' | 'auto:good' | 'auto:best' | 'auto:eco'
  }
): string {
  if (!url) return ''

  // If it's a Cloudinary URL, apply optimizations
  if (url.includes('cloudinary.com')) {
    return optimizeCloudinaryUrl(url, {
      quality: options?.quality || 'auto:good',
      format: 'auto', // Auto WebP/AVIF
      width: options?.width,
      height: options?.height,
    })
  }

  // Return as-is for non-Cloudinary URLs
  return url
}

/**
 * Get thumbnail URL with aggressive compression
 * Perfect for list views and galleries
 *
 * @param url - Original image URL
 * @param size - Thumbnail size (default: 300px)
 * @returns Optimized thumbnail URL
 */
export function getThumbnailUrl(url: string, size: number = 300): string {
  return getOptimizedImageUrl(url, {
    width: size,
    height: size,
    quality: 'auto:eco', // Most aggressive for thumbnails
  })
}

/**
 * Get preview URL with balanced compression
 * Perfect for modal previews and detail views
 *
 * @param url - Original image URL
 * @param maxWidth - Maximum width (default: 1200px)
 * @returns Optimized preview URL
 */
export function getPreviewUrl(url: string, maxWidth: number = 1200): string {
  return getOptimizedImageUrl(url, {
    width: maxWidth,
    quality: 'auto:good', // Balanced quality
  })
}

/**
 * Get full-size URL with light compression
 * Perfect for downloads and printing
 *
 * @param url - Original image URL
 * @returns Lightly optimized full-size URL
 */
export function getFullSizeUrl(url: string): string {
  return getOptimizedImageUrl(url, {
    quality: 'auto:best', // Minimal compression
  })
}
