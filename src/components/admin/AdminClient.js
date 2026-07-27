"use client";

import { useEffect, useState } from "react";
import ModuleHeader from "@/components/ModuleHeader";

const EMPTY_FORM = { username: "", name: "", phone: "", email: "", password: "", role: "agent" };

export default function AdminClient() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error || "Không thể tạo tài khoản.");
      return;
    }
    setForm(EMPTY_FORM);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Xóa tài khoản này?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <ModuleHeader icon="⚙️" title="Tạo Tài Khoản" module={7} />

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 md:col-span-1">
          <h3 className="font-bold mb-3">+ Thêm tư vấn viên</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              placeholder="Tên đăng nhập *"
              required
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Họ tên *"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Mật khẩu (bỏ trống = số điện thoại)"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="agent">Tư vấn viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-brand text-white font-semibold rounded-lg py-2.5 disabled:opacity-60"
            >
              {creating ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 md:col-span-2">
          <h3 className="font-bold mb-3">Danh sách tài khoản ({users.length})</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="py-2">Tên đăng nhập</th>
                <th>Họ tên</th>
                <th>SĐT</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">Đang tải...</td>
                </tr>
              )}
              {!loading && users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{u.username}</td>
                  <td>{u.name}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span className={`text-xs rounded px-2 py-1 ${u.role === "admin" ? "bg-gray-800 text-white" : "bg-brand-light text-brand"}`}>
                      {u.role === "admin" ? "Quản trị viên" : "Tư vấn viên"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(u._id)} className="text-gray-400 hover:text-red-500">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
