// lib/supabase-server.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import { redirect } from "next/navigation";

// Create a server component client (use this in server components)
export async function createServerSupabase() {
  return createServerComponentClient<Database>({ cookies });
}

// Get the current session
export async function getServerSession() {
  const supabase = await createServerSupabase();
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Get the current user
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user || null;
}

// Check if user is admin and redirect if not
export async function requireAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Get the user profile with role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  return {
    user: session.user,
    role: profile.role,
  };
}
