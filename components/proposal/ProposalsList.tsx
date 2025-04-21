"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProposalCard from "./ProposalCard";
import { supabase } from "@/lib/supabase";

interface ProposalsListProps {
  initialProposals: any[];
}

export default function ProposalsList({
  initialProposals,
}: ProposalsListProps) {
  const [proposals, setProposals] = useState(initialProposals);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // Filter state
  const router = useRouter();

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
          links:proposal_links(*)
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

  // Filter proposals based on status
  const filteredProposals =
    filter === "all"
      ? proposals
      : proposals.filter((p) => p.status?.toLowerCase() === filter);

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
                <svg
                  className="animate-spin h-4 w-4 mr-2"
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
                Refreshing...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </>
            )}
          </button>
          <Link
            href="/proposal-generator"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create New Proposal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
}
