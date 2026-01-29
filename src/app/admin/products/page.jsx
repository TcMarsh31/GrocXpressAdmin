"use client";

import React, { useEffect, useState } from "react";
import { uploadImage, createClient } from "@/lib/supabase/client";

const API = "/api/products";

function Pager({ page, totalPages, onChange }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-2 py-1 rounded border bg-white"
      >
        Prev
      </button>
      <div className="px-2">
        {page} / {totalPages}
      </div>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-2 py-1 rounded border bg-white"
      >
        Next
      </button>
    </div>
  );
}

export default function ProductsAdminPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  async function fetchList() {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) q.set("search", search);
    const res = await fetch(`${API}?${q.toString()}`);
    const body = await res.json();
    setItems(body.data || []);
    const total = body.pagination?.total || 0;
    setTotalPages(Math.max(1, Math.ceil(total / limit)));
    setLoading(false);
  }

  function toggle(id) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  }

  async function remove(id) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) fetchList();
    else alert("Delete failed");
  }

  async function bulkDelete() {
    if (selected.size === 0) return alert("No items selected");
    if (!confirm(`Delete ${selected.size} products?`)) return;
    setLoading(true);
    for (const id of Array.from(selected)) {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
    }
    setSelected(new Set());
    await fetchList();
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Products</h1>
        <div className="flex items-center gap-3">
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-slate-900 text-white px-3 py-1 rounded"
          >
            Add product
          </button>
          <button
            onClick={bulkDelete}
            className="px-3 py-1 rounded border bg-white"
          >
            Delete ({selected.size})
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            <div>Loading…</div>
          ) : (
            items.map((p) => (
              <div
                key={p.id}
                className="border rounded p-3 flex flex-col gap-2"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {p.product_name || p.name}
                    </div>
                    <div className="text-slate-400 text-sm">
                      ${(p.price ?? 0).toFixed(2)}
                    </div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_url}
                    alt=""
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setShowForm(true);
                    }}
                    className="text-sm px-2 py-1 border rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="text-sm px-2 py-1 border rounded text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Pager page={page} totalPages={totalPages} onChange={setPage} />
          <div className="text-sm text-slate-500">
            Showing {items.length} items
          </div>
        </div>
      </div>

      {showForm && (
        <ProductForm
          initial={editing}
          onClose={() => {
            setShowForm(false);
            fetchList();
          }}
        />
      )}
    </div>
  );
}

function ProductForm({ initial = null, onClose }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    product_name: initial?.product_name || initial?.name || "",
    price: initial?.price || 0,
    category_id: initial?.category_id || "",
    image: null,
    image_url: initial?.image_url || "",
    stock: initial?.stock || 0,
  });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      if (form.image) {
        imageUrl = await uploadImage(form.image, "products");
      }

      const payload = {
        product_name: form.product_name,
        price: Number(form.price),
        category_id: form.category_id,
        image_url: imageUrl,
        stock: Number(form.stock),
      };

      const method = initial ? "PUT" : "POST";
      const url = initial ? `/api/products/${initial.id}` : "/api/products";
      const res = await fetch(url, {
        method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Save failed");
      onClose();
    } catch (err) {
      alert(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-6 rounded w-[720px] shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">
            {initial ? "Edit product" : "Add product"}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-500">
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-sm mb-1">Name</span>
            <input
              required
              value={form.product_name}
              onChange={(e) =>
                setForm({ ...form, product_name: e.target.value })
              }
              className="border rounded p-2"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm mb-1">Price</span>
            <input
              required
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="border rounded p-2"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm mb-1">Category ID</span>
            <input
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              className="border rounded p-2"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm mb-1">Stock</span>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="border rounded p-2"
            />
          </label>

          <label className="flex flex-col col-span-2">
            <span className="text-sm mb-1">Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] })}
            />
            {form.image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={form.image_url}
                className="w-28 h-28 object-cover mt-2 rounded"
                alt=""
              />
            )}
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
