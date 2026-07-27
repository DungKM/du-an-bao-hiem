"use client";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { formatVND } from "@/lib/finance";
import { calcAccountValue, calcPersonRiders, getEffectiveAge, HISTORICAL_CREDITING_RATES } from "@/lib/premiumCalc";

function fmt1000(v) {
  if (v == null) return "-";
  return Math.round(v / 1000).toLocaleString("vi-VN");
}

// Ngày thiết kế dịch chuyển về sau `yearOffset` năm — dùng để suy tuổi (và do
// đó phí quyền lợi đính kèm theo tuổi) của mỗi năm trong bảng minh họa.
function shiftDate(designDate, yearOffset) {
  if (!designDate) return designDate;
  const d = new Date(designDate);
  d.setFullYear(d.getFullYear() + yearOffset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function BreakEvenChart({ guaranteedRows, illustratedRows }) {
  const width = 640;
  const height = 240;
  const padding = 36;
  const maxLen = Math.max(guaranteedRows.length, illustratedRows.length);
  const maxVal = Math.max(
    ...illustratedRows.map((r) => Math.max(r.cumulativePremium, r.accountValue)),
    ...guaranteedRows.map((r) => r.accountValue),
    1
  );

  const scaleX = (i) => padding + (i / Math.max(maxLen - 1, 1)) * (width - padding * 2);
  const scaleY = (v) => height - padding - (v / maxVal) * (height - padding * 2);

  const linePath = (rows, getVal) => rows.map((r, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(getVal(r))}`).join(" ");

  const yTicks = 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const v = (maxVal / yTicks) * i;
        const y = scaleY(v);
        return (
          <g key={i}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#EFE9EA" />
            <text x={padding - 6} y={y + 3} fontSize="9" fill="#9AA39E" textAnchor="end">
              {Math.round(v / 1_000_000)}tr
            </text>
          </g>
        );
      })}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#DED6D8" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#DED6D8" />
      <path d={linePath(illustratedRows, (r) => r.cumulativePremium)} fill="none" stroke="#1A1A1A" strokeDasharray="4 3" strokeWidth="1.5" />
      <path d={linePath(guaranteedRows, (r) => r.accountValue)} fill="none" stroke="#D31145" strokeWidth="2" />
      <path d={linePath(illustratedRows, (r) => r.accountValue)} fill="none" stroke="#e57b97" strokeWidth="2.5" />
      {illustratedRows
        .filter((_, i) => i === 0 || (i + 1) % 5 === 0 || i === illustratedRows.length - 1)
        .map((r) => (
          <text key={r.year} x={scaleX(r.year - 1)} y={height - padding + 14} fontSize="9" fill="#9AA39E" textAnchor="middle">
            N{r.year} ({r.age}t)
          </text>
        ))}
    </svg>
  );
}

function ToggleButton({ icon, label, open, onClick, marginTop }) {
  return (
    <div style={{ marginTop }}>
      <button
        type="button"
        onClick={onClick}
        className="no-print"
        style={{
          background: "#fff",
          color: "#D31145",
          border: "1.5px solid #D31145",
          borderRadius: 8,
          padding: "8px 18px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>{icon}</span>
        {open ? `Ẩn ${label}` : `Xem ${label}`}
      </button>
    </div>
  );
}

const GTTK_COLUMNS = [
  { head: ["Năm/", "Tuổi"], width: 52, align: "center" },
  { head: ["Phí BH", "(1)"], width: 46 },
  { head: ["Phí ĐT", "(2)"], width: 46 },
  { head: ["QL TV/", "TTTBVV", "(3)"], width: 60 },
  { head: ["Phí RR", "(4)"], width: 44 },
  { head: ["Phí QL", "(5)"], width: 44 },
  { head: ["QL", "Thưởng", "(6)"], width: 44 },
  { head: ["Rút", "GTTK", "(7)"], width: 40 },
  { head: ["GTTK", "CB", "(8)"], width: 54 },
  { head: ["GTTK", "ĐT", "(9)"], width: 54 },
  { head: ["GTTK", "HĐ", "(10)"], width: 54 },
  { head: ["GT", "Hoàn", "Lại(11)"], width: 52 },
];

const detailTh = {
  background: "#D31145",
  color: "#fff",
  fontWeight: 700,
  border: "1px solid rgba(255,255,255,0.25)",
};

const thBase = {
  position: "sticky",
  top: 0,
  background: "#D31145",
  color: "#fff",
  textAlign: "center",
  padding: 4,
  fontWeight: 700,
  whiteSpace: "normal",
  fontSize: 9.5,
  lineHeight: 1.25,
  borderRight: "1px solid rgba(255,255,255,0.18)",
  borderBottom: "2px solid #B00E3A",
  wordBreak: "break-word",
};

const tdBase = {
  textAlign: "right",
  padding: "3px 6px",
  borderBottom: "1px solid #F0F0EE",
  borderRight: "1px solid #EEEEEE",
  whiteSpace: "nowrap",
  color: "#312629",
  fontSize: 10,
};

function GttkTable({ rows }) {
  return (
    <div style={{ overflow: "auto", maxHeight: 520, borderRadius: 8, border: "1px solid #DED6D8", position: "relative" }}>
      <div style={{ fontSize: 11, color: "#9AA39E", fontStyle: "italic", textAlign: "right", padding: "4px 6px 2px" }}>
        Đơn vị tính: 1.000 VNĐ
      </div>
      <table className="zebra-table" style={{ width: "100%", minWidth: 620, borderCollapse: "separate", borderSpacing: 0, fontSize: 10, tableLayout: "auto" }}>
        <thead>
          <tr>
            {GTTK_COLUMNS.map((c, i) => (
              <th
                key={i}
                style={{
                  ...thBase,
                  width: c.width,
                  zIndex: i === 0 ? 4 : 2,
                  ...(i === 0 ? { left: 0, boxShadow: "2px 0 3px rgba(0,0,0,0.1)" } : {}),
                }}
              >
                {c.head.map((line, li) => (
                  <span key={li}>
                    {li > 0 && <br />}
                    {line}
                  </span>
                ))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.year}>
              <td
                style={{
                  ...tdBase,
                  textAlign: "center",
                  fontWeight: 700,
                  position: "sticky",
                  left: 0,
                  zIndex: 1,
                  boxShadow: "2px 0 4px rgba(0,0,0,0.08)",
                  background: "#fff",
                }}
              >
                {r.year}/{r.age}
              </td>
              {r.lapsed ? (
                <td colSpan={11} style={{ ...tdBase, textAlign: "center", fontStyle: "italic", color: "#9AA39E" }}>
                  Mất hiệu lực
                </td>
              ) : (
                <>
                  <td style={tdBase}>{r.premium ? fmt1000(r.premium) : <span style={{ color: "#D4C8CB" }}>-</span>}</td>
                  <td style={tdBase}>{r.allocated ? fmt1000(r.allocated) : <span style={{ color: "#D4C8CB" }}>-</span>}</td>
                  <td style={{ ...tdBase, fontWeight: 700 }}>{fmt1000(r.sumInsured)}</td>
                  <td style={tdBase}>{fmt1000(r.coi)}</td>
                  <td style={tdBase}>{fmt1000(r.adminFee)}</td>
                  <td style={tdBase}>{r.bonus ? fmt1000(r.bonus) : <span style={{ color: "#D4C8CB" }}>-</span>}</td>
                  <td style={tdBase}><span style={{ color: "#D4C8CB" }}>-</span></td>
                  <td style={{ ...tdBase, fontWeight: 400 }}>{fmt1000(r.accountValue)}</td>
                  <td style={tdBase}><span style={{ color: "#D4C8CB" }}>-</span></td>
                  <td style={{ ...tdBase, fontWeight: 700 }}>{fmt1000(r.accountValue)}</td>
                  <td style={{ ...tdBase, fontWeight: 700 }}>
                    {r.surrenderValue != null ? fmt1000(r.surrenderValue) : <span style={{ color: "#D4C8CB" }}>-</span>}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const RATE_SCHEDULE = [
  ["Năm 1", "3.5%"],
  ["Năm 2", "3.0%"],
  ["Năm 3", "3.0%"],
  ["Năm 4-5", "2.0%"],
  ["Năm 6-10", "1.5%"],
  ["Năm 11-15", "1.0%"],
  ["Năm 16+", "0.5%"],
];

const AccountValueSection = forwardRef(function AccountValueSection({ mainProduct, people, familyTotal, designDate }, ref) {
  const [expanded, setExpanded] = useState(true);
  const [illustratedRate, setIllustratedRate] = useState(4.6);
  const [illustratedRateAfterTerm, setIllustratedRateAfterTerm] = useState("");
  const [open, setOpen] = useState({ chart: false, simple: false, detail: false });
  const [gttkHiddenForPrint, setGttkHiddenForPrint] = useState(false);

  useImperativeHandle(ref, () => ({
    prepareForPrint(sections) {
      setExpanded(true);
      setOpen({ chart: !!sections.chart, simple: !!sections.simple, detail: !!sections.detail });
      setGttkHiddenForPrint(!sections.gttk);
    },
  }));

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const mainPerson = people[0];
  const attachedPeople = people.slice(1);
  const mainAge = getEffectiveAge(mainPerson, designDate);

  const result = useMemo(
    () =>
      calcAccountValue({
        sumInsured: mainProduct.sumInsured,
        annualPremium: mainProduct.annualPremium,
        age: mainAge,
        gender: mainPerson.gender,
        paymentTerm: mainProduct.paymentTerm,
        illustratedRate,
        illustratedRateAfterTerm,
      }),
    [mainProduct, mainAge, mainPerson.gender, illustratedRate, illustratedRateAfterTerm]
  );

  const term = Number(mainProduct.paymentTerm) || 20;
  const rowsWithSI = (proj) => proj.rows.map((r) => ({ ...r, sumInsured: r.lapsed ? 0 : mainProduct.sumInsured }));
  const guaranteedRows = rowsWithSI(result.guaranteed);
  const illustratedRows = rowsWithSI(result.illustrated);
  const simpleRows = illustratedRows.filter((r) => r.year <= term);

  return (
    <div style={{ marginTop: 16, border: "1px solid #D31145", borderRadius: 12, overflow: "visible" }}>
      <div
        onClick={() => setExpanded((v) => !v)}
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "#D31145",
          cursor: "pointer",
          flexWrap: "wrap",
          gap: 8,
          borderRadius: expanded ? "12px 12px 0 0" : 12,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>📊 Bảng Giá Trị Tài Khoản Hợp Đồng</span>
        <span style={{ fontSize: 12, color: "#fff" }}>
          {mainProduct.productName} · {term} năm · đến 99 tuổi {expanded ? "▲" : "▼"}
        </span>
      </div>

      {expanded && (
        <div style={{ padding: "14px 16px", borderRadius: "0 0 12px 12px" }}>
          <ToggleButton icon="📈" label="biểu đồ năm hòa vốn" open={open.chart} onClick={() => toggle("chart")} marginTop={16} />
          {open.chart && (
            <div className="mt-2">
              <BreakEvenChart guaranteedRows={guaranteedRows} illustratedRows={illustratedRows} />
              <div className="flex gap-4 text-[11px] text-gray-500 justify-center mt-1 flex-wrap">
                <span><span className="inline-block w-3 h-0.5 bg-[#1A1A1A] align-middle mr-1" />Phí đã đóng</span>
                <span><span className="inline-block w-3 h-0.5 bg-brand align-middle mr-1" />GTHL Cam kết</span>
                <span><span className="inline-block w-3 h-0.5" style={{ background: "#e57b97" }} /> GTHL Minh họa {illustratedRate}%</span>
              </div>
            </div>
          )}

          <ToggleButton
            icon="💰"
            label={`bảng phí đóng chi tiết trong ${term} năm`}
            open={open.simple}
            onClick={() => toggle("simple")}
            marginTop={12}
          />
          {open.simple && (
            <div className="mt-2">
              <p className="text-[13px] font-bold text-[#312629] mb-1.5">
                Bảng phí đóng chi tiết trong {term} năm — {mainProduct.productName}
              </p>
              <p className="text-[11px] text-gray-400 mb-1.5">Đơn vị: 1.000 VNĐ</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] zebra-table">
                  <thead>
                    <tr className="text-white text-center" style={{ background: "#D31145" }}>
                      <th className="py-1.5 px-2">Năm</th>
                      <th className="px-2">Tuổi</th>
                      <th className="px-2">
                        <div>Phí SPC</div>
                        <div className="text-[10px] font-normal opacity-80">{mainProduct.productName}</div>
                      </th>
                      {attachedPeople.map((p, i) => (
                        <th key={i} className="px-2">
                          <div>{p.name || `NĐBH Đính Kèm ${i + 1}`}</div>
                          <div className="text-[10px] font-normal opacity-80">Tổng phí</div>
                        </th>
                      ))}
                      <th className="px-2">Tổng phí</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simpleRows.map((r) => {
                      const attachedFees = attachedPeople.map(
                        (p) => calcPersonRiders(p, familyTotal.withoutWaiver, shiftDate(designDate, r.year - 1)).total
                      );
                      const grandTotal = r.premium + attachedFees.reduce((s, f) => s + f, 0);
                      return (
                        <tr key={r.year} className="border-b border-gray-100 text-right">
                          <td className="py-1 px-2 text-left">{r.year}</td>
                          <td className="px-2 text-left">{r.age}</td>
                          <td className="px-2">{fmt1000(r.premium)}</td>
                          {attachedFees.map((f, i) => (
                            <td key={i} className="px-2">{f > 0 ? fmt1000(f) : "-"}</td>
                          ))}
                          <td className="px-2 font-semibold">{fmt1000(grandTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <ToggleButton
            icon="📋"
            label="chi tiết các loại phí (Minh họa phân bổ phí)"
            open={open.detail}
            onClick={() => toggle("detail")}
            marginTop={12}
          />
          {open.detail && (
            <div className="mt-2">
              <p className="text-[13px] font-bold text-[#312629] mb-1">Minh họa phân bổ phí — {mainProduct.productName}</p>
              <p className="text-[11px] text-gray-400 mb-1.5">Đơn vị: 1.000 VNĐ</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] zebra-table" style={{ borderCollapse: "collapse", border: "1px solid #DED6D8" }}>
                  <thead>
                    <tr className="text-white text-center">
                      <th rowSpan={2} style={detailTh} className="px-2 py-1.5">Năm</th>
                      <th rowSpan={2} style={detailTh} className="px-2 py-1.5">Tuổi</th>
                      <th colSpan={4} style={detailTh} className="px-2 py-1">Phí BH hàng năm</th>
                      <th colSpan={2} style={detailTh} className="px-2 py-1">Phí ban đầu</th>
                      <th colSpan={2} style={detailTh} className="px-2 py-1">Phí đầu tư</th>
                      <th rowSpan={2} style={detailTh} className="px-2 py-1.5">QL HĐ</th>
                      <th colSpan={2} style={detailTh} className="px-2 py-1">Phí RR</th>
                    </tr>
                    <tr className="text-white text-center">
                      <th style={detailTh} className="px-2 py-1 font-medium text-[10px]">CB</th>
                      <th style={detailTh} className="px-2 py-1 font-medium text-[10px]">SP ĐK</th>
                      <th style={detailTh} className="px-2 py-1 font-medium text-[10px]">Tổng</th>
                      <th style={detailTh} className="px-2 py-1 font-medium text-[10px]">Cộng dồn</th>
                      <th style={detailTh} className="px-2 py-1 font-medium text-[10px]">CB</th>
                      <th style={detailTh} className="px-2 py-1 font-medium text-[10px]">Tổng</th>
                      <th style={detailTh} className="px-2 py-1 font-medium text-[10px]">CB</th>
                      <th style={detailTh} className="px-2 py-1 font-medium text-[10px]">Tổng</th>
                      <th style={detailTh} className="px-2 py-1 font-medium text-[10px]">CK</th>
                      <th style={detailTh} className="px-2 py-1 font-medium text-[10px]">MH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let cumulative = 0;
                      return simpleRows.map((r, idx) => {
                        const guaranteedRow = guaranteedRows[idx];
                        const attachedTotal = attachedPeople.reduce(
                          (s, p) => s + calcPersonRiders(p, familyTotal.withoutWaiver, shiftDate(designDate, r.year - 1)).total,
                          0
                        );
                        const yearTotal = r.premium + attachedTotal;
                        cumulative += yearTotal;
                        const initialFee = r.premium ? r.premium - r.allocated : 0;
                        const cell = { padding: "3px 8px", border: "1px solid #EEE8E9" };
                        return (
                          <tr key={r.year} className="text-right">
                            <td style={{ ...cell, textAlign: "center", fontWeight: 600 }}>{r.year}</td>
                            <td style={{ ...cell, textAlign: "center" }}>{r.age}</td>
                            <td style={cell}>{fmt1000(r.premium)}</td>
                            <td style={cell}>{attachedTotal > 0 ? fmt1000(attachedTotal) : "-"}</td>
                            <td style={cell}>{fmt1000(yearTotal)}</td>
                            <td style={{ ...cell, fontWeight: 600 }}>{fmt1000(cumulative)}</td>
                            <td style={cell}>{initialFee > 0 ? fmt1000(initialFee) : "-"}</td>
                            <td style={cell}>{initialFee > 0 ? fmt1000(initialFee) : "-"}</td>
                            <td style={cell}>{fmt1000(r.allocated)}</td>
                            <td style={cell}>{fmt1000(r.allocated)}</td>
                            <td style={cell}>{fmt1000(r.adminFee)}</td>
                            <td style={cell}>{guaranteedRow ? fmt1000(guaranteedRow.coi) : "-"}</td>
                            <td style={cell}>{fmt1000(r.coi)}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 16, marginBottom: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Lãi suất cam kết theo năm HĐ</div>
          </div>
          <div style={{ fontSize: 11, color: "#6B7876", background: "#FAF4F6", borderRadius: 8, padding: "8px 12px", marginBottom: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {RATE_SCHEDULE.map(([label, rate]) => (
              <span key={label} style={{ background: "#fff", border: "1px solid #E8D1D7", borderRadius: 5, padding: "2px 7px" }}>
                <strong>{label}:</strong> {rate}
              </span>
            ))}
          </div>

          <div className={gttkHiddenForPrint ? "print:hidden" : ""}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#312629", margin: "14px 0 6px", paddingLeft: 6, borderLeft: "3px solid #D31145" }}>
            Bảng GTTK Lãi Suất Cam Kết (theo năm HĐ: 3.5% → 0.5%)
          </div>
          <GttkTable rows={guaranteedRows} />

          <div className="no-print space-y-2 mb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap py-1">
              <div>
                <p className="text-sm font-semibold text-[#312629]">Lãi suất minh họa</p>
                <p className="text-[11px] text-gray-400">Mặc định 4.6%/năm, có thể chỉnh</p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={illustratedRate}
                  onChange={(e) => setIllustratedRate(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right"
                />
                <span className="text-sm text-gray-500">%/năm</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap py-1">
              <div>
                <p className="text-sm font-semibold text-[#312629]">Lãi suất minh họa từ năm {term + 1}+</p>
                <p className="text-[11px] text-gray-400">Để trống = lãi cam kết 0,5%/năm (mặc định)</p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={illustratedRateAfterTerm}
                  onChange={(e) => setIllustratedRateAfterTerm(e.target.value)}
                  placeholder="0.5 (mặc định)"
                  className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right"
                />
                <span className="text-sm text-gray-500">%/năm</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: "#312629", margin: "14px 0 6px", paddingLeft: 6, borderLeft: "3px solid #D31145" }}>
            Bảng GTTK Lãi Suất Minh Họa ({term} năm đầu {Number(illustratedRate).toFixed(2)}%/năm, từ năm {term + 1}+ theo lãi cam kết{" "}
            {illustratedRateAfterTerm !== "" ? Number(illustratedRateAfterTerm).toFixed(1).replace(".", ",") : "0,5"}%)
          </div>
          <GttkTable rows={illustratedRows} />

          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-600 mb-1">Lãi suất tích lũy được công bố trong 5 năm gần nhất:</p>
            <table
              className="w-full text-xs text-center rounded-lg overflow-hidden"
              style={{ border: "1px solid #DED6D8", borderCollapse: "collapse" }}
            >
              <thead>
                <tr style={{ background: "#D31145" }}>
                  {HISTORICAL_CREDITING_RATES.map((h, i) => (
                    <th
                      key={h.year}
                      className="py-1.5 font-semibold text-white"
                      style={{ borderRight: i < HISTORICAL_CREDITING_RATES.length - 1 ? "1px solid rgba(255,255,255,0.25)" : "none" }}
                    >
                      Năm {h.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {HISTORICAL_CREDITING_RATES.map((h, i) => (
                    <td
                      key={h.year}
                      className="py-1.5 text-[#312629]"
                      style={{
                        borderTop: "1px solid #DED6D8",
                        borderRight: i < HISTORICAL_CREDITING_RATES.length - 1 ? "1px solid #DED6D8" : "none",
                      }}
                    >
                      {h.rate.toString().replace(".", ",")}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <p className="text-[11px] text-gray-400 italic mt-1.5">
              <b className="not-italic font-semibold text-gray-500">Ghi chú:</b> Kết quả hoạt động của Quỹ liên kết chung trong quá khứ chỉ cho mục đích tham khảo và không phải
              là cơ sở để đảm bảo chắc chắn về kết quả hoạt động trong tương lai.
            </p>
          </div>
          </div>

          <p className="text-[11px] text-gray-400 pt-3">
            ⚠️ Bảng minh họa dùng công thức ước lượng (phân bổ phí, phí quản lý, lãi suất cam kết/minh họa theo năm hợp
            đồng, tỷ lệ phí rủi ro theo tuổi) được khớp gần đúng theo một ví dụ minh họa — không phải bảng tính chính
            thức của công ty bảo hiểm.
          </p>
        </div>
      )}
    </div>
  );
});

export default AccountValueSection;
