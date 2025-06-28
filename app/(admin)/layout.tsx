"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import Navbar from "@/components/admin/Navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and the user role is determined
    if (!isLoading && userRole !== null) {
      if (!user) {
        // Not logged in, redirect to login
        router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      } else if (userRole === "deactivated") {
        // Access revoked, redirect to access revoked page
        router.push("/access-revoked");
      } else if (userRole !== "admin" && userRole !== "sales_rep") {
        // Unknown role, redirect to login
        router.push("/login");
      }
    }
  }, [isLoading, user, userRole, router]);

  // Show loading state while checking authentication
  if (isLoading || (user && userRole === null)) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Only show layout for authenticated users with valid roles
  if (!user || userRole === "deactivated" || (userRole !== "admin" && userRole !== "sales_rep")) {
    return null; // Return nothing as we're redirecting
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar user={user} userRole={userRole} />
      <main className="pt-16">{children}</main>
    </div>
  );
}
