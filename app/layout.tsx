import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { AuthProvider } from "@/components/auth/AuthProvider";
import QueryProvider from "./QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XMA Agency Proposal System",
  description: "Create and manage client proposals",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create supabase server client
  const supabase = await createClient();

  // Get session from supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      >
        <QueryProvider>
          <AuthProvider initialSession={session}>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
