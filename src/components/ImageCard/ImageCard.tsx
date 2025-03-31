'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ImageCollection, ImageType, LocalState } from './types';
import ImageMenu from './ImageMenu';
import ImageNotes from './ImageNotes';
import ImageVariations from './ImageVariations';
import ImageDisplay from './ImageDisplay';
import { preloadImage, preloadConceptImages, cleanupImageCache, isImageLoaded } from '../../utils/imageLoader';

// Define the type for an image variation - For compatibility with existing code
interface ImageVariation {
  id: string;
  url: string;
  notes?: string;
  selected: boolean;
  revise: boolean;
  reject: boolean;
}

// Define the type for an image item - For compatibility with existing code
interface ImageItem {
  id: string;
  conceptId: string;  // ID for the group of variations
  url: string;
  selected: boolean;
  revise: boolean;
  reject: boolean;
  notes?: string;
  variations: ImageVariation[];
  selectedVariation?: string;  // ID of the selected variation
}

interface ImageCardProps {
  image: ImageItem;
  onSelect: (id: string) => void;
  onRevise: (id: string) => void;
  onReject: (id: string) => void;
  onNotesChange: (id: string, notes: string) => void;
  onVariationSelect: (conceptId: string, variationId: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isFullScreen?: boolean;
  onFullScreenChange: (isOpen: boolean) => void;
  nextImageUrl?: string;
  previousImageUrl?: string;
}

// Fullscreen component with its own internal state
function FullscreenView({
  image,
  onSelect,
  onRevise,
  onReject,
  onNotesChange,
  onVariationSelect,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  onClose,
  nextImageUrl,
  previousImageUrl,
  localStates,
}: {
  image: ImageItem;
  onSelect: (id: string) => void;
  onRevise: (id: string) => void;
  onReject: (id: string) => void;
  onNotesChange: (id: string, notes: string) => void;
  onVariationSelect: (conceptId: string, variationId: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onClose: () => void;
  nextImageUrl?: string;
  previousImageUrl?: string;
  localStates: Record<string, LocalState>;
}) {
  const [imageLoaded, setImageLoaded] = useState(isImageLoaded(image.url));
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fullscreenLocalStates, setFullscreenLocalStates] = useState<Record<string, LocalState>>(localStates);
  
  // Update our local copy of the states when they change from parent
  useEffect(() => {
    setFullscreenLocalStates(localStates);
  }, [localStates]);
  
  // Local state for selected variation - independent from the grid view
  const [selectedVariation, setSelectedVariation] = useState<string | undefined>(image.selectedVariation);
  
  useEffect(() => {
    // When the image changes, reset to its current selected variation
    setSelectedVariation(image.selectedVariation);
  }, [image.id, image.selectedVariation]);
  
  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      try {
        // Preload the image and its variations
        await preloadConceptImages(
          image.id,
          image.url,
          image.variations || []
        );

        // Preload next and previous images if available
        if (hasNext && nextImageUrl) preloadImage(nextImageUrl);
        if (hasPrevious && previousImageUrl) preloadImage(previousImageUrl);

        if (isMounted) {
          setImageLoaded(true);
        }
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [image.id, image.url, image.variations, hasNext, hasPrevious, nextImageUrl, previousImageUrl]);
  
  // Handle wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const zoomFactor = 0.2;
    const newScale = Math.max(1, Math.min(4, scale + (delta > 0 ? zoomFactor : -zoomFactor)));
    
    if (newScale < scale) {
      const factor = (newScale - 1) / (scale - 1);
      setPosition({
        x: position.x * factor,
        y: position.y * factor
      });
    }
    
    setScale(newScale);
  };

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Get the current image based on local selectedVariation
  const getCurrentImage = (): ImageType => {
    if (selectedVariation) {
      const variation = image.variations.find(v => v.id === selectedVariation);
      if (variation) {
        return variation;
      }
    }
    return image;
  };
  
  const currentImage = getCurrentImage();
  
  // Get local state for the current image
  const getCurrentLocalState = (): LocalState => {
    const targetId = selectedVariation || image.id;
    return fullscreenLocalStates[targetId] || { selected: false, revise: false, reject: false };
  };
  
  const currentLocalState = getCurrentLocalState();

  // Handle variation selection locally
  const handleVariationSelect = (variationId: string) => {
    // Update our local state
    setSelectedVariation(variationId === image.id ? undefined : variationId);
    
    // Also tell the parent component, but it won't update the grid view in real-time
    onVariationSelect(image.conceptId, variationId);
  };
  
  // Handle select, revise, reject actions with toggling behavior
  const handleSelect = () => {
    const targetId = selectedVariation || image.id;
    
    // Toggle selected status
    const isCurrentlySelected = currentImage.selected || currentLocalState.selected;
    
    // Update local state based on toggle
    const updatedState = {
      ...fullscreenLocalStates,
      [targetId]: {
        selected: !isCurrentlySelected,
        revise: false,
        reject: false
      }
    };
    
    setFullscreenLocalStates(updatedState);
    onSelect(targetId);
  };

