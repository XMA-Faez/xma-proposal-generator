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
    if (!isLoading && (!user || (userRole !== null && userRole !== "admin"))) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
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

  if (!user || userRole !== "admin") {
    return null; // Return nothing as we're redirecting
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar user={user} />
      <main className="pt-16">{children}</main>
    </div>
  );
}
