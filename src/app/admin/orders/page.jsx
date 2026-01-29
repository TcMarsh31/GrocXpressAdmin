"use client";

import React, { useEffect, useState } from "react";
import ClientDate from "@/components/ClientDate";

const API = "/api/orders";

function StatusPill({ status }) {
  const color =
    status === "delivered"
      ? "bg-emerald-100 text-emerald-700"
      : status === "shipped"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-700";
  return <span className={`${color} px-2 py-1 rounded text-xs`}>{status}</span>;
}

export default function OrdersAdminPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchList = React.useCallback(async () => {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (statusFilter) q.set("status", statusFilter);
    const res = await fetch(`${API}?${q.toString()}`);
    const body = await res.json();
    setItems(body.data || []);
  }, [page, statusFilter, limit]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const q = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (statusFilter) q.set("status", statusFilter);
        const res = await fetch(`${API}?${q.toString()}`);
        const body = await res.json();
        if (!mounted) return;
        setItems(body.data || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, statusFilter, limit]);

  async function updateStatus(id, updates) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return alert("Update failed");
    fetchList();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Orders</h1>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All statuses</option>
            <option value="placed">placed</option>
            <option value="confirmed">confirmed</option>
            <option value="shipped">shipped</option>
            <option value="delivered">delivered</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6">
                  Loading…
                </td>
              </tr>
            ) : (
              items.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3">
                    #{o.id}
                    <div className="text-xs text-slate-400">
                      <ClientDate iso={o.created_at} />
                    </div>
                  </td>
                  <td className="p-3">{o.customer_name || o.user_id}</td>
                  <td className="p-3">
                    <StatusPill status={o.status || "placed"} />
                  </td>
                  <td className="p-3 text-right">
                    ${(o.total_price || 0).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateStatus(o.id, {
                            order_shipped_date: new Date().toISOString(),
                          })
                        }
                        className="text-sm px-2 py-1 border rounded"
                      >
                        Mark shipped
                      </button>
                      <button
                        onClick={() =>
                          updateStatus(o.id, {
                            order_delivered_date: new Date().toISOString(),
                          })
                        }
                        className="text-sm px-2 py-1 border rounded"
                      >
                        Mark delivered
                      </button>
                      <a
                        href={`/admin/orders/${o.id}`}
                        className="text-sm px-2 py-1 border rounded"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <div>Showing {items.length} orders</div>
        <div>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-2 py-1 border rounded mr-2"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 border rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
