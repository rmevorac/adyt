'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ImageCard from './ImageCard/ImageCard';
import { imagesAPI } from '../lib/api';

interface ImageItem {
  id: string;
  conceptId: string;
  url: string;
  selected: boolean;
  revise: boolean;
  reject: boolean;
  notes?: string;
  variations: { 
    id: string; 
    url: string; 
    notes?: string; 
    selected: boolean;
    revise: boolean;
    reject: boolean;
  }[];
  selectedVariation?: string;
}

// Add debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function WeeklyDrop() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenImageId, setFullscreenImageId] = useState<string | null>(null);
  const [tempVariation, setTempVariation] = useState<string | undefined>(undefined);

  // Create a debounced version of the API call
  const debouncedUpdateNotes = useCallback(
    debounce(async (id: string, notes: string, noteType: 'reviseNote' | 'rejectNote') => {
      try {
        await imagesAPI.update(id, {
          [noteType]: notes || null
        });
      } catch (error) {
        console.error('Error updating notes:', error);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      const { images: data } = await response.json();
      
      // Group images by their concept directory
      const conceptGroups = new Map<string, any[]>();
      data.forEach((img: any) => {
        const conceptDir = img.url.split('/')[2]; // Get the directory name from the URL
        if (!conceptGroups.has(conceptDir)) {
          conceptGroups.set(conceptDir, []);
        }
        conceptGroups.get(conceptDir)?.push(img);
      });

      // Take only the first image from each concept group
      const firstImages = Array.from(conceptGroups.values()).map(group => group[0]);

      setImages(firstImages.map((img: any) => ({
        id: img.id,
        conceptId: img.id,
        url: img.url,
        selected: img.selected || false,
        revise: img.revise || false,
        reject: img.reject || false,
        notes: img.reviseNote || img.rejectNote || '',
        variations: img.variations.map((variationUrl: string, index: number) => ({
          id: `${img.id}-variation-${index}`,
          url: variationUrl,
          notes: '',
          selected: false,
          revise: false,
          reject: false
        }))
      })));
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to fetch images. Please try again.');
    }
  };

  const handleSelect = async (id: string) => {
    try {
      const currentImage = images.find(img => img.id === id);
      if (!currentImage) return;

      const newSelected = !currentImage.selected;
      
      // Update the database
      await imagesAPI.update(id, {
        selected: newSelected,
        revise: false,
        reject: false
      });

      // Update local state
      setImages(images.map(img => {
        if (img.id === id) {
          return {
            ...img,
            selected: newSelected,
            revise: false,
            reject: false
          };
        }
        return img;
      }));
    } catch (error) {
      console.error('Error updating image:', error);
      // Optionally show an error message to the user
    }
  };

  const handleRevise = async (id: string) => {
    try {
      const currentImage = images.find(img => img.id === id);
      if (!currentImage) return;

      const newRevise = !currentImage.revise;
      
      // Update the database
      await imagesAPI.update(id, {
        selected: false,
        revise: newRevise,
        reject: false
      });

      // Update local state
      setImages(images.map(img => {
        if (img.id === id) {
          return {
            ...img,
            selected: false,
            revise: newRevise,
            reject: false
          };
        }
        return img;
      }));
    } catch (error) {
      console.error('Error updating image:', error);
      // Optionally show an error message to the user
    }
  };

  const handleReject = async (id: string) => {
    try {
      const currentImage = images.find(img => img.id === id);
      if (!currentImage) return;

      const newReject = !currentImage.reject;
      
      // Update the database
      await imagesAPI.update(id, {
        selected: false,
        revise: false,
        reject: newReject
      });

      // Update local state
      setImages(images.map(img => {
        if (img.id === id) {
          return {
            ...img,
            selected: false,
            revise: false,
            reject: newReject
          };
        }
        return img;
      }));
    } catch (error) {
      console.error('Error updating image:', error);
      // Optionally show an error message to the user
    }
  };

  const handleNotesChange = (id: string, notes: string) => {
    // Check if this is a variation or main image ID
    let mainImage: ImageItem | undefined;
    let variation: { id: string; url: string; notes?: string; selected: boolean; revise: boolean; reject: boolean; } | undefined;

    // Find the main image and variation (if applicable)
    images.forEach(img => {
      if (img.id === id) {
        mainImage = img;
      } else {
        const matchingVariation = img.variations.find(v => v.id === id);
        if (matchingVariation) {
          variation = matchingVariation;
          mainImage = img;
        }
      }
    });

    if (!mainImage) return;

    // Update the appropriate image/variation in state
    setImages(images.map(img => {
      if (img.id === mainImage!.id) {
        // If updating the main image directly
        if (img.id === id) {
          return { ...img, notes: notes };
        } 
        // If updating one of its variations
        else if (variation) {
          return {
            ...img,
            variations: img.variations.map(v => 
              v.id === id ? { ...v, notes: notes } : v
            )
          };
        }
      }
      return img;
    }));

    // For API updates - currently we only support updating main images in the backend
    // For variations we just update the local state
    if (!variation) {
      // Determine which type of note to update
      let noteType: 'reviseNote' | 'rejectNote';
      if (mainImage.revise) {
        noteType = 'reviseNote';
      } else if (mainImage.reject) {
        noteType = 'rejectNote';
      } else {
        return; // Don't update if neither revise nor reject is selected
      }

      // Debounced API call for main image
      debouncedUpdateNotes(id, notes, noteType);
    }
    // For variations we could add API support in the future
  };

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 bg-white">
      {/* Grid of images */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {images.map((image, index) => (
          <ImageCard
            key={image.id}
            image={image}
            onSelect={handleSelect}
            onRevise={handleRevise}
            onReject={handleReject}
            onNotesChange={handleNotesChange}
            isFullScreen={fullscreenImageId === image.id}
            onFullScreenChange={(isOpen) => {
              if (isOpen) {
                setFullscreenImageId(image.id);
                setTempVariation(undefined);
              } else {
                // If a variation was selected in fullscreen mode, apply it now
                if (tempVariation !== undefined) {
                  setImages(images.map(img => {
                    if (img.id === fullscreenImageId) {
                      return {
                        ...img,
                        selectedVariation: tempVariation === img.id ? undefined : tempVariation
                      };
                    }
                    return img;
                  }));
                  setTempVariation(undefined);
                }
                setFullscreenImageId(null);
              }
            }}
            onNext={() => {
              // Apply any variation selection before navigating
              if (tempVariation !== undefined && fullscreenImageId) {
                setImages(images.map(img => {
                  if (img.id === fullscreenImageId) {
                    return {
                      ...img,
                      selectedVariation: tempVariation === img.id ? undefined : tempVariation
                    };
                  }
                  return img;
                }));
                setTempVariation(undefined);
              }
              
              if (index < images.length - 1) {
                setFullscreenImageId(images[index + 1].id);
              }
            }}
            onPrevious={() => {
              // Apply any variation selection before navigating
              if (tempVariation !== undefined && fullscreenImageId) {
                setImages(images.map(img => {
                  if (img.id === fullscreenImageId) {
                    return {
                      ...img,
                      selectedVariation: tempVariation === img.id ? undefined : tempVariation
                    };
                  }
                  return img;
                }));
                setTempVariation(undefined);
              }
              
              if (index > 0) {
                setFullscreenImageId(images[index - 1].id);
              }
            }}
            hasNext={index < images.length - 1}
            hasPrevious={index > 0}
            onVariationSelect={(conceptId, variationId) => {
              if (fullscreenImageId) {
                // In fullscreen, just store the variation temporarily
                setTempVariation(variationId === conceptId ? undefined : variationId);
              } else {
                // Not in fullscreen, update the state directly
                setImages(images.map(img => {
                  if (img.id === conceptId) {
                    // If selecting the original image
                    if (variationId === img.id) {
                      return {
                        ...img,
                        selectedVariation: undefined
                      };
                    }
                    // If selecting a variation
                    const variation = img.variations.find(v => v.id === variationId);
                    if (variation) {
                      return {
                        ...img,
                        selectedVariation: variationId
                      };
                    }
                  }
                  return img;
                }));
              }
            }}
          />
        ))}
      </div>
    </div>
  );
} 