"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ClientInformationForm from "./ClientInformationForm";
import CustomServiceForm from "./CustomServiceForm";
import CustomProposalSummary from "./CustomProposalSummary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type PaymentType = "monthly" | "fixed";

export interface CustomService {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  paymentType: PaymentType;
  isMainService?: boolean;
}

export interface CustomProposalData {
  clientInfo: {
    clientName: string;
    companyName: string;
    proposalDate: string;
  };
  services: CustomService[];
  discount: number;
  discountType: "percentage" | "absolute";
  taxIncluded: boolean;
  terms: "standard" | "custom";
  customTerms?: string;
}

export default function CustomProposalClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [proposalData, setProposalData] = useState<CustomProposalData>({
    clientInfo: {
      clientName: "",
      companyName: "",
      proposalDate: new Date().toISOString().split("T")[0],
    },
    services: [],
    discount: 0,
    discountType: "percentage",
    taxIncluded: true,
    terms: "standard",
  });

  const handleClientInfoChange = (clientInfo: CustomProposalData["clientInfo"]) => {
    setProposalData((prev) => ({ ...prev, clientInfo }));
  };

  const handleAddService = (service: CustomService) => {
    setProposalData((prev) => ({
      ...prev,
      services: [...prev.services, service],
    }));
  };

  const handleUpdateService = (id: string, service: CustomService) => {
    setProposalData((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? service : s)),
    }));
  };

  const handleRemoveService = (id: string) => {
    setProposalData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  };

  const handleDiscountChange = (discount: number, discountType: "percentage" | "absolute") => {
    setProposalData((prev) => ({ ...prev, discount, discountType }));
  };

  const handleTaxChange = (taxIncluded: boolean) => {
    setProposalData((prev) => ({ ...prev, taxIncluded }));
  };

  const handleTermsChange = (terms: "standard" | "custom", customTerms?: string) => {
    setProposalData((prev) => ({ ...prev, terms, customTerms }));
  };

  const handleSubmit = async () => {
    if (!proposalData.clientInfo.clientName || !proposalData.clientInfo.companyName) {
      alert("Please fill in all client information");
      return;
    }

    if (proposalData.services.length === 0) {
      alert("Please add at least one service");
      return;
    }

    if (proposalData.terms === "custom" && !proposalData.customTerms) {
      alert("Please provide custom terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/proposals/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) {
        throw new Error("Failed to create proposal");
      }

      const { proposalUrl } = await response.json();
      router.push(proposalUrl);
    } catch (error) {
      console.error("Error creating proposal:", error);
      alert("Failed to create proposal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card className="p-6 bg-zinc-800 border-zinc-700">
          <h2 className="text-xl font-semibold text-white mb-4">Client Information</h2>
          <ClientInformationForm
            clientInfo={proposalData.clientInfo}
            onChange={handleClientInfoChange}
          />
        </Card>

        <Card className="p-6 bg-zinc-800 border-zinc-700">
          <h2 className="text-xl font-semibold text-white mb-4">Custom Services</h2>
          <CustomServiceForm
            services={proposalData.services}
            onAddService={handleAddService}
            onUpdateService={handleUpdateService}
            onRemoveService={handleRemoveService}
          />
        </Card>

        <Card className="p-6 bg-zinc-800 border-zinc-700">
          <h2 className="text-xl font-semibold text-white mb-4">Terms & Conditions</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Terms Type</label>
              <select
                value={proposalData.terms}
                onChange={(e) => handleTermsChange(e.target.value as "standard" | "custom")}
                className="mt-1 w-full rounded-md bg-zinc-700 border-zinc-600 text-white px-3 py-2"
              >
                <option value="standard">Standard Terms</option>
                <option value="custom">Custom Terms</option>
              </select>
            </div>
            {proposalData.terms === "custom" && (
              <div>
                <label className="text-sm font-medium text-gray-300">Custom Terms</label>
                <textarea
                  value={proposalData.customTerms || ""}
                  onChange={(e) => handleTermsChange("custom", e.target.value)}
                  className="mt-1 w-full rounded-md bg-zinc-700 border-zinc-600 text-white px-3 py-2 h-32"
                  placeholder="Enter custom terms and conditions..."
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <CustomProposalSummary
            proposalData={proposalData}
            onDiscountChange={handleDiscountChange}
            onTaxChange={handleTaxChange}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || proposalData.services.length === 0}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Creating..." : "Create Proposal"}
          </Button>
        </div>
      </div>
    </div>
  );
}