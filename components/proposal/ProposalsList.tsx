"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProposalCard from "./ProposalCard";
import Toast from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Plus, Search } from "lucide-react";

interface ProposalsListProps {
  initialProposals: any[];
  userRole: "admin" | "sales_rep";
}

export default function ProposalsList({
  initialProposals,
  userRole,
}: ProposalsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [proposals, setProposals] = useState(initialProposals);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get filter and search from URL parameters
  const filter = searchParams.get("filter") || "all";
  const searchQuery = searchParams.get("search") || "";
  const createdBy = searchParams.get("created_by");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  // Function to refresh proposals data
  const refreshProposals = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "archived") {
        params.set("archivedOnly", "true");
      } else {
        // For non-archived filters, we want to exclude archived proposals
        params.set("includeArchived", "false");
      }
      if (createdBy) {
        params.set("createdBy", createdBy);
      }
      
      const response = await fetch(`/api/proposals?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }
      
      const result = await response.json();
      setProposals(result.proposals || []);
    } catch (error) {
      console.error("Error refreshing proposals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data when URL parameters change
  useEffect(() => {
    refreshProposals();
  }, [filter, createdBy]);

  // Function to update URL parameters
  const updateUrlParams = (newFilter?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newFilter !== undefined) {
      if (newFilter === "all") {
        params.delete("filter");
      } else {
        params.set("filter", newFilter);
      }
    }
    
    if (newSearch !== undefined) {
      if (newSearch === "") {
        params.delete("search");
      } else {
        params.set("search", newSearch);
      }
    }
    
    // Keep other params like created_by
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.push(newUrl);
  };

  // Handle proposal deletion
  const handleDelete = (deletedId: string) => {
    // Update the local state to remove the deleted proposal
    setProposals((currentProposals) => 
      currentProposals.filter((proposal) => proposal.id !== deletedId)
    );
    
    // Show toast notification
    setToast({
      visible: true,
      message: "Proposal deleted successfully",
      type: "success"
    });
  };
  
  // Close toast notification
  const handleCloseToast = () => {
    setToast({...toast, visible: false});
  };

  // Filter proposals based on status and search query
  const filteredProposals = proposals.filter((proposal) => {
    // Archived filter
    if (filter === "archived") {
      return proposal.archived_at !== null;
    } else if (filter !== "all") {
      // Regular status filter (only for non-archived)
      return proposal.archived_at === null && proposal.status?.toLowerCase() === filter;
    } else {
      // "all" filter - only show non-archived
      return proposal.archived_at === null;
    }
  }).filter((proposal) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const clientName = proposal.client?.name?.toLowerCase() || "";
      const companyName = proposal.client?.company_name?.toLowerCase() || proposal.company_name?.toLowerCase() || "";
      const orderId = proposal.order_id?.toLowerCase() || "";
      
      return (
        clientName.includes(query) ||
        companyName.includes(query) ||
        orderId.includes(query)
      );
    }
    
    return true;
  });

  // Group proposals by month
  const groupProposalsByMonth = (proposals: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    
    proposals.forEach((proposal) => {
      const date = new Date(proposal.created_at);
      const monthYear = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(proposal);
    });
    
    // Convert to array and sort by date (newest first)
    return Object.entries(grouped).sort((a, b) => {
      const dateA = new Date(a[1][0].created_at);
      const dateB = new Date(b[1][0].created_at);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const groupedProposals = groupProposalsByMonth(filteredProposals);

  if (proposals.length === 0) {
    return (
      <div className="bg-zinc-800 rounded-lg p-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-zinc-600 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-zinc-400 mb-6">No proposals found</p>
        <Link
          href="/proposal-generator"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors inline-block"
        >
          Create Your First Proposal
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Toast notification */}
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
      
      <div className="flex flex-col gap-4 mb-6">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by client name, company, or order ID..."
            value={searchQuery}
            onChange={(e) => updateUrlParams(undefined, e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-red-600"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <p className="text-zinc-400 mr-4">
              {filteredProposals.length} proposals found
            </p>

            {/* Status filter */}
            <div className="bg-zinc-800 rounded-lg p-1 flex">
              <button
                onClick={() => updateUrlParams("all")}
                className={`px-3 py-1 text-sm rounded-md ${filter === "all" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                All
              </button>
              <button
                onClick={() => updateUrlParams("draft")}
                className={`px-3 py-1 text-sm rounded-md ${filter === "draft" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Draft
              </button>
              <button
                onClick={() => updateUrlParams("sent")}
                className={`px-3 py-1 text-sm rounded-md ${filter === "sent" ? "bg-blue-900 text-blue-300" : "text-zinc-400 hover:text-white"}`}
              >
                Sent
              </button>
              <button
                onClick={() => updateUrlParams("accepted")}
                className={`px-3 py-1 text-sm rounded-md ${filter === "accepted" ? "bg-green-900 text-green-300" : "text-zinc-400 hover:text-white"}`}
              >
                Accepted
              </button>
              <button
                onClick={() => updateUrlParams("paid")}
                className={`px-3 py-1 text-sm rounded-md ${filter === "paid" ? "bg-purple-900 text-purple-300" : "text-zinc-400 hover:text-white"}`}
              >
                Paid
              </button>
              <button
                onClick={() => updateUrlParams("archived")}
                className={`px-3 py-1 text-sm rounded-md ${filter === "archived" ? "bg-orange-900 text-orange-300" : "text-zinc-400 hover:text-white"}`}
              >
                Archived
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshProposals}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </button>
            <Link
              href="/proposal-generator"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Proposal
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {groupedProposals.map(([monthYear, monthProposals]) => (
          <div key={monthYear}>
            <h2 className="text-xl font-semibold text-zinc-300 mb-4 pb-2 border-b border-zinc-700 flex items-center justify-between">
              <span>{monthYear}</span>
              <span className="text-sm font-normal text-zinc-400">
                {(() => {
                  const businessNames = monthProposals
                    .map(p => p.client?.company_name)
                    .filter(name => name && name.trim() !== '');
                  const uniqueBusinesses = new Set(businessNames).size;
                  return (
                    <>
                      {monthProposals.length} {monthProposals.length === 1 ? 'proposal' : 'proposals'} 
                      <span className="text-zinc-500 ml-2">
                        ({uniqueBusinesses} unique {uniqueBusinesses === 1 ? 'proposal' : 'proposals'})
                      </span>
                    </>
                  );
                })()}
              </span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {monthProposals.map((proposal) => (
                <ProposalCard 
                  key={proposal.id} 
                  proposal={proposal} 
                  onDelete={handleDelete}
                  userRole={userRole}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
