// Modified ProposalContent.tsx to use the snapshot data

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
  
  useEffect(() => {
    // If we already have proposal data from the server, use that
    if (initialProposalData) {
      setProposalData(initialProposalData);
      return;
    }

    // Otherwise, try to decode from the URL parameter
    if (encodedProposal) {
      try {
        const decodedData = decodeProposalData(encodedProposal);
        if (decodedData) {
          setProposalData(decodedData);
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

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !proposalData) {
    return <ErrorState error={error} />;
  }

  // Extract data from the proposal
  // Use the snapshots from proposal_data instead of fetching current package/service data
  const {
    clientName,
    companyName,
    proposalDate,
    additionalInfo,
    includePackage = true,
    // Important change: Use the stored package snapshot instead of fetching by ID
    selectedPackage,
    // Important change: Use the stored services snapshot 
    selectedServices = [],
    // Get discounts from the snapshot
    discounts = {
      packageDiscount: { type: "percentage", value: 0 },
      serviceDiscounts: {},
      overallDiscount: { type: "percentage", value: 0 }
    }
  } = proposalData;

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <ProposalHeader
          clientName={clientName}
          companyName={companyName}
          proposalDate={proposalDate}
        />

        {additionalInfo && (
          <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-red-500">
              Project Details
            </h2>
            <div className="bg-zinc-900/50 p-5 rounded-lg">
              <div className="whitespace-pre-wrap text-zinc-300">
                {additionalInfo}
              </div>
            </div>
          </div>
        )}

        {/* If include package and we have a package snapshot */}
        {includePackage && selectedPackage && (
          <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-red-500">Selected Package</h2>
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
                  {discounts.packageDiscount.value > 0 && (
                    <div className="text-lg line-through text-zinc-500">
                      {selectedPackage.price} {selectedPackage.currency}
                    </div>
                  )}
                  <div className="text-2xl font-bold flex items-center justify-end">
                    {/* Calculate discounted price here or use a utility function */}
                    {selectedPackage.price} {selectedPackage.currency}
                    {discounts.packageDiscount.value > 0 && (
                      <span className="ml-2 text-sm font-normal bg-green-900/30 text-green-400 px-2 py-1 rounded">
                        {discounts.packageDiscount.type === 'percentage' 
                          ? `${discounts.packageDiscount.value}% OFF` 
                          : `-${discounts.packageDiscount.value} ${selectedPackage.currency}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {selectedPackage.features && selectedPackage.features.map((feature, index) => (
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
                    <span className={feature.is_bold ? "font-medium" : ""}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedServices && selectedServices.length > 0 && (
          <AdditionalServices
            selectedServices={selectedServices}
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
