'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface StyleOption {
  id: string;
  label: string;
  imageSrc?: string;
  bgColor?: string;
}

interface VisualStyleProps {
  options: StyleOption[];
  selected: string | null;
  onChange: (id: string | null) => void;
}

export default function VisualStyle({ options, selected, onChange }: VisualStyleProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure hydration issues are avoided by only enabling hover effects after client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click on an option
  const handleOptionClick = (optionId: string) => {
    // If already selected, deselect it
    if (selected === optionId) {
      onChange(null);
    } else {
      onChange(optionId);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-medium mb-4 text-gray-800">Choose a style</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
        {options.map((option) => {
          const isSelected = selected === option.id;
          const isHovered = mounted && hoveredId === option.id;
          
          return (
            <div 
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              onMouseEnter={() => mounted && setHoveredId(option.id)}
              onMouseLeave={() => mounted && setHoveredId(null)}
              className={`
                relative cursor-pointer overflow-hidden
                h-64 transition-all duration-200
                ${option.bgColor || 'bg-gray-100'}
                ${isSelected ? 'outline outline-2 outline-blue-500 z-10' : 'outline outline-1 outline-gray-200'}
              `}
            >
              {option.imageSrc ? (
                <div className="relative w-full h-full">
                  <Image
                    src={option.imageSrc}
                    alt={option.label}
                    fill
                    className="object-cover"
                  />
                  {/* Overlay */}
                  <div 
                    className={`
                      absolute inset-0 flex flex-col justify-center items-center p-4 transition-all duration-200
                      ${isHovered && !isSelected ? 'backdrop-blur-sm bg-black/20' : ''}
                      ${isSelected ? 'backdrop-blur-sm bg-blue-500/20' : ''}
                    `}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-blue-500 text-white p-1 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                    
                    {/* Label */}
                    <div className={`
                      text-center transition-opacity duration-200
                      ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}
                    `}>
                      <span className="text-white font-medium text-lg">{option.label}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Overlay for hover */}
                  <div className={`
                    absolute inset-0 transition-all duration-200
                    ${isHovered && !isSelected ? 'backdrop-blur-sm bg-black/20' : ''}
                    ${isSelected ? 'backdrop-blur-sm bg-blue-500/20' : ''}
                  `}></div>
                  
                  <span className={`
                    text-center font-medium text-lg relative z-10
                    transition-opacity duration-200 text-white
                    ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}
                  `}>
                    {option.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 