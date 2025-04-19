"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Proposal {
  id: string;
  title: string;
  proposal_date: string;
  status: string;
  created_at: string;
  encoded_data: string;
  client: {
    name: string;
    company_name: string;
  };
  links: Array<{
    token: string;
    views_count: number;
  }>;
}

export default function ProposalsList() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProposals() {
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
      } catch (err) {
        console.error("Error fetching proposals:", err);
        setError("Failed to load proposals");
      } finally {
        setLoading(false);
      }
    }

    fetchProposals();
  }, []);

  const copyToClipboard = async (text: string, proposalId: string) => {
    try {
      await navigator.clipboard.writeText(text);

      // Visual feedback - could be improved with a proper notification system
      const element = document.getElementById(`copy-${proposalId}`);
      if (element) {
        element.textContent = "Copied!";
        setTimeout(() => {
          element.textContent = "Copy Link";
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-zinc-400">Loading proposals...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            Saved Proposals
          </h1>
          <Link
            href="/proposal-generator"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create New Proposal
          </Link>
        </div>

        {proposals.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {proposals.map((proposal) => {
              const token = proposal.links && proposal.links[0]?.token;
              const viewCount =
                (proposal.links && proposal.links[0]?.views_count) || 0;
              const shareableLink = token
                ? `${window.location.origin}/proposal?token=${token}`
                : null;

              const proposalDate = new Date(
                proposal.proposal_date,
              ).toLocaleDateString();
              const createDate = new Date(
                proposal.created_at,
              ).toLocaleDateString();

              return (
                <div
                  key={proposal.id}
                  className="bg-zinc-800 rounded-lg p-5 shadow-lg"
                >
                  <div className="mb-3">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold">
                        {proposal.client.company_name}
                      </h2>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          proposal.status === "accepted"
                            ? "bg-green-900 text-green-300"
                            : proposal.status === "sent"
                              ? "bg-blue-900 text-blue-300"
                              : proposal.status === "rejected"
                                ? "bg-red-900 text-red-300"
                                : "bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        {proposal.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-zinc-400">{proposal.client.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 mb-4">
                    <div>
                      <p>Proposal Date: {proposalDate}</p>
                      <p>Created: {createDate}</p>
                    </div>
                    <div className="text-right">
                      <p>Views: {viewCount}</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {shareableLink && (
                      <div className="flex rounded-md overflow-hidden text-sm">
                        <input
                          type="text"
                          value={shareableLink}
                          readOnly
                          className="px-3 py-2 bg-zinc-900 text-zinc-300 flex-grow min-w-0 outline-none"
                        />
                        <button
                          id={`copy-${proposal.id}`}
                          onClick={() =>
                            copyToClipboard(shareableLink, proposal.id)
                          }
                          className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 whitespace-nowrap"
                        >
                          Copy Link
                        </button>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {proposal.encoded_data && (
                        <Link
                          href={`/proposal?proposal=${proposal.encoded_data}`}
                          className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-center px-3 py-2 rounded text-sm transition-colors"
                          target="_blank"
                        >
                          View Original
                        </Link>
                      )}

                      {token && (
                        <Link
                          href={`/proposal?token=${token}`}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-center px-3 py-2 rounded text-sm transition-colors"
                          target="_blank"
                        >
                          View Proposal
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
