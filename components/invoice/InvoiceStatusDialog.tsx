"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface InvoiceStatusDialogProps {
  invoice: {
    id: string;
    invoice_number: string;
    status: string;
  };
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions = [
  { value: "draft", label: "Draft", description: "Invoice is being prepared" },
  { value: "sent", label: "Sent", description: "Invoice has been sent to client" },
  { value: "paid", label: "Paid", description: "Invoice has been paid" },
  { value: "overdue", label: "Overdue", description: "Invoice is past due date" },
  { value: "cancelled", label: "Cancelled", description: "Invoice has been cancelled" },
];

export default function InvoiceStatusDialog({
  invoice,
  open,
  onClose,
  onSuccess,
}: InvoiceStatusDialogProps) {
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(invoice.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newStatus === invoice.status) {
      toast.info("No status change selected");
      onClose();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice status");
      }

      const statusLabel = statusOptions.find(opt => opt.value === newStatus)?.label;
      toast.success(`Invoice ${invoice.invoice_number} status updated to ${statusLabel}`);
      onSuccess();
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast.error("Failed to update invoice status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-600";
      case "sent":
        return "bg-blue-900/20 text-blue-400 border-blue-600";
      case "paid":
        return "bg-green-900/20 text-green-400 border-green-600";
      case "overdue":
        return "bg-red-900/20 text-red-400 border-red-600";
      case "cancelled":
        return "bg-gray-900/20 text-gray-400 border-gray-600";
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-800 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">Change Invoice Status</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-sm text-gray-400 mb-2">Invoice Number</p>
            <p className="font-semibold text-white">{invoice.invoice_number}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Current Status</p>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(invoice.status)}`}>
              {statusOptions.find(opt => opt.value === invoice.status)?.label || invoice.status}
            </div>
          </div>

          <div>
            <Label htmlFor="status" className="text-white">New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {statusOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-white hover:bg-zinc-700"
                  >
                    <div className="text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-400">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {newStatus !== invoice.status && (
            <div className="p-4 bg-zinc-700 rounded-lg border border-zinc-600">
              <p className="text-sm text-gray-300">
                <strong>Preview:</strong> Status will change from{" "}
                <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(invoice.status)}`}>
                  {statusOptions.find(opt => opt.value === invoice.status)?.label}
                </span>
                {" "}to{" "}
                <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(newStatus)}`}>
                  {statusOptions.find(opt => opt.value === newStatus)?.label}
                </span>
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-zinc-600 text-white hover:bg-zinc-700">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || newStatus === invoice.status}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
