'use client';

import React from 'react';
import { ImageMenuProps } from './types';

export default function ImageMenu({
  isCurrentlySelected,
  isCurrentlyRevise,
  isCurrentlyReject,
  onSelect,
  onRevise,
  onReject,
  className = '',
}: ImageMenuProps) {
  // Determine which icon to show in the static circle
  const getStaticIcon = () => {
    if (isCurrentlySelected) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    } else if (isCurrentlyRevise) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
    } else if (isCurrentlyReject) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  return (
    <div className={`group/menu image-menu-container ${className}`}>
      {/* Circle that expands on hover */}
      <div className={`
        bg-white/40 transition-all duration-300 ease-out
        w-8 h-8 group-hover/menu:h-[120px] group-hover/menu:w-8
        rounded-full
        relative overflow-hidden
        shadow-md
        origin-top
        border border-gray-200/20
        group-hover/menu:bg-white/40
      `}>
        {/* Static circle with icon */}
        <div className={`
          w-8 h-8 flex items-center justify-center
          ${!isCurrentlySelected && !isCurrentlyRevise && !isCurrentlyReject 
            ? 'group-hover/menu:opacity-0' : 'group-hover/menu:opacity-0'}
          transition-opacity duration-200
        `}>
          {getStaticIcon()}
        </div>

        {/* Menu items */}
        <div className={`
          absolute top-0 left-0 w-full h-full
          opacity-0 group-hover/menu:opacity-100
          invisible group-hover/menu:visible
          flex flex-col justify-evenly py-2
        `}>
          {/* Select Button */}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect();
            }}
            className="h-8 w-full flex items-center justify-center cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`
              h-4 w-4 transition-opacity duration-200
              ${isCurrentlySelected ? 'opacity-100 text-gray-800' : 'opacity-50 hover:opacity-100 text-gray-800'}
            `} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Revise Button */}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRevise();
            }}
            className="h-8 w-full flex items-center justify-center cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`
              h-4 w-4 transition-opacity duration-200
              ${isCurrentlyRevise ? 'opacity-100 text-gray-800' : 'opacity-50 hover:opacity-100 text-gray-800'}
            `} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          
          {/* Reject Button */}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReject();
            }}
            className="h-8 w-full flex items-center justify-center cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`
              h-4 w-4 transition-opacity duration-200
              ${isCurrentlyReject ? 'opacity-100 text-gray-800' : 'opacity-50 hover:opacity-100 text-gray-800'}
            `} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
} 