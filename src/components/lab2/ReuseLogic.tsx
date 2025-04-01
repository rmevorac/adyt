'use client';

import React from 'react';

interface ReuseOption {
  id: string;
  label: string;
}

interface ReuseLogicProps {
  selected: string | null;
  onChange: (id: string) => void;
}

export default function ReuseLogic({ selected, onChange }: ReuseLogicProps) {
  const options: ReuseOption[] = [
    { id: 'same_style', label: 'Same style as last project' },
    { id: 'new_concept', label: 'Same style but new concept' },
    { id: 'remix', label: 'Remix a past batch' }
  ];

  return (
    <div className="w-full">
      <h2 className="text-xl font-medium mb-4 text-gray-800">Reuse/remix logic</h2>
      
      <div className="flex flex-col md:flex-row gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`
              px-4 py-3 rounded-lg border transition-all duration-200
              ${selected === option.id
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
} 