"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatVND, toNumber } from "@/lib/finance";
import {
  calcAccountValueAtYear,
  guaranteedRateForYear,
  calcPersonRiders,
  getEffectiveAge,
  MAIN_PRODUCTS,
  isFixedPremiumProduct,
  getKtvFixedPremium,
  getKtvStbhForPremium,
  getSuggestedPremiumRange,
  getSuggestedPointPremium,
  getStbhForSuggestedPremium,
  getKtvFixedTerm,
} from "@/lib/premiumCalc";
import ModuleHeader from "@/components/ModuleHeader";

const DURATIONS = [5, 10, 15, 20];

// "Trọn Bình An" chưa có công thức phí thật xác nhận (xem premiumCalc.js) —
// không đưa vào so sánh tự động giữa các gói.
const COMPARABLE_PRODUCTS = MAIN_PRODUCTS.filter((p) => p !== "Trọn Bình An");

function formatTr(value) {
  const n = Math.round(toNumber(value) / 1_000_000);
  return `${n.toLocaleString("vi-VN")} tr`;
}

function ValueCell({ value, colorClass }) {
  return <td className={`text-center font-bold text-[15px] ${colorClass}`}>{formatTr(value)}</td>;
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline gap-2 py-1 flex-wrap">
      <span className="text-[13.5px] text-gray-500">{label}</span>
      <span className="text-[15px] font-bold text-[#1A1A1A]">{value}</span>
    </div>
  );
}

// Với 1 sản phẩm + 1 trục neo (giữ STBH hoặc giữ Phí/năm), tính ra trục còn
// lại bằng đúng công thức 2 chiều đã verify trong premiumCalc.js.
function computeProductColumn(productName, anchorMode, anchorSumInsured, anchorPremium, age, gender) {
  const fixed = isFixedPremiumProduct(productName);
  let sumInsured;
  let premium;

  if (fixed) {
    if (anchorMode === "stbh") {
      sumInsured = toNumber(anchorSumInsured);
      premium = getKtvFixedPremium(productName, age, gender, sumInsured);
    } else {
      premium = toNumber(anchorPremium);
      sumInsured = getKtvStbhForPremium(productName, age, gender, premium);
      if (sumInsured == null) premium = null;
    }
  } else {
    if (anchorMode === "stbh") {
      sumInsured = toNumber(anchorSumInsured);
      premium = getSuggestedPointPremium(productName, age, sumInsured);
    } else {
      premium = toNumber(anchorPremium);
      sumInsured = getStbhForSuggestedPremium(productName, age, premium);
      if (sumInsured == null) premium = null;
    }
  }

  const range = sumInsured != null ? getSuggestedPremiumRange(productName, age, sumInsured) : null;
  return { productName, fixed, sumInsured, premium, range };
}

