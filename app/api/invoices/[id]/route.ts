import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await createClient();

    const resolvedParams = await params;
    
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*, proposals(company_name, client_name, proposal_data)")
      .eq("id", resolvedParams.id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await createClient();

    const body = await request.json();
    const { status, dueDate, lineItems, clientTrn, clientAddress } = body;

    const resolvedParams = await params;
    
    // Prepare update data
    const updateData: any = {};
    
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.due_date = dueDate;
    if (clientTrn !== undefined) updateData.client_trn = clientTrn;
    if (clientAddress !== undefined) updateData.client_address = clientAddress;
    
    if (lineItems !== undefined) {
      updateData.line_items = lineItems;
      // Recalculate totals if line items changed
      const subtotal = lineItems.reduce((sum: number, item: any) => sum + item.lineTotal, 0);
      const vatAmount = subtotal * 0.05;
      const totalAmount = subtotal + vatAmount;
      
      updateData.subtotal = subtotal;
      updateData.vat_amount = vatAmount;
      updateData.total_amount = totalAmount;
    }
    
    // Update invoice
    const { data: invoice, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", resolvedParams.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating invoice:", error);
      return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}