  const handleRevise = () => {
    const targetId = selectedVariation || image.id;
    
    // Toggle revise status
    const isCurrentlyRevise = currentImage.revise || currentLocalState.revise;
    
    // Update local state based on toggle
    const updatedState = {
      ...fullscreenLocalStates,
      [targetId]: {
        selected: false,
        revise: !isCurrentlyRevise,
        reject: false
      }
    };
    
    setFullscreenLocalStates(updatedState);
    onRevise(targetId);
  };

  const handleReject = () => {
    const targetId = selectedVariation || image.id;
    
    // Toggle reject status
    const isCurrentlyReject = currentImage.reject || currentLocalState.reject;
    
    // Update local state based on toggle
    const updatedState = {
      ...fullscreenLocalStates,
      [targetId]: {
        selected: false,
        revise: false,
        reject: !isCurrentlyReject
      }
    };
    
    setFullscreenLocalStates(updatedState);
    onReject(targetId);
  };

  // Handle notes change
  const handleNotesChange = (value: string) => {
    const targetId = selectedVariation || image.id;
    onNotesChange(targetId, value);
  };

  // Handle keyboard navigation for variations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        const currentIndex = selectedVariation 
          ? image.variations.findIndex(v => v.id === selectedVariation)
          : -1;
        
        if (currentIndex === -1) {
          // If we're on the main image, go to first variation
          if (image.variations.length > 0) {
            handleVariationSelect(image.variations[0].id);
          }
        } else if (currentIndex === image.variations.length - 1) {
          // If we're on last variation, go to main image
          handleVariationSelect(image.id);
        } else {
          // Go to next variation
          handleVariationSelect(image.variations[currentIndex + 1].id);
        }
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = selectedVariation 
          ? image.variations.findIndex(v => v.id === selectedVariation)
          : -1;
        
