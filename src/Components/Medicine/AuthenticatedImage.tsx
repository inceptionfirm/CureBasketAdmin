import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

interface AuthenticatedImageProps {
  src: string; // Can be full URL, path, or filename only
  alt: string;
  className?: string;
  fallback?: string; // Fallback image URL if load fails
  onError?: () => void;
}

// Cache blob URLs by normalized src to avoid duplicate requests
const blobUrlCache = new Map<string, { url: string; refCount: number }>();
// Remember failed src so we don't retry (was causing 166+ duplicate 404 requests)
const failedCache = new Set<string>();
// Track currently loading images to prevent race conditions (multiple components loading same image)
const loadingPromises = new Map<string, Promise<Blob | null>>();

function getCacheKey(s: string): string {
  try {
    // Normalize: remove leading slashes, decode URI, remove query params
    const normalized = decodeURIComponent(s.trim().replace(/^\/+/, '').split('?')[0]);
    return normalized.toLowerCase(); // Case-insensitive matching
  } catch {
    return s.trim().replace(/^\/+/, '').split('?')[0].toLowerCase();
  }
}

/**
 * AuthenticatedImage Component
 * Fetches images that require authentication using apiClient (which adds Bearer token)
 * Converts blob response to object URL for display.
 * Handles: full URL, path like /files/MEDICINE/..., or filename only (e.g. 13_4_Screenshot.png)
 */
