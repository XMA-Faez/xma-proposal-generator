import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import ReportsClient from "./ReportsClient";

export const metadata: Metadata = {
  title: "Reports - XMA Agency",
  description: "View proposal analytics and reports",
};

async function getProposalsData(startDate?: Date, endDate?: Date) {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from("proposals")
      .select(`
        *,
        client:clients(*),
        links:proposal_links(*),
        package:packages(*)
      `);
    
    // Add date filtering if provided
    if (startDate && endDate) {
      query = query
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }
}

export default async function ReportsPage() {
  const proposals = await getProposalsData();

  return (
    <div className="pt-8 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-6">
          Reports & Analytics
        </h1>
        <ReportsClient initialProposals={proposals} />
      </div>
    </div>
  );
}