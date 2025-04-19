"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "@/app/auth/actions";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (redirectedFrom) {
      formData.append("redirectedFrom", redirectedFrom);
    }

    startTransition(async () => {
      // Call the server action
      const result = await signIn(formData);

      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="admin@xmaagency.com"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing In...
            </div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
}
