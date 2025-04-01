// In-memory cache for loaded images
const loadedImages: Record<string, boolean> = {};

/**
 * Check if an image is already loaded and cached
 */
export function isImageLoaded(url: string): boolean {
  return !!loadedImages[url];
}

/**
 * Preload an image and store it in the cache
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (loadedImages[url]) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => {
      loadedImages[url] = true;
      resolve();
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = url;
  });
}

/**
 * Preload a concept image and its variations
 */
export async function preloadConceptImages(
  id: string, 
  mainImageUrl: string, 
  variations: { id: string; url: string }[]
): Promise<void> {
  try {
    // Preload main image first
    await preloadImage(mainImageUrl);
    
    // Then preload all variations in parallel
    await Promise.all(variations.map(v => preloadImage(v.url)));
  } catch (error) {
    console.error(`Error preloading concept images for ${id}:`, error);
    throw error;
  }
} 