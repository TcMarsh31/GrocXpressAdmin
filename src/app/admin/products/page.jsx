"use client";

import React, { useEffect, useState } from "react";
import { uploadImage } from "@/lib/supabase/client";

const API = "/api/products";

function Pager({ page, totalPages, onChange }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-2 py-1 rounded border border-border bg-card hover:bg-muted disabled:opacity-50 text-card-foreground"
      >
        Prev
      </button>
      <div className="px-2 text-muted-foreground">
        {page} / {totalPages}
      </div>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-2 py-1 rounded border border-border bg-card hover:bg-muted disabled:opacity-50 text-card-foreground"
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
        <h1 className="text-lg font-semibold text-foreground">Products</h1>
        <div className="flex items-center gap-3">
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground"
          />
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90 transition-opacity"
          >
            Add product
          </button>
          <button
            onClick={bulkDelete}
            className="px-3 py-1 rounded border border-border bg-card text-card-foreground hover:bg-muted"
          >
            Delete ({selected.size})
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : (
            items.map((p) => (
              <div
                key={p.id}
                className="border border-border rounded p-3 flex flex-col gap-2 bg-card text-card-foreground"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {p.product_name || p.name}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      ${(p.price ?? 0).toFixed(2)}
                    </div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_url}
                    alt=""
                    className="w-16 h-16 object-cover rounded bg-muted"
                  />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setShowForm(true);
                    }}
                    className="text-sm px-2 py-1 border border-border rounded hover:bg-muted text-card-foreground"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="text-sm px-2 py-1 border border-border rounded text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
          <div className="text-sm text-muted-foreground">
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
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [form, setForm] = useState({
    product_name: initial?.product_name || initial?.name || "",
    price: initial?.price || 0,
    category_id: initial?.category_id || "",
    image: null,
    image_url: initial?.image_url || "",
    stock: initial?.stock || 0,
    weight: initial?.weight || "",
    description: initial?.description || "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const body = await res.json();
      setCategories(body.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  }

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
        weight: form.weight || null,
        description: form.description || null,
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-background text-foreground rounded border border-border w-[720px] shadow-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h3 className="text-lg font-semibold">
            {initial ? "Edit product" : "Add product"}
          </h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            Close
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-sm mb-1 font-medium text-foreground">Name</span>
              <input
                required
                value={form.product_name}
                onChange={(e) =>
                  setForm({ ...form, product_name: e.target.value })
                }
                className="border border-border rounded p-2 bg-background text-foreground"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm mb-1 font-medium text-foreground">Price</span>
              <input
                required
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="border border-border rounded p-2 bg-background text-foreground"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm mb-1 font-medium text-foreground">Category</span>
              <select
                required
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className="border border-border rounded p-2 bg-background text-foreground"
              >
                <option value="">Select a category</option>
                {loadingCategories ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm mb-1 font-medium text-foreground">Weight</span>
              <input
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="border border-border rounded p-2 bg-background text-foreground"
                placeholder="e.g., 500g, 1kg"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm mb-1 font-medium text-foreground">Stock</span>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="border border-border rounded p-2 bg-background text-foreground"
              />
            </label>

            <label className="flex flex-col col-span-2">
              <span className="text-sm mb-1 font-medium text-foreground">Description</span>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="border border-border rounded p-2 bg-background text-foreground"
                rows="3"
                placeholder="Enter product description..."
              />
            </label>

            <label className="flex flex-col col-span-2">
              <span className="text-sm mb-1 font-medium text-foreground">Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, image: e.target.files?.[0] })}
                className="text-sm text-muted-foreground"
              />
              {form.image_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={form.image_url}
                  className="w-28 h-28 object-cover mt-2 rounded border border-border bg-muted"
                  alt=""
                />
              )}
            </label>
          </div>
        </div>

        <div className="border-t border-border p-6 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 border border-border rounded hover:bg-muted text-foreground"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}