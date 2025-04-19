import { redirect } from "next/navigation";
import { getUser } from "@/utils/supabase/server";

export default async function Home() {
  const user = await getUser();

  if (user) {
    // If user is authenticated, redirect to proposal generator
    redirect("/proposal-generator");
  } else {
    // Otherwise, redirect to login page
    redirect("/login");
  }
}
