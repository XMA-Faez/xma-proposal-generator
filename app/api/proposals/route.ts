import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";
import {
  generateOrderId,
  getNextSequentialNumber,
} from "@/lib/orderIdGenerator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { proposalData, encodedData } = body;

    if (!proposalData || !encodedData) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // First get or create the client
    const { data: existingClient } = await supabase
      .from("clients")
      .select()
      .eq("company_name", proposalData.companyName)
      .maybeSingle();

    let clientId;

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      // Create new client
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: proposalData.clientName,
          company_name: proposalData.companyName,
          email: proposalData.email || null,
        })
        .select()
        .single();

      if (clientError) {
        throw clientError;
      }

      clientId = newClient.id;
    }

    // Generate a unique order ID
    const nextSequence = await getNextSequentialNumber(supabase);
    const orderId = generateOrderId(nextSequence);
    console.log(orderId)

    // Save the proposal with the order ID
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .insert({
        client_id: clientId,
        title: `Proposal for ${proposalData.companyName}`,
        proposal_date: proposalData.proposalDate,
        additional_info: proposalData.additionalInfo || null,
        proposal_data: proposalData,
        encoded_data: encodedData,
        status: "draft",
        order_id: orderId, // Add the order ID to the proposal
        client_name: proposalData.clientName,
        company_name: proposalData.companyName,
      })
      .select()
      .single();

    if (proposalError) {
      throw proposalError;
    }

    // Create a link token
    const token = randomUUID();

    const { data: link, error: linkError } = await supabase
      .from("proposal_links")
      .insert({
        proposal_id: proposal.id,
        token,
        views_count: 0,
      })
      .select()
      .single();

    if (linkError) {
      throw linkError;
    }

    const baseUrl =
      request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "";

    return Response.json({
      proposal: {
        ...proposal,
        link: `${baseUrl}/proposal?token=${token}`,
      },
    });
  } catch (error) {
    console.error("Error saving proposal:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("proposals")
      .select(
        `
        *,
        client:clients(*),
        links:proposal_links(*)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return Response.json({ proposals: data });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
