import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a single supabase client for the entire application
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client-side supabase client with auth helpers (for handling auth state)
export function createBrowserClient() {
  return createClientComponentClient<Database>();
}

// Helper functions for proposal management
export async function getProposalByToken(token: string) {
  // Find the proposal link
  const { data: link, error: linkError } = await supabase
    .from("proposal_links")
    .select("proposal_id, views_count")
    .eq("token", token)
    .single();

  if (linkError) return null;

  // Get the proposal
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select(
      `
      *,
      client:clients(*)
    `,
    )
    .eq("id", link.proposal_id)
    .single();

  if (proposalError) return null;

  // Update view count
  await supabase
    .from("proposal_links")
    .update({ views_count: (link.views_count || 0) + 1 })
    .eq("token", token);

  return proposal;
}

export async function saveProposal(proposalData: any, encodedData: string) {
  // First get or create the client
  const client = await getOrCreateClient({
    clientName: proposalData.clientName,
    companyName: proposalData.companyName,
    email: proposalData.email || null,
  });

  // Save the proposal
  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      client_id: client.id,
      title: `Proposal for ${client.company_name}`,
      proposal_date: proposalData.proposalDate,
      additional_info: proposalData.additionalInfo || null,
      proposal_data: proposalData,
      encoded_data: encodedData,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;

  // Create a link token
  const { data: link, error: linkError } = await supabase
    .from("proposal_links")
    .insert({
      proposal_id: proposal.id,
      token: crypto.randomUUID(),
      views_count: 0,
    })
    .select()
    .single();

  if (linkError) throw linkError;

  // Create shareable link with the base URL
  // Use window.location.origin on client-side or env var on server-side
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "https://yoursite.com";

  return {
    ...proposal,
    link: `${baseUrl}/proposal?token=${link.token}`,
  };
}

// Helper function to get or create a client
async function getOrCreateClient(clientData: {
  clientName: string;
  companyName: string;
  email?: string | null;
}) {
  // Check if client exists by company name
  const { data: existingClient } = await supabase
    .from("clients")
    .select()
    .eq("company_name", clientData.companyName)
    .maybeSingle();

  if (existingClient) return existingClient;

  // Create new client if not found
  const { data: newClient, error } = await supabase
    .from("clients")
    .insert({
      name: clientData.clientName,
      company_name: clientData.companyName,
      email: clientData.email || null,
    })
    .select()
    .single();

  if (error) throw error;
  return newClient;
}

export async function getAllProposals() {
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

  if (error) throw error;
  return data;
}
