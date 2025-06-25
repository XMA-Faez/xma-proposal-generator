import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";
import { InvoiceEditForm } from "@/components/invoice/InvoiceEditForm";

interface InvoiceEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvoiceEditPage({ params }: InvoiceEditPageProps) {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  // Await params
  const resolvedParams = await params;

  // Fetch invoice
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, proposals(company_name, client_name, order_id)")
    .eq("id", resolvedParams.id)
    .single();

  if (!invoice) {
    redirect("/proposals");
  }

  return (
    <div className="container mx-auto py-8">
      <InvoiceEditForm invoice={invoice} />
    </div>
  );
}