"use client";

import { useState } from "react";
import { formatVND } from "@/lib/finance";
import { ResultLine } from "./fields";

function DetailToggle({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-brand rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-brand"
      >
        <span>
          {open ? "Ẩn" : "Xem"} chi tiết cách tính – {label}
        </span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function RetirementResult({ need, result }) {
  if (!result) return null;

  const monthlyExpenseNow = Number(need.monthlyExpenseNow) || 0;
  const inflation = Number(need.inflation) || 0;
  const investReturn = Number(need.investReturn) || 0;
  const retireAge = Number(need.retireAge) || 0;
  const currentSavings = Number(need.currentSavings) || 0;

  return (
    <div className="col-span-1 sm:col-span-2 space-y-3">
      <div className="bg-[#FDE8E9] rounded-xl px-[18px] py-4">
        <div className="text-sm font-bold text-brand mb-2.5">Kết quả tính toán</div>
        <ResultLine label="Số năm tích lũy còn lại" value={result.yearsToRetire + " năm"} />
        <ResultLine label="Tài sản trong tương lai có được" value={formatVND(result.futureAsset)} />
        <ResultLine label="Tiết kiệm hàng tháng có được" value={formatVND(result.savingsFromMonthly)} />
        <ResultLine label="Tổng số tiền tích lũy được" value={formatVND(result.totalSavings)} />
        <ResultLine label="Khoản cần cho kế hoạch hưu trí" value={formatVND(result.targetTotal)} />
        <ResultLine label="Khoản thiếu hụt" value={formatVND(result.gap)} />
        <ResultLine label="Cần tiết kiệm thêm mỗi tháng" value={formatVND(result.requiredMonthly) + "/tháng"} strong />
      </div>

      <DetailToggle label="Chi tiêu khi nghỉ hưu">
        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
          Sinh hoạt hôm nay {formatVND(monthlyExpenseNow)}/tháng ({formatVND(monthlyExpenseNow * 12)}/năm), tăng
          theo lạm phát {inflation.toFixed(1)}%/năm. Đến khi {retireAge} tuổi (còn {result.yearsToRetire} năm nữa)
          và hưởng hưu trong {result.spendingYearly.length} năm, chi tiêu mỗi năm sẽ như bảng dưới. Cột "Giá trị
          hiện tại" quy về thời điểm nghỉ hưu theo lãi suất {investReturn.toFixed(1)}%/năm. Tổng nhỏ hơn giữa 2 cột
          chính là "Khoản cần cho kế hoạch hưu trí" ở trên.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#FDE8E9] text-brand">
                <th className="text-left px-3 py-2 font-bold">Năm hưu</th>
                <th className="text-left px-3 py-2 font-bold">Tuổi</th>
                <th className="text-right px-3 py-2 font-bold">Chi tiêu năm (đ)</th>
                <th className="text-right px-3 py-2 font-bold">Giá trị hiện tại (đ)</th>
              </tr>
            </thead>
            <tbody>
              {result.spendingYearly.map((row) => (
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
                <td className="px-3 py-2 text-right">{formatVND(result.spendingNominalTotal)}</td>
                <td className="px-3 py-2 text-right">{formatVND(result.targetTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </DetailToggle>

      <DetailToggle label="Tài sản tích lũy đến khi nghỉ hưu">
        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
          Tài sản hiện có {formatVND(currentSavings)} sinh lời theo lãi suất {investReturn.toFixed(1)}%/năm trong{" "}
          {result.yearsToRetire} năm tới. Giá trị năm cuối cùng chính là "Tài sản trong tương lai có được" ở trên
          (chưa gồm khoản tiết kiệm hàng tháng).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#FDE8E9] text-brand">
                <th className="text-left px-3 py-2 font-bold">Năm</th>
                <th className="text-left px-3 py-2 font-bold">Tuổi</th>
                <th className="text-right px-3 py-2 font-bold">Tài sản tích lũy (đ)</th>
              </tr>
            </thead>
            <tbody>
              {result.assetYearly.map((row) => (
                <tr key={row.year} className="border-b border-[#EFE7E9]">
                  <td className="px-3 py-1.5">{row.year}</td>
                  <td className="px-3 py-1.5">{row.age}</td>
                  <td className="px-3 py-1.5 text-right">{formatVND(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DetailToggle>
    </div>
  );
}
