'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ConceptCardProps {
  id: string;
  index: number;
  totalConcepts: number;
  onRemove: (id: string) => void;
  onChange: (id: string, data: ConceptData) => void;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

export interface ConceptData {
  images: string[];
  inspoLinks: string[];
  notes: string;
  name?: string;
}

export default function ConceptCard({ id, index, totalConcepts, onRemove, onChange, isExpanded, onToggleExpand }: ConceptCardProps) {
  const [data, setData] = useState<ConceptData>({
    images: [],
    inspoLinks: [''],
    notes: '',
    name: `Concept #${index}`
  });
  const [conceptName, setConceptName] = useState(`Concept #${index}`);
  const [isEditingName, setIsEditingName] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [urlErrors, setUrlErrors] = useState<{ [key: number]: string }>({});
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Ensure hydration consistency by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (newData: Partial<ConceptData>) => {
    const updated = { ...data, ...newData };
    setData(updated);
    onChange(id, updated);
  };

  const addEmptyInspoLink = () => {
    handleChange({ inspoLinks: [...data.inspoLinks, ''] });
  };

  const updateInspoLink = (index: number, value: string) => {
    const newLinks = [...data.inspoLinks];
    newLinks[index] = value;
    handleChange({ inspoLinks: newLinks });
    
    // Clear error when user starts typing
    if (urlErrors[index]) {
      const newErrors = { ...urlErrors };
      delete newErrors[index];
      setUrlErrors(newErrors);
    }
  };

  const validateUrl = (index: number) => {
    const url = data.inspoLinks[index];
    if (!url) return;
    
    try {
      // Add http:// prefix if missing
      let validUrl = url;
      if (!/^https?:\/\//i.test(validUrl)) {
        validUrl = 'http://' + validUrl;
        // Update the URL with the prefix
        const newLinks = [...data.inspoLinks];
        newLinks[index] = validUrl;
        handleChange({ inspoLinks: newLinks });
      }
      
      new URL(validUrl);
      // Clear any errors
      if (urlErrors[index]) {
        const newErrors = { ...urlErrors };
        delete newErrors[index];
        setUrlErrors(newErrors);
      }
    } catch {
      setUrlErrors(prev => ({ ...prev, [index]: 'Please enter a valid URL' }));
    }
  };

  const removeInspoLink = (index: number) => {
    const updatedLinks = [...data.inspoLinks];
    updatedLinks.splice(index, 1);
    handleChange({ inspoLinks: updatedLinks });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsUploading(true);
      try {
        await handleFiles(e.dataTransfer.files);
      } catch (error) {
        console.error('Error handling dropped files:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        await handleFiles(e.target.files);
      } catch (error) {
        console.error('Error handling files:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFiles = async (files: FileList) => {
    // Get project name and user ID for better image naming
    const projectName = localStorage.getItem('currentProjectName') || '';
    const userId = localStorage.getItem('userId') || '';
    
    // Convert Files to base64 and upload them
    const uploads = Array.from(files).map(async (file) => {
      if (file.type.startsWith('image/')) {
        // Read file as base64
        const base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        
        try {
          // Upload to server
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              image: base64Image,
              projectName,
              userId 
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload image');
          }
          
          const { url } = await response.json();
          return url; // Return the permanent URL from the server
        } catch (error) {
          console.error('Error uploading image:', error);
          // Fallback to blob URL for preview only
          const imageUrl = URL.createObjectURL(file);
          return imageUrl;
        }
      }
      return null;
    });
    
    // Wait for all uploads to complete
    const newImageUrls = (await Promise.all(uploads)).filter(Boolean) as string[];
    
    // Add new images to existing ones
    const newImages = [...data.images, ...newImageUrls];
    handleChange({ images: newImages });
  };

  // Save concept name
  const saveName = () => {
    setIsEditingName(false);
    handleChange({ name: conceptName });
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center">
          {isEditingName ? (
            <div className="flex items-center">
              <input
                type="text"
                value={conceptName}
                onChange={(e) => setConceptName(e.target.value)}
                className="font-medium text-gray-800 mr-2 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
                onFocus={(e) => e.target.select()}
                onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
              />
              <button 
                onClick={saveName}
                className="text-blue-500 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <h3 
              className="font-medium text-gray-800 cursor-pointer hover:text-blue-500 flex items-center"
              onClick={() => setIsEditingName(true)}
            >
              {data.name || `Concept #${index}`}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </h3>
          )}
          
          {/* Expand/collapse button */}
          <button
            type="button"
            onClick={() => onToggleExpand(id)}
            className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {totalConcepts > 1 && (
          <button 
            onClick={() => onRemove(id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Collapsible content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Image Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center
              transition-colors cursor-pointer min-h-[160px]
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
              ${isUploading ? 'opacity-70 pointer-events-none' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-blue-500 text-sm">Uploading images...</p>
              </div>
            ) : data.images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 w-full">
                {data.images.map((url, index) => (
                  <div key={index} className="aspect-square relative rounded overflow-hidden">
                    <Image
                      src={url}
                      alt={`Concept image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newImages = [...data.images];
                        newImages.splice(index, 1);
                        handleChange({ images: newImages });
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="aspect-square flex items-center justify-center border border-gray-200 rounded bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 text-sm text-center">
                  Drag and drop images here, or click to browse
                </p>
              </>
            )}
          </div>
          
          {/* Inspo Links */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Inspo Links
              </label>
              <button
                type="button"
                onClick={addEmptyInspoLink}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                + Add URL
              </button>
            </div>
            
            {/* All URL inputs */}
            <div className="space-y-2">
              {data.inspoLinks.map((url, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => updateInspoLink(index, e.target.value)}
                      onBlur={() => validateUrl(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          validateUrl(index);
                          if (index === data.inspoLinks.length - 1 && url.trim()) {
                            addEmptyInspoLink();
                          }
                        }
                      }}
                      placeholder="Enter a URL"
                      className={`
                        flex-1 w-full px-3 py-2 border rounded-md text-sm
                        focus:outline-none focus:ring-1 focus:ring-blue-500
                        ${urlErrors[index] ? 'border-red-500' : 'border-gray-300'}
                      `}
                    />
                    {data.inspoLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInspoLink(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {urlErrors[index] && (
                    <p className="text-red-500 text-xs mt-1">{urlErrors[index]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label htmlFor={`notes-${id}`} className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id={`notes-${id}`}
              value={data.notes}
              onChange={(e) => handleChange({ notes: e.target.value })}
              placeholder="Add any notes about this concept..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
} 