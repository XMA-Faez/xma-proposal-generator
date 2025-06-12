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
import CompanyStamp from "@/components/proposal/CompanyStamp";

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
  // Check if this is a custom proposal
  const isCustomProposal = proposalData.isCustomProposal || false;
  
  // For custom proposals, extract data differently
  if (isCustomProposal) {
    const {
      clientInfo,
      services,
      discount,
      discountType,
      taxIncluded,
      terms,
      customTerms,
    } = proposalData;

    return (
      <div className="min-h-screen bg-zinc-900 text-white py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <ProposalHeader
            clientName={clientInfo.clientName}
            companyName={clientInfo.companyName}
            proposalDate={clientInfo.proposalDate}
            orderId={orderId}
          />

          {/* Custom Services Display */}
          <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-red-500">Services</h2>
            
            {services.map((service, index) => (
              <div key={service.id} className={`${index > 0 ? 'mt-6 pt-6 border-t border-zinc-700' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-white">
                    {service.name}
                    {service.isMainService && (
                      <span className="ml-2 text-sm bg-red-600 text-white px-2 py-1 rounded">
                        Main Service
                      </span>
                    )}
                  </h3>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {service.price.toLocaleString()} AED
                    </p>
                    <p className="text-sm text-gray-400">
                      {service.paymentType === "monthly" ? "per month" : "one-time payment"}
                    </p>
                  </div>
                </div>
                
                {service.description && (
                  <p className="text-gray-300 mb-4">{service.description}</p>
                )}
                
                {service.features && service.features.length > 0 && (
                  <div className="bg-zinc-900/50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-300">
                          <span className="text-red-500 mr-2">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Custom Summary Section */}
          <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-red-500">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-medium">
                  {proposalData.calculations.subtotal.toLocaleString()} AED
                </span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    Discount ({discountType === "percentage" ? `${discount}%` : `${discount} AED`})
                  </span>
                  <span className="text-red-400 font-medium">
                    -{proposalData.calculations.discountAmount.toLocaleString()} AED
                  </span>
                </div>
              )}
              
              {taxIncluded && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">VAT (5%)</span>
                  <span className="text-white font-medium">
                    {proposalData.calculations.taxAmount.toLocaleString()} AED
                  </span>
                </div>
              )}
              
              <div className="pt-3 border-t border-zinc-700">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-white">
                    {proposalData.calculations.totalAmount.toLocaleString()} AED
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <CompanyStamp />
            </div>
          </div>

          {/* Terms and Conditions */}
          {terms === "custom" && customTerms && customTerms.length > 0 ? (
            <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-red-500">Terms & Conditions</h2>
              <div className="bg-zinc-900/50 p-5 rounded-lg">
                <ol className="space-y-3 text-zinc-300 text-sm">
                  {customTerms.map((term, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-3 font-semibold">{index + 1}.</span>
                      <span className="leading-relaxed">{term}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <TermsAndConditions />
          )}

          <ProposalFooter />
        </div>
      </div>
    );
  }

  // Standard proposal data extraction
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
