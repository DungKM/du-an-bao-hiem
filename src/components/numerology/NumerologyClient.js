"use client";

import { useState } from "react";
import {
  calcNumerology,
  calcNameNumbers,
  calcPinnacles,
  reduceNumber,
  LIFE_PATH_TEXT,
  DESTINY_TEXT,
  SOUL_URGE_TEXT,
  PERSONALITY_TEXT,
  BIRTHDAY_TEXT,
  ATTITUDE_TEXT,
  MATURITY_TEXT,
  PERSONAL_YEAR_TEXT,
  PERSONAL_MONTH_TEXT,
  LIFE_PATH_SHORT,
  DESTINY_SHORT,
  SOUL_URGE_SHORT,
  PERSONALITY_SHORT,
  PERSONAL_YEAR_SHORT,
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

function formatDobInput(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function parseDdMmYyyy(str) {
  const m = String(str).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : iso;
}

function calcAge(day, month, year) {
  const now = new Date();
  let age = now.getFullYear() - year;
  const hasHadBirthdayThisYear =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

function formatDdMmYyyy(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

function BackIcon({ className }) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
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
    const name = [ho, tenDem, ten].filter(Boolean).join(" ");
    const nameNumbers = calcNameNumbers(name);
    setResult({
      ...computed,
      ...nameNumbers,
      maturity: reduceNumber(computed.lifePath + nameNumbers.destiny),
      pinnacles: calcPinnacles(computed.lifePath, computed.year),
      age: calcAge(computed.day, computed.month, computed.year),
      reportDate: formatDdMmYyyy(new Date()),
    });
    setFullName(name);
  }

  function handleBack() {
    setResult(null);
  }

  const inputClass =
    "w-full rounded-lg border border-sand bg-sand-bg px-3 py-2.5 text-[15px] text-[#2B2722] outline-none focus:border-gold focus:ring-[3px] focus:ring-gold-light";
  const labelClass = "block text-[13px] font-semibold text-[#5C5648] mb-1.5";

  return (
    <div>
      <ModuleHeader icon="🔮" title="Quà Tặng Thần Số Học" module={1} />

      {!result && (
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
                    onChange={(e) => setNgaySinh(formatDobInput(e.target.value))}
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
      )}

      {result && (
        <div className="bg-sand-page rounded-2xl px-4 sm:px-6 py-8">
          <div className="max-w-[760px] mx-auto">
            <button
              onClick={handleBack}
              className="no-print flex items-center gap-1.5 text-sm font-semibold text-[#5C5648] bg-white border border-sand rounded-lg px-3.5 py-2 mb-5 hover:bg-sand-bg transition"
            >
              <BackIcon className="w-4 h-4" />
              Quay lại
            </button>

            <div className="print-area bg-white rounded-xl shadow-sm p-8">
              <div className="text-center mb-5">
                <SparklesIcon className="w-7 h-7 text-gold mx-auto mb-2" />
                <h2 className="text-2xl font-bold tracking-[0.5px] text-[#2B2722]">
                  BÁO CÁO THẦN SỐ HỌC
                </h2>
                <p className="text-sm italic text-[#7A7264] mt-1">
                  Dựa theo cuốn "Thần Số Học Ứng Dụng" – Joy Woodward
                </p>
              </div>
              <hr className="border-sand mb-5" />

              <div className="bg-sand-page border border-sand rounded-[14px] px-5 py-4 mb-7">
                {[
                  ["Họ và tên", fullName],
                  ["Ngày sinh", ngaySinh],
                  ["Tuổi", result.age],
                  ["Giới tính", gioiTinh],
                  ["Ngày lập báo cáo", result.reportDate],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="text-[#7A7264]">{label}</span>
                    <span className="font-bold text-[#2B2722]">{value}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-base font-bold tracking-[0.5px] text-gold uppercase mb-3 pb-2 border-b border-sand">
                Bảng tổng hợp các con số chính
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
                {[
                  ["Con số đường đời", result.lifePath, LIFE_PATH_SHORT[result.lifePath]],
                  ["Con số vận mệnh", result.destiny, DESTINY_SHORT[result.destiny]],
                  ["Con số linh hồn", result.soulUrge, SOUL_URGE_SHORT[result.soulUrge]],
                  ["Con số tính cách", result.personality, PERSONALITY_SHORT[result.personality]],
                  ["Con số ngày sinh", result.birthDayNumber, null],
                  ["Con số thái độ", result.attitude, null],
                  ["Con số trưởng thành", result.maturity, null],
                  [`Năm cá nhân (${result.currentYear})`, result.personalYear, null],
                  [`Tháng cá nhân (${result.currentMonth}/${result.currentYear})`, result.personalMonth, null],
                ].map(([label, number, sub]) => (
                  <div
                    key={label}
                    className="bg-sand-page border border-sand rounded-[14px] px-3 py-4 text-center"
                  >
                    <p className="text-3xl font-bold text-gold">{number}</p>
                    <p className="text-[11px] font-bold tracking-[0.5px] text-[#5C5648] uppercase mt-1">
                      {label}
                    </p>
                    {sub && <p className="text-[10px] text-[#9A8F7C] uppercase mt-0.5">{sub}</p>}
                  </div>
                ))}
              </div>

              <h3 className="text-base font-bold tracking-[0.5px] text-gold uppercase mb-3 pb-2 border-b border-sand">
                Năm đỉnh cao thành công
              </h3>

              <div className="overflow-x-auto mb-7">
                <table className="w-full text-sm border-collapse font-table">
                  <thead>
                    <tr className="bg-sand text-left">
                      <th className="px-4 py-2.5 font-bold text-[#2B2722] rounded-l-lg">Đỉnh</th>
                      <th className="px-4 py-2.5 font-bold text-[#2B2722]">Tuổi</th>
                      <th className="px-4 py-2.5 font-bold text-[#2B2722] rounded-r-lg">Năm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.pinnacles.map((p) => (
                      <tr key={p.label} className="border-b border-sand">
                        <td className="px-4 py-2.5 text-[#2B2722]">{p.label}</td>
                        <td className="px-4 py-2.5 text-[#2B2722]">{p.age}</td>
                        <td className="px-4 py-2.5 text-[#2B2722]">{p.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-base font-bold tracking-[0.5px] text-gold uppercase mb-3 pb-2 border-b border-sand">
                Giải nghĩa chi tiết
              </h3>

              {[
                {
                  key: "lifePath",
                  title: "Con số đường đời",
                  number: result.lifePath,
                  short: LIFE_PATH_SHORT[result.lifePath],
                  intro:
                    "Tiết lộ con đường đặc biệt mà bạn sẽ định hướng trong cuộc đời, đường đời là con số quan trọng nhất trong hồ sơ cốt lõi, khám phá tài năng thiên bẩm, tính cách, cơ hội, bài học quan trọng.",
                  text: LIFE_PATH_TEXT[result.lifePath],
                },
                {
                  key: "destiny",
                  title: "Con số vận mệnh",
                  number: result.destiny,
                  short: DESTINY_SHORT[result.destiny],
                  intro: "Tiết lộ khả năng tinh thần và thể chất, thể hiện mục tiêu, mẫu người bạn muốn trở thành.",
                  text: DESTINY_TEXT[result.destiny],
                },
                {
                  key: "soulUrge",
                  title: "Con số linh hồn",
                  number: result.soulUrge,
                  short: SOUL_URGE_SHORT[result.soulUrge],
                  intro: "Quy định các quyết định do trái tim đưa ra, nơi chứa đựng ước mơ, mong muốn, khao khát.",
                  text: SOUL_URGE_TEXT[result.soulUrge],
                },
                {
                  key: "personality",
                  title: "Con số tính cách",
                  number: result.personality,
                  short: PERSONALITY_SHORT[result.personality],
                  intro:
                    "Quyết định ấn tượng đầu tiên của bạn với người khác, cũng là chỉ dẫn nghề nghiệp, thể hiện tài năng, khả năng thiên bẩm.",
                  text: PERSONALITY_TEXT[result.personality],
                },
                {
                  key: "birthDay",
                  title: "Con số ngày sinh",
                  number: result.birthDayNumber,
                  short: null,
                  intro: "Thể hiện tài năng và bài học.",
                  text: BIRTHDAY_TEXT[result.birthDayNumber],
                },
                {
                  key: "attitude",
                  title: "Con số thái độ",
                  number: result.attitude,
                  short: null,
                  intro: "Ai cũng có 1 thái độ riêng và ảnh hưởng đến chu kỳ cá nhân (cuộc đời, sự nghiệp).",
                  text: ATTITUDE_TEXT[result.attitude],
                },
                {
                  key: "maturity",
                  title: "Con số trưởng thành",
                  number: result.maturity,
                  short: null,
                  intro: "Cảm nhận mạnh mẽ khi 40-50 tuổi. Tìm thấy con người thật, thoải mái khi là chính mình.",
                  text: MATURITY_TEXT[result.maturity],
                },
                {
                  key: "personalYear",
                  title: `Năm cá nhân ${result.currentYear}`,
                  number: result.personalYear,
                  short: PERSONAL_YEAR_SHORT[result.personalYear],
                  intro: `Liên quan đến năm hiện tại ${result.currentYear}, xem dự đoán năm nay nên lưu ý điều gì.`,
                  text: PERSONAL_YEAR_TEXT[result.personalYear],
                },
                {
                  key: "personalMonth",
                  title: `Tháng cá nhân ${result.currentMonth}/${result.currentYear}`,
                  number: result.personalMonth,
                  short: null,
                  intro: `Xem tháng hiện tại là tháng ${result.currentMonth} thì có điều gì cần lưu ý.`,
                  text: PERSONAL_MONTH_TEXT[result.personalMonth],
                },
              ].map((item) => (
                <div key={item.key} className="mb-5">
                  <h4 className="font-bold text-[15px] text-[#2B2722] tracking-[0.3px]">
                    {item.title.toUpperCase()}: {item.number}
                    {item.short ? ` – ${item.short.toUpperCase()}` : ""}
                  </h4>
                  <p className="text-gray-400 text-xs italic mt-1 mb-1.5">{item.intro}</p>
                  {item.text.split("\n\n").map((para, i) => (
                    <p key={i} className="text-gray-600 text-sm mb-2.5 last:mb-0">
                      {para}
                    </p>
                  ))}
                </div>
              ))}

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
