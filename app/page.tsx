import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (session && session.user) {
    // If user is authenticated, redirect to proposal generator
    redirect("/proposal-generator");
  } else {
    // Otherwise, redirect to login page
    redirect("/login");
  }
}
