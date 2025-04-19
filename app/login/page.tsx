// app/login/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Admin Login - XMA Agency",
  description: "Login to access the XMA Agency admin tools",
};

// Properly type the searchParams prop
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  // Check if user is already logged in
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If already authenticated, redirect to dashboard
  if (session) {
    // Use the string value from searchParams safely
    const redirectTo = searchParams.redirectTo || "/proposal-generator";
    redirect(redirectTo);
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src="/XMA-White.svg"
            alt="XMA Agency Logo"
            className="h-12 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-zinc-400">
            Sign in to access the proposal generator and admin tools
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
