import React, { useState } from "react";
import { formatPrice, TAX_RATE } from "@/lib/proposalUtils";
import DiscountControl from "./DiscountControl";

interface GeneratorSummaryProps {
  includePackage: boolean;
  selectedPackage: any | null;
  selectedServices: any[];
  discounts: {
    packageDiscount: { type: "percentage" | "absolute"; value: number };
    serviceDiscounts: Record<
      string,
      { type: "percentage" | "absolute"; value: number }
    >;
    overallDiscount: { type: "percentage" | "absolute"; value: number };
  };
  includeTax: boolean;
  onDiscountChange: (
    type: string,
    id: number | null,
    value: number,
    discountType: "percentage" | "absolute",
  ) => void;
  onTaxToggle: (include: boolean) => void;
}

const GeneratorSummary: React.FC<GeneratorSummaryProps> = ({
  includePackage,
  selectedPackage,
  selectedServices,
  discounts,
  includeTax,
  onDiscountChange,
  onTaxToggle,
}) => {
  const [showDiscounts, setShowDiscounts] = useState(true);

  // Calculate subtotal and handle discounts
  const calculateSubtotal = () => {
    let subtotal = 0;

    // Add package price if included
    if (includePackage && selectedPackage) {
      let packagePrice = selectedPackage.price;

      // Apply package discount
      if (discounts.packageDiscount.value > 0) {
        if (discounts.packageDiscount.type === "percentage") {
          packagePrice =
            packagePrice * (1 - discounts.packageDiscount.value / 100);
        } else {
          packagePrice = Math.max(
            0,
            packagePrice - discounts.packageDiscount.value,
          );
        }
      }

      subtotal += packagePrice;
    }

    // Add services prices
    selectedServices.forEach((service) => {
      let servicePrice = service.price;
      const serviceDiscount = discounts.serviceDiscounts[service.id];

      if (serviceDiscount && serviceDiscount.value > 0) {
        if (serviceDiscount.type === "percentage") {
          servicePrice = servicePrice * (1 - serviceDiscount.value / 100);
        } else {
          servicePrice = Math.max(0, servicePrice - serviceDiscount.value);
        }
      }

      subtotal += servicePrice;
    });

    return subtotal;
  };

  const subtotal = calculateSubtotal();

  // Calculate final total after overall discount
  const calculateFinalTotal = () => {
    if (discounts.overallDiscount.value <= 0) {
      return subtotal;
    }

    if (discounts.overallDiscount.type === "percentage") {
      return subtotal * (1 - discounts.overallDiscount.value / 100);
    } else {
      return Math.max(0, subtotal - discounts.overallDiscount.value);
    }
  };

  const finalTotalBeforeTax = calculateFinalTotal();

  // Calculate tax amount
  const taxAmount = includeTax ? Math.round(finalTotalBeforeTax * TAX_RATE) : 0;

  // Calculate final total with tax
  const finalTotal = finalTotalBeforeTax + taxAmount;

  // Calculate monthly fees if any
  const monthlyFees = selectedServices
    .filter(
      (service) =>
        (service.is_monthly || service.monthly) &&
        (service.setup_fee || service.setupFee),
    )
    .reduce(
      (total, service) => total + (service.setup_fee || service.setupFee),
      0,
    );

  return (
    <div className="bg-zinc-800 rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-red-500">Summary & Discounts</h2>
        <button
          onClick={() => setShowDiscounts(!showDiscounts)}
          className="text-sm bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded text-zinc-300 transition-colors"
        >
          {showDiscounts ? "Hide Discounts" : "Show Discounts"}
        </button>
      </div>

      {showDiscounts && (
        <div className="bg-zinc-900 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-4">Discount Settings</h3>

          <div className="space-y-4">
            {/* Package discount */}
            {includePackage && selectedPackage && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-3 border-b border-zinc-800">
                <div className="md:col-span-4">
                  <span className="text-sm text-zinc-400">
                    {selectedPackage.name} Package Discount:
                  </span>
                </div>
                <div className="md:col-span-8">
                  <DiscountControl
                    id="generator-package-discount"
                    label=""
                    discount={discounts.packageDiscount}
                    maxValue={selectedPackage.price}
                    onChange={(value, type) =>
                      onDiscountChange("package", null, value, type)
                    }
                    className="mb-0"
                  />
                </div>
              </div>
            )}

            {/* Service discounts */}
            {selectedServices.length > 0 && (
              <div className="space-y-3">
                {selectedServices.map((service) => {
                  const serviceDiscount = discounts.serviceDiscounts[
                    service.id
                  ] || { type: "percentage", value: 0 };
                  return (
                    <div
                      key={service.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-3 border-b border-zinc-800"
                    >
                      <div className="md:col-span-4">
                        <span className="text-sm text-zinc-400">
                          {service.name} Discount:
                        </span>
                      </div>
                      <div className="md:col-span-8">
                        <DiscountControl
                          id={`generator-service-discount-${service.id}`}
                          label=""
                          discount={serviceDiscount}
                          maxValue={service.price}
                          onChange={(value, type) =>
                            onDiscountChange("service", service.id, value, type)
                          }
                          className="mb-0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Overall discount */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-3 border-b border-zinc-800 pb-3">
              <div className="md:col-span-4">
                <span className="text-sm text-zinc-400">Overall Discount:</span>
              </div>
              <div className="md:col-span-8">
                <DiscountControl
                  id="generator-overall-discount"
                  label=""
                  discount={discounts.overallDiscount}
                  maxValue={subtotal}
                  onChange={(value, type) =>
                    onDiscountChange("overall", null, value, type)
                  }
                  className="mb-0"
                />
              </div>
            </div>

            {/* Tax toggle */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-3">
              <div className="md:col-span-4">
                <span className="text-sm text-zinc-400">
                  Include {(TAX_RATE * 100).toFixed(0)}% VAT:
                </span>
              </div>
              <div className="md:col-span-8">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTax}
                    onChange={(e) => onTaxToggle(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${includeTax ? "bg-red-500" : "bg-zinc-700"}`}
                  >
                    <div
                      className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${includeTax ? "translate-x-5" : ""}`}
                    />
                  </div>
                  <span className="ml-2 text-sm text-zinc-300">
                    {includeTax ? "Yes" : "No"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="bg-zinc-900 p-4 rounded-lg">
        <div className="space-y-2 mb-4">
          {includePackage && selectedPackage && (
            <div className="flex justify-between items-center text-sm">
              <span>{selectedPackage.name} Package:</span>
              <div className="text-right">
                {discounts.packageDiscount.value > 0 && (
                  <span className="text-xs line-through text-zinc-500 block">
                    {formatPrice(selectedPackage.price)}{" "}
                    {selectedPackage.currency}
                  </span>
                )}
                <span>
                  {formatPrice(
                    discounts.packageDiscount.value > 0
                      ? discounts.packageDiscount.type === "percentage"
                        ? selectedPackage.price *
                          (1 - discounts.packageDiscount.value / 100)
                        : selectedPackage.price -
                          discounts.packageDiscount.value
                      : selectedPackage.price,
                  )}{" "}
                  {selectedPackage.currency}
                </span>
              </div>
            </div>
          )}

          {selectedServices.length > 0 &&
            selectedServices.map((service) => {
              const serviceDiscount = discounts.serviceDiscounts[service.id];
              const discountedPrice =
                serviceDiscount && serviceDiscount.value > 0
                  ? serviceDiscount.type === "percentage"
                    ? service.price * (1 - serviceDiscount.value / 100)
                    : service.price - serviceDiscount.value
                  : service.price;

              return (
                <div
                  key={service.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span>{service.name}:</span>
                  <div className="text-right">
                    {serviceDiscount && serviceDiscount.value > 0 && (
                      <span className="text-xs line-through text-zinc-500 block">
                        {formatPrice(service.price)} {service.currency}
                      </span>
                    )}
                    <span>
                      {formatPrice(discountedPrice)} {service.currency}
                    </span>
                  </div>
                </div>
              );
            })}

          <div className="flex justify-between items-center text-sm pt-2 border-t border-zinc-800">
            <span>Subtotal:</span>
            <span>{formatPrice(subtotal)} AED</span>
          </div>

          {discounts.overallDiscount.value > 0 && (
            <div className="flex justify-between items-center text-sm text-green-400">
              <span>Overall Discount:</span>
              <span>
                {discounts.overallDiscount.type === "percentage"
                  ? `-${discounts.overallDiscount.value}%`
                  : `-${formatPrice(discounts.overallDiscount.value)} AED`}
              </span>
            </div>
          )}

          {/* Show total before tax when tax is included */}
          {includeTax && (
            <div className="flex justify-between items-center text-sm pt-2 border-t border-zinc-800">
              <span>Total before tax:</span>
              <span>{formatPrice(finalTotalBeforeTax)} AED</span>
            </div>
          )}

          {/* Tax line */}
          {includeTax && (
            <div className="flex justify-between items-center text-sm">
              <span>VAT ({(TAX_RATE * 100).toFixed(0)}%):</span>
              <span>{formatPrice(taxAmount)} AED</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center border-t border-zinc-800 pt-3">
          <span className="text-lg font-medium">
            Total Investment {includeTax ? "(Inc. VAT)" : ""}:
          </span>
          <span className="text-2xl font-bold">
            {formatPrice(finalTotal)} AED
          </span>
        </div>

        {monthlyFees > 0 && (
          <div className="text-sm text-zinc-400 mt-2 text-right">
            Plus {formatPrice(monthlyFees)} AED monthly fee(s)
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratorSummary;