export default function CompareClient() {
  const searchParams = useSearchParams();
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("tinhPhiSnapshot");
      if (raw) setSnapshot(JSON.parse(raw));
    } catch {
      // sessionStorage không khả dụng hoặc dữ liệu hỏng — bỏ qua, dùng mặc định.
    }
  }, []);

  const mainPerson = snapshot?.people?.[0] || null;
  const designDate = snapshot?.designDate;

  const product = searchParams.get("product") || snapshot?.mainProduct?.productName || "Vững Tương Lai";
  const insuredName = searchParams.get("name") || mainPerson?.name || "";
  const rawAgeParam = searchParams.get("age");
  const ageFromSnapshot = mainPerson ? getEffectiveAge(mainPerson, designDate) : null;
  const age = rawAgeParam ? Number(rawAgeParam) : ageFromSnapshot ?? 36;
  const gender = searchParams.get("gender") || mainPerson?.gender || "Nam";
  const annualPremium = Number(searchParams.get("premium")) || snapshot?.mainProduct?.annualPremium || 10_000_000;
  const sumInsured = Number(searchParams.get("sumInsured")) || snapshot?.mainProduct?.sumInsured || 1_000_000_000;
  const illustrativeRate = 4.6;
  const evalYear = 20;

  // Tổng phí quyền lợi đính kèm hiện có của NĐBH chính (không đổi giữa các
  // cột so sánh sản phẩm — chỉ phí sản phẩm chính mới đổi theo từng cột).
  const riderTotal = mainPerson ? calcPersonRiders(mainPerson, 0, designDate).total : 0;

  const [anchorMode, setAnchorMode] = useState("stbh"); // "stbh" | "premium"
  const [anchorSumInsured, setAnchorSumInsured] = useState(sumInsured);
  const [anchorPremium, setAnchorPremium] = useState(annualPremium);
  const [selectedProducts, setSelectedProducts] = useState(() =>
    COMPARABLE_PRODUCTS.reduce((acc, p) => ({ ...acc, [p]: true }), {})
  );

  // Khi snapshot phương án nạp xong (hoặc đổi), đưa 2 ô neo về đúng giá trị
  // hiện tại của phương án — chỉ 1 lần khi chưa có override qua query-string.
  useEffect(() => {
    if (!searchParams.get("sumInsured")) setAnchorSumInsured(sumInsured);
    if (!searchParams.get("premium")) setAnchorPremium(annualPremium);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  const productColumns = useMemo(
    () =>
      COMPARABLE_PRODUCTS.filter((p) => selectedProducts[p]).map((p) =>
        computeProductColumn(p, anchorMode, anchorSumInsured, anchorPremium, age, gender)
      ),
    [anchorMode, anchorSumInsured, anchorPremium, age, gender, selectedProducts]
  );

  // "Trọn Bình An" chưa có công thức GTTK xác nhận — không tính bảng này.
  // Khỏe Trọn Vẹn * chỉ có 1 thời hạn đóng phí cố định theo biến thể (không
  // chọn tự do như Vững Tương Lai/Khỏe Bình An) — bảng chỉ còn 1 cột đúng
  // thời hạn đó thay vì lưới 5/10/15/20 năm.
  const noCashValueSupport = product === "Trọn Bình An";
  const ktvFixedTerm = getKtvFixedTerm(product);
  const termsForProduct = noCashValueSupport ? [] : ktvFixedTerm != null ? [ktvFixedTerm] : DURATIONS;

  const rows = useMemo(() => {
    const illuRate = toNumber(illustrativeRate);
    const base = { sumInsured: toNumber(sumInsured), annualPremium: toNumber(annualPremium), age: toNumber(age), gender, evalYear: toNumber(evalYear) };

    return termsForProduct.map((term) => {
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
  }, [annualPremium, sumInsured, age, gender, illustrativeRate, evalYear, product]);

  return (
    <div>
      <ModuleHeader icon="🔀" title="So Sánh Kế Hoạch Đóng Phí" module={4} />

      <div className="bg-white border border-[#F0E4E7] rounded-2xl shadow-sm py-5 px-4 sm:px-8 mb-5">
        <InfoRow label="Sản phẩm hiện tại:" value={product} />
        <InfoRow label="Người được bảo hiểm:" value={`${insuredName || "—"} (${age} tuổi, ${gender})`} />
        <InfoRow label="Phí/năm:" value={formatVND(annualPremium)} />
        <InfoRow label="STBH:" value={formatVND(sumInsured)} />
        {!snapshot && (
          <p className="text-[11px] text-amber-600 mt-1">
            Chưa có dữ liệu từ "Tính Phí Quyền Lợi" trong phiên này — đang hiển thị số minh họa mặc định.
          </p>
        )}
      </div>

      <div className="bg-white border border-[#F0E4E7] rounded-2xl shadow-sm p-4 sm:p-6 mb-5">
        <h2 className="text-[15px] font-bold text-[#312629] mb-1">So sánh các gói sản phẩm chính</h2>
        <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
          So sánh mức phí/STBH giữa các gói cho cùng NĐBH chính ({age} tuổi, {gender}). Chọn giữ cố định STBH (để xem
          mỗi gói cần đóng phí bao nhiêu) hoặc giữ cố định Phí/năm (để so các gói ở cùng một ngân sách).
        </p>

        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAnchorMode("stbh")}
              className={`px-3 py-2 transition ${anchorMode === "stbh" ? "bg-brand text-white" : "bg-white text-gray-600"}`}
            >
              Giữ cố định STBH
            </button>
            <button
              type="button"
              onClick={() => setAnchorMode("premium")}
              className={`px-3 py-2 transition ${anchorMode === "premium" ? "bg-brand text-white" : "bg-white text-gray-600"}`}
            >
              Giữ cố định Phí/năm
            </button>
          </div>

          {anchorMode === "stbh" ? (
            <label className="block">
              <span className="text-xs font-semibold text-gray-700">STBH neo (đ)</span>
              <input
                type="number"
                value={anchorSumInsured}
                onChange={(e) => setAnchorSumInsured(e.target.value === "" ? 0 : Number(e.target.value))}
                className="block border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1 w-48"
              />
            </label>
          ) : (
            <label className="block">
              <span className="text-xs font-semibold text-gray-700">Phí/năm neo (đ)</span>
              <input
                type="number"
                value={anchorPremium}
                onChange={(e) => setAnchorPremium(e.target.value === "" ? 0 : Number(e.target.value))}
                className="block border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1 w-48"
              />
            </label>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5 pb-4 border-b border-gray-100">
          {COMPARABLE_PRODUCTS.map((p) => (
            <label key={p} className="flex items-center gap-1.5 text-xs text-[#312629]">
              <input
                type="checkbox"
                checked={!!selectedProducts[p]}
                onChange={(e) => setSelectedProducts((prev) => ({ ...prev, [p]: e.target.checked }))}
              />
              {p}
            </label>
          ))}
          <label className="flex items-center gap-1.5 text-xs text-gray-400">
            <input type="checkbox" checked={false} disabled />
            Trọn Bình An <span className="italic">(chưa xác nhận công thức phí — chưa hỗ trợ so sánh tự động)</span>
          </label>
        </div>

        {productColumns.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Chọn ít nhất 1 gói sản phẩm để so sánh.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#F0E4E7]">
            <table className="w-full text-sm min-w-[700px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left bg-brand-light text-[#312629] font-bold py-3 px-4 text-[13px]">Hạng mục</th>
                  {productColumns.map((c) => (
                    <th key={c.productName} className="bg-brand text-white text-center py-3 px-4 text-[13px] font-bold">
                      {c.productName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#F0F0EE]">
                  <td className="py-3 px-4 text-[13.5px] font-semibold text-[#312629]">STBH</td>
                  {productColumns.map((c) => (
                    <td key={c.productName} className="text-center font-bold text-[14px] text-[#312629]">
                      {c.sumInsured != null ? formatVND(c.sumInsured) : "—"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#F0F0EE] bg-brand-light/60">
                  <td className="py-3 px-4 text-[13.5px] font-semibold text-[#312629]">Phí sản phẩm chính/năm</td>
                  {productColumns.map((c) => (
                    <td key={c.productName} className="text-center font-bold text-[14px] text-brand">
                      {c.premium != null ? formatVND(c.premium) : "—"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#F0F0EE]">
                  <td className="py-3 px-4 text-[13.5px] text-gray-500">Ghi chú</td>
                  {productColumns.map((c) => (
                    <td key={c.productName} className="text-center text-[11px] text-gray-400 px-2">
                      {c.premium == null
                        ? "Không xác định được ở tuổi/mức này"
                        : c.fixed
                        ? "✓ Phí cố định theo STBH & tuổi"
                        : c.range
                        ? `Dải gợi ý: ${formatVND(c.range.min)} – ${formatVND(c.range.max)}`
                        : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <p className="text-[13.5px] font-bold text-[#312629]">Tổng phí năm đầu</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">(gồm quyền lợi đính kèm hiện có)</p>
                  </td>
                  {productColumns.map((c) => (
                    <td key={c.productName} className="text-center font-bold text-[15px] text-brand-dark">
                      {c.premium != null ? formatVND(c.premium + riderTotal) : "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#F0E4E7] rounded-2xl shadow-sm p-4 sm:p-6">
        <h2 className="text-[15px] font-bold text-[#312629] mb-1">So sánh theo thời hạn đóng phí</h2>

        {noCashValueSupport ? (
          <>
            <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
              Sản phẩm {product} là dòng UL có thời hạn đóng phí cố định. Bảng dưới thể hiện giá trị hoàn lại dự kiến tại
              năm hợp đồng thứ {evalYear} theo cả lãi minh họa {illustrativeRate}%/năm (mức quy định) và lãi cam kết. Để so
              sánh nhiều kế hoạch đóng phí, hãy chọn sản phẩm Vững Tương Lai hoặc Khỏe Bình An ở Module tính phí.
            </p>
            <div className="bg-brand-light/60 rounded-xl px-5 py-6 text-center text-[13.5px] text-[#312629]">
              Với mức phí {formatVND(annualPremium)}/năm, sản phẩm {product} chưa tính được giá trị hoàn lại tại năm{" "}
              {evalYear} cho các thời hạn đóng phí. Vui lòng điều chỉnh ở Module tính phí.
            </div>
          </>
        ) : (
          <>
            <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
              {ktvFixedTerm != null ? (
                <>
                  Sản phẩm {product} là dòng UL có thời hạn đóng phí cố định. Bảng dưới thể hiện giá trị hoàn lại dự kiến
                  tại năm hợp đồng thứ {evalYear} theo cả lãi minh họa {illustrativeRate}%/năm (mức quy định) và lãi cam
                  kết. Để so sánh nhiều kế hoạch đóng phí, hãy chọn sản phẩm Vững Tương Lai hoặc Khỏe Bình An ở Module tính
                  phí.
                </>
              ) : (
                <>
                  Sản phẩm dòng UL (bảo hiểm liên kết chung) có 2 mức: giá trị hoàn lại theo lãi minh họa {illustrativeRate}
                  %/năm (mức quy định) và theo lãi cam kết. Bảng dưới thể hiện giá trị hoàn lại dự kiến tại năm hợp đồng thứ{" "}
                  {evalYear} theo các thời hạn đóng phí khác nhau của sản phẩm hiện tại ({product}).
                </>
              )}
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
          </>
        )}

        <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
          Bảng so sánh giá trị hoàn lại dự kiến để khách hàng cân nhắc lựa chọn phù hợp với khả năng tài chính. Công cụ tham
          khảo — số cuối cùng theo bảng minh họa chính thức &amp; điều khoản sản phẩm.
        </p>
      </div>
    </div>
  );
}
