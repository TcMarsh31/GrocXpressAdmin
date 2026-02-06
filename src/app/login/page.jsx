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
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4 transition-colors">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-card text-card-foreground p-6 sm:p-8 rounded-lg border border-border shadow-sm
                   max-h-[calc(100dvh-3.5rem)] overflow-y-auto"
        aria-labelledby="admin-signin-title"
      >
        <h2
          id="admin-signin-title"
          className="text-2xl font-semibold mb-4 text-center text-foreground"
        >
          Admin sign in
        </h2>

        {error && (
          <div className="mb-3 text-sm text-destructive text-center">{error}</div>
        )}

        <label className="block mb-3">
          <div className="text-sm mb-1 text-foreground">Email</div>
          <input
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border rounded p-3 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            type="email"
            required
          />
        </label>

        <label className="block mb-4">
          <div className="text-sm mb-1 text-foreground">Password</div>
          <input
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border rounded p-3 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            type="password"
            required
          />
        </label>

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <button
            className="w-full sm:w-auto bg-primary text-primary-foreground px-4 py-3 rounded text-sm hover:opacity-90 transition-opacity font-medium"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <a href="#" className="text-sm text-muted-foreground hover:text-foreground text-center sm:text-left transition-colors">
            Forgot?
          </a>
        </div>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Only admin users may sign in here.
        </p>
      </form>
    </div>
  );
}
