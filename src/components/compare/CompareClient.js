"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatVND, toNumber } from "@/lib/finance";
import { calcAccountValueAtYear, guaranteedRateForYear } from "@/lib/premiumCalc";
import ModuleHeader from "@/components/ModuleHeader";

const DURATIONS = [10, 15, 20];

function formatTr(value) {
  const n = Math.round(toNumber(value) / 1_000_000);
  return `${n.toLocaleString("vi-VN")} tr`;
}

function ValueCell({ value, colorClass }) {
  return <td className={`text-center font-bold text-[15px] ${colorClass}`}>{formatTr(value)}</td>;
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <span className="text-[13.5px] text-gray-500">{label}</span>
      <span className="text-[15px] font-bold text-[#1A1A1A]">{value}</span>
    </div>
  );
}

export default function CompareClient() {
  const searchParams = useSearchParams();
  const [product] = useState(() => searchParams.get("product") || "Vững Tương Lai");
  const [insuredName] = useState(() => searchParams.get("name") || "");
  const [age] = useState(() => Number(searchParams.get("age")) || 36);
  const [gender] = useState(() => searchParams.get("gender") || "Nam");
  const [annualPremium] = useState(() => Number(searchParams.get("premium")) || 10_000_000);
  const [sumInsured] = useState(() => Number(searchParams.get("sumInsured")) || 1_000_000_000);
  const [illustrativeRate] = useState(4.6);
  const [evalYear] = useState(20);

  const rows = useMemo(() => {
    const illuRate = toNumber(illustrativeRate);
    const base = { sumInsured: toNumber(sumInsured), annualPremium: toNumber(annualPremium), age: toNumber(age), gender, evalYear: toNumber(evalYear) };

    return DURATIONS.map((term) => {
      const totalPremium = toNumber(annualPremium) * term;
      const cashIllustrative = calcAccountValueAtYear({ ...base, paymentTerm: term }, () => illuRate / 100);
      const cashGuaranteed = calcAccountValueAtYear({ ...base, paymentTerm: term }, (year) => guaranteedRateForYear(year));

      return {
        term,
        totalPremium,
        cashIllustrative,
        cashGuaranteed,
        diff: cashIllustrative - totalPremium,
      };
    });
  }, [annualPremium, sumInsured, age, gender, illustrativeRate, evalYear]);

  return (
    <div>
      <ModuleHeader icon="🔀" title="So Sánh Kế Hoạch Đóng Phí" module={4} />

      <div className="bg-white border border-[#F0E4E7] rounded-2xl shadow-sm py-5 px-8 mb-5">
        <InfoRow label="Sản phẩm:" value={product} />
        <InfoRow label="Người được bảo hiểm:" value={`${insuredName || "—"} (${age} tuổi, ${gender})`} />
        <InfoRow label="Phí/năm:" value={formatVND(annualPremium)} />
        <InfoRow label="STBH:" value={formatVND(sumInsured)} />
        <InfoRow label="Lãi minh họa (UL):" value={`${illustrativeRate}%`} />
      </div>

      <div className="bg-white border border-[#F0E4E7] rounded-2xl shadow-sm p-6">
        <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
          Tất cả sản phẩm là dòng UL (bảo hiểm liên kết chung), có 2 mức: giá trị hoàn lại theo lãi minh họa {illustrativeRate}%/năm (mức quy
          định) và theo lãi cam kết. Bảng dưới thể hiện giá trị hoàn lại dự kiến tại năm hợp đồng thứ {evalYear} theo các thời hạn đóng phí
          khác nhau.
        </p>

        <div className="overflow-x-auto rounded-xl border border-[#F0E4E7]">
          <table className="w-full text-sm min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="text-left bg-brand-light text-[#312629] font-bold py-3 px-4 text-[13px]">Hạng mục</th>
                {rows.map((r) => (
                  <th key={r.term} className="bg-brand text-white text-center py-3 px-4 text-[14px] font-bold">
                    {r.term} năm
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#F0F0EE]">
                <td className="py-3 px-4">
                  <p className="text-[13.5px] font-semibold text-[#312629]">Tổng phí đóng dự kiến</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">(phí/năm × số năm)</p>
                </td>
                {rows.map((r) => (
                  <td key={r.term} className="text-center font-bold text-[15px] text-[#312629]">{formatTr(r.totalPremium)}</td>
                ))}
              </tr>
              <tr className="border-b border-[#F0F0EE] bg-brand-light/60">
                <td className="py-3 px-4">
                  <p className="text-[13.5px] font-semibold text-[#312629]">Giá trị hoàn lại (minh họa {illustrativeRate}%)</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">(tại năm {evalYear})</p>
                </td>
                {rows.map((r) => (
                  <ValueCell key={r.term} value={r.cashIllustrative} colorClass="text-brand" />
                ))}
              </tr>
              <tr className="border-b border-[#F0F0EE]">
                <td className="py-3 px-4">
                  <p className="text-[13.5px] font-semibold text-[#312629]">Giá trị hoàn lại (lãi cam kết)</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">(tại năm {evalYear})</p>
                </td>
                {rows.map((r) => (
                  <ValueCell key={r.term} value={r.cashGuaranteed} colorClass="text-brand-dark" />
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <p className="text-[13.5px] font-bold text-[#312629]">Chênh lệch so với phí đóng</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">(minh họa − tổng phí)</p>
                </td>
                {rows.map((r) => (
                  <ValueCell key={r.term} value={r.diff} colorClass={r.diff >= 0 ? "text-emerald-600" : "text-brand"} />
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
          Bảng so sánh giá trị hoàn lại dự kiến để khách hàng cân nhắc lựa chọn phù hợp với khả năng tài chính. Công cụ tham
          khảo — số cuối cùng theo bảng minh họa chính thức &amp; điều khoản sản phẩm.
        </p>
      </div>
    </div>
  );
}