        if (currentIndex === -1) {
          // If we're on the main image and click previous, go to last variation
          if (image.variations.length > 0) {
            handleVariationSelect(image.variations[image.variations.length - 1].id);
          }
        } else if (currentIndex === 0) {
          // If we're on first variation, go to main image
          handleVariationSelect(image.id);
        } else {
          // Go to previous variation
          handleVariationSelect(image.variations[currentIndex - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image.variations, selectedVariation]);

  const hasVariations = image.variations.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onWheel={handleWheel}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative max-w-4xl w-full h-[90vh] flex flex-col">
        <div className="flex-grow flex items-start gap-4">
          {/* Menu in fullscreen view */}
          <div className={`flex-shrink-0 transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <ImageMenu
              isCurrentlySelected={currentImage.selected || currentLocalState.selected}
              isCurrentlyRevise={currentImage.revise || currentLocalState.revise}
              isCurrentlyReject={currentImage.reject || currentLocalState.reject}
              onSelect={handleSelect}
              onRevise={handleRevise}
              onReject={handleReject}
            />
          </div>

          {/* Image display in fullscreen */}
          <div className="flex-grow flex flex-col items-center">
            <div className="relative w-full max-w-4xl mx-auto">
              <ImageDisplay
                imageUrl={currentImage.url}
                hasNext={!!hasNext}
                hasPrevious={!!hasPrevious}
                onNext={onNext}
                onPrevious={onPrevious}
                scale={scale}
                position={position}
                isDragging={isDragging}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Variations in fullscreen */}
            {imageLoaded && hasVariations && (
              <div className="mt-6 w-full">
                <ImageVariations
                  mainImage={image}
                  variations={image.variations}
                  selectedId={selectedVariation || image.id}
                  onVariationSelect={handleVariationSelect}
                  localStates={fullscreenLocalStates}
                />
              </div>
            )}
          </div>
        </div>

        {/* Notes textarea in fullscreen */}
        <div className="h-[80px] flex items-center justify-center px-4 mt-4">
          <ImageNotes
            notes={currentImage.notes}
            isSelected={currentImage.selected || currentLocalState.selected}
            isRevise={currentImage.revise || currentLocalState.revise}
            isReject={currentImage.reject || currentLocalState.reject}
            onChange={handleNotesChange}
          />
        </div>
      </div>
    </div>
  );
}

export default function ImageCard({
  image,
  onSelect,
  onRevise,
  onReject,
  onNotesChange,
  onVariationSelect,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  isFullScreen,
  onFullScreenChange,
  nextImageUrl,
  previousImageUrl,
}: ImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(isImageLoaded(image.url));
  
  // Shared state for grid and fullscreen
  const [localStates, setLocalStates] = useState<Record<string, LocalState>>({});
  
  useEffect(() => {
    setImageLoaded(isImageLoaded(image.url));
  }, [image.url]);

  // Get the current image and state (only using the grid's selected variation)
  const getCurrentImage = (): ImageType => {
    if (image.selectedVariation) {
      const variation = image.variations.find(v => v.id === image.selectedVariation);
      if (variation) {
        return variation;
      }
    }
    return image;
  };

  const currentImage = getCurrentImage();
  
  // Get local state for the current image
  const getCurrentLocalState = (): LocalState => {
    const targetId = image.selectedVariation || image.id;
    return localStates[targetId] || { selected: false, revise: false, reject: false };
  };
  
  const currentLocalState = getCurrentLocalState();

  // Handle select, revise, reject actions with toggling behavior
  const handleSelect = () => {
    const targetId = image.selectedVariation || image.id;
    
    // Toggle selected status
    const isCurrentlySelected = currentImage.selected || currentLocalState.selected;
    
    // Update local state based on toggle
    const updatedState = {
      ...localStates,
      [targetId]: {
        selected: !isCurrentlySelected,
        revise: false,
        reject: false
      }
    };
    
    setLocalStates(updatedState);
    onSelect(targetId);
  };

  const handleRevise = () => {
    const targetId = image.selectedVariation || image.id;
    
    // Toggle revise status
    const isCurrentlyRevise = currentImage.revise || currentLocalState.revise;
    
    // Update local state based on toggle
    const updatedState = {
      ...localStates,
      [targetId]: {
        selected: false,
        revise: !isCurrentlyRevise,
        reject: false
      }
    };
    
    setLocalStates(updatedState);
    
    // Only open fullscreen if we're turning revise ON
    if (!isCurrentlyRevise && !isFullScreen) {
      onFullScreenChange(true);
    }
    
    onRevise(targetId);
  };

  const handleReject = () => {
    const targetId = image.selectedVariation || image.id;
    
    // Toggle reject status
    const isCurrentlyReject = currentImage.reject || currentLocalState.reject;
    
    // Update local state based on toggle
    const updatedState = {
      ...localStates,
      [targetId]: {
        selected: false,
        revise: false,
        reject: !isCurrentlyReject
      }
    };
    
    setLocalStates(updatedState);
    onReject(targetId);
  };

  // Determine if any variation has a status (for UI purposes)
  const hasVariations = image.variations.length > 0;

  return (
    <div className="relative">
      {/* Main image container - Grid View */}
      <div className="aspect-square group relative overflow-hidden">
        <div 
          id={`image-${image.id}`}
          className="w-full h-full cursor-pointer"
          onClick={() => onFullScreenChange(true)}
        >
          <img
            src={currentImage.url}
            alt="Generated content"
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Navigation arrows for variations in grid view */}
          {hasVariations && (
            <>
              {/* Previous arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = image.selectedVariation 
                    ? image.variations.findIndex(v => v.id === image.selectedVariation)
                    : -1;
                  
                  if (currentIndex === -1) {
                    // If we're on the main image and click previous, go to last variation
                    onVariationSelect(image.conceptId, image.variations[image.variations.length - 1].id);
                  } else if (currentIndex === 0) {
                    // If we're on first variation, go to main image
                    onVariationSelect(image.conceptId, image.id);
                  } else {
                    // Go to previous variation
                    onVariationSelect(image.conceptId, image.variations[currentIndex - 1].id);
                  }
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Next arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = image.selectedVariation 
                    ? image.variations.findIndex(v => v.id === image.selectedVariation)
                    : -1;
                  
                  if (currentIndex === -1) {
                    // If we're on the main image, go to first variation
                    onVariationSelect(image.conceptId, image.variations[0].id);
                  } else if (currentIndex === image.variations.length - 1) {
                    // If we're on last variation, go to main image
                    onVariationSelect(image.conceptId, image.id);
                  } else {
                    // Go to next variation
                    onVariationSelect(image.conceptId, image.variations[currentIndex + 1].id);
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Variation indicator dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Main image dot */}
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${!image.selectedVariation ? 'bg-white scale-125' : 'bg-white/50'}`} />
                {/* Variation dots */}
                {image.variations.map((variation) => (
                  <div 
                    key={variation.id}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${image.selectedVariation === variation.id ? 'bg-white scale-125' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Menu in grid view */}
          <div className="absolute top-2 left-2 z-30">
            <div className={`
              ${!currentImage.selected && !currentImage.revise && !currentImage.reject && 
                !currentLocalState.selected && !currentLocalState.revise && !currentLocalState.reject ? 
                'opacity-0 group-hover:opacity-100' : 'opacity-100'}
              transition-all duration-300
            `}>
              <ImageMenu
                isCurrentlySelected={currentImage.selected || currentLocalState.selected}
                isCurrentlyRevise={currentImage.revise || currentLocalState.revise}
                isCurrentlyReject={currentImage.reject || currentLocalState.reject}
                onSelect={handleSelect}
                onRevise={handleRevise}
                onReject={handleReject}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Completely separate fullscreen component with its own state */}
      {isFullScreen && (
        <FullscreenView
          image={image}
          onSelect={onSelect}
          onRevise={onRevise}
          onReject={onReject}
          onNotesChange={onNotesChange}
          onVariationSelect={onVariationSelect}
          onNext={onNext}
          onPrevious={onPrevious}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onClose={() => onFullScreenChange(false)}
          nextImageUrl={nextImageUrl}
          previousImageUrl={previousImageUrl}
          localStates={localStates}
        />
      )}
    </div>
  );
} 