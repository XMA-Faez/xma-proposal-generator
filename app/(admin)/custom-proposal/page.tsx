import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CustomProposalClient from "@/components/proposal/CustomProposalClient";

export default async function CustomProposalPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Custom Proposal Generator</h1>
      <CustomProposalClient />
    </div>
  );
}