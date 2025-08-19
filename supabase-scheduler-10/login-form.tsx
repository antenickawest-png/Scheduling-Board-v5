"use client";

import React, { useState } from "react";
// if the alias doesn't work, change to: import { useAuth } from "../hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message ?? "Something went wrong");
    } else if (isSignUp) {
      // Supabase sends a confirmation email and then redirects to /auth/callback
      setNotice("Check your email for the confirmation link.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
          🔐 R&S Weekly Schedule
        </h2>
        
        {error && <div className="text-red-600 text-sm text-center mb-4">{error}</div>}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-800 bg-purple-300 hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? "Loading..." : isSignUp ? "🚀 Sign up" : "🚀 Sign in"}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600 cursor-pointer hover:underline mt-4">
            Forgot password?
          </div>
        </form>
        
        {notice && <div className="text-green-700 text-sm text-center mt-4">{notice}</div>}

        <div className="text-center mt-4">
          <button
            type="button"
            className="text-purple-600 hover:text-purple-500 text-sm"
            onClick={() => {
              setIsSignUp((v) => !v);
              setError("");
              setNotice("");
            }}
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

