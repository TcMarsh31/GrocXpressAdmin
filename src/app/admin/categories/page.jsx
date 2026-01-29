"use client";

import React, { useEffect, useState } from "react";

const API = "/api/categories";

export default function CategoriesAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function fetchList() {
    const res = await fetch(API);
    const body = await res.json();
    setItems(body.data || []);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(API);
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
  }, []);

  async function remove(id) {
    if (!confirm("Delete category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed");
    fetchList();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Categories</h1>
        <div>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-slate-900 text-white px-3 py-1 rounded"
          >
            Add category
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        {loading ? (
          <div>Loading…</div>
        ) : (
          <ul className="space-y-2">
            {items.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between border rounded p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ background: c.icon_color || "#eee" }}
                    className="w-10 h-10 rounded flex items-center justify-center"
                  >
                    {c.icon || "📦"}
                  </div>
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-slate-400">
                      {c.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditing(c);
                      setShowForm(true);
                    }}
                    className="px-2 py-1 border rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="px-2 py-1 border rounded text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <CategoryForm
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

function CategoryForm({ initial = null, onClose }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    icon: initial?.icon || "",
    icon_color: initial?.icon_color || "#f3f4f6",
  });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      const method = initial ? "PUT" : "POST";
      const url = initial ? `/api/categories/${initial.id}` : "/api/categories";
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
      <form onSubmit={submit} className="bg-white p-6 rounded w-[520px] shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">
            {initial ? "Edit category" : "Add category"}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-500">
            Close
          </button>
        </div>

        <label className="flex flex-col mb-3">
          <span className="text-sm mb-1">Name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded p-2"
          />
        </label>
        <label className="flex flex-col mb-3">
          <span className="text-sm mb-1">Icon (emoji or class)</span>
          <input
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="border rounded p-2"
          />
        </label>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="color"
            value={form.icon_color}
            onChange={(e) => setForm({ ...form, icon_color: e.target.value })}
          />
          <div className="text-sm text-slate-500">Pick icon color</div>
        </label>

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
