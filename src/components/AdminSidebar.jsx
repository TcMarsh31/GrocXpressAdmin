"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function AdminSidebar({ userEmail }) {
  const pathname = usePathname();

  const nav = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <aside className="w-64 shrink-0 border-r bg-white p-4">
      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-lg font-semibold">
          Admin
        </Link>
      </div>

      <nav className="flex flex-col gap-1 text-sm">
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
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-100 text-slate-700",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t pt-4 text-xs text-slate-500">
        Signed in as {userEmail}
      </div>
    </aside>
  );
}
