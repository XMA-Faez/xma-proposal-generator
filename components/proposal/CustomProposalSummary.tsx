"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomProposalData } from "./CustomProposalClient";

interface CustomProposalSummaryProps {
  proposalData: CustomProposalData;
  onDiscountChange: (discount: number, discountType: "percentage" | "absolute") => void;
  onTaxChange: (taxIncluded: boolean) => void;
}

export default function CustomProposalSummary({
  proposalData,
  onDiscountChange,
  onTaxChange,
}: CustomProposalSummaryProps) {
  const calculateSubtotal = () => {
    return proposalData.services.reduce((sum, service) => sum + service.price, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (proposalData.discountType === "percentage") {
      return (subtotal * proposalData.discount) / 100;
    }
    return proposalData.discount;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const afterDiscount = subtotal - discount;
    return proposalData.taxIncluded ? afterDiscount * 0.05 : 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const monthlyServices = proposalData.services.filter((s) => s.paymentType === "monthly");
  const fixedServices = proposalData.services.filter((s) => s.paymentType === "fixed");
  const monthlyTotal = monthlyServices.reduce((sum, s) => sum + s.price, 0);
  const fixedTotal = fixedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <Card className="p-6 bg-zinc-800 border-zinc-700">
      <h2 className="text-xl font-semibold text-white mb-4">Proposal Summary</h2>

      <div className="space-y-4">
        {/* Services Breakdown */}
        {proposalData.services.length > 0 && (
          <div className="space-y-2 pb-4 border-b border-zinc-700">
            {monthlyServices.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Monthly Services</h3>
                {monthlyServices.map((service) => (
                  <div key={service.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {service.name}
                      {service.isMainService && " (Main)"}
                    </span>
                    <span className="text-white">{service.price.toLocaleString()} AED/mo</span>
                  </div>
                ))}
              </div>
            )}
            {fixedServices.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-400 mb-1">One-time Services</h3>
                {fixedServices.map((service) => (
                  <div key={service.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {service.name}
                      {service.isMainService && " (Main)"}
                    </span>
                    <span className="text-white">{service.price.toLocaleString()} AED</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discount Control */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Discount</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={proposalData.discount || ""}
              onChange={(e) =>
                onDiscountChange(parseFloat(e.target.value) || 0, proposalData.discountType)
              }
              className="bg-zinc-700 border-zinc-600 text-white"
              placeholder="0"
            />
            <select
              value={proposalData.discountType}
              onChange={(e) =>
                onDiscountChange(proposalData.discount, e.target.value as "percentage" | "absolute")
              }
              className="rounded-md bg-zinc-700 border-zinc-600 text-white px-3 py-2"
            >
              <option value="percentage">%</option>
              <option value="absolute">AED</option>
            </select>
          </div>
        </div>

        {/* Tax Toggle */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="tax"
            checked={proposalData.taxIncluded}
            onCheckedChange={(checked) => onTaxChange(checked as boolean)}
          />
          <label htmlFor="tax" className="text-sm text-gray-300 cursor-pointer">
            Include 5% VAT
          </label>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-zinc-700 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">{calculateSubtotal().toLocaleString()} AED</span>
          </div>
          {proposalData.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Discount</span>
              <span className="text-red-400">-{calculateDiscount().toLocaleString()} AED</span>
            </div>
          )}
          {proposalData.taxIncluded && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">VAT (5%)</span>
              <span className="text-white">{calculateTax().toLocaleString()} AED</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-zinc-700">
            <span className="text-white">Total</span>
            <span className="text-white">{calculateTotal().toLocaleString()} AED</span>
          </div>
          {monthlyTotal > 0 && fixedTotal > 0 && (
            <div className="text-xs text-gray-400 pt-2">
              <p>Monthly: {monthlyTotal.toLocaleString()} AED/mo</p>
              <p>One-time: {fixedTotal.toLocaleString()} AED</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}