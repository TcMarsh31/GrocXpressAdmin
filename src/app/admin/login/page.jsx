"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) return setError(error.message);

    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white p-6 sm:p-8 rounded shadow-sm
                   max-h-[calc(100dvh-3.5rem)] overflow-y-auto"
        aria-labelledby="admin-signin-title"
      >
        <h2
          id="admin-signin-title"
          className="text-2xl font-semibold mb-4 text-center"
        >
          Admin sign in
        </h2>

        {error && (
          <div className="mb-3 text-sm text-red-600 text-center">{error}</div>
        )}

        <label className="block mb-3">
          <div className="text-sm mb-1">Email</div>
          <input
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-3 text-sm"
            type="email"
            required
          />
        </label>

        <label className="block mb-4">
          <div className="text-sm mb-1">Password</div>
          <input
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-3 text-sm"
            type="password"
            required
          />
        </label>

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <button
            className="w-full sm:w-auto bg-slate-900 text-white px-4 py-3 rounded text-sm"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <a className="text-sm text-slate-500 text-center sm:text-left">
            Forgot?
          </a>
        </div>

        <p className="mt-4 text-xs text-slate-400 text-center">
          Only admin users may sign in here.
        </p>
      </form>
    </div>
  );
}
