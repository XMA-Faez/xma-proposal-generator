"use client";

import React, { useState } from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import CountdownTimer from "./CountdownTimer";
import { Trash2, Share2, Copy, RefreshCw, Edit, FileText, MoreVertical } from "lucide-react";
import { InvoiceGeneratorDialog } from "@/components/invoice/InvoiceGeneratorDialog";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";

interface ProposalCardProps {
  proposal: any;
  onDelete?: (id: string) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(proposal.status || "draft");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  const token = proposal.links && proposal.links[0]?.token;
  const viewCount = (proposal.links && proposal.links[0]?.views_count) || 0;
  const orderId = proposal.order_id;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareableLink = token ? `${baseUrl}/proposal?token=${token}` : null;

  const proposalDate = new Date(proposal.proposal_date).toLocaleDateString();
  const createDate = new Date(proposal.created_at).toLocaleDateString();

  // Use expires_at from database - don't calculate for old proposals
  let expiresAt: Date | null = null;
  let hasValidExpiration = false;
  
  if (proposal.expires_at) {
    expiresAt = new Date(proposal.expires_at);
    hasValidExpiration = true;
  }
  // Don't auto-calculate for old proposals - let them exist without countdown
  
  const expirationDate = expiresAt ? expiresAt.toLocaleDateString() : null;

  // Check if proposal is expired (only if it has a valid expiration date)
  const isExpired = expiresAt ? new Date() > expiresAt : false;

  // Determine if we should show expiration info (hide for accepted/paid proposals and proposals without expiration)
  const showExpiration = hasValidExpiration && !["accepted", "paid"].includes(status.toLowerCase());

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

  // Handler for when countdown expires
  const handleCountdownExpire = async () => {
    if (status !== "expired" && !["accepted", "paid"].includes(status.toLowerCase())) {
      // Update status to expired
      try {
        const response = await fetch(`/api/update-proposal-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            id: proposal.id,
            status: 'expired' 
          }),
        });
        
        if (response.ok) {
          setStatus('expired');
        }
      } catch (error) {
        console.error('Failed to update proposal status to expired:', error);
      }
    }
  };

  // Handler for renewing expired proposals
  const handleRenew = async () => {
    if (!proposal.id) return;

    setIsRenewing(true);
    setRenewError(null);

    try {
      const response = await fetch("/api/proposals/renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: proposal.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to renew proposal");
      }

      // Update status and refresh the component
      setStatus('draft');
      // Optionally trigger a page refresh or callback to parent
      window.location.reload();
    } catch (error) {
      console.error("Error renewing proposal:", error);
      setRenewError(
        error instanceof Error ? error.message : "Failed to renew proposal",
      );
    } finally {
      setIsRenewing(false);
    }
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
            {showExpiration && expiresAt && (
              <div>
                {!isExpired && status !== "expired" ? (
                  <div className="text-xs text-zinc-400 mb-1">Expires in:</div>
                ) : null}
                <CountdownTimer 
                  expiresAt={expiresAt.toISOString()} 
                  onExpire={handleCountdownExpire}
                  className="text-xs justify-end"
                  status={status}
                />
              </div>
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

        {/* Action Buttons - Single row layout */}
        <div className="flex gap-2 items-center">
          {/* View Proposal Button */}
          {token && (
            <Link
              href={`/proposal?token=${token}`}
              className="flex-1 bg-red-600 hover:bg-red-700 text-center px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
              prefetch={true}
            >
              <Share2 size={14} className="mr-1" />
              View
            </Link>
          )}

          {/* Invoice Button */}
          <div className="flex-1">
            <InvoiceGeneratorDialog
              proposal={proposal}
              trigger={
                <button className="w-full bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center transition-colors">
                  <FileText size={14} className="mr-1" />
                  Invoice
                </button>
              }
            />
          </div>

          {/* Kebab Menu */}
          <Dropdown
            trigger={
              <button className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded transition-colors">
                <MoreVertical size={16} />
              </button>
            }
            align="right"
          >
            {/* Edit Option */}
            <Link href={`/proposals/edit/${proposal.id}`}>
              <DropdownItem>
                <Edit size={14} className="mr-2" />
                Edit Proposal
              </DropdownItem>
            </Link>

            {/* Renew Option - only for expired proposals */}
            {hasValidExpiration && (isExpired || status === "expired") && (
              <>
                <DropdownSeparator />
                <DropdownItem 
                  onClick={handleRenew}
                  disabled={isRenewing}
                >
                  <RefreshCw size={14} className={`mr-2 ${isRenewing ? 'animate-spin' : ''}`} />
                  {isRenewing ? 'Renewing...' : 'Renew Proposal'}
                </DropdownItem>
              </>
            )}

            {/* Delete Option */}
            <DropdownSeparator />
            <DropdownItem 
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-400 hover:bg-red-900/20"
            >
              <Trash2 size={14} className="mr-2" />
              Delete Proposal
            </DropdownItem>
          </Dropdown>
        </div>

        {/* Renewal Error */}
        {renewError && (
          <div className="mt-2 text-red-500 text-sm">
            Error: {renewError}
          </div>
        )}
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
