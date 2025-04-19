"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/proposalUtils";
import { supabase } from "@/lib/supabase";
import GeneratorSummary from "@/components/proposal/GeneratorSummary";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

// Wrapper component with QueryClientProvider
export default function ProposalGeneratorPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProposalGenerator />
    </QueryClientProvider>
  );
}

// Service Info Component
const ServiceInfo = ({ service }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="relative">
      <div
        className="text-blue-400 cursor-pointer hover:text-blue-300 ml-2"
        onClick={() => setShowInfo(!showInfo)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 inline"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {showInfo && (
        <div className="absolute z-10 top-0 left-6 w-64 p-3 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg text-sm">
          {service.description}
        </div>
      )}
    </div>
  );
};

// Package Card Component
const PackageCard = ({ pkg, isSelected, onSelect }) => (
  <div
    className={`flex flex-col h-full rounded-xl border ${
      isSelected ? "border-red-500 shadow-lg" : "border-zinc-700"
    } ${
      pkg.is_popular && !isSelected ? "border-zinc-600" : ""
    } bg-zinc-900 backdrop-blur-sm transition-all hover:shadow-xl cursor-pointer`}
    onClick={() => onSelect(pkg.id)}
  >
    {pkg.is_popular && (
      <div className="bg-red-600 text-white text-center py-1 px-4 text-sm font-medium rounded-t-xl">
        Most Popular
      </div>
    )}
    <div className="p-6 flex flex-col h-full">
      <h3
        className={`text-xl font-bold ${pkg.is_popular ? "text-red-500" : "text-white"} mb-2`}
      >
        {pkg.name}
      </h3>
      <div className="mb-6">
        <div className="flex items-end">
          <span className="text-3xl font-bold text-white">
            {formatPrice(pkg.price)}
          </span>
          <span className="text-zinc-400 ml-2 mb-1">{pkg.currency}</span>
        </div>
        <div className="text-zinc-400 text-sm mt-1">
          ${formatPrice(pkg.usd_price)} USD
        </div>
      </div>
      <div className="flex-grow">
        <ul className="space-y-3">
          {pkg.features &&
            pkg.features
              .sort((a, b) => a.order_index - b.order_index)
              .map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center ml-0">
                  <div className="mr-2 mt-0.5">
                    {feature.is_included ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-zinc-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`${feature.is_included ? "" : "text-zinc-500"} ${feature.is_bold ? "font-bold" : ""}`}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
        </ul>
      </div>
      <div className="mt-6 text-sm text-zinc-400">{pkg.description}</div>
      <div
        className={`mt-4 w-full py-2 text-center rounded-md ${
          isSelected
            ? "bg-red-600 text-white font-medium"
            : "bg-zinc-800 text-zinc-300"
        }`}
      >
        {isSelected ? "Selected" : "Select Package"}
      </div>
    </div>
  </div>
);

// Main Component
const ProposalGenerator = () => {
  // Fetch packages using React Query
  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("price");

      if (error) {
        console.error("Error fetching packages:", error);
        throw error;
      }

      console.log("Packages from DB:", data);
      return data || [];
    },
  });

  // Fetch services using React Query
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

      console.log("Services from DB:", data);
      return data || [];
    },
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
      packagesQuery.data.length > 0
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
  }, [packagesQuery.isSuccess, packagesQuery.data]);

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

  // Seed database with initial data if needed
  const seedDatabase = async () => {
    try {
      // Insert packages
      const packagesData = [
        {
          name: "Base",
          price: 8000,
          currency: "AED",
          usd_price: 2300,
          is_popular: false,
          description:
            "Our Base package is perfect for businesses just starting their digital marketing journey. It provides essential advertising assets and foundational tools to establish your online presence and begin generating leads.",
        },
        {
          name: "Standard",
          price: 15000,
          currency: "AED",
          usd_price: 4500,
          is_popular: true,
          description:
            "Our most popular option, the Standard package delivers the perfect balance of value and performance. With more than double the advertising assets of the Base package, it gives you the resources needed to create a comprehensive marketing strategy.",
        },
        {
          name: "Premium",
          price: 25000,
          currency: "AED",
          usd_price: 6800,
          is_popular: false,
          description:
            "The Premium package is designed for businesses ready to dominate their market. With our most comprehensive set of advertising assets and full-service implementation, this package delivers maximum impact and results.",
        },
      ];

      const { data: insertedPackages, error: packagesError } = await supabase
        .from("packages")
        .insert(packagesData)
        .select();

      if (packagesError) throw packagesError;

      // Insert package features
      const featuresData = [];

      // Base package features
      featuresData.push(
        {
          package_id: insertedPackages[0].id,
          text: "8 Total Ads",
          is_bold: true,
          is_included: true,
          order_index: 0,
        },
        {
          package_id: insertedPackages[0].id,
          text: "5 Static Ads",
          is_bold: false,
          is_included: true,
          order_index: 1,
        },
        {
          package_id: insertedPackages[0].id,
          text: "3 Video Ads",
          is_bold: false,
          is_included: true,
          order_index: 2,
        },
        {
          package_id: insertedPackages[0].id,
          text: "Ad Campaign(s) Set-up",
          is_bold: false,
          is_included: true,
          order_index: 3,
        },
        {
          package_id: insertedPackages[0].id,
          text: "CRM",
          is_bold: false,
          is_included: true,
          order_index: 4,
        },
        {
          package_id: insertedPackages[0].id,
          text: "WhatsApp Integration",
          is_bold: false,
          is_included: true,
          order_index: 5,
        },
      );

      // Standard package features
      featuresData.push(
        {
          package_id: insertedPackages[1].id,
          text: "18 Total Ads",
          is_bold: true,
          is_included: true,
          order_index: 0,
        },
        {
          package_id: insertedPackages[1].id,
          text: "10 Static Ads",
          is_bold: false,
          is_included: true,
          order_index: 1,
        },
        {
          package_id: insertedPackages[1].id,
          text: "8 Video Ads",
          is_bold: false,
          is_included: true,
          order_index: 2,
        },
        {
          package_id: insertedPackages[1].id,
          text: "Ad Campaign(s) Set-up",
          is_bold: false,
          is_included: true,
          order_index: 3,
        },
        {
          package_id: insertedPackages[1].id,
          text: "CRM",
          is_bold: false,
          is_included: true,
          order_index: 4,
        },
        {
          package_id: insertedPackages[1].id,
          text: "WhatsApp Integration",
          is_bold: false,
          is_included: true,
          order_index: 5,
        },
      );

      // Premium package features
      featuresData.push(
        {
          package_id: insertedPackages[2].id,
          text: "34 Total Ads",
          is_bold: true,
          is_included: true,
          order_index: 0,
        },
        {
          package_id: insertedPackages[2].id,
          text: "20 Static Ads",
          is_bold: false,
          is_included: true,
          order_index: 1,
        },
        {
          package_id: insertedPackages[2].id,
          text: "14 Video Ads",
          is_bold: false,
          is_included: true,
          order_index: 2,
        },
        {
          package_id: insertedPackages[2].id,
          text: "Ad Campaign(s) Set-up",
          is_bold: false,
          is_included: true,
          order_index: 3,
        },
        {
          package_id: insertedPackages[2].id,
          text: "CRM",
          is_bold: false,
          is_included: true,
          order_index: 4,
        },
        {
          package_id: insertedPackages[2].id,
          text: "WhatsApp Integration",
          is_bold: false,
          is_included: true,
          order_index: 5,
        },
      );

      const { error: featuresError } = await supabase
        .from("package_features")
        .insert(featuresData);

      if (featuresError) throw featuresError;

      // Insert services
      const servicesData = [
        {
          name: "Website Optimization",
          price: 5000,
          currency: "AED",
          description:
            "Transform your existing website into a high-converting sales machine. Our optimization service includes speed improvements, SEO enhancements, mobile responsiveness, and conversion rate optimization to ensure your website performs at its best.",
          is_monthly: false,
        },
        {
          name: "Website Creation",
          price: 10000,
          currency: "AED",
          description:
            "Get a professionally designed, custom-built website that perfectly represents your brand. Includes responsive design, SEO optimization, content management system, contact forms, and integration with your marketing tools.",
          is_monthly: false,
        },
        {
          name: "CRM",
          price: 3000,
          currency: "AED",
          description:
            "Our CRM solution helps you manage customer relationships effectively. Includes lead capture, customer segmentation, automated follow-ups, sales pipeline management, and detailed reporting. Setup fee plus monthly subscription.",
          is_monthly: true,
          setup_fee: 300,
        },
        {
          name: "Content Package",
          price: 7500,
          currency: "AED",
          description:
            "Get 5 professionally produced videos to showcase your products or services. Our content team handles everything from concept to final delivery, ensuring high-quality videos that engage your audience and drive conversions.",
          is_monthly: false,
        },
      ];

      const { error: servicesError } = await supabase
        .from("services")
        .insert(servicesData);

      if (servicesError) throw servicesError;

      // Refresh queries to show new data
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });

      alert("Database seeded successfully!");
    } catch (error) {
      console.error("Error seeding database:", error);
      alert(`Error seeding database: ${error.message}`);
    }
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
              queryClient.invalidateQueries({ queryKey: ["packages"] });
              queryClient.invalidateQueries({ queryKey: ["services"] });
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mr-2"
          >
            Try Again
          </button>

          <button
            onClick={seedDatabase}
            className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded"
          >
            Seed Database
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
          <button
            onClick={seedDatabase}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
          >
            Initialize with Sample Data
          </button>
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
              <div className="bg-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 text-red-500">
                  Client Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Client Name*
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Company Name*
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Proposal Date*
                  </label>
                  <input
                    type="date"
                    value={proposalDate}
                    onChange={(e) => setProposalDate(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Add any specific requirements, project details, or notes for the client..."
                    className="w-full h-32 bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    This information will be displayed in the proposal and can
                    include project scope, timeline expectations, or any other
                    relevant details.
                  </p>
                </div>
              </div>

              {/* Package Selection */}
              <div className="bg-zinc-800 rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-red-500">
                    Select Package
                  </h2>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePackage}
                        onChange={() => setIncludePackage(!includePackage)}
                        className="sr-only"
                      />
                      <div
                        className={`relative w-10 h-5 rounded-full transition-colors ${includePackage ? "bg-red-500" : "bg-zinc-700"}`}
                      >
                        <div
                          className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${includePackage ? "translate-x-5" : ""}`}
                        />
                      </div>
                      <span className="ml-2 text-sm text-zinc-300">
                        Include Package
                      </span>
                    </label>
                  </div>
                </div>

                {includePackage && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {packagesQuery.data.map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        isSelected={selectedPackageId === pkg.id}
                        onSelect={setSelectedPackageId}
                      />
                    ))}
                  </div>
                )}

                {!includePackage && (
                  <div className="bg-zinc-900 p-6 rounded-lg text-center">
                    <p className="text-zinc-400">
                      Package selection is disabled. You can add additional
                      services below.
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Services */}
              <div className="bg-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 text-red-500">
                  {includePackage
                    ? "Additional Services (Optional)"
                    : "Services"}
                </h2>
                <div className="space-y-4">
                  {servicesQuery.data.map((service) => {
                    const isSelected = selectedServices.some(
                      (s) => s.id === service.id,
                    );

                    return (
                      <div
                        key={service.id}
                        className={`flex flex-col p-4 rounded-lg ${isSelected ? "bg-zinc-900 border border-red-500/50" : "bg-zinc-900"}`}
                      >
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            id={`service-${service.id}`}
                            checked={isSelected}
                            onChange={() => toggleService(service)}
                            className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-600 rounded bg-zinc-700"
                          />
                          <label
                            htmlFor={`service-${service.id}`}
                            className="ml-3 flex-grow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="block font-medium">
                                  {service.name}
                                </span>
                                <span className="block text-sm text-zinc-400 mt-1">
                                  {service.description &&
                                    service.description.substring(0, 80)}
                                  ...
                                  <ServiceInfo service={service} />
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="block font-medium">
                                  {formatPrice(service.price)}{" "}
                                  {service.currency}
                                  {service.is_monthly &&
                                    ` + ${service.setup_fee}/mo`}
                                </span>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

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
          // Proposal Preview
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Proposal Created Successfully
              </h1>
              <p className="text-zinc-400 mt-2">
                Your proposal has been saved to the database and is ready to
                share
              </p>
            </div>

            {/* Shareable Link Section */}
            <div className="mb-8 bg-zinc-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-red-500">
                Proposal Link
              </h3>

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={proposalLink}
                    readOnly
                    className="flex-grow bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none w-full md:w-auto"
                  />
                  <button
                    onClick={copyLinkToClipboard}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap w-full md:w-auto"
                  >
                    {linkCopied ? "Copied!" : "Copy Link"}
                  </button>
                </div>

                <div className="mt-4 text-sm text-zinc-400">
                  <p>
                    Share this link with your client. They can view the proposal
                    without needing to create an account.
                  </p>
                </div>

                <div className="mt-6 flex flex-col md:flex-row gap-4">
                  <a
                    href={proposalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md transition-colors text-center"
                  >
                    Open in New Tab
                  </a>
                  <button
                    onClick={() => {
                      // Create a direct email link with subject and body
                      const subject = encodeURIComponent(
                        `Marketing Proposal for ${companyName}`,
                      );
                      const body = encodeURIComponent(
                        `Dear ${clientName},\n\nThank you for your interest in XMA Agency. We've prepared a custom marketing proposal for ${companyName}.\n\nYou can view your proposal here: ${proposalLink}\n\nPlease let us know if you have any questions.\n\nBest regards,\nXMA Agency Team`,
                      );
                      window.location.href = `mailto:?subject=${subject}&body=${body}`;
                    }}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md transition-colors text-center"
                  >
                    Email This Link
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-zinc-800 rounded-lg p-6 mb-8">
              <div className="mb-4 text-center">
                <img
                  src="/XMA-White.svg"
                  alt="XMA Agency Logo"
                  className="h-10 mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-red-500">
                  Proposal Summary
                </h2>
              </div>

              {/* Client Information */}
              <div className="mb-6 pb-6 border-b border-zinc-700">
                <h3 className="text-lg font-bold mb-2 text-red-500">
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-900/50 p-3 rounded-lg">
                    <p className="text-sm text-zinc-400">Name:</p>
                    <p className="font-medium">{clientName}</p>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-lg">
                    <p className="text-sm text-zinc-400">Company:</p>
                    <p className="font-medium">{companyName}</p>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-lg">
                    <p className="text-sm text-zinc-400">Date:</p>
                    <p className="font-medium">{proposalDate}</p>
                  </div>
                </div>
              </div>

              {/* Selected Packages and Services */}
              <div className="mb-6 pb-6 border-b border-zinc-700">
                <h3 className="text-lg font-bold mb-2 text-red-500">
                  Proposal Contents
                </h3>
                <div className="space-y-3">
                  {includePackage && selectedPackage && (
                    <div className="bg-zinc-900/50 p-3 rounded-lg">
                      <p className="text-sm text-zinc-400">Package:</p>
                      <p className="font-medium">{selectedPackage.name}</p>
                    </div>
                  )}

                  {selectedServices.length > 0 && (
                    <div className="bg-zinc-900/50 p-3 rounded-lg">
                      <p className="text-sm text-zinc-400">Services:</p>
                      <ul className="mt-1 space-y-1">
                        {selectedServices.map((service) => (
                          <li key={service.id} className="font-medium">
                            {service.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-zinc-400">
                  View the complete proposal by clicking the link above.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-12">
              <button
                onClick={backToGenerator}
                className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create Another Proposal
              </button>

              <div className="flex flex-col md:flex-row gap-4">
                <Link
                  href="/proposals"
                  className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 px-6 rounded-lg transition-colors text-center"
                >
                  View All Proposals
                </Link>

                <Link
                  href={proposalLink}
                  target="_blank"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors text-center"
                >
                  View Full Proposal
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
