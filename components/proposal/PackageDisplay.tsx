import React, { useState } from 'react';
import { packages } from '@/data/proposalData';
import { calculateDiscountedPrice, formatPrice, parsePrice, Discount } from '@/lib/proposalUtils';
import DiscountControl from './DiscountControl';

interface PackageDisplayProps {
  selectedPackageIndex: number | null;
  discount: Discount;
  onDiscountChange: (value: number, type: 'percentage' | 'absolute') => void;
  includePackage?: boolean;
}

const PackageDisplay: React.FC<PackageDisplayProps> = ({
  selectedPackageIndex,
  discount,
  onDiscountChange,
  includePackage = true
}) => {
  const [showAllPackages, setShowAllPackages] = useState(false);
  
  if (!includePackage || selectedPackageIndex === null) {
    return null;
  }
  
  // Safety check for invalid package index
  if (selectedPackageIndex < 0 || selectedPackageIndex >= packages.length) {
    return (
      <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
        <div className="text-red-500">Invalid package selection</div>
      </div>
    );
  }
  
  const selectedPackage = packages[selectedPackageIndex];
  
  // Parse the price string to a number
  const originalPrice = parsePrice(selectedPackage.price);
  
  // Calculate discounted price
  const discountedPrice = calculateDiscountedPrice(originalPrice, discount);

  return (
    <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-red-500">Selected Package</h2>
        <button 
          onClick={() => setShowAllPackages(!showAllPackages)}
          className="text-sm bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded text-zinc-300 transition-colors"
        >
          {showAllPackages ? 'Hide Options' : 'Show All Packages'}
        </button>
      </div>
      
      {showAllPackages ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {packages.map((pkg, index) => (
            <div 
              key={index}
              className={`bg-zinc-900 p-5 rounded-lg border-2 transition-all ${
                index === selectedPackageIndex 
                  ? 'border-red-500 shadow-lg' 
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${pkg.popular ? 'text-red-500' : ''}`}>
                    {pkg.name} Package
                  </h3>
                  
                  {pkg.popular && (
                    <div className="inline-block bg-red-600/20 text-red-400 text-xs font-medium px-2 py-1 rounded mt-1">
                      Most Popular
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    {pkg.price} {pkg.currency}
                  </div>
                  <div className="text-sm text-zinc-400">
                    ${pkg.usdPrice} USD
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-zinc-400 mb-4">
                {pkg.description}
              </p>
              
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Key Features:</div>
                <ul className="space-y-2">
                  {pkg.features.slice(0, 3).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={feature.bold ? "font-medium" : ""}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 p-6 rounded-lg mb-6">
          <div className="flex flex-wrap justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">
                {selectedPackage.name} Package
              </h3>
              {selectedPackage.popular && (
                <div className="inline-block bg-red-600/20 text-red-400 text-xs font-medium px-2 py-1 rounded mt-1">
                  Most Popular
                </div>
              )}
              <p className="text-zinc-400 mt-2 max-w-xl">
                {selectedPackage.description}
              </p>
            </div>
            <div className="text-right mt-2 md:mt-0">
              {discount > 0 && (
                <div className="text-lg line-through text-zinc-500">
                  {selectedPackage.price} {selectedPackage.currency}
                </div>
              )}
              <div className="text-2xl font-bold flex items-center justify-end">
                {formatPrice(discountedPrice)} {selectedPackage.currency}
                {discount > 0 && (
                  <span className="ml-2 text-sm font-normal bg-green-900/30 text-green-400 px-2 py-1 rounded">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <div className="text-sm text-zinc-400">
                ${selectedPackage.usdPrice} USD
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {selectedPackage.features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className={feature.bold ? "font-medium" : ""}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Discount is now shown in summary section */}
    </div>
  );
};

export default PackageDisplay;
