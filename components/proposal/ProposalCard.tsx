"use client";

import React, { useState } from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import CountdownTimer from "./CountdownTimer";
import { Card } from "@/components/ui/design-card";
import {
  Trash2,
  Share2,
  Copy,
  RefreshCw,
  Edit,
  FileText,
  MoreHorizontal,
  Archive,
} from "lucide-react";
import { InvoiceGeneratorDialog } from "@/components/invoice/InvoiceGeneratorDialog";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown";
import { Button } from "../ui/button";

interface ProposalCardProps {
  proposal: any;
  onDelete?: (id: string) => void;
  userRole?: "admin" | "sales_rep";
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onDelete,
  userRole,
}) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(proposal.status || "draft");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
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
  const showExpiration =
    hasValidExpiration && !["accepted", "paid"].includes(status.toLowerCase());

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
    if (
      status !== "expired" &&
      !["accepted", "paid"].includes(status.toLowerCase())
    ) {
      // Update status to expired
      try {
        const response = await fetch(`/api/update-proposal-status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: proposal.id,
            status: "expired",
          }),
        });

        if (response.ok) {
          setStatus("expired");
        }
      } catch (error) {
        console.error("Failed to update proposal status to expired:", error);
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
      setStatus("draft");
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

  // Archive the proposal
  const handleArchive = async () => {
    if (!proposal.id) return;

    setIsArchiving(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/proposals/archive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proposalId: proposal.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to archive proposal");
      }

      // Notify parent component about archival to update the list
      if (onDelete) {
        onDelete(proposal.id);
      } else {
        // If no callback provided, refresh the page
        window.location.reload();
      }
    } catch (error) {
      console.error("Error archiving proposal:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to archive proposal",
      );
    } finally {
      setIsArchiving(false);
      setShowDeleteConfirm(false);
    }
  };

  const isArchived = proposal.archived_at !== null;

  // Get status color for left border
  const getStatusBorderColor = () => {
    switch (status.toLowerCase()) {
      case "draft": return "border-l-status-draft";
      case "sent": return "border-l-status-sent";
      case "accepted": return "border-l-status-accepted";
      case "paid": return "border-l-status-paid";
      case "expired": return "border-l-status-expired";
      case "rejected": return "border-l-status-rejected";
      default: return "border-l-border-primary";
    }
  };

  return (
    <Card
      variant="primary"
      size="none"
      className={`shadow-lg transition-all hover:shadow-xl hover:border-border-interactive border-l-4 ${getStatusBorderColor()} ${isArchived ? "opacity-75 border border-status-expired/30" : ""}`}
    >
      {/* Header with Status Badge */}
      <div className="px-4 py-2 flex justify-between items-center border-b border-border-secondary">
        <div className="flex gap-3">
          {isArchived && <Archive className="h-5 w-5 text-orange-400" />}
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/proposal?token=${token}`}
                className=""
                prefetch={true}
                target="_blank"
              >
                <h2
                  className={`text-lg font-bold hover:text-text-secondary transition-colors flex items-center gap-1`}
                >
                  {proposal.client?.company_name || proposal.company_name}
                </h2>
              </Link>
              {shareableLink && (
                <button
                  onClick={copyToClipboard}
                  className="text-text-muted h-min hover:text-text-primary transition-colors flex items-center gap-1"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
            <p className="text-sm text-text-muted">
              {proposal.client?.name || proposal.client_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            status={status}
            proposalId={proposal.id}
            onStatusChange={handleStatusChange}
          />
          {isArchived && (
            <span className="text-xs bg-status-expired/30 text-status-expired px-2 py-1 rounded">
              Archived
            </span>
          )}
          <Dropdown
          trigger={
            <button className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-interactive rounded transition-colors">
              <MoreHorizontal size={16} />
            </button>
          }
          align="right"
        >
          <DropdownItem className="flex items-center gap-2">
            <InvoiceGeneratorDialog
              proposal={proposal}
              trigger={
                <button className="transition-colors flex items-center gap-1">
                  <FileText size={14} />
                  Create Invoice
                </button>
              }
            />
          </DropdownItem>

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
              <DropdownItem onClick={handleRenew} disabled={isRenewing}>
                <RefreshCw
                  size={14}
                  className={`mr-2 ${isRenewing ? "animate-spin" : ""}`}
                />
                {isRenewing ? "Renewing..." : "Renew Proposal"}
              </DropdownItem>
            </>
          )}

          {/* Delete/Archive Option */}
          <DropdownSeparator />
          {userRole === "admin" ? (
            <DropdownItem
              onClick={() => setShowDeleteConfirm(true)}
              className="text-semantic-error hover:bg-semantic-error/20"
            >
              <Trash2 size={14} className="mr-2" />
              Delete Proposal
            </DropdownItem>
          ) : (
            <DropdownItem
              onClick={() => setShowDeleteConfirm(true)}
              className="text-status-expired hover:bg-status-expired/20"
              disabled={isArchiving}
            >
              <Trash2 size={14} className="mr-2" />
              {isArchiving ? "Archiving..." : "Archive Proposal"}
            </DropdownItem>
          )}
        </Dropdown>
        </div>
      </div>


      {/* Main Content */}
      <div className="p-4">
        {/* Consolidated Info Line */}
        <div className="text-xs text-text-muted flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span>{proposalDate}</span>
            <span>•</span>
            <span>{viewCount} views</span>
            {orderId && (
              <>
                <span>•</span>
                <span>{orderId}</span>
              </>
            )}
            {proposal.created_by_profile && (
              <>
                <span>•</span>
                <span>
                  {proposal.created_by_profile.name ||
                    proposal.created_by_profile.email}
                </span>
              </>
            )}
          </div>
          {showExpiration && expiresAt && (
            <div className="flex items-center gap-2">
              {!isExpired && status !== "expired" && (
                <span>Expires in:</span>
              )}
              <CountdownTimer
                expiresAt={expiresAt.toISOString()}
                onExpire={handleCountdownExpire}
                className="text-xs"
                status={status}
              />
            </div>
          )}
        </div>

        {/* Renewal Error */}
        {renewError && (
          <div className="mt-2 text-semantic-error text-sm">
            Error: {renewError}
          </div>
        )}
      </div>

      {/* Delete/Archive Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title={userRole === "admin" ? "Confirm Deletion" : "Confirm Archive"}
        message={
          <p>
            Are you sure you want to{" "}
            {userRole === "admin" ? "delete" : "archive"} the proposal for{" "}
            <span className="font-semibold text-text-primary">
              {proposal.client?.company_name}
            </span>
            ?{" "}
            {userRole === "admin"
              ? "This action cannot be undone."
              : "You can restore it later if needed."}
          </p>
        }
        confirmText={userRole === "admin" ? "Delete" : "Archive"}
        cancelText="Cancel"
        isProcessing={userRole === "admin" ? isDeleting : isArchiving}
        error={deleteError}
        onConfirm={userRole === "admin" ? handleDelete : handleArchive}
        onCancel={() => setShowDeleteConfirm(false)}
        icon={<Trash2 size={24} />}
      />
    </Card>
  );
};

export default ProposalCard;
