"use client";

import React, { useState } from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  MoreVertical,
  Trash2,
  Share2,
  Eye,
  Copy,
  ExternalLink,
} from "lucide-react";

interface ProposalCardProps {
  proposal: any;
  onDelete?: (id: string) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(proposal.status || "draft");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Delete the proposal
  const handleDelete = async () => {
    if (!proposal.id) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/proposals/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: proposal.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete proposal");
      }

      // Notify parent component about deletion to update the list
      if (onDelete) {
        onDelete(proposal.id);
      } else {
        // If no callback provided, refresh the page
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting proposal:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete proposal",
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Close menu when clicking outside
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    if (menuOpen) {
      document.addEventListener("click", closeMenu);
    }
    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [menuOpen]);

  return (
    <div className="bg-zinc-800 rounded-lg shadow-lg">
      {/* Header with Status Badge */}
      <div className="px-4 py-3 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">{proposal.client?.company_name}</h2>
          <p className="text-sm text-zinc-400">{proposal.client?.name}</p>
        </div>
        <StatusBadge
          status={status}
          proposalId={proposal.id}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Order ID Bar if available */}
      {orderId && (
        <div className="px-4 py-1 text-xs text-red-400">
          Order ID: {orderId}
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {/* Info Grid */}
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

        {/* Link Input & Copy Button */}
        {shareableLink && (
          <div className="flex rounded-md overflow-hidden text-sm mb-4">
            <input
              type="text"
              value={shareableLink}
              readOnly
              className="px-3 py-2 bg-zinc-900 text-zinc-300 flex-grow min-w-0 outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 whitespace-nowrap flex items-center"
            >
              {copied ? (
                "Copied!"
              ) : (
                <>
                  <Copy size={14} className="mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Actions Menu */}
          <div className="relative">
            <button
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded flex items-center"
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                setMenuOpen(!menuOpen);
              }}
            >
              <MoreVertical size={16} className="mr-1" />
              Actions
            </button>

            {menuOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-zinc-700 rounded-md shadow-lg z-20">
                <div className="py-1" role="menu">
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      copyToClipboard();
                      setMenuOpen(false);
                    }}
                  >
                    <Copy size={16} className="mr-2" />
                    Copy Link
                  </button>

                  {proposal.encoded_data && (
                    <Link
                      href={`/proposal?proposal=${proposal.encoded_data}`}
                      target="_blank"
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-600 transition-colors"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Original Version
                    </Link>
                  )}

                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      setMenuOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Proposal
                  </button>
                </div>
              </div>
            )}
          </div>

          {token && (
            <Link
              href={`/proposal?token=${token}`}
              className="flex-1 bg-red-600 hover:bg-red-700 text-center px-3 py-2 rounded text-sm transition-colors flex items-center justify-center"
              target="_blank"
            >
              <Share2 size={14} className="mr-1" />
              View Proposal
            </Link>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Confirm Deletion"
        message={
          <p>
            Are you sure you want to delete the proposal for{" "}
            <span className="font-semibold text-white">
              {proposal.client?.company_name}
            </span>
            ? This action cannot be undone.
          </p>
        }
        confirmText="Delete"
        cancelText="Cancel"
        isProcessing={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        icon={<Trash2 size={24} />}
      />
    </div>
  );
};

export default ProposalCard;
