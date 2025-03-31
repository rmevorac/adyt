'use client';

import React from 'react';
import Link from 'next/link';

export default function TopNavigation() {
  return (
    <nav className="sticky top-0 w-full bg-white z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center space-x-12">
        <Link 
          href="/" 
          className="text-lg font-medium text-gray-800 hover:text-gray-800 transition-colors relative group"
        >
          <span>The Darkroom</span>
          <span className="absolute h-0.5 bg-gray-800 left-1/2 right-1/2 -bottom-1 group-hover:left-0 group-hover:right-0 transition-all duration-300 ease-out"></span>
        </Link>

        <Link 
          href="/lab" 
          className="text-lg font-medium text-gray-800 hover:text-gray-800 transition-colors relative group"
        >
          <span>Lab</span>
          <span className="absolute h-0.5 bg-gray-800 left-1/2 right-1/2 -bottom-1 group-hover:left-0 group-hover:right-0 transition-all duration-300 ease-out"></span>
        </Link>
      </div>
    </nav>
  );
} 