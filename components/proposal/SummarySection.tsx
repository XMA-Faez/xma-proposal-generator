import React from "react";
import {
  calculateTotalPrice,
  formatPrice,
  Discount,
  TAX_RATE,
} from "@/lib/proposalUtils";
import { packages } from "@/data/proposalData";
import CompanyStamp from "./CompanyStamp";

interface SummarySectionProps {
  proposalData: any;
  discounts: {
    packageDiscount: Discount;
    serviceDiscounts: Record<string, Discount>;
    overallDiscount: Discount;
  };
  orderId?: string | null;
  status?: string;
  onDiscountChange?: (
    type: string,
    id: number | null,
    value: number,
    discountType: "percentage" | "absolute",
  ) => void;
  includeTax?: boolean;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  proposalData,
  discounts,
  orderId,
  status = "draft",
  includeTax = true,
}) => {
  // Override includeTax from props if explicitly set
  const effectiveIncludeTax =
    proposalData.includeTax !== undefined
      ? proposalData.includeTax
      : includeTax;

  // Pass the tax inclusion flag to the calculation function
  const dataWithTaxFlag = {
    ...proposalData,
    includeTax: effectiveIncludeTax,
  };

  const priceDetails = calculateTotalPrice(dataWithTaxFlag, discounts);

  const showMonthlyFees =
    proposalData.selectedServices &&
    proposalData.selectedServices.some(
      (service) => service.monthly || service.is_monthly,
    );

  const monthlyTotal = proposalData.selectedServices
    ? proposalData.selectedServices.reduce((total, service) => {
        if (
          (service.monthly || service.is_monthly) &&
          (service.setupFee || service.setup_fee)
        ) {
          return total + (service.setupFee || service.setup_fee);
        }
        return total;
      }, 0)
    : 0;

  // Helper function to safely get package name
  const getPackageName = () => {
    // First try using the direct selectedPackage reference if available
    if (proposalData.selectedPackage && proposalData.selectedPackage.name) {
      return proposalData.selectedPackage.name;
    }

    // Then try using the selectedPackageIndex with the imported packages array
    if (
      proposalData.selectedPackageIndex !== null &&
      proposalData.selectedPackageIndex !== undefined &&
      packages &&
      packages[proposalData.selectedPackageIndex] &&
      packages[proposalData.selectedPackageIndex].name
    ) {
      return packages[proposalData.selectedPackageIndex].name;
    }

    // Finally, check if there's a package_id and find it in the imported packages
    if (proposalData.package_id && packages) {
      const pkg = packages.find((p) => p.id === proposalData.package_id);
      if (pkg) return pkg.name;
    }

    // Default fallback
    return "Selected Package";
  };

  // Check if this is an accepted or paid proposal
  const isAcceptedOrPaid = ["accepted", "paid"].includes(status.toLowerCase());

  return (
    <div className="mb-8 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg p-6 shadow-lg border border-zinc-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-red-500">Investment Summary</h2>
      </div>

      <div className="space-y-3 mb-6">
        {/* Package */}
        {proposalData.includePackage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 pb-3 border-b border-zinc-700">
            <div className="col-span-10">
              <div className="flex items-center">
                <span className="font-medium">{getPackageName()} Package</span>
                {discounts.packageDiscount.value > 0 && (
                  <span className="ml-2 text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
                    {discounts.packageDiscount.type === "percentage"
                      ? `${discounts.packageDiscount.value}% OFF`
                      : `-${formatPrice(discounts.packageDiscount.value)} AED`}
                  </span>
                )}
              </div>
            </div>

            <div className="col-span-2 text-right">
              <span>
                {formatPrice(priceDetails.discountedPackagePrice)} AED
              </span>
            </div>
          </div>
        )}

        {/* Services */}
        {proposalData.selectedServices &&
          proposalData.selectedServices.length > 0 && (
            <>
              <h3 className="font-medium text-zinc-400 mt-4">Services</h3>
              {proposalData.selectedServices.map((service) => {
                const serviceDiscount = discounts.serviceDiscounts[
                  service.id
                ] || { type: "percentage", value: 0 };
                const discountedService =
                  priceDetails.servicesWithDiscounts &&
                  priceDetails.servicesWithDiscounts.find(
                    (s) => s.id === service.id,
                  );

                if (!discountedService) return null;

                return (
                  <div
                    key={service.id}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-2 pb-3 border-b border-zinc-700"
                  >
                    <div className="col-span-10">
                      <div className="flex items-center">
                        <span>{service.name}</span>
                        {serviceDiscount.value > 0 && (
                          <span className="ml-2 text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
                            {serviceDiscount.type === "percentage"
                              ? `${serviceDiscount.value}% OFF`
                              : `-${formatPrice(serviceDiscount.value)} AED`}
                          </span>
                        )}
                      </div>
                      {(service.monthly || service.is_monthly) && (
                        <div className="text-xs text-zinc-400">
                          +{service.setupFee || service.setup_fee} AED/month
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 text-right">
                      <span>
                        {formatPrice(discountedService.discountedPrice)} AED
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

        {/* Subtotal */}
        <div className="flex justify-between items-center pt-2 pb-3 border-b border-zinc-700">
          <span className="font-medium">Subtotal</span>
          <span>{formatPrice(priceDetails.subtotal)} AED</span>
        </div>

        {/* Overall Discount */}
        {discounts.overallDiscount.value > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 pb-3 border-b border-zinc-700">
            <div className="col-span-10">
              <span className="font-medium">Overall Discount</span>
              <span className="ml-2 text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
                {discounts.overallDiscount.type === "percentage"
                  ? `${discounts.overallDiscount.value}% OFF`
                  : `-${formatPrice(discounts.overallDiscount.value)} AED`}
              </span>
            </div>

            <div className="col-span-2 text-right text-green-400">
              -{formatPrice(priceDetails.overallDiscountAmount)} AED
            </div>
          </div>
        )}

        {/* Total before tax (only shown when tax is included) */}
        {effectiveIncludeTax && (
          <div className="flex justify-between items-center pt-2 pb-3 border-b border-zinc-700">
            <span className="font-medium">Total before tax</span>
            <span>{formatPrice(priceDetails.finalPriceBeforeTax)} AED</span>
          </div>
        )}

        {/* Tax (5%) */}
        {effectiveIncludeTax && (
          <div className="flex justify-between items-center pt-2 pb-3 border-b border-zinc-700">
            <span className="font-medium">
              VAT ({(TAX_RATE * 100).toFixed(0)}%)
            </span>
            <span>{formatPrice(priceDetails.taxAmount)} AED</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-zinc-900 p-4 rounded-lg">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>
            Total Investment {effectiveIncludeTax ? "(Inc. VAT)" : ""}
          </span>
          <span className="text-2xl text-red-400">
            {isNaN(
              parseFloat(priceDetails.formattedFinalPrice.replace(/,/g, "")),
            )
              ? "0 AED"
              : `${priceDetails.formattedFinalPrice} AED`}
          </span>
        </div>

        {showMonthlyFees && (
          <div className="mt-2 text-sm text-zinc-400 flex justify-between">
            <span>Monthly Subscription Fees</span>
            <span>{formatPrice(monthlyTotal)} AED/month</span>
          </div>
        )}

        <div className="mt-4 text-center">
          {!isAcceptedOrPaid && (
            <p className="text-sm text-zinc-400">
              This proposal is valid for 30 days from the date issued.
              {effectiveIncludeTax && (
                <span className="ml-1">
                  All prices include {(TAX_RATE * 100).toFixed(0)}% VAT.
                </span>
              )}
            </p>
          )}
          {isAcceptedOrPaid && (
            <p className="text-sm text-zinc-400">
              {status === "paid" ? (
                <span className="text-green-400 font-medium">
                  This proposal has been accepted and paid. All terms are
                  finalized.
                </span>
              ) : (
                <span className="text-green-400 font-medium">
                  This proposal has been accepted. All terms are finalized.
                </span>
              )}
              {effectiveIncludeTax && (
                <span className="ml-1 text-zinc-400">
                  All prices include {(TAX_RATE * 100).toFixed(0)}% VAT.
                </span>
              )}
            </p>
          )}
        </div>

        {/* Legal Contract Section with Company Stamp */}
        {orderId && <CompanyStamp orderId={orderId} />}
      </div>
    </div>
  );
};

export default SummarySection;
