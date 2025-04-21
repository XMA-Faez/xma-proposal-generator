"use client";

import React, { useState } from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";

interface ProposalCardProps {
  proposal: any;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(proposal.status || "draft");

  const token = proposal.links && proposal.links[0]?.token;
  const viewCount = (proposal.links && proposal.links[0]?.views_count) || 0;
  const orderId = proposal.order_id;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareableLink = token ? `${baseUrl}/proposal?token=${token}` : null;

  const proposalDate = new Date(proposal.proposal_date).toLocaleDateString();
  const createDate = new Date(proposal.created_at).toLocaleDateString();

  // Calculate expiration date (30 days from proposal date)
  const expDate = new Date(proposal.proposal_date);
  expDate.setDate(expDate.getDate() + 30);
  const expirationDate = expDate.toLocaleDateString();

  // Check if proposal is expired
  const isExpired = new Date() > expDate;

  // Determine if we should show expiration date (hide for accepted/paid proposals)
  const showExpiration = !["accepted", "paid"].includes(status.toLowerCase());

  const copyToClipboard = async () => {
    if (!shareableLink) return;

    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Handler for status changes
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-5 shadow-lg">
      <div className="mb-3">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">{proposal.client?.company_name}</h2>
          <StatusBadge
            status={status}
            proposalId={proposal.id}
            onStatusChange={handleStatusChange}
          />
        </div>
        <p className="text-zinc-400">{proposal.client?.name}</p>

        {/* Display Order ID if available */}
        {orderId && (
          <div className="mt-2">
            <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">
              Order ID: {orderId}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 mb-4">
        <div>
          <p>Proposal Date: {proposalDate}</p>
          <p>Created: {createDate}</p>
        </div>
        <div className="text-right">
          <p>Views: {viewCount}</p>
          {showExpiration && (
            <p className={isExpired ? "text-red-400" : ""}>
              {isExpired ? "Expired: " : "Expires: "}
              {expirationDate}
            </p>
          )}
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
              onClick={copyToClipboard}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy Link"}
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
};

export default ProposalCard;
