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

const ProposalPage = () => {
  const searchParams = useSearchParams();
  const proposalParam = searchParams.get("proposal");
  const tokenParam = searchParams.get("token");

  const [proposalData, setProposalData] = useState(null);
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

          // If the proposal has proposal_data field with data, use that directly
          if (proposal.proposal_data) {
            setProposalData(proposal.proposal_data);

            // Extract discounts from proposal_data if available
            if (proposal.proposal_data.discounts) {
              setDiscounts(
                normalizeDiscounts(proposal.proposal_data.discounts),
              );
            } else {
              // Otherwise build discounts from DB fields
              setDiscounts({
                packageDiscount: {
                  type: proposal.package_discount_type || "percentage",
                  value: proposal.package_discount_value || 0,
                },
                serviceDiscounts: {}, // Would need to fetch from proposal_services
                overallDiscount: {
                  type: proposal.overall_discount_type || "percentage",
                  value: proposal.overall_discount_value || 0,
                },
              });
            }
          }
          // If there's encoded_data, try decoding that
          else if (proposal.encoded_data) {
            const decodedData = decodeProposalData(proposal.encoded_data);
            if (decodedData) {
              setProposalData(decodedData);

              if (decodedData.discounts) {
                setDiscounts(normalizeDiscounts(decodedData.discounts));
              }
            } else {
              setError("Invalid proposal data format");
            }
          }
          // Legacy format - build data structure from db fields
          else {
            // Create data structure for legacy proposal
            setProposalData({
              clientName: proposal.client_name || proposal.client?.name,
              companyName:
                proposal.company_name || proposal.client?.company_name,
              proposalDate: proposal.proposal_date,
              additionalInfo: proposal.additional_info,
              includePackage: proposal.include_package !== false,
              selectedPackageId: proposal.package_id,
              // For legacy proposals, we need to load the package and services
              // These will be done by the component directly
            });

            setDiscounts({
              packageDiscount: {
                type: proposal.package_discount_type || "percentage",
                value: proposal.package_discount_value || 0,
              },
              serviceDiscounts: {}, // Would need to fetch from proposal_services
              overallDiscount: {
                type: proposal.overall_discount_type || "percentage",
                value: proposal.overall_discount_value || 0,
              },
            });

            // NOTE: For legacy proposals, we will need to fetch the related package and services
            // This approach is not ideal and should be migrated to the snapshot approach
            console.warn(
              "Legacy proposal format detected. Consider migrating to snapshot format.",
            );
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
              selectedPackage: decodedData.selectedPackage || null,
            };

            setProposalData(normalizedData);

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

        {/* Use the updated PackageDisplay component */}
        <PackageDisplay
          selectedPackage={proposalData.selectedPackage}
          selectedPackageIndex={proposalData.selectedPackageIndex}
          discount={discounts.packageDiscount}
          onDiscountChange={() => {}} // Dummy function since clients can't modify
          includePackage={proposalData.includePackage !== false}
        />

        {/* Use the updated AdditionalServices component */}
        {proposalData.selectedServices &&
          proposalData.selectedServices.length > 0 && (
            <AdditionalServices
              selectedServices={proposalData.selectedServices}
              discounts={discounts.serviceDiscounts}
              onDiscountChange={() => {}} // Dummy function
            />
          )}

        {/* Use the updated SummarySection component */}
        <SummarySection proposalData={proposalData} discounts={discounts} />

        <TermsAndConditions />

        <ProposalFooter />
      </div>
    </div>
  );
};

export default ProposalPage;
