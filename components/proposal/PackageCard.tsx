"use client";

import React from "react";
import { formatPrice } from "@/lib/proposalUtils";

interface Feature {
  text: string;
  is_included: boolean;
  is_bold?: boolean;
  order_index: number;
}

interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  usd_price: number;
  is_popular?: boolean;
  description: string;
  features: Feature[];
}

interface PackageCardProps {
  pkg: Package;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, isSelected, onSelect }) => (
  <div
    className={`flex flex-col h-full rounded-xl border ${
      isSelected ? "border-red-500 shadow-lg" : "border-zinc-700"
    } ${
      pkg.is_popular && !isSelected ? "border-zinc-600" : ""
    } ${
      isSelected ? "bg-zinc-800" : "bg-zinc-800/50 opacity-70"
    } backdrop-blur-sm transition-all hover:shadow-xl cursor-pointer ${
      !isSelected ? "hover:opacity-90" : ""
    }`}
    onClick={() => onSelect(pkg.id)}
  >
    {pkg.is_popular && (
      <div className="bg-red-600 text-white text-center py-1 px-4 text-sm font-medium rounded-t-xl">
        Most Popular
      </div>
    )}
    <div className="p-6 flex flex-col h-full">
      <h3
        className={`text-xl font-bold ${pkg.is_popular ? "text-red-500" : "text-white"} mb-2`}
      >
        {pkg.name}
      </h3>
      <div className="mb-6">
        <div className="flex items-end">
          <span className="text-3xl font-bold text-white">
            {formatPrice(pkg.price)}
          </span>
          <span className="text-zinc-400 ml-2 mb-1">{pkg.currency}</span>
        </div>
        <div className="text-zinc-400 text-sm mt-1">
          ${formatPrice(pkg.usd_price)} USD
        </div>
      </div>
      <div className="flex-grow">
        <ul className="space-y-3">
          {pkg.features &&
            pkg.features
              .sort((a, b) => a.order_index - b.order_index)
              .map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center ml-0">
                  <div className="mr-2 mt-0.5">
                    {feature.is_included ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-zinc-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`${feature.is_included ? "" : "text-zinc-500"} ${feature.is_bold ? "font-bold" : ""}`}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
        </ul>
      </div>
      <div className="mt-6 text-sm text-zinc-400">{pkg.description}</div>
      <button
        className={`mt-4 w-full py-2 text-center rounded-md ${
          isSelected
            ? "bg-red-600 text-white font-medium"
            : "bg-zinc-800 text-zinc-300"
        }`}
      >
        {isSelected ? "Selected" : "Select Package"}
      </button>
    </div>
  </div>
);

export default PackageCard;
