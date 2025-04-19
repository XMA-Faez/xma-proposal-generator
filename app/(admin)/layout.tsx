import { requireAdmin } from "@/utils/supabase/server";
import Navbar from "@/components/admin/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This function will redirect to login if user is not an admin
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar user={user} />
      <main className="pt-16">{children}</main>
    </div>
  );
}
