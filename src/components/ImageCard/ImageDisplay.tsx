'use client';

import React from 'react';
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
  return (
    <div className="w-full flex justify-center overflow-hidden">
      {/* Previous arrow with centered, smaller click area */}
      {hasPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious?.();
          }}
          className="absolute left-[-60px] top-1/2 -translate-y-1/2 h-[25vh] w-[60px] flex items-center justify-start group"
        >
          <div className="text-white/50 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      )}

      {/* Next arrow with centered, smaller click area */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          className="absolute right-[-60px] top-1/2 -translate-y-1/2 h-[25vh] w-[60px] flex items-center justify-end group"
        >
          <div className="text-white/50 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      )}

      <div 
        className="relative max-h-[65vh] flex items-center justify-center"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={imageUrl}
          alt="Generated content"
          className="max-w-full max-h-[65vh] object-contain select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.05s',
          }}
          draggable={false}
          onLoad={onLoad}
        />
      </div>
    </div>
  );
} 