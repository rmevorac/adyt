'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ImageCard from '../imageCard/ImageCard';
import { imagesAPI } from '../../lib/api';
import { 
  ImageItem, 
  APIImage, 
  ImageConcept, 
  ImageVariation,
  convertToImageItem 
} from '../../types/image';

// Add debounce utility
function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function WeeklyDrop() {
  // We'll store concepts internally but convert to ImageItem for compatibility with ImageCard
  const [concepts, setConcepts] = useState<ImageConcept[]>([]);
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
      const conceptGroups = new Map<string, APIImage[]>();
      data.forEach((img: APIImage) => {
        const conceptDir = img.url.split('/')[2]; // Get the directory name from the URL
        if (!conceptGroups.has(conceptDir)) {
          conceptGroups.set(conceptDir, []);
        }
        conceptGroups.get(conceptDir)?.push(img);
      });

      // Convert to our new ImageConcept structure
      const newConcepts: ImageConcept[] = Array.from(conceptGroups.entries()).map(([dirName, images]) => {
        // Use the first image as the concept ID but it will also be a variation
        const conceptId = images[0].id;
        
        // Create a variations array from ALL images in this concept, including the first one
        const variations: ImageVariation[] = images.map((img, index) => ({
          id: img.id, // Keep original IDs for all images
          url: img.url,
          notes: img.reviseNote || img.rejectNote || '',
          selected: img.selected || false,
          revise: img.revise || false,
          reject: img.reject || false
        }));

        // Add all variations from the first image
        if (images[0].variations && images[0].variations.length > 0) {
          images[0].variations.forEach((variationUrl, index) => {
            variations.push({
              id: `${images[0].id}-extra-variation-${index}`,
              url: variationUrl,
              notes: '',
              selected: false,
              revise: false,
              reject: false
            });
          });
        }

        // No need for the special case handling anymore since we're including all images

        // Create the concept
        return {
          id: conceptId,
          name: dirName,
          directoryPath: `/images/${dirName}`,
          variations,
          selectedVariationId: undefined // No variation selected by default
        };
      });

      setConcepts(newConcepts);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to fetch images. Please try again.');
    }
  };

  const handleSelect = async (id: string) => {
    try {
      // Find which concept contains this variation
      const conceptWithVariation = findConceptByVariationId(id);
      if (!conceptWithVariation) return;

      // Find the variation
      const variationIndex = conceptWithVariation.variations.findIndex(v => v.id === id);
      if (variationIndex === -1) return;

      const variation = conceptWithVariation.variations[variationIndex];
      const newSelected = !variation.selected;
      
      // Update the database (only if it's the main image with the same ID as the concept)
      if (id === conceptWithVariation.id) {
        await imagesAPI.update(id, {
          selected: newSelected,
          revise: false,
          reject: false
        });
      }

      // Update local state
      setConcepts(prevConcepts => {
        return prevConcepts.map(concept => {
          if (concept.id === conceptWithVariation.id) {
            return {
              ...concept,
              variations: concept.variations.map(v => 
                v.id === id
                  ? { ...v, selected: newSelected, revise: false, reject: false }
                  : v
              )
            };
          }
          return concept;
        });
      });
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const handleRevise = async (id: string) => {
    try {
      // Find which concept contains this variation
      const conceptWithVariation = findConceptByVariationId(id);
      if (!conceptWithVariation) return;

      // Find the variation
      const variationIndex = conceptWithVariation.variations.findIndex(v => v.id === id);
      if (variationIndex === -1) return;

      const variation = conceptWithVariation.variations[variationIndex];
      const newRevise = !variation.revise;
      
      // Update the database (only if it's the main image with the same ID as the concept)
      if (id === conceptWithVariation.id) {
        await imagesAPI.update(id, {
          selected: false,
          revise: newRevise,
          reject: false
        });
      }

      // Update local state
      setConcepts(prevConcepts => {
        return prevConcepts.map(concept => {
          if (concept.id === conceptWithVariation.id) {
            return {
              ...concept,
              variations: concept.variations.map(v => 
                v.id === id
                  ? { ...v, selected: false, revise: newRevise, reject: false }
                  : v
              )
            };
          }
          return concept;
        });
      });
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      // Find which concept contains this variation
      const conceptWithVariation = findConceptByVariationId(id);
      if (!conceptWithVariation) return;

      // Find the variation
      const variationIndex = conceptWithVariation.variations.findIndex(v => v.id === id);
      if (variationIndex === -1) return;

      const variation = conceptWithVariation.variations[variationIndex];
      const newReject = !variation.reject;
      
      // Update the database (only if it's the main image with the same ID as the concept)
      if (id === conceptWithVariation.id) {
        await imagesAPI.update(id, {
          selected: false,
          revise: false,
          reject: newReject
        });
      }

      // Update local state
      setConcepts(prevConcepts => {
        return prevConcepts.map(concept => {
          if (concept.id === conceptWithVariation.id) {
            return {
              ...concept,
              variations: concept.variations.map(v => 
                v.id === id
                  ? { ...v, selected: false, revise: false, reject: newReject }
                  : v
              )
            };
          }
          return concept;
        });
      });
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const handleNotesChange = (id: string, notes: string) => {
    // Find which concept contains this variation
    const conceptWithVariation = findConceptByVariationId(id);
    if (!conceptWithVariation) return;

    // Find the variation
    const variationIndex = conceptWithVariation.variations.findIndex(v => v.id === id);
    if (variationIndex === -1) return;

    const variation = conceptWithVariation.variations[variationIndex];

    // Update local state
    setConcepts(prevConcepts => {
      return prevConcepts.map(concept => {
        if (concept.id === conceptWithVariation.id) {
          return {
            ...concept,
            variations: concept.variations.map(v => 
              v.id === id ? { ...v, notes } : v
            )
          };
        }
        return concept;
      });
    });

    // For API updates - currently we only support updating main images in the backend
    if (id === conceptWithVariation.id) {
      // Determine which type of note to update
      let noteType: 'reviseNote' | 'rejectNote';
      if (variation.revise) {
        noteType = 'reviseNote';
      } else if (variation.reject) {
        noteType = 'rejectNote';
      } else {
        return; // Don't update if neither revise nor reject is selected
      }

      // Debounced API call for main image
      debouncedUpdateNotes(id, notes, noteType);
    }
  };

  // Helper function to find which concept contains a given variation ID
  const findConceptByVariationId = (variationId: string): ImageConcept | undefined => {
    return concepts.find(concept => 
      concept.variations.some(variation => variation.id === variationId)
    );
  };

  // Helper function to handle variation selection
  const handleVariationSelect = (conceptId: string, variationId: string) => {
    setConcepts(prevConcepts => {
      return prevConcepts.map(concept => {
        if (concept.id === conceptId) {
          return {
            ...concept,
            selectedVariationId: variationId === concept.id ? undefined : variationId
          };
        }
        return concept;
      });
    });
  };

  const handleFullscreenChange = (imageId: string | null) => {
    setFullscreenImageId(imageId);
  };

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        {error}
      </div>
    );
  }

  // Convert concepts to ImageItems for backward compatibility with ImageCard
  const images: ImageItem[] = concepts.map(concept => {
    // Use first variation as the "main" image
    return convertToImageItem(concept);
  });

  return (
    <div className="container mx-auto px-4 bg-white">
      {/* Grid of images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {images.map((image, index) => (
          <ImageCard
            key={image.id}
            image={image}
            onSelect={handleSelect}
            onRevise={handleRevise}
            onReject={handleReject}
            onNotesChange={handleNotesChange}
            onVariationSelect={handleVariationSelect}
            hasNext={index < images.length - 1}
            hasPrevious={index > 0}
            onNext={index < images.length - 1 ? () => setFullscreenImageId(images[index + 1].id) : undefined}
            onPrevious={index > 0 ? () => setFullscreenImageId(images[index - 1].id) : undefined}
            isFullScreen={fullscreenImageId === image.id}
            onFullScreenChange={(isOpen) => handleFullscreenChange(isOpen ? image.id : null)}
            nextImageUrl={index < images.length - 1 ? images[index + 1].url : undefined}
            previousImageUrl={index > 0 ? images[index - 1].url : undefined}
          />
        ))}
      </div>
    </div>
  );
} 