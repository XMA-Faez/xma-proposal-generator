import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import ProposalsList from "@/components/proposal/ProposalsList";

export const metadata: Metadata = {
  title: "All Proposals - XMA Agency",
  description: "View and manage all client proposals",
};

async function getProposalsData() {
  try {
    const { data, error } = await supabase
      .from("proposals")
      .select(
        `
        *,
        client:clients(*),
        links:proposal_links(*),
        package:packages(*)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }
}

export default async function ProposalsPage() {
  const proposals = await getProposalsData();

  return (
    <div className="pt-8 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-6">
          Proposals
        </h1>
        <ProposalsList initialProposals={proposals} />
      </div>
    </div>
  );
}
