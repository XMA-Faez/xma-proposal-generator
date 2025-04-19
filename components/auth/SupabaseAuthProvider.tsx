"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: string | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null;
  }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({
  children,
  serverSession,
}: {
  children: React.ReactNode;
  serverSession: Session | null;
}) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [session, setSession] = useState<Session | null>(serverSession);
  const [user, setUser] = useState<User | null>(serverSession?.user || null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch user profile on session change to get role
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data) {
          setUserRole(data.role);
        }
      } else {
        setUserRole(null);
      }
    };

    fetchUserProfile();
  }, [user, supabase]);

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);

      // Refresh the page on sign in or sign out to update server-side session
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    // Initial session check
    setIsLoading(false);

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        router.refresh();
      }

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  // Create the value object for the context
  const value = {
    user,
    session,
    isLoading,
    userRole,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SupabaseAuthProvider");
  }
  return context;
}
