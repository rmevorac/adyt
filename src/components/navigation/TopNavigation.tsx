'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function TopNavigation() {
  const pathname = usePathname();
  
  return (
    <nav className="sticky top-0 w-full bg-white z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo as home button */}
        <Link href="/" className="flex items-center transition-transform hover:scale-105">
          <Image
            src="/platform_images/adyt_logo.svg"
            alt="Adyt Logo"
            width={60}
            height={60}
            className="mr-2"
            priority
          />
        </Link>

        {/* Navigation links centered */}
        <div className="flex items-center justify-center space-x-12">
          <Link 
            href="/darkroom" 
            className={`text-lg font-medium text-gray-800 hover:text-gray-800 transition-colors relative group ${pathname === '/darkroom' ? 'font-semibold' : ''}`}
          >
            <span>The Darkroom</span>
            <span className={`absolute h-0.5 bg-gray-800 left-1/2 right-1/2 -bottom-1 transform origin-center group-hover:left-0 group-hover:right-0 transition-all duration-300 ease-in-out ${pathname === '/darkroom' ? '!left-0 !right-0' : ''}`}></span>
          </Link>

          <Link 
            href="/lab" 
            className={`text-lg font-medium text-gray-800 hover:text-gray-800 transition-colors relative group ${pathname === '/lab' ? 'font-semibold' : ''}`}
          >
            <span>Lab</span>
            <span className={`absolute h-0.5 bg-gray-800 left-1/2 right-1/2 -bottom-1 transform origin-center group-hover:left-0 group-hover:right-0 transition-all duration-300 ease-in-out ${pathname === '/lab' ? '!left-0 !right-0' : ''}`}></span>
          </Link>
        </div>
        
        {/* Empty div for balance */}
        <div style={{ width: '60px' }}></div>
      </div>
    </nav>
  );
} 