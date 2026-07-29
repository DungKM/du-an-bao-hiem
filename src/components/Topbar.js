"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Logo from "./Logo";

export default function Topbar({ user, daysLeft }) {
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error || "Có lỗi xảy ra.");
      return;
    }
    setMsg("Đổi mật khẩu thành công!");
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setShowModal(false), 1200);
  }

  return (
    <>
      <div className="bg-[#111111] text-white flex items-center justify-between px-6 h-14 sticky top-0 z-[100] shadow-lg no-print">
        <div className="flex items-center gap-2 bg-brand-accent rounded-[10px] px-3 py-1.5">
          <Logo className="w-7 h-7" />
          <span className="text-sm font-black tracking-wide whitespace-nowrap">Trust Tool</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] text-white">{user?.name}</span>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg border-[1.5px] border-white/20 bg-transparent px-3.5 py-1.5 text-xs font-semibold hover:bg-white/10 transition"
          >
            🔑 Đổi mật khẩu
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg border-[1.5px] border-white/20 bg-transparent px-4 py-1.5 text-xs font-semibold hover:bg-white/10 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 no-print">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="font-bold text-lg mb-4">🔑 Đổi mật khẩu</h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              {msg && <p className="text-sm text-brand">{msg}</p>}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
