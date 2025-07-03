"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { CalendarIcon, Download, Edit, Eye, Plus, Search, FileText, DollarSign, AlertCircle, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InvoiceCreateDialog from "./InvoiceCreateDialog";
import PaymentDialog from "./PaymentDialog";
import InvoiceStatusDialog from "./InvoiceStatusDialog";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_company: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: string;
  payment_date: string | null;
  is_recurring: boolean;
}

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, dateRange]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (dateRange.from) {
        query = query.gte("issue_date", format(dateRange.from, "yyyy-MM-dd"));
      }

      if (dateRange.to) {
        query = query.lte("issue_date", format(dateRange.to, "yyyy-MM-dd"));
      }

      const { data, error } = await query;

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", className: "bg-gray-500" },
      sent: { label: "Sent", className: "bg-blue-500" },
      paid: { label: "Paid", className: "bg-green-500" },
      overdue: { label: "Overdue", className: "bg-red-500" },
      cancelled: { label: "Cancelled", className: "bg-gray-700" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={cn(config.className, "text-white")}>
        {config.label}
      </Badge>
    );
  };

  const handlePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    fetchInvoices();
    setShowPaymentDialog(false);
    setSelectedInvoice(null);
  };

  const handleStatusChange = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowStatusDialog(true);
  };

  const handleStatusUpdate = () => {
    fetchInvoices();
    setShowStatusDialog(false);
    setSelectedInvoice(null);
  };

  const handleDelete = async (invoice: Invoice) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete invoice ${invoice.invoice_number}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      toast.success(`Invoice ${invoice.invoice_number} deleted successfully`);
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  const calculateStats = () => {
    const total = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0);
    const pending = invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').reduce((sum, inv) => sum + inv.total_amount, 0);
    const overdue = invoices.filter(inv => inv.status === 'overdue').length;

    return { total, paid, pending, overdue };
  };

  const stats = calculateStats();

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Invoices</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Invoiced</p>
              <p className="text-2xl font-bold text-white">AED {stats.total.toLocaleString()}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Paid</p>
              <p className="text-2xl font-bold text-green-400">AED {stats.paid.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-blue-400">AED {stats.pending.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-800 p-4 rounded-lg shadow-sm border border-zinc-700 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by invoice number, client name or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 bg-zinc-800 border-zinc-700" align="start">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">From Date</label>
                  <input
                    type="date"
                    value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value ? new Date(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-zinc-600 rounded-md bg-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">To Date</label>
                  <input
                    type="date"
                    value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value ? new Date(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-zinc-600 rounded-md bg-zinc-700 text-white"
                  />
                </div>
                <button
                  onClick={() => setDateRange({ from: undefined, to: undefined })}
                  className="w-full px-3 py-2 text-sm bg-zinc-600 hover:bg-zinc-500 rounded-md text-white"
                >
                  Clear Dates
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-zinc-800 rounded-lg shadow-sm border border-zinc-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-white">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{invoice.client_name}</p>
                      <p className="text-sm text-gray-400">{invoice.client_company}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{format(new Date(invoice.issue_date), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-gray-300">{format(new Date(invoice.due_date), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-white font-medium">AED {invoice.total_amount.toLocaleString()}</TableCell>
                  <TableCell className="">{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {invoice.is_recurring ? (
                      <Badge variant="outline">Recurring</Badge>
                    ) : (
                      <Badge variant="outline">One-time</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Tooltip content="View Invoice Details">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/invoices/${invoice.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </Tooltip>
                      
                      <Tooltip content="Edit Invoice">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/invoices/${invoice.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </Tooltip>
                      
                      <Tooltip content="Change Status">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(invoice)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <Tooltip content="Record Payment">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePayment(invoice)}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      )}
                      
                      <Tooltip content="Delete Invoice">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(invoice)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showCreateDialog && (
        <InvoiceCreateDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            fetchInvoices();
            setShowCreateDialog(false);
          }}
        />
      )}

      {showPaymentDialog && selectedInvoice && (
        <PaymentDialog
          invoice={selectedInvoice}
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          onSuccess={handlePaymentComplete}
        />
      )}

      {showStatusDialog && selectedInvoice && (
        <InvoiceStatusDialog
          invoice={{
            id: selectedInvoice.id,
            invoice_number: selectedInvoice.invoice_number,
            status: selectedInvoice.status,
          }}
          open={showStatusDialog}
          onClose={() => setShowStatusDialog(false)}
          onSuccess={handleStatusUpdate}
        />
      )}
    </div>
    </TooltipProvider>
  );
}
