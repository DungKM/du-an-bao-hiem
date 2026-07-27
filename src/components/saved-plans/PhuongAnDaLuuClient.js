"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatVND } from "@/lib/finance";
import ModuleHeader from "@/components/ModuleHeader";

function formatUpdatedAt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("vi-VN", { hour12: false });
  const date = d.toLocaleDateString("vi-VN");
  return `${time} ${date}`;
}

export default function PhuongAnDaLuuClient() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/saved-plans");
    if (res.ok) {
      const data = await res.json();
      setPlans(data.savedPlans || []);
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return plans;
    const s = search.trim().toLowerCase();
    return plans.filter((p) => p.name.toLowerCase().includes(s) || (p.mainProduct?.productName || "").toLowerCase().includes(s));
  }, [plans, search]);

  async function handleDelete(id) {
    if (!window.confirm("Xóa phương án này khỏi danh sách?")) return;
    await fetch(`/api/saved-plans/${id}`, { method: "DELETE" });
    load();
  }

  function handleOpen(id) {
    router.push(`/tinh-phi-quyen-loi?savedPlanId=${id}`);
  }

  return (
    <div>
      <ModuleHeader icon="💾" title="Phương Án Đã Lưu" module={6} />

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand flex items-center justify-center text-xl shrink-0">💾</div>
            <div>
              <h1 className="font-bold text-[#312629]">Phương Án Đã Lưu</h1>
              <p className="text-xs text-gray-400">Mở lại phương án đã thiết kế trong Module tính phí để chỉnh sửa</p>
            </div>
          </div>
          <button
            type="button"
            onClick={load}
            className="border border-brand text-brand text-xs font-semibold rounded-lg px-3 py-1.5 hover:bg-brand-light"
          >
            🔄 Tải lại
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Tìm theo tên phương án, sản phẩm..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full mb-3"
        />

        {loading && <p className="text-center text-gray-400 py-8 text-sm">Đang tải...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">Chưa có phương án nào được lưu.</p>
        )}

        <div className="space-y-2">
          {filtered.map((p) => (
            <div
              key={p._id}
              className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between flex-wrap gap-3"
            >
              <div>
                <p className="font-semibold text-sm text-[#312629]">
                  {p.name} - {p.mainProduct?.productName || "?"} - STBH {formatVND(p.mainProduct?.sumInsured)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Cập nhật: {formatUpdatedAt(p.updatedAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpen(p._id)}
                  className="bg-[#0000C1] hover:bg-[#00009c] text-white text-xs font-semibold rounded-lg px-3 py-2"
                >
                  Mở lại để sửa
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p._id)}
                  title="Xóa"
                  className="w-9 h-9 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
