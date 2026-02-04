import React from "react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export const revalidate = 0;

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  if (!user) {
    redirect("/login");
  }

  const isAdmin =
    user &&
    (user.user_metadata?.role === "admin" ||
      user.app_metadata?.roles?.includes("admin"));

  /* ─────────────────────────────
     NOT AUTHENTICATED (LOGIN PAGE)
  ───────────────────────────── */
  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
        {children}
      </div>
    );
  }

  /* ─────────────────────────────
     AUTHENTICATED BUT NOT ADMIN
  ───────────────────────────── */
  if (!isAdmin) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow text-center max-w-md w-full">
          <h2 className="text-lg font-semibold mb-2">Access denied</h2>
          <p className="text-sm text-slate-500">
            Your account does not have administrator privileges.
          </p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────
     ADMIN SHELL
  ───────────────────────────── */
  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      <div className="flex min-h-[100dvh]">
        <AdminSidebar userEmail={user.email} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
