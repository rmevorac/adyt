'use client';

import React, { useRef, useEffect } from 'react';
import { ImageNotesProps } from './types';

export default function ImageNotes({
  notes,
  isSelected,
  isRevise,
  isReject,
  onChange
}: ImageNotesProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea when revise mode is activated
  useEffect(() => {
    if (isRevise && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isRevise]);

  // Get the appropriate placeholder text based on the current state
  const getPlaceholder = () => {
    if (isSelected) {
      return "What do you like about this image?";
    } else if (isRevise) {
      return "What would you like changed?";
    } else {
      return "Why doesn't this work for you?";
    }
  };

  return (
    <div className={`
      w-full max-w-3xl mx-auto transition-opacity duration-200
      ${(isSelected || isRevise || isReject) ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `}>
      <textarea
        ref={textareaRef}
        value={notes || ''}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getPlaceholder()}
        className="w-full p-3 rounded-md bg-white/10 text-white placeholder-white/60 resize-none border border-white/20 focus:outline-none focus:border-white/40"
        rows={2}
      />
    </div>
  );
} 