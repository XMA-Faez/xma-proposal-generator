import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateOrderId } from "@/lib/orderIdGenerator";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const proposalData = await request.json();
    const { clientInfo, services, discount, discountType, taxIncluded, terms, customTerms } = proposalData;

    // Create or find client
    let clientId: string;
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("company_name", clientInfo.companyName)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: clientInfo.clientName,
          company_name: clientInfo.companyName,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (clientError || !newClient) {
        throw new Error("Failed to create client");
      }
      clientId = newClient.id;
    }

    // Generate order ID
    const orderId = await generateOrderId(supabase);

    // Calculate totals
    const subtotal = services.reduce((sum: number, service: any) => sum + service.price, 0);
    const discountAmount = discountType === "percentage" 
      ? (subtotal * discount) / 100 
      : discount;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = taxIncluded ? afterDiscount * 0.05 : 0;
    const totalAmount = afterDiscount + taxAmount;

    // Prepare proposal data
    const proposalPayload = {
      order_id: orderId,
      client_id: clientId,
      total_amount: totalAmount,
      status: "pending",
      created_by: user.id,
      proposal_date: clientInfo.proposalDate,
      proposal_data: {
        clientInfo,
        services,
        discount,
        discountType,
        taxIncluded,
        terms,
        customTerms,
        isCustomProposal: true,
        calculations: {
          subtotal,
          discountAmount,
          taxAmount,
          totalAmount,
        },
      },
    };

    // Create proposal
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .insert(proposalPayload)
      .select("id")
      .single();

    if (proposalError || !proposal) {
      throw new Error("Failed to create proposal");
    }

    // Generate shareable link
    const token = crypto.randomUUID();
    const { error: linkError } = await supabase
      .from("proposal_links")
      .insert({
        proposal_id: proposal.id,
        token,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

    if (linkError) {
      throw new Error("Failed to create proposal link");
    }

    const proposalUrl = `/proposal?token=${token}`;

    return NextResponse.json({ proposalUrl });
  } catch (error) {
    console.error("Error creating custom proposal:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 }
    );
  }
}