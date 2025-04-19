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
  const [isLoading, setIsLoading] = useState<boolean>(!initialSession);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
    console.log(user)
        try {
          console.log("Fetching user profile for:", user.id);

          // Query with detailed logging
          const { data, error } = await supabase
            .from("profiles")
            .select("*") // Select all fields for debugging
            .eq("id", user.id)
            .single();

          console.log(data)

          if (error) {
            console.error("Error fetching profile:", error);
            setUserRole(null);
            return;
          }

          console.log("Profile data received:", data);

          if (data) {
            setUserRole(data.role);
            console.log("User role set to:", data.role);
          } else {
            console.warn("No profile found for user:", user.id);

            // Create a profile if it doesn't exist
            try {
              const { error: insertError } = await supabase
                .from("profiles")
                .insert({
                  id: user.id,
                  email: user.email,
                  role: "admin", // Set role for new user
                });

              if (insertError) {
                console.error("Error creating profile:", insertError);
              } else {
                console.log("Created new profile with admin role");
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
        console.log("No user found");
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);

      // Refresh the page on sign in or sign out to update server-side session
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
