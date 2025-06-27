"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProposalCard from "./ProposalCard";
import Toast from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Plus } from "lucide-react";

interface ProposalsListProps {
  initialProposals: any[];
}

export default function ProposalsList({
  initialProposals,
}: ProposalsListProps) {
  const [proposals, setProposals] = useState(initialProposals);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // Filter state
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  // Function to refresh proposals data
  const refreshProposals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("proposals")
        .select(
          `
          *,
          client:clients(*),
          links:proposal_links(*),
          package:packages(*)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProposals(data || []);
    } catch (error) {
      console.error("Error refreshing proposals:", error);
    } finally {
      setIsLoading(false);
    }
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

  // Filter proposals based on status
  const filteredProposals =
    filter === "all"
      ? proposals
      : proposals.filter((p) => p.status?.toLowerCase() === filter);

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
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center">
          <p className="text-zinc-400 mr-4">
            {filteredProposals.length} proposals found
          </p>

          {/* Status filter */}
          <div className="bg-zinc-800 rounded-lg p-1 flex">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "all" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "draft" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"}`}
            >
              Draft
            </button>
            <button
              onClick={() => setFilter("sent")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "sent" ? "bg-blue-900 text-blue-300" : "text-zinc-400 hover:text-white"}`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilter("accepted")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "accepted" ? "bg-green-900 text-green-300" : "text-zinc-400 hover:text-white"}`}
            >
              Accepted
            </button>
            <button
              onClick={() => setFilter("paid")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "paid" ? "bg-purple-900 text-purple-300" : "text-zinc-400 hover:text-white"}`}
            >
              Paid
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
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
