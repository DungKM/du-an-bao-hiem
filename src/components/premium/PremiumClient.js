"use client";

import { useMemo, useState } from "react";
import { formatVND } from "@/lib/finance";
import { RIDERS, calcPremium } from "@/lib/premiumCalc";
import ModuleHeader from "@/components/ModuleHeader";

export default function PremiumClient() {
  const [sumInsured, setSumInsured] = useState(1_000_000_000);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState("Nam");
  const [riderKeys, setRiderKeys] = useState([]);

  const result = useMemo(
    () => calcPremium({ sumInsured, age, gender, riderKeys }),
    [sumInsured, age, gender, riderKeys]
  );

  function toggleRider(key) {
    setRiderKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  return (
    <div>
      <ModuleHeader icon="🛡️" title="Tính Phí Quyền Lợi" module={3} />

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold">Thông tin người được bảo hiểm</h3>
          <div className="grid grid-cols-2 gap-3">
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
            <label className="col-span-2 text-xs font-semibold text-gray-700">
              Số tiền bảo hiểm (STBH) mong muốn
              <input type="number" value={sumInsured} onChange={(e) => setSumInsured(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </label>
          </div>

          <h3 className="font-bold pt-2">Quyền lợi bổ trợ mong muốn</h3>
          <div className="space-y-2">
            {RIDERS.map((r) => (
              <label key={r.key} className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 cursor-pointer">
                <input type="checkbox" checked={riderKeys.includes(r.key)} onChange={() => toggleRider(r.key)} />
                <span className="flex-1">{r.label}</span>
                <span className="text-gray-400 text-xs">
                  {r.type === "flat" ? formatVND(r.amount) + "/năm" : `${r.rate}‱ STBH`}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold mb-4">Kết quả ước tính phí/năm</h3>
          <div className="flex justify-between py-2 border-b border-dashed">
            <span className="text-gray-600">Phí bảo hiểm chính</span>
            <span className="font-semibold">{formatVND(result.base)}</span>
          </div>
          {result.riderBreakdown.map((r) => (
            <div key={r.key} className="flex justify-between py-2 border-b border-dashed text-sm">
              <span className="text-gray-500">{r.label}</span>
              <span>{formatVND(r.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 mt-2 border-t-2 border-brand">
            <span className="font-bold">Tổng phí ước tính/năm</span>
            <span className="font-bold text-brand text-lg">{formatVND(result.total)}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-4">
            ⚠️ Bảng phí minh họa mang tính tham khảo cho quá trình tư vấn, không phải bảng phí chính thức của công ty bảo
            hiểm. Số phí cuối cùng theo hồ sơ yêu cầu bảo hiểm &amp; bảng minh họa chính thức.
          </p>
        </div>
      </div>
    </div>
  );
}
