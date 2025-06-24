"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            setUserRole(null);
            return;
          }

          if (data) {
            setUserRole(data.role);
          } else {
            // Create a profile if it doesn't exist
            try {
              const { error: insertError } = await supabase
                .from("profiles")
                .insert({
                  id: user.id,
                  email: user.email,
                  role: "admin",
                });

              if (insertError) {
                console.error("Error creating profile:", insertError);
              } else {
                setUserRole("admin");
              }
            } catch (e) {
              console.error("Error creating profile:", e);
            }
          }
        } catch (error) {
          console.error("Error in profile fetch:", error);
        }
        setIsLoading(false);
      } else {
        setUserRole(null);
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, supabase]);

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setSession(session);
        setUser(session.user);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
      }

      // Refresh the page on sign in or sign out
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

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
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
