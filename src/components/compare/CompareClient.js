"use client";

import { useMemo, useState } from "react";
import { annuityFV, formatVND, toNumber } from "@/lib/finance";
import ModuleHeader from "@/components/ModuleHeader";

const DURATIONS = [10, 15, 20];

export default function CompareClient() {
  const [product, setProduct] = useState("Vững Tương Lai");
  const [insuredName, setInsuredName] = useState("");
  const [age, setAge] = useState(36);
  const [gender, setGender] = useState("Nam");
  const [annualPremium, setAnnualPremium] = useState(10_000_000);
  const [sumInsured, setSumInsured] = useState(1_000_000_000);
  const [illustrativeRate, setIllustrativeRate] = useState(4.6);
  const [guaranteedRate, setGuaranteedRate] = useState(2);
  const [loadingPct, setLoadingPct] = useState(15);
  const [evalYear, setEvalYear] = useState(20);

  const rows = useMemo(() => {
    const netAnnual = toNumber(annualPremium) * (1 - toNumber(loadingPct) / 100);

    return DURATIONS.map((term) => {
      const totalPremium = toNumber(annualPremium) * term;
      const remainingYears = Math.max(toNumber(evalYear) - term, 0);

      const fvAtTerm = (rate) => annuityFV(netAnnual, rate / 100, term);
      const fvAtEval = (rate) => fvAtTerm(rate) * Math.pow(1 + rate / 100, remainingYears);

      const cashIllustrative = fvAtEval(toNumber(illustrativeRate));
      const cashGuaranteed = fvAtEval(toNumber(guaranteedRate));

      return {
        term,
        totalPremium,
        cashIllustrative,
        cashGuaranteed,
        diff: cashIllustrative - totalPremium,
      };
    });
  }, [annualPremium, illustrativeRate, guaranteedRate, loadingPct, evalYear]);

  return (
    <div>
      <ModuleHeader icon="🔀" title="So Sánh Kế Hoạch Đóng Phí" module={4} />

      <div className="bg-white rounded-xl shadow-sm p-5 mb-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="text-xs font-semibold text-gray-700">
          Sản phẩm
          <input value={product} onChange={(e) => setProduct(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Người được bảo hiểm
          <input value={insuredName} onChange={(e) => setInsuredName(e.target.value)} placeholder="Họ tên" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Tuổi
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Giới tính
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
            <option>Nam</option>
            <option>Nữ</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Phí/năm (đ)
          <input type="number" value={annualPremium} onChange={(e) => setAnnualPremium(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          STBH (đ)
          <input type="number" value={sumInsured} onChange={(e) => setSumInsured(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Lãi minh họa (%)
          <input type="number" value={illustrativeRate} onChange={(e) => setIllustrativeRate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Lãi cam kết (%)
          <input type="number" value={guaranteedRate} onChange={(e) => setGuaranteedRate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Chi phí ban đầu ước tính (%)
          <input type="number" value={loadingPct} onChange={(e) => setLoadingPct(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Xem giá trị hoàn lại tại năm HĐ thứ
          <input type="number" value={evalYear} onChange={(e) => setEvalYear(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </label>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-sm text-gray-500 mb-4">
          Sản phẩm: <b>{product}</b> · Người được bảo hiểm: <b>{insuredName || "—"} ({age} tuổi, {gender})</b> ·
          Phí/năm: <b>{formatVND(annualPremium)}</b> · STBH: <b>{formatVND(sumInsured)}</b> · Lãi minh họa: <b>{illustrativeRate}%</b>
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Bảng dưới thể hiện giá trị hoàn lại dự kiến tại năm hợp đồng thứ {evalYear} theo các thời hạn đóng phí khác nhau.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Hạng mục</th>
                {rows.map((r) => (
                  <th key={r.term} className="text-center bg-brand-light text-brand py-2">{r.term} năm</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dashed">
                <td className="py-2 text-gray-500">
                  Tổng phí đóng dự kiến<br /><span className="text-[11px]">(phí/năm × số năm)</span>
                </td>
                {rows.map((r) => (
                  <td key={r.term} className="text-center font-semibold">{formatVND(r.totalPremium)}</td>
                ))}
              </tr>
              <tr className="border-b border-dashed">
                <td className="py-2 text-gray-500">
                  Giá trị hoàn lại (minh họa {illustrativeRate}%)<br /><span className="text-[11px]">(tại năm {evalYear})</span>
                </td>
                {rows.map((r) => (
                  <td key={r.term} className="text-center font-semibold text-brand">{formatVND(r.cashIllustrative)}</td>
                ))}
              </tr>
              <tr className="border-b border-dashed">
                <td className="py-2 text-gray-500">
                  Giá trị hoàn lại (lãi cam kết {guaranteedRate}%)<br /><span className="text-[11px]">(tại năm {evalYear})</span>
                </td>
                {rows.map((r) => (
                  <td key={r.term} className="text-center font-semibold">{formatVND(r.cashGuaranteed)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 font-semibold">
                  Chênh lệch so với phí đóng<br /><span className="text-[11px] font-normal text-gray-400">(minh họa − tổng phí)</span>
                </td>
                {rows.map((r) => (
                  <td key={r.term} className={`text-center font-bold ${r.diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {formatVND(r.diff)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-gray-400 mt-4">
          Bảng so sánh giá trị hoàn lại dự kiến để khách hàng cân nhắc lựa chọn phù hợp với khả năng tài chính. Công cụ tham
          khảo — số cuối cùng theo bảng minh họa chính thức &amp; điều khoản sản phẩm.
        </p>
      </div>
    </div>
  );
}
