"use client";

import { useRef, useState } from "react";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB

export default function ProfileCard({ initialProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef(null);

  function startEdit() {
    setForm(profile);
    setAvatarError("");
    setEditing(true);
  }

  async function persist(patch) {
    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  }

  async function handleSave() {
    setSaving(true);
    const updated = await persist(form);
    setSaving(false);
    if (updated) {
      setProfile(updated);
      setEditing(false);
    }
  }

  function handleAvatarClick() {
    if (!editing) startEdit();
    // Đợi state editing cập nhật xong rồi mới mở hộp chọn ảnh (form.avatarDataUrl cần sẵn sàng).
    setTimeout(() => fileInputRef.current?.click(), 0);
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    if (file.size > MAX_FILE_BYTES) {
      setAvatarError("Ảnh quá lớn, vui lòng chọn ảnh dưới 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((p) => ({ ...p, avatarDataUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  const avatarSrc = (editing ? form.avatarDataUrl : profile.avatarDataUrl) || "";

  return (
    <div className="flex items-stretch gap-6 p-7 pb-6">
      <div className="shrink-0 self-start">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <div className="relative w-[150px] h-[150px]">
          <div
            onClick={handleAvatarClick}
            className="w-full h-full rounded-[20px] border-[3px] border-brand-accent bg-gradient-to-br from-brand-accent/[0.133] to-brand/[0.133] flex items-center justify-center text-5xl overflow-hidden cursor-pointer"
            title="Bấm để đổi ảnh đại diện"
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              "🧑‍💼"
            )}
          </div>
          <button
            type="button"
            onClick={handleAvatarClick}
            title="Đổi ảnh đại diện"
            className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-brand-accent border-2 border-white text-white text-sm flex items-center justify-center shadow-md hover:bg-brand transition"
          >
            ✎
          </button>
        </div>
        {avatarError && <p className="text-[11px] text-red-500 mt-1 max-w-[150px]">{avatarError}</p>}
      </div>

      {!editing ? (
        <div className="flex-1 min-w-0 text-left">
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-brand-accent text-sm font-medium mt-0.5">{profile.title}</p>
          <p className="text-sm text-gray-600 mt-2">
            {profile.phone && <>📞 {profile.phone} </>}
            {profile.email && <>· ✉️ {profile.email}</>}
          </p>
          {profile.bio && (
            <p className="text-sm text-gray-700 bg-brand-light border border-brand-accent/20 rounded-lg px-3 py-2 mt-3">
              🏆 {profile.bio}
            </p>
          )}
          <button
            onClick={startEdit}
            className="mt-3 flex items-center gap-1.5 text-white bg-brand-accent rounded-lg px-3.5 py-1.5 text-sm font-semibold shadow-sm hover:bg-brand transition"
          >
            ✎ Chỉnh sửa
          </button>
        </div>
      ) : (
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Họ tên"
            className="px-3 py-2 rounded-lg border-[1.5px] border-brand-accent text-[13px] outline-none"
          />
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Chức danh"
            className="px-3 py-2 rounded-lg border-[1.5px] border-brand-accent text-[13px] outline-none"
          />
          <input
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="Điện thoại"
            className="px-3 py-2 rounded-lg border-[1.5px] border-brand-accent text-[13px] outline-none"
          />
          <input
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="Email"
            className="px-3 py-2 rounded-lg border-[1.5px] border-brand-accent text-[13px] outline-none"
          />
          <textarea
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Thành tích đạt được"
            rows={3}
            className="px-3 py-2 rounded-lg border-[1.5px] border-brand-accent text-[13px] outline-none resize-y"
          />
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-[18px] py-[7px] rounded-lg bg-brand-accent text-white font-bold text-[13px] disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-[18px] py-[7px] rounded-lg bg-[#F0F2F1] text-[#111111] text-[13px]"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
