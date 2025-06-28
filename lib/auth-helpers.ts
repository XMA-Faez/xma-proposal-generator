import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";

type UserRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Get the authenticated user with their role
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  // Get user role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    role: profile?.role || null
  };
}

/**
 * Require user to be authenticated with a specific role
 */
export async function requireRole(roles: UserRole[], redirectTo: string = "/login") {
  const user = await getAuthUser();
  
  if (!user) {
    redirect(redirectTo);
  }

  if (!user.role || !roles.includes(user.role)) {
    redirect("/unauthorized");
  }

  // Check if user is deactivated
  if (user.role === "deactivated") {
    redirect("/access-revoked");
  }

  return user;
}

/**
 * Require admin role
 */
export async function requireAdminRole(redirectTo: string = "/login") {
  return requireRole(["admin"], redirectTo);
}

/**
 * Require sales rep role
 */
export async function requireSalesRepRole(redirectTo: string = "/login") {
  return requireRole(["sales_rep"], redirectTo);
}

/**
 * Require any authenticated user (admin or sales rep)
 */
export async function requireAuthenticatedUser(redirectTo: string = "/login") {
  return requireRole(["admin", "sales_rep"], redirectTo);
}

/**
 * Check if user has a specific role (non-throwing version)
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getAuthUser();
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if user is sales rep
 */
export async function isSalesRep(): Promise<boolean> {
  return hasRole("sales_rep");
}