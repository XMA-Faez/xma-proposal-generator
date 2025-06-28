"use client";

import { useState, useEffect } from "react";
import type { Database } from "@/types/supabase";

type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"] & {
  user_profile?: {
    name: string | null;
    email: string | null;
  };
};

export function useActivityLog(userId?: string) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (userId) {
        params.append("userId", userId);
      }

      const response = await fetch(`/api/activity-logs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch activity logs");
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const logActivity = async (
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const response = await fetch("/api/activity-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          entity_type: entityType,
          entity_id: entityId,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log activity");
      }

      // Refresh the activities list
      await fetchActivities();
    } catch (err) {
      console.error("Error logging activity:", err);
    }
  };

  return {
    activities,
    loading,
    error,
    refresh: fetchActivities,
    logActivity,
  };
}