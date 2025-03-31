'use client';

import React from 'react';
import { ImageVariationsProps, ImageType, LocalState } from './types';

export default function ImageVariations({
  mainImage,
  variations,
  selectedId,
  onVariationSelect,
  localStates
}: ImageVariationsProps) {
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

  return (
    <div className="flex gap-2 justify-center">
      {/* Main image tile */}
      <div
        onClick={() => onVariationSelect(mainImage.id)}
        className={`
          flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 relative cursor-pointer
          ${selectedId === mainImage.id ? 'w-20 h-20 border-white' : 'w-16 h-16 border-transparent hover:border-white/50'}
        `}
      >
        {/* Status indicator */}
        {hasStatus(mainImage, localStates[mainImage.id]) && (
          <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white/40 flex items-center justify-center">
            {getStatusIcon(mainImage, localStates[mainImage.id])}
          </div>
        )}
        <img
          src={mainImage.url}
          alt="Original"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Variations */}
      {variations.map((variation) => (
        <div
          key={variation.id}
          onClick={() => onVariationSelect(variation.id)}
          className={`
            flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 relative cursor-pointer
            ${selectedId === variation.id ? 'w-20 h-20 border-white' : 'w-16 h-16 border-transparent hover:border-white/50'}
          `}
        >
          {/* Status indicator */}
          {hasStatus(variation, localStates[variation.id]) && (
            <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white/40 flex items-center justify-center">
              {getStatusIcon(variation, localStates[variation.id])}
            </div>
          )}
          <img
            src={variation.url}
            alt={`Variation ${variation.id}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
} 