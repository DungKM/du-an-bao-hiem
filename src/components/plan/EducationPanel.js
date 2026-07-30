"use client";

import { useState } from "react";
import { formatVND } from "@/lib/finance";
import { NumField, ResultLine } from "./fields";
import { calcEducationChild } from "@/lib/planCalculations";

export function defaultEducationChild() {
  return {
    currentAge: 8,
    startAge: 18,
    studyYears: 5,
    annualCostNow: 50_000_000,
    eduInflation: 6,
    investReturn: 5,
    currentSavings: 0,
    monthlySaving: 0,
  };
}

const MAX_CHILDREN = 6;

function ChildCard({ index, child, onChange }) {
  const [showDetail, setShowDetail] = useState(false);
  const result = calcEducationChild(child);

  function set(patch) {
    onChange({ ...child, ...patch });
  }

  return (
    <div className="border border-[#DED6D8] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-[#FDE8E9] px-4 py-2.5">
        <span className="font-bold text-[#312629]">Con {index + 1}</span>
        <span className="text-brand font-semibold text-sm">
          Cần thêm {formatVND(result.requiredMonthly)}/tháng
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NumField label="Tuổi con hiện tại" value={child.currentAge} onChange={(v) => set({ currentAge: v })} suffix="tuổi" />
        <NumField label="Tuổi bắt đầu đại học" value={child.startAge} onChange={(v) => set({ startAge: v })} suffix="tuổi" />
        <NumField label="Số năm học đại học" value={child.studyYears} onChange={(v) => set({ studyYears: v })} suffix="năm" hint="Tối đa 8 năm" />
        <NumField label="Học phí theo năm hiện nay" value={child.annualCostNow} onChange={(v) => set({ annualCostNow: v })} suffix="đ" />
        <NumField label="Lạm phát giáo dục" value={child.eduInflation} onChange={(v) => set({ eduInflation: v })} suffix="%" hint="Thường 6-8%/năm" />
        <NumField label="Lãi suất hàng năm" value={child.investReturn} onChange={(v) => set({ investReturn: v })} suffix="%" hint="Tiền gửi, chứng khoán..." />
        <NumField label="Tổng tiết kiệm hiện có cho giáo dục" value={child.currentSavings} onChange={(v) => set({ currentSavings: v })} suffix="đ" />
        <NumField label="Tiết kiệm hàng tháng (dự định)" value={child.monthlySaving} onChange={(v) => set({ monthlySaving: v })} suffix="đ" />

        <div className="col-span-1 sm:col-span-2 bg-[#FDE8E9] rounded-xl px-[18px] py-4">
          <div className="text-sm font-bold text-brand mb-2.5">Kết quả tính toán</div>
          <ResultLine label="Thời gian tiết kiệm" value={result.yearsUntilStart + " năm"} />
          <ResultLine label="Tổng mục tiêu giáo dục" value={formatVND(result.targetTotal)} />
          <ResultLine label="Tiết kiệm hàng tháng có được khi vào ĐH" value={formatVND(result.savingsFromMonthly)} />
          <ResultLine label="Tiết kiệm đã có khi vào ĐH" value={formatVND(result.savingsFromCurrent)} />
          <ResultLine label="Tổng tiết kiệm có được" value={formatVND(result.totalSavings)} />
          <ResultLine label="Khoản thiếu hụt" value={formatVND(result.gap)} />
          <ResultLine label="Cần tiết kiệm thêm mỗi tháng" value={formatVND(result.requiredMonthly) + "/tháng"} strong />
        </div>

        <div className="col-span-1 sm:col-span-2 bg-white border border-[#DED6D8] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetail((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-brand"
          >
            <span>
              {showDetail ? "Ẩn" : "Xem"} chi tiết cách tính – Con {index + 1}
            </span>
            <span>{showDetail ? "▲" : "▼"}</span>
          </button>
          {showDetail && (
            <div className="px-4 pb-4">
              <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
                Học phí hôm nay {formatVND(child.annualCostNow)}/năm, tăng theo lạm phát giáo dục{" "}
                {Number(child.eduInflation).toFixed(1)}%/năm. Đến khi con {child.startAge} tuổi (còn{" "}
                {result.yearsUntilStart} năm nữa), học phí mỗi năm học sẽ như bảng dưới. Cột "Giá trị hiện tại" quy
                về hôm nay theo lãi suất {Number(child.investReturn).toFixed(1)}%/năm. Tổng nhỏ hơn giữa 2 cột chính
                là "Tổng mục tiêu giáo dục" ở trên.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr className="bg-[#FDE8E9] text-brand">
                      <th className="text-left px-3 py-2 font-bold">Năm học</th>
                      <th className="text-left px-3 py-2 font-bold">Tuổi con</th>
                      <th className="text-right px-3 py-2 font-bold">Học phí (đ)</th>
                      <th className="text-right px-3 py-2 font-bold">Giá trị hiện tại (đ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearly.map((row) => (
                      <tr key={row.year} className="border-b border-[#EFE7E9]">
                        <td className="px-3 py-1.5">{row.year}</td>
                        <td className="px-3 py-1.5">{row.age}</td>
                        <td className="px-3 py-1.5 text-right">{formatVND(row.nominal)}</td>
                        <td className="px-3 py-1.5 text-right">{formatVND(row.presentValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-brand font-bold text-brand">
                      <td className="px-3 py-2" colSpan={2}>
                        Tổng
                      </td>
                      <td className="px-3 py-2 text-right">{formatVND(result.nominalTotal)}</td>
                      <td className="px-3 py-2 text-right">{formatVND(result.targetTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EducationPanel({ education, onChange }) {
  const children = education.children || [];

  function setNumChildren(n) {
    const num = Math.min(Math.max(Number(n) || 1, 1), MAX_CHILDREN);
    const next = [...children];
    while (next.length < num) next.push(defaultEducationChild());
    next.length = num;
    onChange({ numChildren: num, children: next });
  }

  function setChild(idx, child) {
    const next = [...children];
    next[idx] = child;
    onChange({ children: next });
  }

  return (
    <div className="col-span-1 sm:col-span-2 space-y-3.5">
      <label className="block">
        <span className="text-xs font-semibold text-gray-700">Số con cần hoạch định</span>
        <select
          value={education.numChildren || 1}
          onChange={(e) => setNumChildren(e.target.value)}
          className="w-full border border-gray-200 rounded-lg mt-1 px-3 py-2 text-sm text-gray-700 outline-none"
        >
          {Array.from({ length: MAX_CHILDREN }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} con
            </option>
          ))}
        </select>
      </label>

      {children.map((child, idx) => (
        <ChildCard key={idx} index={idx} child={child} onChange={(c) => setChild(idx, c)} />
      ))}
    </div>
  );
}
