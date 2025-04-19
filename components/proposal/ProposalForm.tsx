"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import ClientInformationForm from "./ClientInformationForm";
import PackageSelection from "./PackageSelection";
import ServiceSelection from "./ServiceSelection";
import GeneratorSummary from "./GeneratorSummary";
import ProposalSuccess from "./ProposalSuccess";

// Main Component
function ProposalForm({ initialData }) {
  // Use React Query with initialData
  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*, features:package_features(*)")
        .order("price");

      if (error) {
        console.error("Error fetching packages:", error);
        throw error;
      }
      return data || [];
    },
    initialData: initialData?.packages || [],
  });

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("price");

      if (error) {
        console.error("Error fetching services:", error);
        throw error;
      }
      return data || [];
    },
    initialData: initialData?.services || [],
  });

  // State for form inputs
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [proposalDate, setProposalDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showProposal, setShowProposal] = useState(false);
  const [proposalLink, setProposalLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [includePackage, setIncludePackage] = useState(true);
  const [discounts, setDiscounts] = useState({
    packageDiscount: { type: "percentage", value: 0 },
    serviceDiscounts: {},
    overallDiscount: { type: "percentage", value: 0 },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Set default selected package when packages are loaded
  useEffect(() => {
    if (
      packagesQuery.isSuccess &&
      packagesQuery.data &&
      packagesQuery.data.length > 0 &&
      !selectedPackageId
    ) {
      // Try to find the "Standard" package, or use the second one, or the first one
      const standardPackage = packagesQuery.data.find(
        (p) => p.name === "Standard",
      );
      const defaultPackage =
        standardPackage ||
        (packagesQuery.data.length > 1
          ? packagesQuery.data[1]
          : packagesQuery.data[0]);

      setSelectedPackageId(defaultPackage.id);
    }
  }, [packagesQuery.isSuccess, packagesQuery.data, selectedPackageId]);

  // Handle discount changes (universal handler)
  const handleDiscountChange = (
    type,
    id,
    value,
    discountType = "percentage",
  ) => {
    if (type === "package") {
      setDiscounts((prev) => ({
        ...prev,
        packageDiscount: {
          type: discountType,
          value:
            value > (discountType === "percentage" ? 100 : Infinity)
              ? discountType === "percentage"
                ? 100
                : value
              : value,
        },
      }));
    } else if (type === "service") {
      if (id !== null) {
        setDiscounts((prev) => ({
          ...prev,
          serviceDiscounts: {
            ...prev.serviceDiscounts,
            [id]: {
              type: discountType,
              value:
                value > (discountType === "percentage" ? 100 : Infinity)
                  ? discountType === "percentage"
                    ? 100
                    : value
                  : value,
            },
          },
        }));
      }
    } else if (type === "overall") {
      setDiscounts((prev) => ({
        ...prev,
        overallDiscount: {
          type: discountType,
          value:
            value > (discountType === "percentage" ? 100 : Infinity)
              ? discountType === "percentage"
                ? 100
                : value
              : value,
        },
      }));
    }
  };

  // Toggle service selection
  const toggleService = (service) => {
    if (selectedServices.some((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));

      // Remove discount for this service if it exists
      if (discounts.serviceDiscounts[service.id]) {
        const updatedDiscounts = { ...discounts };
        delete updatedDiscounts.serviceDiscounts[service.id];
        setDiscounts(updatedDiscounts);
      }
    } else {
      setSelectedServices([...selectedServices, service]);

      // Initialize discount for this service
      setDiscounts((prev) => ({
        ...prev,
        serviceDiscounts: {
          ...prev.serviceDiscounts,
          [service.id]: { type: "percentage", value: 0 },
        },
      }));
    }
  };

  // Generate proposal
  const generateProposal = async (e) => {
    e.preventDefault();

    setSaveError(null);
    setIsSaving(true);

    // Validate that at least one package or service is selected
    if (!includePackage && selectedServices.length === 0) {
      alert("Please select at least one package or service for your proposal.");
      setIsSaving(false);
      return;
    }

    try {
      // First try to get or create the client
      const { data: existingClient } = await supabase
        .from("clients")
        .select()
        .eq("company_name", companyName)
        .maybeSingle();

      let clientId;

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert({
            name: clientName,
            company_name: companyName,
            email: null,
          })
          .select()
          .single();

        if (clientError) {
          throw clientError;
        }

        clientId = newClient.id;
      }

      // Save the proposal with individual fields
      const { data: proposal, error: proposalError } = await supabase
        .from("proposals")
        .insert({
          client_id: clientId,
          title: `Proposal for ${companyName}`,
          client_name: clientName,
          company_name: companyName,
          proposal_date: proposalDate,
          additional_info: additionalInfo || null,
          include_package: includePackage,
          package_id: includePackage ? selectedPackageId : null,
          package_discount_type: discounts.packageDiscount.type,
          package_discount_value: discounts.packageDiscount.value,
          overall_discount_type: discounts.overallDiscount.type,
          overall_discount_value: discounts.overallDiscount.value,
          status: "draft",
        })
        .select()
        .single();

      if (proposalError) {
        throw proposalError;
      }

      // Save selected services
      if (selectedServices.length > 0) {
        const serviceEntries = selectedServices.map((service) => {
          const discount = discounts.serviceDiscounts[service.id] || {
            type: "percentage",
            value: 0,
          };

          return {
            proposal_id: proposal.id,
            service_id: service.id,
            discount_type: discount.type,
            discount_value: discount.value,
          };
        });

        const { error: servicesError } = await supabase
          .from("proposal_services")
          .insert(serviceEntries);

        if (servicesError) {
          throw servicesError;
        }
      }

      // Create a link token
      const token = crypto.randomUUID();

      const { data: link, error: linkError } = await supabase
        .from("proposal_links")
        .insert({
          proposal_id: proposal.id,
          token,
          views_count: 0,
        })
        .select()
        .single();

      if (linkError) {
        throw linkError;
      }

      // Create shareable link
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/proposal?token=${token}`;

      setProposalLink(url);
      setShowProposal(true);
    } catch (error) {
      console.error("Error saving proposal:", error);
      setSaveError(error.message || "Failed to save proposal to database");
    } finally {
      setIsSaving(false);
    }
  };

  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(proposalLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
  };

  // Back to generator
  const backToGenerator = () => {
    setShowProposal(false);
    setProposalLink("");
  };

  // Loading state
  if (packagesQuery.isLoading || servicesQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-zinc-400">Loading packages and services...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (packagesQuery.isError || servicesQuery.isError) {
    const error = packagesQuery.error || servicesQuery.error;
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        <div className="text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-zinc-400 mb-4">{error.message}</p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mr-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (
    (packagesQuery.data.length === 0 || servicesQuery.data.length === 0) &&
    !showProposal
  ) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center bg-zinc-900 text-white">
        <div className="text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-zinc-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h2 className="text-xl font-bold text-zinc-300 mb-2">
            No Data Found
          </h2>
          <p className="text-zinc-400 mb-4">
            {packagesQuery.data.length === 0
              ? "No packages found in the database."
              : ""}
            {servicesQuery.data.length === 0
              ? "No services found in the database."
              : ""}
          </p>
          <p className="text-zinc-400 mb-6">
            Please contact your administrator to set up the necessary data.
          </p>
        </div>
      </div>
    );
  }

  // Get the selected package
  const selectedPackage =
    packagesQuery.data.find((p) => p.id === selectedPackageId) || null;
    
  return (
    <div className="min-h-screen pt-40 bg-zinc-900 text-white py-8">
      <div className="container mx-auto px-4">
        {!showProposal ? (
          // Proposal Generator Form
          <div>
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Proposal Generator
              </h1>
              <p className="text-zinc-400 mt-2">
                Create a customized proposal for your client
              </p>
            </div>

            <form onSubmit={generateProposal} className="max-w-6xl mx-auto">
              {/* Client Information */}
              <ClientInformationForm
                clientName={clientName}
                setClientName={setClientName}
                companyName={companyName}
                setCompanyName={setCompanyName}
                proposalDate={proposalDate}
                setProposalDate={setProposalDate}
                additionalInfo={additionalInfo}
                setAdditionalInfo={setAdditionalInfo}
              />

              {/* Package Selection */}
              <PackageSelection
                packages={packagesQuery.data}
                selectedPackageId={selectedPackageId}
                setSelectedPackageId={setSelectedPackageId}
                includePackage={includePackage}
                setIncludePackage={setIncludePackage}
              />

              {/* Additional Services */}
              <ServiceSelection
                services={servicesQuery.data}
                selectedServices={selectedServices}
                toggleService={toggleService}
                includePackage={includePackage}
              />

              {/* Summary and Discounts Section */}
              {(includePackage || selectedServices.length > 0) && (
                <GeneratorSummary
                  includePackage={includePackage}
                  selectedPackage={selectedPackage}
                  selectedServices={selectedServices}
                  discounts={discounts}
                  onDiscountChange={handleDiscountChange}
                />
              )}

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating Proposal...
                    </div>
                  ) : (
                    "Generate Proposal"
                  )}
                </button>
                {saveError && (
                  <div className="mt-2 text-red-500 text-sm">
                    Error: {saveError}
                  </div>
                )}
              </div>
            </form>
          </div>
        ) : (
          // Proposal Success View
          <ProposalSuccess
            proposalLink={proposalLink}
            linkCopied={linkCopied}
            copyLinkToClipboard={copyLinkToClipboard}
            backToGenerator={backToGenerator}
            clientName={clientName}
            companyName={companyName}
            proposalDate={proposalDate}
            includePackage={includePackage}
            selectedPackage={selectedPackage}
            selectedServices={selectedServices}
          />
        )}
      </div>
    </div>
  );
}

export default ProposalForm;
