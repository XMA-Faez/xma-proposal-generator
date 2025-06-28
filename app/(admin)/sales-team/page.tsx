"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, FileText, Archive, Mail, Calendar, UserMinus } from "lucide-react";
import Link from "next/link";
import Toast from "@/components/ui/Toast";

export default function SalesTeamPage() {
  const router = useRouter();
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [salesRepStats, setSalesRepStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSalesTeamData();
  }, []);

  const fetchSalesTeamData = async () => {
    try {
      const response = await fetch("/api/sales-reps");
      if (!response.ok) {
        throw new Error("Failed to fetch sales team data");
      }
      const data = await response.json();
      setSalesReps(data.salesReps || []);
      setSalesRepStats(data.salesRepStats || []);
    } catch (error) {
      console.error("Error fetching sales team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (salesRepId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove access for ${email}? This will deactivate their account but leave their proposals intact.`)) {
      return;
    }

    setDeactivatingId(salesRepId);

    try {
      const response = await fetch("/api/sales-reps/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ salesRepId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to deactivate sales rep");
      }

      setToast({
        visible: true,
        message: `Successfully removed access for ${email}`,
        type: "success"
      });

      // Refresh the data
      await fetchSalesTeamData();
    } catch (error) {
      console.error("Error deactivating sales rep:", error);
      setToast({
        visible: true,
        message: error instanceof Error ? error.message : "Failed to remove access",
        type: "error"
      });
    } finally {
      setDeactivatingId(null);
    }
  };

  const handleCloseToast = () => {
    setToast({...toast, visible: false});
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Team Management</h1>
          <p className="text-gray-400">Manage your sales representatives and monitor their performance</p>
        </div>
        <Button asChild>
          <Link href="/sales-team/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Sales Rep
          </Link>
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Sales Reps</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{salesReps?.length || 0}</div>
            <p className="text-xs text-gray-400">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Proposals</CardTitle>
            <FileText className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {salesRepStats.reduce((sum, rep) => sum + rep.totalActive, 0)}
            </div>
            <p className="text-xs text-gray-400">
              Active proposals
            </p>
          </CardContent>
        </Card>

        <Link href="/proposals?filter=archived">
          <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Archived</CardTitle>
              <Archive className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {salesRepStats.reduce((sum, rep) => sum + rep.totalArchived, 0)}
              </div>
              <p className="text-xs text-gray-400">
                Archived proposals
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Sales Reps List */}
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white">Sales Representatives</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your sales team and monitor their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesRepStats && salesRepStats.length > 0 ? (
            <div className="space-y-4">
              {salesRepStats.map((rep) => (
                <div
                  key={rep.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-850 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-medium">
                        {rep.name ? rep.name.charAt(0).toUpperCase() : rep.email!.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">
                          {rep.name || rep.email?.split("@")[0]}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail className="h-3 w-3" />
                          {rep.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="h-3 w-3" />
                          Joined {new Date(rep.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Stats */}
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{rep.totalActive}</div>
                      <div className="text-xs text-gray-400">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{rep.statusCounts.accepted || 0}</div>
                      <div className="text-xs text-gray-400">Accepted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{rep.totalArchived}</div>
                      <div className="text-xs text-gray-400">Archived</div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        Active
                      </Badge>
                      {rep.statusCounts.sent > 0 && (
                        <Badge variant="outline" className="border-blue-400 text-blue-400">
                          {rep.statusCounts.sent} Sent
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-zinc-600 text-gray-300 hover:bg-zinc-700"
                      >
                        <Link href={`/sales-team/${rep.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-zinc-600 text-gray-300 hover:bg-zinc-700"
                      >
                        <Link href={`/proposals?created_by=${rep.id}`}>
                          View Proposals
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivate(rep.id, rep.email!)}
                        disabled={deactivatingId === rep.id}
                        className="border-red-600 text-red-400 hover:bg-red-900/20"
                      >
                        <UserMinus className="mr-1 h-3 w-3" />
                        {deactivatingId === rep.id ? "Removing..." : "Remove Access"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-600" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">No sales representatives</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first sales representative.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/sales-team/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sales Rep
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toast notification */}
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </div>
  );
}