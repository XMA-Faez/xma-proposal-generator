"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InvoiceDownloadButton } from "@/components/invoice/InvoiceDownloadButton";
import InvoiceStatusDialog from "@/components/invoice/InvoiceStatusDialog";
import { Trash2, Settings } from "lucide-react";
import Link from "next/link";
import type { InvoiceData } from "@/types/invoice";

interface InvoiceActionsProps {
  invoiceId: string;
  invoiceNumber: string;
  invoiceStatus: string;
  invoiceData: InvoiceData;
  onUpdate?: () => void;
}

export default function InvoiceActions({ 
  invoiceId, 
  invoiceNumber, 
  invoiceStatus,
  invoiceData,
  onUpdate
}: InvoiceActionsProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      // Redirect to invoices list after successful deletion
      window.location.href = "/invoices";
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice");
    }
  };

  const handleStatusUpdate = () => {
    setShowStatusDialog(false);
    if (onUpdate) {
      onUpdate();
    } else {
      // Refresh the page if no update callback provided
      window.location.reload();
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        <Tooltip content="Edit invoice details and line items">
          <Link href={`/invoices/${invoiceId}/edit`}>
            <Button variant="outline" size="sm" className="border-zinc-600 bg-zinc-700 text-white hover:bg-zinc-600">
              Edit Invoice
            </Button>
          </Link>
        </Tooltip>
        
        <Tooltip content="Change invoice status">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStatusDialog(true)}
            className="border-zinc-600 bg-zinc-700 text-white hover:bg-zinc-600"
          >
            <Settings className="mr-2 h-4 w-4" />
            Status
          </Button>
        </Tooltip>
        
        <Tooltip content="Download invoice as PDF">
          <InvoiceDownloadButton invoice={invoiceData} />
        </Tooltip>
        
        <Tooltip content="Delete invoice permanently">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="border-red-600 bg-red-700 text-white hover:bg-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </Tooltip>
      </div>

      {showStatusDialog && (
        <InvoiceStatusDialog
          invoice={{
            id: invoiceId,
            invoice_number: invoiceNumber,
            status: invoiceStatus,
          }}
          open={showStatusDialog}
          onClose={() => setShowStatusDialog(false)}
          onSuccess={handleStatusUpdate}
        />
      )}
    </TooltipProvider>
  );
}