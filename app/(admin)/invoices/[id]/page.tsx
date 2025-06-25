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
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/proposals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Proposals
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-black">Invoice #{invoice.invoice_number}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status || undefined)}`}>
            {invoice.status || "draft"}
          </span>
        </div>
        <InvoiceDownloadButton invoice={invoiceData} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-black">From</h2>
            <p className="font-medium text-black">{invoice.issuer_name}</p>
            <p className="text-sm text-gray-600">{invoice.issuer_address}</p>
            <p className="text-sm text-gray-600">Phone: {invoice.issuer_phone}</p>
            <p className="text-sm text-gray-600">TRN: {invoice.issuer_trn}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Bill To</h2>
            <p className="font-medium text-black">{invoice.client_company}</p>
            <p className="text-sm text-gray-600">{invoice.client_name}</p>
            <p className="text-sm text-gray-600">{invoice.client_address}</p>
            {invoice.client_trn && (
              <p className="text-sm text-gray-600">TRN: {invoice.client_trn}</p>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded">
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-medium text-black">{invoice.order_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Issue Date</p>
            <p className="font-medium text-black">{format(new Date(invoice.issue_date), "dd MMM yyyy")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-medium text-black">{format(new Date(invoice.due_date), "dd MMM yyyy")}</p>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 text-black">Description</th>
              <th className="text-center py-2 text-black">Qty</th>
              <th className="text-right py-2 text-black">Unit Price</th>
              <th className="text-right py-2 text-black">Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.line_items as any[]).map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 text-black">{item.description}</td>
                <td className="text-center py-3 text-black">{item.quantity}</td>
                <td className="text-right py-3 text-black">{formatCurrency(item.unitPrice)}</td>
                <td className="text-right py-3 text-black">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between mb-2">
              <span className="text-black">Subtotal:</span>
              <span className="text-black">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-black">VAT (5%):</span>
              <span className="text-black">{formatCurrency(invoice.vat_amount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-gray-300 pt-2">
              <span className="text-black">Total:</span>
              <span className="text-red-600">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div className="mt-8 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-4 text-black">Payment Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Account Holder</p>
              <p className="font-medium text-black">{invoice.bank_account_holder}</p>
            </div>
            <div>
              <p className="text-gray-600">IBAN</p>
              <p className="font-medium text-black">{invoice.iban}</p>
            </div>
            <div>
              <p className="text-gray-600">SWIFT/BIC</p>
              <p className="font-medium text-black">{invoice.swift_code}</p>
            </div>
            <div>
              <p className="text-gray-600">Bank Address</p>
              <p className="font-medium text-black">{invoice.bank_address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
