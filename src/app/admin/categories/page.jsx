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
        <h1 className="text-lg font-semibold text-foreground">Categories</h1>
        <div>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90"
          >
            Add category
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded shadow-sm p-4 text-card-foreground">
        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : (
          <ul className="space-y-2">
            {items.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between border border-border rounded p-3 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ background: c.icon_color || "#eee" }}
                    className="w-10 h-10 rounded flex items-center justify-center text-lg shadow-sm border border-black/5"
                  >
                    {c.icon || "📦"}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
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
                    className="px-2 py-1 border border-border rounded text-sm hover:bg-muted"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="px-2 py-1 border border-border rounded text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 text-sm"
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <form onSubmit={submit} className="bg-background text-foreground border border-border p-6 rounded w-[520px] shadow-lg">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold">
            {initial ? "Edit category" : "Add category"}
          </h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            Close
          </button>
        </div>

        <label className="flex flex-col mb-3">
          <span className="text-sm mb-1 font-medium">Name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-border rounded p-2 bg-background text-foreground"
          />
        </label>
        <label className="flex flex-col mb-3">
          <span className="text-sm mb-1 font-medium">Icon (emoji or class)</span>
          <input
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="border border-border rounded p-2 bg-background text-foreground"
          />
        </label>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="color"
            value={form.icon_color}
            onChange={(e) => setForm({ ...form, icon_color: e.target.value })}
            className="bg-transparent"
          />
          <div className="text-sm text-muted-foreground">Pick icon color</div>
        </label>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 border border-border rounded hover:bg-muted"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
