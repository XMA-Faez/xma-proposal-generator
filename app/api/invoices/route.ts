import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";
import type { CreateInvoiceRequest, InvoiceLineItem } from "@/types/invoice";

// Default company information
const COMPANY_INFO = {
  name: "XLUXIVE DIGITAL MARKETING LLC",
  address: "Office: M-44, THE CURVE BUILDING-AL Qouz, Al Qouz Third, Dubai, United Arab Emirates",
  phone: "+971 4 123 4567",
  trn: "104853792000003",
  bankAccountHolder: "XLUXIVE DIGITAL MARKETING LLC",
  iban: "AE590860000009339072484",
  swiftCode: "WIOBAEADXXX",
  bankAddress: "Office: M-44, THE CURVE BUILDING-AL QOUZ, Al Qouz Third, Dubai, United Arab Emirates"
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body: CreateInvoiceRequest = await request.json();
    const { proposalId, dueDate, lineItems, clientTrn, clientAddress } = body;

    // Fetch proposal data
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", proposalId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: InvoiceLineItem) => sum + item.lineTotal, 0);
    const vatAmount = subtotal * 0.05; // 5% VAT
    const totalAmount = subtotal + vatAmount;

    // Generate invoice number
    const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number");

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        proposal_id: proposalId,
        order_id: proposal.order_id || "",
        issuer_name: COMPANY_INFO.name,
        issuer_address: COMPANY_INFO.address,
        issuer_phone: COMPANY_INFO.phone,
        issuer_trn: COMPANY_INFO.trn,
        client_name: proposal.client_name,
        client_company: proposal.company_name,
        client_address: clientAddress || COMPANY_INFO.address, // Default if not provided
        client_trn: clientTrn,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: dueDate,
        currency: "AED",
        line_items: lineItems,
        bank_account_holder: COMPANY_INFO.bankAccountHolder,
        iban: COMPANY_INFO.iban,
        swift_code: COMPANY_INFO.swiftCode,
        bank_address: COMPANY_INFO.bankAddress,
        subtotal,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        status: "draft",
        created_by: user.id
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Invoice creation error:", invoiceError);
      return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposalId");

    let query = supabase
      .from("invoices")
      .select("*, proposals(company_name, client_name)")
      .order("created_at", { ascending: false });

    if (proposalId) {
      query = query.eq("proposal_id", proposalId);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error("Error fetching invoices:", error);
      return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
    }

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
