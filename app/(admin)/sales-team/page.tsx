"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/design-card";
import { brandButtonVariants } from "@/lib/design-system";
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
      <div className="bg-surface-primary min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-text-primary">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Sales Team Management</h1>
            <p className="text-text-muted">Manage your sales representatives and monitor their performance</p>
          </div>
          <Link 
            href="/sales-team/new"
            className={brandButtonVariants({ variant: "primary" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Sales Rep
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="elevated" size="md">
            <div className="flex flex-row items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-muted">Total Sales Reps</h3>
              <Users className="h-4 w-4 text-status-sent" />
            </div>
            <div className="text-2xl font-bold text-text-primary">{salesReps?.length || 0}</div>
            <p className="text-xs text-text-subtle">
              Active team members
            </p>
          </Card>

          <Card variant="elevated" size="md">
            <div className="flex flex-row items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-muted">Total Proposals</h3>
              <FileText className="h-4 w-4 text-status-accepted" />
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {salesRepStats.reduce((sum, rep) => sum + rep.totalActive, 0)}
            </div>
            <p className="text-xs text-text-subtle">
              Active proposals
            </p>
          </Card>

          <Link href="/proposals?filter=archived">
            <Card variant="elevated" size="md" className="hover:bg-surface-interactive transition-colors cursor-pointer">
              <div className="flex flex-row items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-muted">Archived</h3>
                <Archive className="h-4 w-4 text-text-muted" />
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {salesRepStats.reduce((sum, rep) => sum + rep.totalArchived, 0)}
              </div>
              <p className="text-xs text-text-subtle">
                Archived proposals
              </p>
            </Card>
          </Link>
        </div>

        {/* Sales Reps List */}
        <Card variant="primary" size="lg">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-text-primary">Sales Representatives</h3>
            <p className="text-sm text-text-muted">
              Manage your sales team and monitor their performance
            </p>
          </div>
          <div>
          {salesRepStats && salesRepStats.length > 0 ? (
            <div className="space-y-4">
              {salesRepStats.map((rep) => (
                <Card
                  key={rep.id}
                  variant="elevated"
                  size="md"
                  className="flex items-center justify-between transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-text-primary font-medium">
                        {rep.name ? rep.name.charAt(0).toUpperCase() : rep.email!.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-text-primary">
                          {rep.name || rep.email?.split("@")[0]}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <Mail className="h-3 w-3" />
                          {rep.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <Calendar className="h-3 w-3" />
                          Joined {new Date(rep.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Stats */}
                    <div className="text-center">
                      <div className="text-lg font-semibold text-text-primary">{rep.totalActive}</div>
                      <div className="text-xs text-text-muted">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-text-primary">{rep.statusCounts.accepted || 0}</div>
                      <div className="text-xs text-text-muted">Accepted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-text-primary">{rep.totalArchived}</div>
                      <div className="text-xs text-text-muted">Archived</div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary" className="bg-status-accepted text-text-primary">
                        Active
                      </Badge>
                      {rep.statusCounts.sent > 0 && (
                        <Badge variant="outline" className="border-status-sent text-status-sent">
                          {rep.statusCounts.sent} Sent
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link 
                        href={`/sales-team/${rep.id}`}
                        className="px-3 py-1.5 text-sm border border-border-primary text-text-secondary bg-surface-elevated hover:bg-surface-interactive rounded-md transition-colors"
                      >
                        View Details
                      </Link>
                      <Link 
                        href={`/proposals?created_by=${rep.id}`}
                        className="px-3 py-1.5 text-sm border border-border-primary text-text-secondary hover:bg-surface-interactive rounded-md transition-colors"
                      >
                        View Proposals
                      </Link>
                      <button
                        onClick={() => handleDeactivate(rep.id, rep.email!)}
                        disabled={deactivatingId === rep.id}
                        className="px-3 py-1.5 text-sm border border-semantic-error text-semantic-error hover:bg-semantic-error/20 rounded-md transition-colors disabled:opacity-50 flex items-center"
                      >
                        <UserMinus className="mr-1 h-3 w-3" />
                        {deactivatingId === rep.id ? "Removing..." : "Remove Access"}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-text-subtle" />
              <h3 className="mt-2 text-sm font-medium text-text-secondary">No sales representatives</h3>
              <p className="mt-1 text-sm text-text-muted">
                Get started by adding your first sales representative.
              </p>
              <div className="mt-6">
                <Link 
                  href="/sales-team/new"
                  className={brandButtonVariants({ variant: "primary" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Sales Rep
                </Link>
              </div>
            </div>
          )}
          </div>
        </Card>

        {/* Toast notification */}
        <Toast
          isVisible={toast.visible}
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      </div>
    </div>
  );
}
