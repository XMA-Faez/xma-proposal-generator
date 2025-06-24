import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Proposal ID is required" }, { status: 400 });
    }

    // Get the current proposal
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Check if the proposal can be renewed (only expired proposals)
    if (proposal.status !== "expired") {
      return NextResponse.json({ 
        error: "Only expired proposals can be renewed" 
      }, { status: 400 });
    }

    // Calculate new expiration date
    const validityDays = proposal.validity_days || 30;
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + validityDays);

    // Update the proposal
    const { error: updateError } = await supabase
      .from("proposals")
      .update({
        status: "draft", // Reset to draft status
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error renewing proposal:", updateError);
      return NextResponse.json({ 
        error: "Failed to renew proposal" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Proposal renewed successfully",
      newExpiresAt: newExpiresAt.toISOString()
    });
  } catch (error) {
    console.error("Renewal API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}