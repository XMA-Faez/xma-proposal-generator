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
import ContractActions from "@/components/proposal/ContractActions";

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
  const [linkCopied, setLinkCopied] = useState(false);

  // Generate a shareable link if one isn't provided
  const getShareableLink = () => {
    if (typeof window === "undefined") return null;

    // For token-based proposals
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      return `${window.location.origin}/proposal?token=${token}`;
    }

    // For encoded proposals
    if (encodedProposal) {
      return `${window.location.origin}/proposal?proposal=${encodedProposal}`;
    }

    return null;
  };

  const shareableLink = getShareableLink();

  const copyLinkToClipboard = () => {
    if (!shareableLink) return;

    navigator.clipboard
      .writeText(shareableLink)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

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
      overallDiscount: { type: "percentage", value: 0 },
    },
  } = proposalData;

  // Try to get order ID from parent component or props
  const orderId = initialProposalData?.order_id || null;
  const status = initialProposalData?.status || "draft";

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Contract Actions - Adding this right at the top for visibility */}
        <ContractActions
          proposalData={proposalData}
          orderId={orderId}
          status={status}
          shareableLink={shareableLink}
          onCopyLink={copyLinkToClipboard}
          copied={linkCopied}
        />

        <ProposalHeader
          clientName={clientName}
          companyName={companyName}
          proposalDate={proposalDate}
          orderId={orderId}
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
          <PackageDisplay
            selectedPackageIndex={null}
            selectedPackage={selectedPackage}
            discount={discounts.packageDiscount}
            onDiscountChange={() => {}} // Dummy function
            includePackage={includePackage}
          />
        )}

        {selectedServices && selectedServices.length > 0 && (
          <AdditionalServices
            selectedServices={selectedServices}
            discounts={discounts.serviceDiscounts}
            onDiscountChange={() => {}} // Dummy function
          />
        )}

        <SummarySection
          proposalData={proposalData}
          discounts={discounts}
          orderId={orderId}
          status={status}
        />

        <TermsAndConditions />

        <ProposalFooter />
      </div>
    </div>
  );
};

export default ProposalContent;
