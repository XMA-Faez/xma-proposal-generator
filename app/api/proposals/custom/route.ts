import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateOrderId, getNextSequentialNumber } from "@/lib/orderIdGenerator";

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
        })
        .select("id")
        .single();

      if (clientError || !newClient) {
        console.error("Client creation error:", clientError);
        throw new Error(`Failed to create client: ${clientError?.message || "Unknown error"}`);
      }
      clientId = newClient.id;
    }

    // Generate order ID
    const nextSequence = await getNextSequentialNumber(supabase);
    console.log("Next sequence:", nextSequence, typeof nextSequence);
    const orderId = generateOrderId(nextSequence);
    console.log("Generated order ID:", orderId);

    // Calculate totals
    const subtotal = services.reduce((sum: number, service: any) => sum + service.price, 0);
    const discountAmount = discountType === "percentage" 
      ? (subtotal * discount) / 100 
      : discount;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = taxIncluded ? afterDiscount * 0.05 : 0;
    const totalAmount = afterDiscount + taxAmount;

    // Prepare proposal data
    console.log("Storing order_id:", orderId, typeof orderId);
    const proposalPayload = {
      order_id: orderId,
      client_id: clientId,
      client_name: clientInfo.clientName,
      company_name: clientInfo.companyName,
      status: "pending",
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
      console.error("Proposal creation error:", proposalError);
      throw new Error(`Failed to create proposal: ${proposalError?.message || "Unknown error"}`);
    }

    // Generate shareable link
    const token = crypto.randomUUID();
    const { error: linkError } = await supabase
      .from("proposal_links")
      .insert({
        proposal_id: proposal.id,
        token,
      });

    if (linkError) {
      console.error("Proposal link creation error:", linkError);
      throw new Error(`Failed to create proposal link: ${linkError?.message || "Unknown error"}`);
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