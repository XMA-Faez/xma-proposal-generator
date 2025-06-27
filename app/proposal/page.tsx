import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { decodeProposalData } from "@/lib/proposalUtils";
import ProposalClient from "./ProposalClient";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const token = searchParams.token as string | undefined;
  const proposal = searchParams.proposal as string | undefined;

  let title = "Proposal - XMA Agency";
  let description = "View your custom proposal from XMA Agency";

  try {
    if (token) {
      // Fetch proposal data using token
      const supabase = await createClient();
      const { data: link } = await supabase
        .from("proposal_links")
        .select("proposal_id")
        .eq("token", token)
        .single();

      if (link) {
        const { data: proposalData } = await supabase
          .from("proposals")
          .select("*, client:clients(*)")
          .eq("id", link.proposal_id)
          .single();

        if (proposalData?.client) {
          const clientName = proposalData.client.name || "";
          const companyName = proposalData.client.company_name || "";
          
          if (companyName && clientName) {
            title = `${companyName} - ${clientName} | XMA Agency Proposal`;
          } else if (companyName) {
            title = `${companyName} | XMA Agency Proposal`;
          } else if (clientName) {
            title = `${clientName} | XMA Agency Proposal`;
          }
          
          description = `Custom proposal for ${companyName || clientName} from XMA Agency`;
        }
      }
    } else if (proposal) {
      // Decode proposal data from URL
      const decodedData = decodeProposalData(proposal);
      if (decodedData) {
        const isCustom = decodedData.isCustomProposal;
        const clientName = isCustom ? decodedData.clientInfo?.clientName : decodedData.clientName;
        const companyName = isCustom ? decodedData.clientInfo?.companyName : decodedData.companyName;
        
        if (companyName && clientName) {
          title = `${companyName} - ${clientName} | XMA Agency Proposal`;
        } else if (companyName) {
          title = `${companyName} | XMA Agency Proposal`;
        } else if (clientName) {
          title = `${clientName} | XMA Agency Proposal`;
        }
        
        description = `Custom proposal for ${companyName || clientName} from XMA Agency`;
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default function ProposalPage() {
  return <ProposalClient />;
}