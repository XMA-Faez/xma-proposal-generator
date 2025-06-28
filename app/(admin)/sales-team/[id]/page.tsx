import { requireAdminRole } from "@/lib/auth-helpers";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, FileText, Archive, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SalesRepDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminRole();
  const { id } = await params;
  const supabase = await createClient();

  // Get sales rep details
  const { data: salesRep } = await supabase
    .from("profiles")
    .select("id, name, email, role, created_at, updated_at")
    .eq("id", id)
    .eq("role", "sales_rep")
    .single();

  if (!salesRep) {
    notFound();
  }

  // Get proposal statistics
  const { data: activeProposals } = await supabase
    .from("proposals")
    .select("id, status, created_at, client_name, company_name")
    .eq("created_by", salesRep.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  const { data: archivedProposals } = await supabase
    .from("proposals")
    .select("id, created_at, client_name, company_name")
    .eq("created_by", salesRep.id)
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false });

  const totalActive = activeProposals?.length || 0;
  const totalArchived = archivedProposals?.length || 0;

  // Calculate status breakdown
  const statusCounts = activeProposals?.reduce((acc, proposal) => {
    const status = proposal.status || "draft";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" asChild className="border-zinc-600 text-gray-300 hover:bg-zinc-700">
          <Link href="/sales-team">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales Team
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {salesRep.name || salesRep.email?.split("@")[0]}
          </h1>
          <p className="text-gray-400">Sales Representative Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Rep Info */}
        <div className="lg:col-span-1">
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-medium text-lg">
                  {salesRep.name ? salesRep.name.charAt(0).toUpperCase() : salesRep.email!.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">
                    {salesRep.name || "No name set"}
                  </p>
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    Active
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-zinc-700">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="h-4 w-4" />
                  {salesRep.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(salesRep.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics and Proposals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Active Proposals</CardTitle>
                <FileText className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalActive}</div>
                <p className="text-xs text-gray-400">Currently in progress</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Accepted</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{statusCounts.accepted || 0}</div>
                <p className="text-xs text-gray-400">Proposals accepted</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Archived</CardTitle>
                <Archive className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalArchived}</div>
                <p className="text-xs text-gray-400">Archived proposals</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Active Proposals */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Recent Active Proposals</CardTitle>
                  <CardDescription className="text-gray-400">
                    Latest proposal activity
                  </CardDescription>
                </div>
                <Button variant="outline" asChild className="border-zinc-600 text-gray-300 hover:bg-zinc-700">
                  <Link href={`/proposals?sales_rep=${salesRep.id}`}>View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeProposals && activeProposals.length > 0 ? (
                <div className="space-y-3">
                  {activeProposals.slice(0, 5).map((proposal) => (
                    <div
                      key={proposal.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-zinc-700 bg-zinc-900"
                    >
                      <div>
                        <h4 className="font-medium text-white">
                          {proposal.company_name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {proposal.client_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={
                            proposal.status === "accepted"
                              ? "bg-green-600 text-white"
                              : proposal.status === "sent"
                              ? "bg-blue-600 text-white"
                              : proposal.status === "rejected"
                              ? "bg-red-600 text-white"
                              : "bg-gray-600 text-white"
                          }
                        >
                          {proposal.status || "draft"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(proposal.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-600" />
                  <h3 className="mt-2 text-sm font-medium text-gray-300">No active proposals</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This sales representative hasn't created any proposals yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Archived Proposals */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    Archived Proposals
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Previously archived proposals
                  </CardDescription>
                </div>
                {totalArchived > 5 && (
                  <Button variant="outline" asChild className="border-zinc-600 text-gray-300 hover:bg-zinc-700">
                    <Link href={`/proposals?sales_rep=${salesRep.id}&archived=true`}>View All Archived</Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {archivedProposals && archivedProposals.length > 0 ? (
                <div className="space-y-3">
                  {archivedProposals.slice(0, 5).map((proposal) => (
                    <div
                      key={proposal.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-zinc-700 bg-zinc-900 opacity-75"
                    >
                      <div className="flex items-center gap-3">
                        <Archive className="h-4 w-4 text-gray-500" />
                        <div>
                          <h4 className="font-medium text-gray-300">
                            {proposal.company_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {proposal.client_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-gray-600 text-gray-400">
                          Archived
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(proposal.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Archive className="mx-auto h-12 w-12 text-gray-600" />
                  <h3 className="mt-2 text-sm font-medium text-gray-300">No archived proposals</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This sales representative hasn't archived any proposals yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}