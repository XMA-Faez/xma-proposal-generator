"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProposalCard from "./ProposalCard";

interface ProposalsListProps {
  initialProposals: any[];
}

export default function ProposalsList({
  initialProposals,
}: ProposalsListProps) {
  const [proposals, setProposals] = useState(initialProposals);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      <div className="flex justify-between items-center mb-6">
        <p className="text-zinc-400">{proposals.length} proposals found</p>
        <Link
          href="/proposal-generator"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Create New Proposal
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
}
