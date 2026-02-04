import React from "react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

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
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r bg-white p-4">
          <div className="mb-6">
            <Link
              href="/admin/dashboard"
              prefetch={false}
              className="text-lg font-semibold"
            >
              Admin
            </Link>
          </div>

          <nav className="flex flex-col gap-1 text-sm">
            <Link
              href="/admin/dashboard"
              className="px-3 py-2 rounded hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="px-3 py-2 rounded hover:bg-slate-100"
            >
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="px-3 py-2 rounded hover:bg-slate-100"
            >
              Orders
            </Link>
            <Link
              href="/admin/categories"
              className="px-3 py-2 rounded hover:bg-slate-100"
            >
              Categories
            </Link>
            <Link
              href="/admin/settings"
              className="px-3 py-2 rounded hover:bg-slate-100 text-slate-500"
            >
              Settings
            </Link>
          </nav>

          <div className="mt-6 border-t pt-4 text-xs text-slate-500">
            Signed in as {user.email}
          </div>
        </aside>

        {/* Main content — ONLY scroll container */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
