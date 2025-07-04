"use client";

import React from "react";
import PackageCard from "./PackageCard";

interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  usd_price: number;
  is_popular?: boolean;
  description: string;
  features: any[];
}

interface PackageSelectionProps {
  packages: Package[];
  selectedPackageId: string | null;
  setSelectedPackageId: (id: string) => void;
  includePackage: boolean;
  setIncludePackage: (include: boolean) => void;
}

const PackageSelection: React.FC<PackageSelectionProps> = ({
  packages,
  selectedPackageId,
  setSelectedPackageId,
  includePackage,
  setIncludePackage,
}) => {
  return (
    <div className="bg-zinc-900 rounded-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Select Package
        </h2>
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includePackage}
              onChange={() => setIncludePackage(!includePackage)}
              className="sr-only"
            />
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${includePackage ? "bg-red-500" : "bg-zinc-700"}`}
            >
              <div
                className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${includePackage ? "translate-x-5" : ""}`}
              />
            </div>
            <span className="ml-2 text-sm text-zinc-300">
              Include Package
            </span>
          </label>
        </div>
      </div>

      {includePackage && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isSelected={selectedPackageId === pkg.id}
              onSelect={setSelectedPackageId}
            />
          ))}
        </div>
      )}

      {!includePackage && (
        <div className="bg-zinc-900 p-6 rounded-lg text-center">
          <p className="text-zinc-400">
            Package selection is disabled. You can add additional
            services below.
          </p>
        </div>
      )}
    </div>
  );
};

export default PackageSelection;