const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  className = '',
  fallback,
  onError
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src || src.trim() === '') {
      setLoading(false);
      return;
    }

    // If it's already a data URL or blob URL, use it directly
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      setImageUrl(src);
      setLoading(false);
      return;
    }

    // If it's a full URL from java.api.curebasket.com, use it directly (no auth needed)
    if (src.startsWith('https://java.api.curebasket.com') || src.startsWith('http://java.api.curebasket.com')) {
      setImageUrl(src);
      setLoading(false);
      setError(false);
      return;
    }

    // Check cache first to avoid duplicate fetches
    const cacheKey = getCacheKey(src);
    const cached = blobUrlCache.get(cacheKey);
    if (cached) {
      cached.refCount += 1;
      setImageUrl(cached.url);
      setLoading(false);
      setError(false);
      return () => {
        cached.refCount -= 1;
        if (cached.refCount <= 0) {
          blobUrlCache.delete(cacheKey);
          URL.revokeObjectURL(cached.url);
        }
      };
    }

    // If we already tried this image and it failed, show placeholder without fetching again
    if (failedCache.has(cacheKey)) {
      setError(true);
      setLoading(false);
      return;
    }

    // Check if another component is already loading this image (prevent race condition)
    const existingPromise = loadingPromises.get(cacheKey);
    if (existingPromise) {
      existingPromise.then(() => {
        // After promise resolves, check cache (first component will have set it)
        const cached = blobUrlCache.get(cacheKey);
        if (cached) {
          cached.refCount += 1;
          setImageUrl(cached.url);
          setLoading(false);
          setError(false);
        } else if (failedCache.has(cacheKey)) {
          setError(true);
          setLoading(false);
        }
      }).catch(() => {
        setError(true);
        setLoading(false);
      });
      return () => {
        const entry = blobUrlCache.get(cacheKey);
        if (entry) {
          entry.refCount -= 1;
          if (entry.refCount <= 0) {
            blobUrlCache.delete(cacheKey);
            URL.revokeObjectURL(entry.url);
          }
        }
      };
    }

    // Extract relative path from full URL if needed
    let relativePath = src.trim();
    if (src.startsWith('http://') || src.startsWith('https://')) {
      try {
        const url = new URL(src);
        relativePath = url.pathname + url.search;
        if (relativePath.startsWith('/backend/')) {
          relativePath = relativePath.substring('/backend'.length);
        } else if (relativePath === '/backend') {
          relativePath = '/';
        }
      } catch (e) {
        failedCache.add(cacheKey);
        setError(true);
        setLoading(false);
        return;
      }
    }

    if (relativePath.startsWith('/backend/')) {
      relativePath = relativePath.substring('/backend'.length);
    }
    if (!relativePath.startsWith('/')) {
      relativePath = '/' + relativePath;
    }

    // Extract filename and medicine ID from path
    const filename = relativePath.replace(/^\/+/, '').replace(/^files\/MEDICINE\//, '').replace(/^MEDICINE\//, '');
    const idFromFilename = filename.match(/^(\d+)_/)?.[1] ?? null;
    
    // Try paths in order of likelihood (medicine ID endpoint is most likely to work)
    const pathsToTry: string[] = [];
    
    // Priority 1: Medicine-specific endpoint (if we can extract ID from filename)
    if (idFromFilename) {
      pathsToTry.push(`/medicines/image/${idFromFilename}`);
    }
    
    // Priority 2: Try without /files/ prefix (maybe backend serves directly at /MEDICINE/)
    pathsToTry.push(`/MEDICINE/${filename}`);
    
    // Priority 3: Try with /files/ prefix (current attempt that's failing)
    pathsToTry.push(`/files/MEDICINE/${filename}`);
    
    // Priority 4: Try just filename (if backend serves at root)
    pathsToTry.push(`/${filename}`);
    
    // Priority 5: Try original path as-is
    if (relativePath !== `/${filename}` && relativePath !== `/files/MEDICINE/${filename}` && relativePath !== `/MEDICINE/${filename}`) {
      pathsToTry.push(relativePath);
    }
    
    console.log('🖼️ Trying image paths:', {
      originalSrc: src,
      normalizedPath: relativePath,
      filename,
      medicineId: idFromFilename,
      pathsToTry
    });
    
    const pathToTry = pathsToTry[0];

    // Create loading promise and store it immediately to prevent race conditions
    const loadPromise = (async (): Promise<Blob | null> => {
      try {
        setLoading(true);
        setError(false);

        // Try each path until one works
        let response: { success: boolean; data?: Blob; error?: string } = { success: false };
        let lastError: string = '';

        for (const path of pathsToTry) {
          try {
            console.log(`🔄 Trying path: ${path}`);
            response = await apiClient.getBlob(path);
            if (response.success && response.data) {
              console.log(`✅ Success with path: ${path}`);
              break; // Found working path!
            }
            lastError = response.error || 'Not found';
          } catch (err) {
            lastError = err instanceof Error ? err.message : 'Request failed';
            continue; // Try next path
          }
        }

        if (!response.success || !response.data) {
          throw new Error(lastError || 'Image not found at any path');
        }

        const blobUrl = URL.createObjectURL(response.data);
        blobUrlCache.set(cacheKey, { url: blobUrl, refCount: 1 });
        setImageUrl(blobUrl);
        setLoading(false);
        return response.data;
      } catch (err) {
        failedCache.add(cacheKey);
        setError(true);
        setLoading(false);
        console.error(`❌ All paths failed for image: ${src}`, err);
        onError?.();
        return null;
      } finally {
        loadingPromises.delete(cacheKey);
      }
    })();

    loadingPromises.set(cacheKey, loadPromise);

    return () => {
      const entry = blobUrlCache.get(cacheKey);
      if (entry) {
        entry.refCount -= 1;
        if (entry.refCount <= 0) {
          blobUrlCache.delete(cacheKey);
          URL.revokeObjectURL(entry.url);
        }
      }
    };
  }, [src, onError]);

  if (loading) {
    return (
      <div className={`authenticated-image-loading ${className}`} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        minHeight: '100px',
        color: '#999'
      }}>
        <span>Loading...</span>
      </div>
    );
  }

  if (error || !imageUrl) {
    if (fallback) {
      return <img src={fallback} alt={alt} className={className} />;
    }
    return (
      <div className={`authenticated-image-error ${className}`} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        minHeight: '100px',
        color: '#999'
      }}>
        <span>Image not available</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => {
        setError(true);
        if (onError) {
          onError();
        }
      }}
    />
  );
};

export default AuthenticatedImage;
