/**
 * Enhanced utility functions for proposal data handling with full snapshots
 */

import { packages, standaloneServices } from "@/data/proposalData";

// Utility function for decoding proposal data
export const decodeProposalData = (encodedData: string) => {
  try {
    const jsonString = decodeURIComponent(atob(encodedData));
    const data = JSON.parse(jsonString);

    // Validate the data has the expected structure
    if (!data.clientName || !data.companyName) {
      console.error("Missing required fields in proposal data");
      return null;
    }

    // Handle different proposal data formats (old vs new structure)
    const validatedData = {
      ...data,
      // Ensure we have some form of package reference
      selectedPackage: data.selectedPackage || null,
      selectedPackageIndex:
        data.selectedPackageIndex !== null ? data.selectedPackageIndex : 1, // Default to Standard package if missing
      // Ensure we have services array
      selectedServices: Array.isArray(data.selectedServices)
        ? data.selectedServices
        : [],
      // Ensure we have discounts structure
      discounts: data.discounts || {
        packageDiscount: { type: "percentage", value: 0 },
        serviceDiscounts: {},
        overallDiscount: { type: "percentage", value: 0 },
      },
    };

    return validatedData;
  } catch (error) {
    console.error("Error decoding proposal data:", error);
    return null;
  }
};

// Encode proposal data for URL sharing
export const encodeProposalData = (data: any) => {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(encodeURIComponent(jsonString));
  } catch (error) {
    console.error("Error encoding proposal data:", error);
    return null;
  }
};

// Normalize and prepare a proposal for storage with full snapshots
export const prepareProposalData = (
  formData: any,
  packageData: any,
  servicesData: any[],
) => {
  const {
    clientName,
    companyName,
    proposalDate,
    additionalInfo,
    includePackage,
    selectedPackageId,
    selectedServiceIds = [],
    discounts,
  } = formData;

  // Get full package data from packages array
  const selectedPackage =
    includePackage && selectedPackageId
      ? packageData.find((p) => p.id === selectedPackageId)
      : null;

  // Get full service data for each selected service
  const selectedServices = selectedServiceIds
    .map((id) => servicesData.find((s) => s.id === id))
    .filter(Boolean); // Remove any undefined entries

  // Create the complete proposal data with snapshots
  return {
    clientName,
    companyName,
    proposalDate,
    additionalInfo,
    includePackage,
    // Store the complete package object
    selectedPackage,
    // Also keep the ID reference for backward compatibility
    selectedPackageId,
    // Store the complete service objects
    selectedServices,
    // Also keep IDs for backward compatibility
    selectedServiceIds,
    // Include discounts
    discounts,
  };
};

// Calculate price with discount applied
export interface Discount {
  type: "percentage" | "absolute";
  value: number;
}

export const calculateDiscountedPrice = (
  price: number,
  discount: Discount,
): number => {
  if (!discount || discount.value <= 0) return price;

  if (discount.type === "percentage") {
    // Ensure percentage doesn't exceed 100%
    const percentage = Math.min(discount.value, 100);
    const discountAmount = (price * percentage) / 100;
    return Math.round(price - discountAmount);
  } else {
    // Ensure absolute discount doesn't exceed price
    const discountAmount = Math.min(discount.value, price);
    return Math.round(price - discountAmount);
  }
};

// Parse price string to number (remove commas)
export const parsePrice = (priceString: string | number): number => {
  if (typeof priceString === "number") return priceString;

  if (!priceString || typeof priceString !== "string") {
    return 0;
  }
  const parsed = parseInt(priceString.replace(/,/g, ""));
  return isNaN(parsed) ? 0 : parsed;
};

// Format number back to price string with commas
export const formatPrice = (price: number): string => {
  if (price === null || price === undefined) {
    return "0";
  }
  return new Intl.NumberFormat("en-US").format(price);
};

// Calculate total price with all discounts
export const calculateTotalPrice = (
  proposalData: any,
  discounts: {
    packageDiscount: Discount;
    serviceDiscounts: Record<string, Discount>;
    overallDiscount: Discount;
  },
) => {
  let packagePrice = 0;
  let discountedPackagePrice = 0;

  // Calculate package price with discount if a package is included
  if (proposalData.includePackage !== false) {
    // Use the snapshot package data if available
    if (proposalData.selectedPackage) {
      packagePrice = parsePrice(proposalData.selectedPackage.price);
    }
    // Fallback to packages array lookup for older proposals
    else if (
      proposalData.selectedPackageIndex !== null &&
      packages[proposalData.selectedPackageIndex]
    ) {
      packagePrice = parsePrice(
        packages[proposalData.selectedPackageIndex].price,
      );
    }

    discountedPackagePrice = calculateDiscountedPrice(
      packagePrice,
      discounts.packageDiscount || { type: "percentage", value: 0 },
    );
  }

  // Ensure selectedServices is an array
  const selectedServices = Array.isArray(proposalData.selectedServices)
    ? proposalData.selectedServices
    : [];

  // Calculate services price with individual discounts
  let totalServiceDiscount = 0;
  const servicesWithDiscounts = selectedServices.map((service) => {
    if (!service || !service.id)
      return { originalPrice: 0, discountedPrice: 0, discountAmount: 0 };

    const serviceDiscount =
      discounts.serviceDiscounts && discounts.serviceDiscounts[service.id]
        ? discounts.serviceDiscounts[service.id]
        : { type: "percentage", value: 0 };

    const originalPrice = parsePrice(service.price) || 0;
    const discountedPrice = calculateDiscountedPrice(
      originalPrice,
      serviceDiscount,
    );
    const discountAmount = originalPrice - discountedPrice;
    totalServiceDiscount += discountAmount;

    return {
      ...service,
      originalPrice,
      discountedPrice,
      discountAmount,
    };
  });

  const servicesPrice = servicesWithDiscounts.reduce(
    (total, service) => total + (service.discountedPrice || 0),
    0,
  );

  // Calculate subtotal
  const subtotal = discountedPackagePrice + servicesPrice;

  // Apply overall discount
  const finalPrice = calculateDiscountedPrice(
    subtotal,
    discounts.overallDiscount || { type: "percentage", value: 0 },
  );
  const overallDiscountAmount = subtotal - finalPrice;

  // Calculate package discount amount
  const packageDiscountAmount = packagePrice - discountedPackagePrice;

  return {
    originalPackagePrice: packagePrice,
    discountedPackagePrice,
    packageDiscountAmount,
    servicesWithDiscounts,
    servicesPrice,
    totalServiceDiscount,
    subtotal,
    overallDiscountAmount,
    finalPrice,
    formattedFinalPrice: formatPrice(finalPrice),
  };
};
