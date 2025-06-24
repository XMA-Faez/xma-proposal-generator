"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProposalForm from "@/components/proposal/ProposalForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposalData, setProposalData] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const resolvedParams = await params;
        // Fetch the proposal
        const { data: proposal, error: proposalError } = await supabase
          .from("proposals")
          .select(`
            *,
            clients (*),
            package:packages (*),
            proposal_services (
              *,
              service:services (*)
            )
          `)
          .eq("id", resolvedParams.id)
          .single();

        if (proposalError) throw proposalError;

        // Fetch packages and services for the form
        const [packagesResponse, servicesResponse] = await Promise.all([
          supabase.from("packages").select("*, features:package_features(*)").order("price"),
          supabase.from("services").select("*").order("price")
        ]);

        if (packagesResponse.error) throw packagesResponse.error;
        if (servicesResponse.error) throw servicesResponse.error;

        // Prepare the form data from the proposal
        const formData = proposal.proposal_data || {};
        
        // Convert database field names to form field names
        const mappedData = {
          clientName: proposal.client_name || formData.clientName,
          companyName: proposal.company_name || formData.companyName,
          proposalDate: proposal.proposal_date || formData.proposalDate,
          additionalInfo: proposal.additional_info || formData.additionalInfo,
          includePackage: proposal.include_package ?? formData.includePackage ?? true,
          selectedPackageId: proposal.package_id || formData.selectedPackageId,
          selectedPackage: proposal.package || formData.selectedPackage, // Add the full package object
          includeTax: proposal.include_tax ?? formData.includeTax ?? true,
          validityDays: proposal.validity_days || formData.validityDays || 30,
          discounts: formData.discounts || {
            packageDiscount: {
              type: proposal.package_discount_type || "percentage",
              value: proposal.package_discount_value || 0
            },
            serviceDiscounts: proposal.proposal_services?.reduce((acc: any, ps: any) => {
              if (ps.service) {
                acc[ps.service.id] = {
                  type: ps.discount_type || "percentage",
                  value: ps.discount_value || 0
                };
              }
              return acc;
            }, {}) || {},
            overallDiscount: {
              type: proposal.overall_discount_type || "percentage", 
              value: proposal.overall_discount_value || 0
            }
          },
          selectedServices: proposal.proposal_services?.map((ps: any) => ps.service) || formData.selectedServices || []
        };
        
        
        setProposalData({
          ...proposal,
          ...mappedData,
          proposalId: proposal.id,
          isEdit: true
        });

        setInitialData({
          packages: packagesResponse.data || [],
          services: servicesResponse.data || []
        });

      } catch (err) {
        console.error("Error fetching proposal:", err);
        setError(err instanceof Error ? err.message : "Failed to load proposal");
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [params]);

  const handleSubmit = async (formData: any) => {
    try {
      
      // Call the API route to update the proposal
      const response = await fetch("/api/proposals/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalId: proposalData.proposalId,
          formData: formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update proposal");
      }

      // Redirect with refresh
      window.location.href = "/proposals";
    } catch (error) {
      console.error("Error updating proposal:", error);
      alert(`Error updating proposal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-full mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Proposal</h2>
          <p className="text-zinc-400">Please wait while we fetch the proposal details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-950/40 rounded-full mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Unable to Load Proposal</h2>
          <p className="text-zinc-400 mb-6 leading-relaxed">{error}</p>
          <Link
            href="/proposals"
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Proposals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header Section */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/proposals"
                className="inline-flex items-center text-zinc-400 hover:text-white transition-colors duration-200 group"
              >
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Proposals</span>
              </Link>
              <div className="hidden sm:block w-px h-6 bg-zinc-700"></div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-white">Edit Proposal</h1>
                <p className="text-sm text-zinc-400 mt-1">
                  Make changes to your proposal details and settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Header */}
        <div className="sm:hidden mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Edit Proposal</h1>
          <p className="text-zinc-400">Make changes to your proposal details and settings</p>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-amber-300 font-semibold mb-1">Editing Existing Proposal</h3>
              <p className="text-amber-200/70 text-sm leading-relaxed">
                You're modifying an existing proposal. All changes will be saved immediately and will be visible to clients who have the proposal link. The original creation date will be preserved.
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="rounded-xl">
          <div className="p-6 sm:p-8">
            <ProposalEditForm 
              proposalData={proposalData} 
              initialData={initialData}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced ProposalForm wrapper for editing
function ProposalEditForm({ proposalData, initialData, onSubmit }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {isSubmitting && (
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="bg-zinc-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent"></div>
              <div>
                <p className="text-white font-medium">Saving Changes</p>
                <p className="text-zinc-400 text-sm">Please wait while we update your proposal...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ProposalForm 
        initialData={initialData} 
        editMode={true}
        existingProposal={proposalData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
