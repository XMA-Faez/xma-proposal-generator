import React, { useState } from "react";
import {
  calculateDiscountedPrice,
  formatPrice,
  parsePrice,
  Discount,
} from "@/lib/proposalUtils";

interface PackageDisplayProps {
  selectedPackageIndex?: number | null;
  selectedPackage?: any; // Package snapshot
  discount: Discount;
  onDiscountChange: (value: number, type: "percentage" | "absolute") => void;
  includePackage?: boolean;
}

const PackageDisplay: React.FC<PackageDisplayProps> = ({
  selectedPackageIndex,
  selectedPackage,
  discount,
  onDiscountChange,
  includePackage = true,
}) => {
  const [showAllPackages, setShowAllPackages] = useState(false);

  if (!includePackage || (!selectedPackage && selectedPackageIndex === null)) {
    return null;
  }

  // If we have the package snapshot, use it directly
  if (selectedPackage) {
    // Parse the price string or number to a number
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
            {showAllPackages ? "Hide Details" : "Show Details"}
          </button>
        </div>

        <div className="bg-zinc-900 p-6 rounded-lg mb-6">
          <div className="flex flex-wrap justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">
                {selectedPackage.name} Package
              </h3>
              {selectedPackage.is_popular && (
                <div className="inline-block bg-red-600/20 text-red-400 text-xs font-medium px-2 py-1 rounded mt-1">
                  Most Popular
                </div>
              )}
              <p className="text-zinc-400 mt-2 max-w-xl">
                {selectedPackage.description}
              </p>
            </div>
            <div className="text-right mt-2 md:mt-0">
              {discount.value > 0 && (
                <div className="text-lg line-through text-zinc-500">
                  {formatPrice(originalPrice)} {selectedPackage.currency}
                </div>
              )}
              <div className="text-2xl font-bold flex items-center justify-end">
                {formatPrice(discountedPrice)} {selectedPackage.currency}
                {discount.value > 0 && (
                  <span className="ml-2 text-sm font-normal bg-green-900/30 text-green-400 px-2 py-1 rounded">
                    {discount.type === "percentage"
                      ? `${discount.value}% OFF`
                      : `-${formatPrice(discount.value)} ${selectedPackage.currency}`}
                  </span>
                )}
              </div>
              {selectedPackage.usd_price && (
                <div className="text-sm text-zinc-400">
                  ${formatPrice(selectedPackage.usd_price)} USD
                </div>
              )}
            </div>
          </div>

          {showAllPackages && (
            <div className="mt-6">
              {selectedPackage.features && Array.isArray(selectedPackage.features) && selectedPackage.features.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <span className={typeof feature === 'string' ? '' : (feature.is_bold ? "font-medium" : "")}>
                        {typeof feature === 'string' ? feature : feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-zinc-400 py-4 bg-zinc-700/50 rounded">
                  No additional details available for this package.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // If we don't have the package snapshot, show limited info
  return (
    <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-red-500">Selected Package</h2>
      <div className="bg-zinc-900 p-5 rounded-lg">
        <div className="text-center text-zinc-400 py-4">
          Package information is not stored in this proposal's format.
        </div>
      </div>
    </div>
  );
};

export default PackageDisplay;
