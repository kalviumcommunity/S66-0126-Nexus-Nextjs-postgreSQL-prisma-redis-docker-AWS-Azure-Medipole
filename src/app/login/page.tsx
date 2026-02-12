"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setIsLoading(true);
    try {
      // Mock token - in real apps, get it from backend
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJyb2xlIjoiVVNFUiJ9.mocktoken";
      
      // Set cookie using API route
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: mockToken }),
      });

      router.push("/dashboard");
    } catch {
      console.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center mt-10">
      <h1 className="text-xl font-semibold">Login Page</h1>
      <p className="mt-2 text-gray-600">
        Sign in to access the dashboard
      </p>
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </main>
  );
}
