"use client";

import { useState } from "react";
import { Archive, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProposalArchiveButtonProps {
  proposalId: string;
  isArchived?: boolean;
  variant?: "button" | "menu-item";
  onSuccess?: () => void;
}

export function ProposalArchiveButton({ 
  proposalId, 
  isArchived = false, 
  variant = "menu-item",
  onSuccess 
}: ProposalArchiveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleArchive = async () => {
    setLoading(true);
    
    try {
      const endpoint = "/api/proposals/archive";
      const method = isArchived ? "DELETE" : "POST";
      
      let url = endpoint;
      let body = undefined;
      
      if (isArchived) {
        // For restore, use DELETE with query param
        url = `${endpoint}?proposalId=${proposalId}`;
      } else {
        // For archive, use POST with body
        body = JSON.stringify({ proposalId });
      }

      const response = await fetch(url, {
        method,
        headers: method === "POST" ? {
          "Content-Type": "application/json",
        } : undefined,
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update proposal");
      }

      toast.success(
        isArchived 
          ? "Proposal restored successfully" 
          : "Proposal archived successfully"
      );
      
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to update proposal"
      );
    } finally {
      setLoading(false);
    }
  };

  const icon = isArchived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />;
  const text = isArchived ? "Restore" : "Archive";
  const title = isArchived ? "Restore Proposal" : "Archive Proposal";
  const description = isArchived 
    ? "This will restore the proposal and make it active again. You can archive it again later if needed."
    : "This will archive the proposal and hide it from your active proposals. You can restore it later if needed.";

  if (variant === "button") {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {icon}
            {text}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={loading}
              className={isArchived ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}
            >
              {loading ? "Processing..." : text}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <div className="flex items-center gap-2 w-full">
          {icon}
          {text}
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleArchive}
            disabled={loading}
            className={isArchived ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}
          >
            {loading ? "Processing..." : text}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}