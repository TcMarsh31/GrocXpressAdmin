import React from "react";

import { createClient } from "@/lib/supabase/server";
import ClientDate from "@/components/ClientDate";
// Server component: fetch summary stats from API/database and render cards + recent orders
export const revalidate = 0;

async function fetchStats() {
  // Query counts from Supabase directly for accuracy
  const supabase = createClient();
  const [
    { data: orders },
    { data: revenue },
    { data: lowStock },
    { data: recent },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact" }),
    supabase
      .rpc("store_revenue_stats" /* optional: fallback to aggregate below */)
      .then((r) => r)
      .catch(async () => {
        const { data } = await supabase.from("orders").select("total_price");
        const total = (data || []).reduce(
          (s, o) => s + (o.total_price || 0),
          0,
        );
        return { data: { total } };
      }),
    supabase.from("products").select("id,stock").lt("stock", 5).limit(5),
    supabase
      .from("orders")
      .select("id,status,created_at,total_price")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return {
    ordersCount: orders?.length ?? 0,
    revenue: revenue?.data?.total ?? 0,
    lowStock: lowStock ?? [],
    recent: recent ?? [],
  };
}

export default async function DashboardPage() {
  const stats = await fetchStats();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </header>

      <section className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-slate-500">Orders</div>
          <div className="text-3xl font-bold">{stats.ordersCount}</div>
        </div>
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-slate-500">Revenue</div>
          <div className="text-3xl font-bold">
            ${(stats.revenue || 0).toFixed(2)}
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-slate-500">Low stock</div>
          <div className="text-3xl font-bold">
            {(stats.lowStock || []).length}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="font-medium mb-3">Recent orders</h2>
          <table className="w-full text-sm">
            <thead className="text-slate-400 text-left">
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(stats.recent || []).map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="py-2">{o.id}</td>
                  <td className="py-2">{o.status}</td>
                  <td className="py-2">
                    <ClientDate iso={o.created_at} />
                  </td>
                  <td className="py-2 text-right">
                    ${(o.total_price || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="font-medium mb-3">Low stock</h2>
          <ul className="text-sm space-y-2">
            {(stats.lowStock || []).map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <div>Product {p.id}</div>
                <div className="text-amber-600">{p.stock}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="text-xs text-slate-400">
        Charts and deeper analytics can be added once UI components are
        standardized.
      </p>
    </div>
  );
}
