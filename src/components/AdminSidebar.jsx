"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminSidebar({ userEmail }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const nav = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/settings", label: "Settings" },
    { href: "/admin/profile", label: "Profile" },
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground p-4 flex flex-col h-full">
      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-lg font-semibold">
          Admin
        </Link>
      </div>

      <nav className="flex flex-col gap-1 text-sm flex-1">
        {nav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "px-3 py-2 rounded transition",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-sidebar-border pt-4 flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground truncate flex-1" title={userEmail}>
          Signed in as<br />{userEmail}
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle className="h-8 w-8" />
          <button
            onClick={handleSignOut}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-sidebar-accent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 focus:outline-none transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
