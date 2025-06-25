"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Trash2 } from "lucide-react";
import { format, addDays } from "date-fns";
import type { InvoiceLineItem, CreateInvoiceRequest } from "@/types/invoice";
import type { Database } from "@/types/supabase";

type Proposal = Database["public"]["Tables"]["proposals"]["Row"];

interface InvoiceGeneratorDialogProps {
  proposal: Proposal & {
    proposal_data?: any;
  };
  trigger?: React.ReactNode;
}

export const InvoiceGeneratorDialog: React.FC<InvoiceGeneratorDialogProps> = ({
  proposal,
  trigger,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientTrn, setClientTrn] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [dueDate, setDueDate] = useState(
    format(addDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(() => {
    const items: InvoiceLineItem[] = [];
    
    // Add package if exists and is included
    if (proposal.include_package && proposal.package) {
      const pkg = proposal.package;
      const quantity = 1;
      let unitPrice = pkg.price;
      
      // Apply package discount if exists
      if (proposal.package_discount_value && proposal.package_discount_value > 0) {
        if (proposal.package_discount_type === "percentage") {
          unitPrice = unitPrice * (1 - proposal.package_discount_value / 100);
        } else {
          unitPrice = unitPrice - proposal.package_discount_value;
        }
      }
      
      items.push({
        description: `${pkg.name}${pkg.description ? ` - ${pkg.description}` : ""}`,
        quantity,
        unitPrice: unitPrice,
        taxRate: 5,
        lineTotal: unitPrice * quantity,
      });
    }
    
    // Add services if exist
    if (proposal.proposal_services && proposal.proposal_services.length > 0) {
      proposal.proposal_services.forEach((proposalService: any) => {
        const service = proposalService.service;
        if (!service) return;
        
        const quantity = 1;
        let unitPrice = service.price;
        
        // Apply service discount if exists
        if (proposalService.discount_value && proposalService.discount_value > 0) {
          if (proposalService.discount_type === "percentage") {
            unitPrice = unitPrice * (1 - proposalService.discount_value / 100);
          } else {
            unitPrice = unitPrice - proposalService.discount_value;
          }
        }
        
        items.push({
          description: `${service.name}${service.is_monthly ? " (Monthly)" : ""}`,
          quantity,
          unitPrice: unitPrice,
          taxRate: 5,
          lineTotal: unitPrice * quantity,
        });
        
        // Add setup fee if exists
        if (service.setup_fee && service.setup_fee > 0) {
          items.push({
            description: `${service.name} - Setup Fee`,
            quantity: 1,
            unitPrice: service.setup_fee,
            taxRate: 5,
            lineTotal: service.setup_fee,
          });
        }
      });
    }
    
    // If no items found, add empty row
    return items.length > 0 ? items : [{
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 5,
      lineTotal: 0,
    }];
  });

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 5,
        lineTotal: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: field === "description" ? value : Number(value),
    };
    
    // Recalculate line total
    if (field === "quantity" || field === "unitPrice") {
      updated[index].lineTotal = updated[index].quantity * updated[index].unitPrice;
    }
    
    setLineItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const vatAmount = subtotal * 0.05;
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  };

  // Check for existing invoice and redirect if found
  const handleInvoiceAction = async () => {
    try {
      const response = await fetch(`/api/invoices?proposalId=${proposal.id}`);
      if (response.ok) {
        const { invoices } = await response.json();
        if (invoices && invoices.length > 0) {
          const invoice = invoices[0]; // Get the first (and should be only) invoice
          // If invoice exists, redirect to invoice page
          router.push(`/invoices/${invoice.id}`);
          return;
        }
      }
      // If no invoice exists, open dialog to create one
      setOpen(true);
    } catch (error) {
      console.error("Error checking existing invoice:", error);
      // If error, still allow creating new invoice
      setOpen(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Create new invoice
      const request: CreateInvoiceRequest = {
        proposalId: proposal.id,
        dueDate,
        lineItems: lineItems.filter(item => item.description && item.lineTotal > 0),
        clientTrn: clientTrn || undefined,
        clientAddress: clientAddress || undefined,
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      const { invoice } = await response.json();
      
      setOpen(false);
      router.push(`/invoices/${invoice.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  return (
    <>
      {/* Custom trigger that handles the logic */}
      <div onClick={handleInvoiceAction}>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Invoice
          </Button>
        )}
      </div>

      {/* Dialog only for creating new invoices */}
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
          <DialogDescription>
            Create an invoice for proposal {proposal.order_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <Input value={proposal.client_name} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <Input value={proposal.company_name} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client TRN (optional)</label>
                <Input
                  value={clientTrn}
                  onChange={(e) => setClientTrn(e.target.value)}
                  placeholder="Enter client's TRN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
              <Textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Enter client's business address"
                rows={2}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Invoice Items</h3>
              <Button onClick={addLineItem} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-2 w-[40%] text-sm font-medium text-zinc-400">Description</th>
                  <th className="text-center py-2 px-2 w-[15%] text-sm font-medium text-zinc-400">Quantity</th>
                  <th className="text-right py-2 px-2 w-[15%] text-sm font-medium text-zinc-400">Unit Price</th>
                  <th className="text-right py-2 px-2 w-[15%] text-sm font-medium text-zinc-400">Total</th>
                  <th className="w-[15%]"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} className="border-b border-zinc-800">
                    <td className="py-2 px-2">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, "description", e.target.value)
                        }
                        placeholder="Item description"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(index, "quantity", e.target.value)
                        }
                        min="1"
                        className="text-center"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(index, "unitPrice", e.target.value)
                        }
                        min="0"
                        step="0.01"
                        className="text-right"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className="font-medium">
                        AED {item.lineTotal.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>AED {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (5%):</span>
                <span>AED {vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>AED {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || lineItems.every(item => !item.description)}
            >
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
};
