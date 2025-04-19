import React from "react";
import {
  calculateTotalPrice,
  formatPrice,
  parsePrice,
  Discount,
} from "@/lib/proposalUtils";

interface SummarySectionProps {
  proposalData: any;
  discounts: {
    packageDiscount: Discount;
    serviceDiscounts: Record<string, Discount>;
    overallDiscount: Discount;
  };
  onDiscountChange?: (
    type: string,
    id: number | null,
    value: number,
    discountType: "percentage" | "absolute",
  ) => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  proposalData,
  discounts,
}) => {
  const priceDetails = calculateTotalPrice(proposalData, discounts);

  const showMonthlyFees = proposalData.selectedServices?.some(
    (service) => service.monthly || service.is_monthly,
  );

  const monthlyTotal = (proposalData.selectedServices || []).reduce(
    (total, service) => {
      if (
        (service.monthly || service.is_monthly) &&
        (service.setupFee || service.setup_fee)
      ) {
        return total + (service.setupFee || service.setup_fee);
      }
      return total;
    },
    0,
  );

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
                {/* Use the package name from the snapshot, or fallback to index */}
                <span className="font-medium">
                  {proposalData.selectedPackage
                    ? `${proposalData.selectedPackage.name} Package`
                    : "Selected Package"}
                </span>
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
      </div>

      {/* Total */}
      <div className="bg-zinc-900 p-4 rounded-lg">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Investment</span>
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
          <p className="text-sm text-zinc-400">
            This proposal is valid for 30 days from the date issued.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
