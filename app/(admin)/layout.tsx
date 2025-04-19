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
    // If authentication check is complete and user is not logged in or not an admin
    if (!isLoading && (!user || userRole !== "admin")) {
      // Redirect to login
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isLoading, user, userRole, router]);

  // Show loading state while checking authentication
  if (isLoading || !user || userRole !== "admin") {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar user={user} />
      <main className="pt-16">{children}</main>
    </div>
  );
}
