'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageDisplayProps } from './types';

export default function ImageDisplay({
  imageUrl,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  scale,
  position,
  isDragging,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onLoad
}: ImageDisplayProps) {
  const [showArrows, setShowArrows] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  // Debug: console log when image URL changes
  useEffect(() => {
    console.log('ImageDisplay rendering with URL:', imageUrl);
    setImgLoading(true);
    setImgError(false);
  }, [imageUrl]);

  // This will be triggered by parent component's menu hover
  const handleMenuHover = () => {
    setShowArrows(false);
  };

  // Reset when mouse leaves menu
  const handleMenuLeave = () => {
    setShowArrows(true);
  };

  // Add event listeners to document to detect menu hover
  React.useEffect(() => {
    const menuElement = document.querySelector('.image-menu-container');
    
    if (menuElement) {
      menuElement.addEventListener('mouseenter', handleMenuHover);
      menuElement.addEventListener('mouseleave', handleMenuLeave);
    }
    
    return () => {
      if (menuElement) {
        menuElement.removeEventListener('mouseenter', handleMenuHover);
        menuElement.removeEventListener('mouseleave', handleMenuLeave);
      }
    };
  }, []);
  
  // Handle image error
  const handleImageError = () => {
    console.error('Failed to load image:', imageUrl);
    setImgError(true);
    setImgLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', imageUrl);
    setImgLoading(false);
    onLoad?.();
  };

  // Prevent scroll on the entire document when in fullscreen
  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      // Only prevent default when the fullscreen view is active
      if (document.querySelector('.fixed.inset-0.bg-black\\/40')) {
        e.preventDefault();
      }
    };
    
    // Add the wheel event listener to the document
    document.addEventListener('wheel', preventScroll, { passive: false });
    
    // Clean up
    return () => {
      document.removeEventListener('wheel', preventScroll);
    };
  }, []);

  const handleWheelEvent = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWheel?.(e);
  };

  return (
    <div className="w-full h-full flex justify-center items-center overflow-hidden relative">
      {/* Previous arrow with centered, smaller click area */}
      {hasPrevious && showArrows && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious?.();
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[25vh] w-[60px] flex items-center justify-start group z-10"
        >
          <div className="text-white/50 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      )}

      {/* Next arrow with centered, smaller click area */}
      {hasNext && showArrows && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[25vh] w-[60px] flex items-center justify-end group z-10"
        >
          <div className="text-white/50 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      )}

      {/* Loading indicator */}
      {imgLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      <div 
        className="w-full h-full flex items-center justify-center image-container"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={handleWheelEvent}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <div className="relative w-full h-full">
          {imgError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
              Could not load image
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Generated content"
                className="max-h-full max-w-full object-contain select-none"
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  transition: isDragging ? 'none' : 'transform 0.05s',
                }}
                draggable={false}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 