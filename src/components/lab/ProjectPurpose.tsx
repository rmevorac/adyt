'use client';

import React, { useState, useEffect } from 'react';

interface ProjectPurposeProps {
  purpose: string;
  onChange: (value: string) => void;
}

export default function ProjectPurpose({ purpose, onChange }: ProjectPurposeProps) {
  const [customFocus, setCustomFocus] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const purposes = [
    'Instagram',
    'TikTok',
    'Website',
    'Ad Campaign',
    'Print',
    'Other'
  ];

  // Extract custom value from purpose if it starts with "Other:"
  useEffect(() => {
    if (purpose.startsWith('Other:')) {
      setCustomFocus(purpose.substring(6).trim());
      setIsOtherSelected(true);
    } else {
      setIsOtherSelected(purpose === 'Other');
      if (purpose !== 'Other') {
        setCustomFocus('');
      }
    }
  }, [purpose]);

  // Handle dropdown change
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue !== 'Other' && customFocus) {
      setCustomFocus('');
    }
  };

  // Handle custom focus change
  const handleCustomFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomFocus(value);
    
    // Update the full purpose value
    if (value.trim() !== '') {
      onChange(`Other: ${value}`);
    } else {
      onChange('Other');
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-medium mb-4 text-gray-800">What&apos;s the focus?</h2>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-1/2">
          <select
            value={purpose.startsWith('Other:') ? 'Other' : purpose}
            onChange={handleSelectChange}
            className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-3 px-4 pr-10 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="" disabled>Choose a style...</option>
            {purposes.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        
        {isOtherSelected && (
          <div className="w-full md:w-1/2">
            <input
              type="text"
              value={customFocus}
              onChange={handleCustomFocusChange}
              placeholder="Please specify..."
              className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        )}
      </div>
    </div>
  );
} 