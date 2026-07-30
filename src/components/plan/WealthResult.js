"use client";

import { useState } from "react";
import { formatVND } from "@/lib/finance";
import { ResultLine } from "./fields";

export default function WealthResult({ need, result }) {
  const [showDetail, setShowDetail] = useState(false);
  if (!result) return null;

  const targetAmount = Number(need.targetAmount) || 0;
  const currentSavings = Number(need.currentSavings) || 0;
  const inflationRate = Number(need.inflationRate) || 0;
  const expectedReturn = Number(need.expectedReturn) || 0;
  const years = Number(need.years) || 0;

  return (
    <div className="col-span-1 sm:col-span-2 space-y-3">
      <div className="bg-[#FDE8E9] rounded-xl px-[18px] py-4">
        <div className="text-sm font-bold text-brand mb-2.5">Kết quả tính toán</div>
        <ResultLine label="Khoản tích lũy mong muốn" value={formatVND(result.desiredTarget)} />
        <ResultLine label="Tiết kiệm hiện có (nhờ lãi suất)" value={formatVND(result.currentSavingsFV)} />
        <ResultLine label="Tiết kiệm hàng tháng (nhờ lãi suất)" value={formatVND(result.monthlySavingsFV)} />
        <ResultLine label="Khoản tích lũy của bạn" value={formatVND(result.totalSavings)} />
        <ResultLine label="Khoản thiếu hụt" value={formatVND(result.gap)} />
        <ResultLine
          label="Cần tiết kiệm mỗi tháng để đạt mục tiêu"
          value={formatVND(result.requiredMonthly) + "/tháng"}
          strong
        />
      </div>

      <div className="border border-brand rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-brand"
        >
          <span>{showDetail ? "Ẩn" : "Xem"} chi tiết cách tính – Gia tăng tài sản</span>
          <span>{showDetail ? "▲" : "▼"}</span>
        </button>
        {showDetail && (
          <div className="px-4 pb-4">
            <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
              Mục tiêu hôm nay {formatVND(targetAmount)} bị trượt giá theo lạm phát {inflationRate.toFixed(1)}%/năm
              — sau {years} năm cần số tiền lớn hơn (cột "Mục tiêu trượt giá", giá trị năm cuối = "Khoản tích lũy
              mong muốn"). Song song, khoản tiết kiệm hiện có {formatVND(currentSavings)} sinh lời{" "}
              {expectedReturn.toFixed(1)}%/năm (cột "Tiết kiệm sinh lời", giá trị năm cuối = "Tiết kiệm hiện có
              (nhờ lãi suất)").
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-[#FDE8E9] text-brand">
                    <th className="text-left px-3 py-2 font-bold">Năm</th>
                    <th className="text-right px-3 py-2 font-bold">Mục tiêu trượt giá (đ)</th>
                    <th className="text-right px-3 py-2 font-bold">Tiết kiệm sinh lời (đ)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearly.map((row) => (
                    <tr key={row.year} className="border-b border-[#EFE7E9]">
                      <td className="px-3 py-1.5">{row.year}</td>
                      <td className="px-3 py-1.5 text-right">{formatVND(row.targetNominal)}</td>
                      <td className="px-3 py-1.5 text-right">{formatVND(row.savingsValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
