"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { decodeProposalData } from "@/lib/proposalUtils";
import ProposalHeader from "@/components/proposal/ProposalHeader";
import PackageDisplay from "@/components/proposal/PackageDisplay";
import AdditionalServices from "@/components/proposal/AdditionalServices";
import SummarySection from "@/components/proposal/SummarySection";
import TermsAndConditions from "@/components/proposal/TermsAndConditions";
import ProposalFooter from "@/components/proposal/ProposalFooter";
import LoadingState from "@/components/proposal/LoadingState";
import ErrorState from "@/components/proposal/ErrorState";
import ProposalCTA from "@/components/proposal/ProposalCTA";
import PrintButton from "@/components/proposal/PrintButton";

const ProposalPage = () => {
  const searchParams = useSearchParams();
  const proposalParam = searchParams.get("proposal");
  const tokenParam = searchParams.get("token");
  const [linkCopied, setLinkCopied] = useState(false);

  // Helper function to normalize discount structure
  const normalizeDiscounts = (discounts) => {
    const normalized = {
      packageDiscount: { type: "percentage", value: 0 },
      serviceDiscounts: {},
      overallDiscount: { type: "percentage", value: 0 },
    };

    // Normalize package discount
    if (discounts?.packageDiscount) {
      normalized.packageDiscount =
        typeof discounts.packageDiscount === "number"
          ? { type: "percentage", value: discounts.packageDiscount }
          : discounts.packageDiscount;
    }

    // Normalize overall discount
    if (discounts?.overallDiscount) {
      normalized.overallDiscount =
        typeof discounts.overallDiscount === "number"
          ? { type: "percentage", value: discounts.overallDiscount }
          : discounts.overallDiscount;
    }

    // Normalize service discounts
    if (discounts?.serviceDiscounts) {
      Object.entries(discounts.serviceDiscounts).forEach(([id, discount]) => {
        normalized.serviceDiscounts[id] =
          typeof discount === "number"
            ? { type: "percentage", value: discount }
            : discount;
      });
    }

    return normalized;
  };

  // Generate a shareable link based on the current URL
  const getShareableLink = () => {
    if (typeof window === 'undefined') return null;
    return window.location.href;
  };

  const shareableLink = getShareableLink();

  const copyLinkToClipboard = () => {
    if (!shareableLink) return;
    
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  // Use React Query to fetch proposal data
  const { data, isLoading, error } = useQuery({
    queryKey: ["proposal", tokenParam, proposalParam],
    queryFn: async () => {
      try {
        // If we have a token, fetch from Supabase
        if (tokenParam) {
          // Find the proposal link
          const { data: link, error: linkError } = await supabase
            .from("proposal_links")
            .select("proposal_id, views_count")
            .eq("token", tokenParam)
            .single();

          if (linkError) {
            throw new Error("Invalid proposal link");
          }

          // Get the proposal
          const { data: proposal, error: proposalError } = await supabase
            .from("proposals")
            .select(
              `
              *,
              client:clients(*)
            `,
            )
            .eq("id", link.proposal_id)
            .single();

          if (proposalError) {
            throw new Error("Failed to load proposal");
          }

          // Update the view count
          await supabase
            .from("proposal_links")
            .update({ views_count: (link.views_count || 0) + 1 })
            .eq("token", tokenParam);

          // Return the proposal data, order ID, and status
          console.log("Raw order_id from database:", proposal.order_id, typeof proposal.order_id);
          
          // Handle order_id that might be stored as an object or other type
          let orderId = '';
          if (typeof proposal.order_id === 'string') {
            orderId = proposal.order_id;
          } else if (proposal.order_id && typeof proposal.order_id === 'object') {
            // If it's an object, try to extract a string value
            orderId = proposal.order_id.toString();
          } else {
            orderId = String(proposal.order_id || '');
          }
          
          console.log("Processed order_id:", orderId);
          
          return {
            proposalData: proposal.proposal_data,
            orderId: orderId,
            status: proposal.status || "draft",
            discounts: normalizeDiscounts(proposal.proposal_data.discounts),
          };
        }
        // If we have encoded proposal data directly in the URL
        else if (proposalParam) {
          const decodedData = decodeProposalData(proposalParam);
          if (!decodedData) {
            throw new Error("Invalid proposal data");
          }

          // Initialize data with defaults to handle older proposal formats
          const normalizedData = {
            ...decodedData,
            includePackage: decodedData.includePackage !== false,
            selectedPackageIndex:
              decodedData.selectedPackageIndex === null
                ? 1
                : decodedData.selectedPackageIndex,
          };

          // Initialize service discounts
          let initialDiscounts = normalizeDiscounts(normalizedData.discounts);
          
          if (
            !normalizedData.discounts && 
            normalizedData.selectedServices && 
            normalizedData.selectedServices.length > 0
          ) {
            const serviceDiscounts = {};
            normalizedData.selectedServices.forEach((service) => {
              serviceDiscounts[service.id] = { type: "percentage", value: 0 };
            });
            initialDiscounts.serviceDiscounts = serviceDiscounts;
          }

          return {
            proposalData: normalizedData,
            orderId: null, // URL-based proposals won't have an order ID
            status: "draft", // Default status for URL-based proposals
            discounts: initialDiscounts,
          };
        } else {
          throw new Error("No proposal data found");
        }
      } catch (error) {
        console.error("Error loading proposal:", error);
        throw error;
      }
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !data?.proposalData) {
    return <ErrorState error={error?.message || "Failed to load proposal data"} />;
  }

  const { proposalData, orderId, status, discounts } = data;

  // Check if this is a custom proposal and extract the correct data
  const isCustomProposal = proposalData.isCustomProposal || false;
  const clientName = isCustomProposal ? proposalData.clientInfo?.clientName : proposalData.clientName;
  const companyName = isCustomProposal ? proposalData.clientInfo?.companyName : proposalData.companyName;
  const proposalDate = isCustomProposal ? proposalData.clientInfo?.proposalDate : proposalData.proposalDate;
  const additionalInfo = isCustomProposal ? proposalData.clientInfo?.additionalInfo : proposalData.additionalInfo;

  // Check if this is an accepted or paid proposal
  const isAcceptedOrPaid = ["accepted", "paid"].includes(status?.toLowerCase());

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Add the simple Print Button at the top */}
        <div className="flex justify-end mb-4">
          <PrintButton
            proposalData={proposalData}
            orderId={orderId}
            status={status}
          />
        </div>

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

        {/* Custom Proposal Services */}
        {isCustomProposal && proposalData.services && proposalData.services.length > 0 && (
          <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-red-500">Services</h2>
            
            {proposalData.services.map((service, index) => (
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
        )}

        {/* Standard Proposal Packages/Services */}
        {!isCustomProposal && (
          <>
            <PackageDisplay
              selectedPackageIndex={proposalData.selectedPackageIndex}
              selectedPackage={proposalData.selectedPackage}
              discount={discounts.packageDiscount}
              onDiscountChange={() => {}}
              includePackage={proposalData.includePackage !== false}
            />

            {proposalData.selectedServices &&
              proposalData.selectedServices.length > 0 && (
                <AdditionalServices
                  selectedServices={proposalData.selectedServices}
                  discounts={discounts.serviceDiscounts}
                  onDiscountChange={() => {}}
                />
              )}
          </>
        )}

        {/* Custom Proposal Summary */}
        {isCustomProposal ? (
          <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-red-500">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-medium">
                  {proposalData.calculations.subtotal.toLocaleString()} AED
                </span>
              </div>
              
              {proposalData.discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    Discount ({proposalData.discountType === "percentage" ? `${proposalData.discount}%` : `${proposalData.discount} AED`})
                  </span>
                  <span className="text-red-400 font-medium">
                    -{proposalData.calculations.discountAmount.toLocaleString()} AED
                  </span>
                </div>
              )}
              
              {proposalData.taxIncluded && (
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
          </div>
        ) : (
          <SummarySection
            proposalData={proposalData}
            discounts={discounts}
            orderId={orderId}
            status={status}
          />
        )}

        {/* Terms and Conditions */}
        {isCustomProposal && proposalData.terms === "custom" && proposalData.customTerms && proposalData.customTerms.length > 0 ? (
          <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-red-500">Terms & Conditions</h2>
            <div className="bg-zinc-900/50 p-5 rounded-lg">
              <ol className="space-y-3 text-zinc-300 text-sm">
                {proposalData.customTerms.map((term, index) => (
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

        {/* Only show CTA section if proposal is not already paid */}
        {status !== "paid" && <ProposalCTA />}

        <ProposalFooter />
      </div>
    </div>
  );
};

export default ProposalPage;
