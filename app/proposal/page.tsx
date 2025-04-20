"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

const ProposalPage = () => {
  const searchParams = useSearchParams();
  const proposalParam = searchParams.get("proposal");
  const tokenParam = searchParams.get("token");

  const [proposalData, setProposalData] = useState(null);
  const [orderId, setOrderId] = useState<string | null>(null); // Add state for order ID
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discounts, setDiscounts] = useState({
    packageDiscount: { type: "percentage", value: 0 },
    serviceDiscounts: {},
    overallDiscount: { type: "percentage", value: 0 },
  });

  useEffect(() => {
    async function fetchProposalData() {
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
            setError("Invalid proposal link");
            setIsLoading(false);
            return;
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
            setError("Failed to load proposal");
            setIsLoading(false);
            return;
          }

          // Update the view count
          await supabase
            .from("proposal_links")
            .update({ views_count: (link.views_count || 0) + 1 })
            .eq("token", tokenParam);

          // Set the proposal data from the stored JSON
          setProposalData(proposal.proposal_data);

          // Set the order ID from the database
          setOrderId(proposal.order_id);

          if (proposal.proposal_data.discounts) {
            setDiscounts(normalizeDiscounts(proposal.proposal_data.discounts));
          }
        }
        // If we have encoded proposal data directly in the URL
        else if (proposalParam) {
          const decodedData = decodeProposalData(proposalParam);
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

            // URL-based proposals won't have an order ID
            setOrderId(null);

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
        } else {
          setError("No proposal data found");
        }
      } catch (error) {
        console.error("Error loading proposal:", error);
        setError("Failed to load proposal data");
      } finally {
        setIsLoading(false);
      }
    }

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

    fetchProposalData();
  }, [proposalParam, tokenParam]);

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
          orderId={orderId} // Pass the order ID to the header
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

        <SummarySection
          proposalData={proposalData}
          discounts={discounts}
          orderId={orderId} // Pass the order ID to the summary section
        />

        <TermsAndConditions />

        <ProposalCTA />

        <ProposalFooter />
      </div>
    </div>
  );
};

export default ProposalPage;
