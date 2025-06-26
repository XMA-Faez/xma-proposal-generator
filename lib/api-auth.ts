import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}

export async function authenticateRequest(): Promise<{ user: AuthenticatedUser | null; error: NextResponse | null }> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    };
  }

  // Get user role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    user: {
      id: user.id,
      email: user.email!,
      role: profile?.role || undefined
    },
    error: null
  };
}

export async function requireAdmin(): Promise<{ user: AuthenticatedUser | null; error: NextResponse | null }> {
  const { user, error } = await authenticateRequest();
  
  if (error) {
    return { user: null, error };
  }
  
  if (user?.role !== 'admin') {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    };
  }
  
  return { user, error: null };
}

export async function requireAuth(): Promise<{ user: AuthenticatedUser | null; error: NextResponse | null }> {
  return authenticateRequest();
}