"use client";

import { useState } from "react";
import {
  calcNumerology,
  LIFE_PATH_TEXT,
  PERSONAL_YEAR_TEXT,
  PERSONAL_MONTH_TEXT,
} from "@/lib/numerology";
import ModuleHeader from "@/components/ModuleHeader";

function SparklesIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function parseDdMmYyyy(str) {
  const m = String(str).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : iso;
}

export default function NumerologyClient({ agent }) {
  const [ho, setHo] = useState("");
  const [tenDem, setTenDem] = useState("");
  const [ten, setTen] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [gioiTinh, setGioiTinh] = useState("Nam");
  const [ngheNghiep, setNgheNghiep] = useState("");

  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [fullName, setFullName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!ho.trim() || !ten.trim()) {
      setError("Vui lòng nhập đủ Họ và Tên.");
      return;
    }
    const iso = parseDdMmYyyy(ngaySinh);
    if (!iso) {
      setError("Ngày sinh không hợp lệ, vui lòng nhập theo định dạng dd/mm/yyyy.");
      return;
    }

    const computed = calcNumerology(iso);
    setResult(computed);
    setFullName([ho, tenDem, ten].filter(Boolean).join(" "));
  }

  const inputClass =
    "w-full rounded-lg border border-sand bg-sand-bg px-3 py-2.5 text-[15px] text-[#2B2722] outline-none focus:border-gold focus:ring-[3px] focus:ring-gold-light";
  const labelClass = "block text-[13px] font-semibold text-[#5C5648] mb-1.5";

  return (
    <div>
      <ModuleHeader icon="🔮" title="Quà Tặng Thần Số Học" module={1} />

      <div className="no-print bg-sand-page rounded-2xl px-4 sm:px-6 py-8">
        <div className="max-w-[760px] mx-auto">
          <header className="flex items-center gap-4 mb-7">
            <div className="w-[52px] h-[52px] rounded-full bg-gold-light flex items-center justify-center shrink-0">
              <SparklesIcon className="w-7 h-7 text-gold" />
            </div>
            <div>
              <h1 className="text-[26px] font-bold tracking-[0.5px] text-[#2B2722] m-0">
                Quà Tặng Cho Khách Hàng
              </h1>
              <p className="mt-1 text-sm text-[#7A7264]">
                Module 1 · Thông tin khách hàng &amp; Báo cáo Thần Số Học
              </p>
            </div>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="bg-sand-bg border border-sand rounded-[14px] p-6 mb-5">
              <p className="flex items-center text-base font-bold text-gold tracking-[0.5px] mb-[18px]">
                <UserIcon className="w-[18px] h-[18px] mr-2.5" />
                Thông tin khách hàng
              </p>

              <div className="flex gap-4 flex-wrap">
                <div className="mb-4 flex-1 min-w-[160px]">
                  <label className={labelClass}>Họ (không dấu)</label>
                  <input placeholder="VD: TRAN" value={ho} onChange={(e) => setHo(e.target.value)} className={inputClass} />
                </div>
                <div className="mb-4 flex-1 min-w-[160px]">
                  <label className={labelClass}>Tên đệm (không dấu)</label>
                  <input placeholder="VD: VAN" value={tenDem} onChange={(e) => setTenDem(e.target.value)} className={inputClass} />
                </div>
                <div className="mb-4 flex-1 min-w-[160px]">
                  <label className={labelClass}>Tên (không dấu)</label>
                  <input placeholder="VD: HUY" value={ten} onChange={(e) => setTen(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                <div className="mb-4 flex-1 min-w-[160px]">
                  <label className={labelClass}>Ngày tháng năm sinh (theo CCCD)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="dd/mm/yyyy"
                    value={ngaySinh}
                    onChange={(e) => setNgaySinh(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                <div className="mb-4 flex-1 min-w-[160px]">
                  <label className={labelClass}>Giới tính</label>
                  <select value={gioiTinh} onChange={(e) => setGioiTinh(e.target.value)} className={inputClass}>
                    <option>Nam</option>
                    <option>Nữ</option>
                  </select>
                </div>
                <div className="mb-4 flex-1 min-w-[160px]">
                  <label className={labelClass}>Nghề nghiệp</label>
                  <input
                    placeholder="Gõ để tìm nghề nghiệp..."
                    value={ngheNghiep}
                    onChange={(e) => setNgheNghiep(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            <button
              type="submit"
              className="w-full flex items-center justify-center py-3.5 text-base font-bold tracking-[0.5px] bg-gold hover:bg-gold-dark text-white rounded-[10px] mb-10 transition"
            >
              <SparklesIcon className="w-[18px] h-[18px] mr-2" />
              Tạo báo cáo Thần Số Học
            </button>
          </form>
        </div>
      </div>

      {result && (
        <div className="bg-sand-page rounded-2xl px-4 sm:px-6 py-8">
          <div className="max-w-[760px] mx-auto">
            <div className="print-area bg-white rounded-xl shadow-sm p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4 no-print">
                <h2 className="font-bold text-lg">Quà Tặng Thần Số Học</h2>
              </div>
              <p className="text-brand font-semibold mb-1">Khách hàng: {fullName}</p>
              <p className="text-xs text-gray-400 mb-4">
                {gioiTinh}
                {ngheNghiep && <> · {ngheNghiep}</>} · Sinh {ngaySinh}
              </p>

              <h3 className="font-bold">CON SỐ CHỦ ĐẠO: {result.lifePath}</h3>
              <p className="text-gray-600 text-sm mt-1 mb-4">{LIFE_PATH_TEXT[result.lifePath]}</p>

              <h3 className="font-bold">CON SỐ TRƯỞNG THÀNH: {result.maturity}</h3>
              <p className="text-gray-600 text-sm mt-1 mb-4">{LIFE_PATH_TEXT[result.maturity]}</p>

              <h3 className="font-bold">
                NĂM CÁ NHÂN {result.currentYear}: {result.personalYear}
              </h3>
              <p className="text-gray-400 text-xs italic mb-1">
                Liên quan đến năm hiện tại {result.currentYear}, xem dự đoán năm nay nên lưu ý điều gì.
              </p>
              <p className="text-gray-600 text-sm mt-1 mb-4">{PERSONAL_YEAR_TEXT[result.personalYear]}</p>

              <h3 className="font-bold">
                THÁNG CÁ NHÂN {result.currentMonth}/{result.currentYear}: {result.personalMonth}
              </h3>
              <p className="text-gray-600 text-sm mt-1 mb-6">{PERSONAL_MONTH_TEXT[result.personalMonth]}</p>

              <div className="bg-brand-light rounded-lg p-4 flex gap-3 items-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl">🧑‍💼</div>
                <div className="text-xs">
                  <p className="font-bold">{agent?.name}</p>
                  <p className="text-brand font-medium">Tư vấn viên tài chính</p>
                  {agent?.phone && (
                    <p>
                      📞 {agent.phone} {agent?.email && <>· ✉️ {agent.email}</>}
                    </p>
                  )}
                  {agent?.bio && <p className="text-gray-500">{agent.bio}</p>}
                </div>
              </div>

              <p className="text-center text-[11px] text-gray-400 mt-6">
                Bảng báo cáo chỉ có tính chất tham khảo và vận dụng, hãy luôn sống tốt và tử tế, bạn sẽ luôn cảm thấy
                hạnh phúc. Hãy luôn tâm niệm: "Đức năng thắng số".
              </p>

              <button
                onClick={() => window.print()}
                className="no-print mt-6 bg-brand text-white rounded-lg px-5 py-2.5 font-semibold"
              >
                🖨️ In / Lưu PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
