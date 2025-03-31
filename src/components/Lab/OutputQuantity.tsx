'use client';

import React from 'react';

interface OutputQuantityProps {
  quantity: number;
  onChange: (quantity: number) => void;
  pricePerImage: number;
}

export default function OutputQuantity({ quantity, onChange, pricePerImage }: OutputQuantityProps) {
  // Calculate the total price
  const totalPrice = quantity * pricePerImage;
  
  // Format numbers for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-medium mb-4 text-gray-800">Output Quantity + Pricing</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Images
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => onChange(Math.max(1, quantity - 1))}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-10 w-10 rounded-l-lg border border-gray-200 flex items-center justify-center transition-colors"
                disabled={quantity <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-10 text-center w-16 border-t border-b border-gray-200 text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-300"
              />
              <button
                type="button"
                onClick={() => onChange(quantity + 1)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-10 w-10 rounded-r-lg border border-gray-200 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 md:text-right">
            <div className="text-sm text-gray-500 mb-1">Price per image</div>
            <div className="text-gray-700">{formatPrice(pricePerImage)}</div>
          </div>
          
          <div className="flex-1 md:text-right">
            <div className="text-sm text-gray-500 mb-1">Total price</div>
            <div className="text-lg font-semibold text-gray-900">{formatPrice(totalPrice)}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 