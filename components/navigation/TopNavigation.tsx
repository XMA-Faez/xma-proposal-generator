"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, ChevronDown, User, Package } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/supabase";

type UserRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

interface TopNavigationProps {
  userRole: UserRole;
}

export function TopNavigation({ userRole }: TopNavigationProps) {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = (email?: string) => {
    if (!email) return "U";
    return email
      .split("@")[0]
      .split(".")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "sales_rep":
        return "Sales Representative";
      default:
        return "User";
    }
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      {/* Left side - Breadcrumb or page title could go here */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-gray-900">
          {userRole === "sales_rep" ? "Sales Dashboard" : "Admin Dashboard"}
        </h1>
      </div>

      {/* Right side - User menu and notifications */}
      <div className="flex items-center gap-4">
        {/* Notifications (placeholder for future feature) */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getUserInitials(user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-xs">
                <span className="font-medium text-gray-900">
                  {user?.email?.split("@")[0]}
                </span>
                <span className="text-gray-500">
                  {getRoleDisplayName(profile?.role)}
                </span>
              </div>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm">
                  {getUserInitials(user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.email}</span>
                <span className="text-xs text-gray-500">
                  {getRoleDisplayName(profile?.role)}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            {userRole === "admin" && (
              <>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/admin/packages">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Package Management</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleSignOut}
            >
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}