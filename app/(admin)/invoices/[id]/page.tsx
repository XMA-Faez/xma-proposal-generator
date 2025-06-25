import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import type { Database } from "@/types/supabase";
import type { InvoiceData } from "@/types/invoice";
import { InvoiceDownloadButton } from "@/components/invoice/InvoiceDownloadButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface InvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  // Await params
  const resolvedParams = await params;

  // Fetch invoice
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, proposals(company_name, client_name)")
    .eq("id", resolvedParams.id)
    .single();

  if (!invoice) {
    redirect("/proposals");
  }

  const invoiceData: InvoiceData = {
    invoiceNumber: invoice.invoice_number,
    proposalId: invoice.proposal_id || undefined,
    orderId: invoice.order_id,
    issuerName: invoice.issuer_name,
    issuerAddress: invoice.issuer_address,
    issuerPhone: invoice.issuer_phone,
    issuerTrn: invoice.issuer_trn,
    clientName: invoice.client_name,
    clientCompany: invoice.client_company,
    clientAddress: invoice.client_address,
    clientTrn: invoice.client_trn || undefined,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    currency: invoice.currency,
    lineItems: invoice.line_items as any,
    bankAccountHolder: invoice.bank_account_holder,
    iban: invoice.iban,
    swiftCode: invoice.swift_code,
    bankAddress: invoice.bank_address,
    subtotal: invoice.subtotal,
    vatAmount: invoice.vat_amount,
    totalAmount: invoice.total_amount,
    status: invoice.status as any,
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "paid":
        return "bg-green-900/20 text-green-400";
      case "sent":
        return "bg-blue-900/20 text-blue-400";
      case "overdue":
        return "bg-red-900/20 text-red-400";
      case "cancelled":
        return "bg-zinc-700 text-zinc-400";
      default:
        return "bg-yellow-900/20 text-yellow-400";
    }
  };

  return (
    <div className="container mx-auto py-8 min-h-screen text-white">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/proposals">
            <Button variant="ghost" size="sm" className="text-white hover:bg-zinc-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Proposals
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Invoice #{invoice.invoice_number}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status || undefined)}`}>
            {invoice.status || "draft"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="outline" size="sm" className="border-zinc-600 bg-zinc-700 text-white hover:bg-zinc-600">
              Edit Invoice
            </Button>
          </Link>
          <InvoiceDownloadButton invoice={invoiceData} />
        </div>
      </div>

      <div className="bg-zinc-800 rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-white">From</h2>
            <p className="font-medium text-white">{invoice.issuer_name}</p>
            <p className="text-sm text-zinc-400">{invoice.issuer_address}</p>
            <p className="text-sm text-zinc-400">Phone: {invoice.issuer_phone}</p>
            <p className="text-sm text-zinc-400">TRN: {invoice.issuer_trn}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4 text-white">Bill To</h2>
            <p className="font-medium text-white">{invoice.client_company}</p>
            <p className="text-sm text-zinc-400">{invoice.client_name}</p>
            <p className="text-sm text-zinc-400">{invoice.client_address}</p>
            {invoice.client_trn && (
              <p className="text-sm text-zinc-400">TRN: {invoice.client_trn}</p>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-zinc-700 rounded">
          <div>
            <p className="text-sm text-zinc-400">Order ID</p>
            <p className="font-medium text-white">{invoice.order_id}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Issue Date</p>
            <p className="font-medium text-white">{format(new Date(invoice.issue_date), "dd MMM yyyy")}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Due Date</p>
            <p className="font-medium text-white">{format(new Date(invoice.due_date), "dd MMM yyyy")}</p>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-zinc-600">
              <th className="text-left py-2 text-white">Description</th>
              <th className="text-center py-2 text-white">Qty</th>
              <th className="text-right py-2 text-white">Unit Price</th>
              <th className="text-right py-2 text-white">Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.line_items as any[]).map((item, index) => (
              <tr key={index} className="border-b border-zinc-700">
                <td className="py-3 text-white">{item.description}</td>
                <td className="text-center py-3 text-white">{item.quantity}</td>
                <td className="text-right py-3 text-white">{formatCurrency(item.unitPrice)}</td>
                <td className="text-right py-3 text-white">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between mb-2">
              <span className="text-white">Subtotal:</span>
              <span className="text-white">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-white">VAT (5%):</span>
              <span className="text-white">{formatCurrency(invoice.vat_amount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-zinc-600 pt-2">
              <span className="text-white">Total:</span>
              <span className="text-red-400">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div className="mt-8 p-4 bg-zinc-700 rounded">
          <h3 className="font-semibold mb-4 text-white">Payment Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-400">Account Holder</p>
              <p className="font-medium text-white">{invoice.bank_account_holder}</p>
            </div>
            <div>
              <p className="text-zinc-400">IBAN</p>
              <p className="font-medium text-white">{invoice.iban}</p>
            </div>
            <div>
              <p className="text-zinc-400">SWIFT/BIC</p>
              <p className="font-medium text-white">{invoice.swift_code}</p>
            </div>
            <div>
              <p className="text-zinc-400">Bank Address</p>
              <p className="font-medium text-white">{invoice.bank_address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
