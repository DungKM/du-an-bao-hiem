"use client";

import { useState } from "react";
import { formatVND } from "@/lib/finance";
import { ResultLine } from "./fields";

export default function ProtectionResult({ need, result }) {
  const [showDetail, setShowDetail] = useState(false);
  if (!result) return null;

  const monthlyIncome = Number(need.monthlyIncome) || 0;
  const protectPct = Number(need.protectPct) || 0;
  const inflationRate = Number(need.inflationRate) || 0;
  const investReturnRate = Number(need.investReturnRate) || 0;
  const years = Number(need.protectYears) || 0;

  return (
    <div className="col-span-2 space-y-3">
      <div className="bg-[#FDE8E9] rounded-xl px-[18px] py-4">
        <div className="text-sm font-bold text-brand mb-2.5">Kết quả tính toán</div>
        <ResultLine label="Bảo vệ thu nhập theo năm" value={formatVND(result.firstPayment)} />
        <ResultLine label="Nhu cầu tức thời (trả nợ)" value={formatVND(result.debtNeed)} />
        <ResultLine
          label="Nhu cầu tương lai (chưa tính lạm phát)"
          value={formatVND(result.simpleFutureTotal)}
        />
        <ResultLine label="Quỹ hiện có" value={formatVND(result.currentFund)} />
        <ResultLine label="Nhu cầu tương lai (đã tính lạm phát)" value={formatVND(result.futureTotal)} />
        <ResultLine label="Nhờ có công cụ tiết kiệm" value={formatVND(result.pv)} />
        <ResultLine label="Khoản thiếu hụt cần bảo vệ" value={formatVND(result.gap)} strong />
      </div>

      <div className="bg-white border border-[#DED6D8] rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-brand"
        >
          <span>
            {showDetail ? "Ẩn" : "Hiện"} chi tiết cách tính – Bảo vệ thu nhập
          </span>
          <span>{showDetail ? "▲" : "▼"}</span>
        </button>
        {showDetail && (
          <div className="px-4 pb-4">
            <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
              Thu nhập cần thay thế năm đầu {formatVND(result.firstPayment)} (={" "}
              {formatVND(monthlyIncome)}/tháng × 12 × {protectPct}%), tăng theo lạm phát{" "}
              {inflationRate.toFixed(1)}%/năm trong {years} năm. Cột "Giá trị hiện tại" quy số tiền
              tương lai về hiện tại theo lãi suất tiền gửi {investReturnRate.toFixed(1)}%/năm. Tổng cột
              "Thu nhập cần thay" = Nhu cầu tương lai (đã tính lạm phát); tổng cột "Giá trị hiện tại" =
              Nhờ có công cụ tiết kiệm ở trên.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-[#FDE8E9] text-brand">
                    <th className="text-left px-3 py-2 font-bold">Năm</th>
                    <th className="text-right px-3 py-2 font-bold">Thu nhập cần thay (đ)</th>
                    <th className="text-right px-3 py-2 font-bold">Giá trị hiện tại (đ)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearly.map((row) => (
                    <tr key={row.year} className="border-b border-[#EFE7E9]">
                      <td className="px-3 py-1.5">{row.year}</td>
                      <td className="px-3 py-1.5 text-right">{formatVND(row.nominal)}</td>
                      <td className="px-3 py-1.5 text-right">{formatVND(row.presentValue)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-brand font-bold text-brand">
                    <td className="px-3 py-2">Tổng</td>
                    <td className="px-3 py-2 text-right">{formatVND(result.futureTotal)}</td>
                    <td className="px-3 py-2 text-right">{formatVND(result.pv)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button
              type="button"
              onClick={() => setShowDetail(false)}
              className="mt-3 px-4 py-1.5 rounded-lg border border-[#DED6D8] text-sm text-gray-600"
            >
              ▲ Thu gọn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
