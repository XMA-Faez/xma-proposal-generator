import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login - XMA Agency",
  description: "Login to access the XMA Agency admin tools",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img 
            src="/XMA-White.svg" 
            alt="XMA Agency Logo" 
            className="h-12 mx-auto mb-6" 
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Login
          </h1>
          <p className="text-zinc-400">
            Sign in to access the proposal generator and admin tools
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}
