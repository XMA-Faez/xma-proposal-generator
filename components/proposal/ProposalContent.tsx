"use client";

import React, { useEffect, useState } from "react";
import { decodeProposalData } from "@/lib/proposalUtils";
import ProposalHeader from "@/components/proposal/ProposalHeader";
import PackageDisplay from "@/components/proposal/PackageDisplay";
import AdditionalServices from "@/components/proposal/AdditionalServices";
import SummarySection from "@/components/proposal/SummarySection";
import TermsAndConditions from "@/components/proposal/TermsAndConditions";
import ProposalFooter from "@/components/proposal/ProposalFooter";
import LoadingState from "@/components/proposal/LoadingState";
import ErrorState from "@/components/proposal/ErrorState";

interface ProposalContentProps {
  proposalData?: any;
  encodedProposal?: string;
  serverFetched?: boolean;
}

const ProposalContent: React.FC<ProposalContentProps> = ({
  proposalData: initialProposalData,
  encodedProposal,
  serverFetched = false,
}) => {
  const [proposalData, setProposalData] = useState(initialProposalData || null);
  const [isLoading, setIsLoading] = useState(!serverFetched && !proposalData);
  const [error, setError] = useState<string | null>(null);
  const [discounts, setDiscounts] = useState({
    packageDiscount: { type: "percentage", value: 0 },
    serviceDiscounts: {},
    overallDiscount: { type: "percentage", value: 0 },
  });

  useEffect(() => {
    // If we already have proposal data from the server, use that
    if (initialProposalData) {
      setProposalData(initialProposalData);

      // Initialize discounts from proposal data if available
      if (initialProposalData.discounts) {
        setDiscounts(normalizeDiscounts(initialProposalData.discounts));
      }
      return;
    }

    // Otherwise, try to decode from the URL parameter
    if (encodedProposal) {
      try {
        const decodedData = decodeProposalData(encodedProposal);
        if (decodedData) {
          // Initialize data with defaults to handle older proposal formats
          const normalizedData = {
            ...decodedData,
            includePackage: decodedData.includePackage !== false,
            selectedPackageIndex:
              decodedData.selectedPackageIndex === null
                ? 1
                : decodedData.selectedPackageIndex,
          };

          setProposalData(normalizedData);

          // Initialize service discounts
          if (
            normalizedData.selectedServices &&
            normalizedData.selectedServices.length > 0
          ) {
            const initialServiceDiscounts = {};
            normalizedData.selectedServices.forEach((service) => {
              initialServiceDiscounts[service.id] = {
                type: "percentage",
                value: 0,
              };
            });
            setDiscounts((prev) => ({
              ...prev,
              serviceDiscounts: initialServiceDiscounts,
            }));
          }

          // If the proposal already contains discount data, use it
          if (normalizedData.discounts) {
            setDiscounts(normalizeDiscounts(normalizedData.discounts));
          }
        } else {
          setError("Invalid proposal data");
        }
      } catch (err) {
        console.error("Error decoding proposal:", err);
        setError("Failed to load proposal data");
      } finally {
        setIsLoading(false);
      }
    } else if (!serverFetched) {
      setError("No proposal data found");
      setIsLoading(false);
    }
  }, [initialProposalData, encodedProposal, serverFetched]);

  // Helper function to normalize discount structure
  const normalizeDiscounts = (discounts) => {
    const normalized = {
      packageDiscount: { type: "percentage", value: 0 },
      serviceDiscounts: {},
      overallDiscount: { type: "percentage", value: 0 },
    };

    // Normalize package discount
    if (discounts.packageDiscount) {
      normalized.packageDiscount =
        typeof discounts.packageDiscount === "number"
          ? { type: "percentage", value: discounts.packageDiscount }
          : discounts.packageDiscount;
    }

    // Normalize overall discount
    if (discounts.overallDiscount) {
      normalized.overallDiscount =
        typeof discounts.overallDiscount === "number"
          ? { type: "percentage", value: discounts.overallDiscount }
          : discounts.overallDiscount;
    }

    // Normalize service discounts
    if (discounts.serviceDiscounts) {
      Object.entries(discounts.serviceDiscounts).forEach(([id, discount]) => {
        normalized.serviceDiscounts[id] =
          typeof discount === "number"
            ? { type: "percentage", value: discount }
            : discount;
      });
    }

    return normalized;
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !proposalData) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <ProposalHeader
          clientName={proposalData.clientName}
          companyName={proposalData.companyName}
          proposalDate={proposalData.proposalDate}
        />

        {proposalData.additionalInfo && (
          <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-red-500">
              Project Details
            </h2>
            <div className="bg-zinc-900/50 p-5 rounded-lg">
              <div className="whitespace-pre-wrap text-zinc-300">
                {proposalData.additionalInfo}
              </div>
            </div>
          </div>
        )}

        <PackageDisplay
          selectedPackageIndex={proposalData.selectedPackageIndex}
          discount={discounts.packageDiscount}
          onDiscountChange={() => {}} // Dummy function since clients can't modify
          includePackage={proposalData.includePackage !== false}
        />

        {proposalData.selectedServices &&
          proposalData.selectedServices.length > 0 && (
            <AdditionalServices
              selectedServices={proposalData.selectedServices}
              discounts={discounts.serviceDiscounts}
              onDiscountChange={() => {}} // Dummy function
            />
          )}

        <SummarySection proposalData={proposalData} discounts={discounts} />

        <TermsAndConditions />

        <ProposalFooter />
      </div>
    </div>
  );
};

export default ProposalContent;
