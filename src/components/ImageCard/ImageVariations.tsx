'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { ImageVariationsProps, ImageType, LocalState } from './types';

export default function ImageVariations({
  mainImage,
  variations,
  selectedId,
  onVariationSelect,
  localStates
}: ImageVariationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);
  
  // Scroll to selected variation whenever it changes
  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const selectedElement = selectedRef.current;
      
      // Calculate scroll position to center the element
      const scrollPosition = selectedElement.offsetLeft + 
        (selectedElement.offsetWidth / 2) - 
        (container.offsetWidth / 2);
        
      // Smooth scroll to the position
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedId]);

  // Helper function to get status icon based on image status
  const getStatusIcon = (image: ImageType, localState?: LocalState) => {
    if (image.selected || localState?.selected) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (image.revise || localState?.revise) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      );
    }
    
    if (image.reject || localState?.reject) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Return null if no status
    return null;
  };

  // Check if an image has any status set
  const hasStatus = (image: ImageType, localState?: LocalState) => {
    return (
      image.selected || image.revise || image.reject ||
      localState?.selected || localState?.revise || localState?.reject
    );
  };
  
  // Use all variations including what was previously the "main image"
  // mainImage is now just the currently displayed variation
  const allVariations = variations;

  return (
    <div ref={containerRef} className="flex gap-3 justify-center items-center w-full h-full">
      {/* Render all variations, treating them equally */}
      {allVariations.map((variation, index) => {
        const isSelected = selectedId === variation.id;
        return (
          <div
            key={`variation-${index}-${variation.id}`}
            ref={isSelected ? selectedRef : null}
            onClick={() => onVariationSelect(variation.id)}
            className={`
              flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 relative cursor-pointer
              ${isSelected ? 'border-white shadow-md shadow-white/30' : 'border-transparent hover:border-white/50'}
            `}
            style={{
              width: isSelected ? '74px' : '60px',
              height: isSelected ? '74px' : '60px'
            }}
          >
            {/* Status indicator */}
            {hasStatus(variation, localStates[variation.id]) && (
              <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white/40 flex items-center justify-center z-10">
                {getStatusIcon(variation, localStates[variation.id])}
              </div>
            )}
            <div className="relative w-full h-full">
              <Image
                src={variation.url}
                alt={`Variation ${variation.id}`}
                fill
                className="object-cover"
                unoptimized // Since we're dealing with dynamically generated images
              />
            </div>
          </div>
        );
      })}
    </div>
  );
} 