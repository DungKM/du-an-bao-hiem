"use client";

import { useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS = ["Chưa liên hệ", "Đã liên hệ", "Đã gửi tóm tắt QL", "Đã chốt HĐ", "Từ chối"];
const TARGET_KEY = "trust-tool-sales-target";

function fmtTr(v) {
  return `${(Number(v) || 0).toLocaleString("vi-VN")} tr`;
}

export default function CustomerListClient() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [target, setTarget] = useState(1000);
  const [editingTarget, setEditingTarget] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", expectedFee: "", nextAction: "", status: "Chưa liên hệ" });

  useEffect(() => {
    const stored = window.localStorage.getItem(TARGET_KEY);
    if (stored) setTarget(Number(stored));
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/customers");
    if (res.ok) {
      const data = await res.json();
      setCustomers(data.customers || []);
    }
    setLoading(false);
  }

  function saveTarget(v) {
    setTarget(v);
    window.localStorage.setItem(TARGET_KEY, String(v));
  }

  const filtered = useMemo(() => {
    let list = customers;
    if (filter === "sent") list = list.filter((c) => c.status === "Đã gửi tóm tắt QL");
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s));
    }
    return list;
  }, [customers, filter, search]);

  const totalFee = customers.reduce((s, c) => s + (Number(c.expectedFee) || 0), 0);
  const closedCustomers = customers.filter((c) => c.status === "Đã chốt HĐ");
  const paidFee = closedCustomers.reduce((s, c) => s + (Number(c.expectedFee) || 0), 0);
  const remaining = Math.max(target - paidFee, 0);
  const progressPct = target > 0 ? Math.min((paidFee / target) * 100, 100) : 0;

  function openCreate() {
    setEditing(null);
    setForm({ name: "", location: "", expectedFee: "", nextAction: "", status: "Chưa liên hệ" });
    setShowModal(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({
      name: c.name,
      location: c.location || "",
      expectedFee: c.expectedFee || "",
      nextAction: c.nextAction || "",
      status: c.status || "Chưa liên hệ",
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, expectedFee: Number(form.expectedFee) || 0 };
    if (editing) {
      await fetch(`/api/customers/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setShowModal(false);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Xóa khách hàng này khỏi danh sách?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    load();
  }

  function exportCSV() {
    const header = ["STT", "Tên KH", "Nơi ở", "Trạng thái", "Phí dự kiến (tr)", "Hoạt động tiếp theo", "Cập nhật"];
    const rows = filtered.map((c, i) => [
      i + 1,
      c.name,
      c.location || "",
      c.status,
      c.expectedFee || 0,
      c.nextAction || "",
      new Date(c.updatedAt).toLocaleDateString("vi-VN"),
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "khach-hang-da-luu.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="bg-brand flex items-center gap-3 px-[18px] py-3.5 rounded-2xl border-b-[3px] border-brand-accent mb-5">
        <div className="h-[34px] w-[34px] rounded-[10px] bg-brand-accent/20 flex items-center justify-center text-lg shrink-0">
          👥
        </div>
        <h1 className="flex-1 text-[15px] font-extrabold text-white">Danh Sách Khách Hàng Đã Lưu</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-white/20 text-sm rounded-lg px-3 py-1.5">
            ⭳ Xuất CSV
          </button>
          <button onClick={openCreate} className="bg-white text-brand text-sm font-semibold rounded-lg px-3 py-1.5">
            + Thêm KH
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400">Tổng KH trong DS</p>
          <p className="text-2xl font-bold">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400">Tổng phí dự kiến</p>
          <p className="text-2xl font-bold">{fmtTr(totalFee)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400">Đã đóng phí ({closedCustomers.length} hợp đồng)</p>
          <p className="text-2xl font-bold">{fmtTr(paidFee)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400">Còn thiếu mục tiêu</p>
          <p className="text-2xl font-bold text-brand">{fmtTr(remaining)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold">Tiến độ đạt mục tiêu</span>
          {editingTarget ? (
            <input
              type="number"
              autoFocus
              defaultValue={target}
              onBlur={(e) => {
                saveTarget(Number(e.target.value) || 0);
                setEditingTarget(false);
              }}
              className="border rounded px-2 w-28 text-right"
            />
          ) : (
            <span>
              Mục tiêu: <b className="underline cursor-pointer" onClick={() => setEditingTarget(true)}>{fmtTr(target)} ✎</b>
            </span>
          )}
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-brand font-semibold">{progressPct.toFixed(0)}% hoàn thành</span>
          <span>
            {fmtTr(paidFee)} / {fmtTr(target)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Tìm khách hàng..."
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <button
            onClick={() => setFilter("all")}
            className={`text-sm rounded-lg px-3 py-2 ${filter === "all" ? "bg-brand text-white" : "border"}`}
          >
            Tất cả ({customers.length})
          </button>
          <button
            onClick={() => setFilter("sent")}
            className={`text-sm rounded-lg px-3 py-2 ${filter === "sent" ? "bg-brand text-white" : "border"}`}
          >
            Đã gửi tóm tắt QL ({customers.filter((c) => c.status === "Đã gửi tóm tắt QL").length})
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="py-2">STT</th>
              <th>Tên KH</th>
              <th>Nơi ở</th>
              <th>Trạng thái</th>
              <th>Phí dự kiến</th>
              <th>Hoạt động tiếp theo</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
                  Chưa có khách hàng nào.
                </td>
              </tr>
            )}
            {filtered.map((c, i) => (
              <tr key={c._id} className="border-b border-gray-100">
                <td className="py-2">{i + 1}</td>
                <td className="font-medium">{c.name}</td>
                <td>{c.location || "—"}</td>
                <td>
                  <span className="text-xs bg-brand-light text-brand rounded px-2 py-1">{c.status}</span>
                </td>
                <td>{c.expectedFee ? fmtTr(c.expectedFee) : "—"}</td>
                <td>{c.nextAction || "—"}</td>
                <td>{new Date(c.updatedAt).toLocaleDateString("vi-VN")}</td>
                <td>
                  <button onClick={() => openEdit(c)} className="text-brand mr-2">✎</button>
                  <button onClick={() => handleDelete(c._id)} className="text-gray-400">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="font-bold text-lg mb-4">{editing ? "✎ Sửa khách hàng" : "+ Thêm khách hàng mới"}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <label className="col-span-2 text-xs font-semibold text-gray-700">
                Tên KH *
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                />
              </label>
              <label className="text-xs font-semibold text-gray-700">
                Nơi ở
                <input
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                />
              </label>
              <label className="text-xs font-semibold text-gray-700">
                Phí dự kiến (tr)
                <input
                  type="number"
                  value={form.expectedFee}
                  onChange={(e) => setForm((p) => ({ ...p, expectedFee: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                />
              </label>
              <label className="text-xs font-semibold text-gray-700">
                Hoạt động tiếp theo
                <input
                  value={form.nextAction}
                  onChange={(e) => setForm((p) => ({ ...p, nextAction: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                />
              </label>
              <label className="text-xs font-semibold text-gray-700">
                Trạng thái
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border text-sm">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold">
                  {editing ? "Lưu thay đổi" : "Thêm vào danh sách"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
