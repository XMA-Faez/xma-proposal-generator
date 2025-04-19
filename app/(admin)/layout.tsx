import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/admin/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If user is not authenticated, redirect to login
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar user={session.user} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
