"use client";

import { useMemo } from "react";
import { formatVND, formatVNDShort, formatDateVN } from "@/lib/finance";
import { calcPersonRiders, calcAccountValue, calcThyroidEarlyStageBenefit, getEffectiveAge } from "@/lib/premiumCalc";

const RIDER_ORDER = [
  { key: "healthCardInpatient", label: "Thẻ SK Trọn Đời — Nội trú" },
  { key: "healthCardOutpatient", label: "Thẻ SK Trọn Đời — Ngoại trú" },
  { key: "healthCardDental", label: "Thẻ SK Trọn Đời — Nha khoa" },
  { key: "hospitalCash", label: "Hỗ trợ chi phí nằm viện" },
  { key: "criticalIllness", label: "Bệnh hiểm nghèo 2.0" },
  { key: "termLife", label: "Tử kỳ gia hạn hàng năm" },
  { key: "accident", label: "Tử vong & thương tật do tai nạn" },
  { key: "waiver", label: "Miễn thu phí 3.0" },
];

const RIDER_DESCRIPTIONS = {
  healthCardInpatient: (r) => `Nội trú, hạn mức theo hạng "${r.tier}"${r.scope === "global" ? ", toàn cầu" : ", Việt Nam"}.`,
  healthCardOutpatient: (r) => `Ngoại trú, hạn mức theo hạng "${r.tier}".`,
  healthCardDental: (r) => `Nha khoa, hạn mức theo hạng "${r.tier}".`,
  hospitalCash: (r) => `Trợ cấp ${formatVND(r.amountPerDay)}/ngày nằm viện.`,
  criticalIllness: () => "Chi trả một lần khi mắc bệnh hiểm nghèo thuộc danh mục.",
  termLife: () => "Chi trả khi tử vong trong thời hạn hợp đồng.",
  accident: () => "Chi trả khi tử vong/thương tật do tai nạn.",
  waiver: () => "Miễn phí các năm còn lại cho cả gia đình nếu người này tử vong/mất khả năng lao động.",
};

function BannerRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ background: "#D31145" }} className="text-white text-xs font-bold py-1.5 px-2">
        {children}
      </td>
    </tr>
  );
}

function BenefitRow({ label, sub, values }) {
  return (
    <tr className="border-b border-dashed border-gray-200 align-top">
      <td className="py-2 pr-3">
        <p className="text-sm font-semibold text-[#312629]">{label}</p>
        {sub && <p className="text-xs text-gray-500 italic mt-0.5">{sub}</p>}
      </td>
      {values.map((v, i) => (
        <td key={i} className="py-2 px-2 text-right text-sm font-semibold">{v}</td>
      ))}
    </tr>
  );
}

export default function BenefitSummary({ mainProduct, people, familyTotal, designDate }) {
  const mainPerson = people[0];
  const mainAge = getEffectiveAge(mainPerson, designDate);
  const thyroidEarly = calcThyroidEarlyStageBenefit(mainProduct.sumInsured);
  const columnCount = 1 + people.length;

  const accountValue = useMemo(
    () =>
      calcAccountValue({
        sumInsured: mainProduct.sumInsured,
        annualPremium: mainProduct.annualPremium,
        age: mainAge,
        gender: mainPerson.gender,
        paymentTerm: mainProduct.paymentTerm,
        illustratedRate: 4.6,
      }),
    [mainProduct, mainAge, mainPerson.gender]
  );

  const totalMainPremium = Number(mainProduct.annualPremium) * Number(mainProduct.paymentTerm || 0);
  const perPersonRows = people.map((p) => calcPersonRiders(p, familyTotal.withoutWaiver, designDate));
  const totalAttachedPremium = perPersonRows.slice(1).reduce((s, pr) => s + pr.total * Number(mainProduct.paymentTerm || 0), 0);

  // Chỉ cột NĐBH chính (index 0) có giá trị cho các dòng thuộc sản phẩm chính; các cột khác hiện "-".
  const mainOnly = (value) => people.map((_, i) => (i === 0 ? value : "-"));

  return (
    <div className="bg-white border border-[#DED6D8] rounded-[14px] overflow-hidden">
      <div className="bg-brand text-white px-[18px] py-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-[15px] font-black tracking-wide">TÓM TẮT QUYỀN LỢI BẢO HIỂM</p>
          <p className="text-xs opacity-90 mt-0.5">{mainProduct.productName}</p>
        </div>
        <div className="text-right text-[11px] opacity-90 space-y-0.5">
          <p>Ngày thiết kế: {formatDateVN(designDate)}</p>
          <p>Thời hạn đóng phí: <b className="font-bold">{mainProduct.paymentTerm} năm</b></p>
          <p>Phí đóng năm đầu: <b className="font-bold">{formatVNDShort(mainProduct.annualPremium)}</b></p>
        </div>
      </div>
      <p className="px-[18px] pt-3 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
        {people.map((p, i) => (
          <span key={i}>
            {i === 0 ? "NĐBH Chính" : `NĐBH Đính Kèm ${i}`}: <b>{p.name || "—"}</b> — {getEffectiveAge(p, designDate) || "?"} tuổi — {p.gender}
          </span>
        ))}
      </p>

      <div className="px-[18px] pb-[18px] pt-2 overflow-x-auto">
        <table className="w-full text-sm zebra-table table-fixed min-w-[560px]">
          <colgroup>
            <col style={{ width: `${Math.max(30, 55 - people.length * 6)}%` }} />
            {people.map((_, i) => (
              <col key={i} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b-2 border-[#DED6D8] text-left bg-[#FDF3F6]">
              <th className="py-2 px-2">Tên Quyền Lợi</th>
              {people.map((p, i) => (
                <th key={i} className="text-center px-2 text-brand font-bold">
                  {p.name || "—"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <BannerRow colSpan={columnCount}>📋 SẢN PHẨM CHÍNH</BannerRow>
            <BenefitRow label="Số tiền bảo hiểm sản phẩm chính (STBH)" values={mainOnly(formatVND(mainProduct.sumInsured))} />

            <BannerRow colSpan={columnCount}>1.1. Quyền lợi Thương Tật Toàn Bộ Vĩnh Viễn (TTTBVV)</BannerRow>
            <BenefitRow
              label="TTTBVV không do ung thư tuyến giáp — trước 75 tuổi"
              sub="Số lớn hơn giữa Số tiền bảo hiểm và GTTK hợp đồng, cộng GTTK đóng thêm"
              values={mainOnly("Chi trả số lớn hơn giữa Số tiền bảo hiểm và GTTK hợp đồng, cộng GTTK đóng thêm")}
            />
            <BenefitRow
              label="TTTBVV do ung thư tuyến giáp giai đoạn sớm — trước 75 tuổi"
              sub={`Chi trả 1 lần 10% STBH, tối đa 200 triệu VNĐ/NĐBH. = MIN(${Math.round(mainProduct.sumInsured * 0.1).toLocaleString("vi-VN")}, 200.000.000)`}
              values={mainOnly(formatVND(thyroidEarly))}
            />
            <BenefitRow
              label="TTTBVV do ung thư tuyến giáp giai đoạn nghiêm trọng — trước 75 tuổi"
              sub="Số lớn hơn giữa Số tiền bảo hiểm và GTTK hợp đồng, cộng GTTK đóng thêm, trừ khoản UT tuyến giáp giai đoạn sớm đã nhận"
              values={mainOnly("Chi trả số lớn hơn giữa Số tiền bảo hiểm và GTTK hợp đồng, cộng GTTK đóng thêm − QL UT TG giai đoạn sớm đã chi trả (nếu có)")}
            />

            <BannerRow colSpan={columnCount}>1.2. Tử vong</BannerRow>
            <BenefitRow
              label="Chi trả số lớn hơn giữa Số tiền bảo hiểm và GTTK hợp đồng, cộng GTTK đóng thêm"
              sub="Số lớn hơn giữa Số tiền bảo hiểm và Giá trị tài khoản, cộng với GTTK đóng thêm"
              values={mainOnly("—")}
            />

            <BannerRow colSpan={columnCount}>💰 GIÁ TRỊ HOÀN LẠI &amp; TỔNG PHÍ</BannerRow>
            <BenefitRow
              label={`Tổng số tiền SP chính dự kiến (${mainProduct.paymentTerm} năm)`}
              values={mainOnly(formatVND(totalMainPremium))}
            />
            <BenefitRow
              label={`Tổng số tiền SP đính kèm dự kiến (${mainProduct.paymentTerm} năm)`}
              values={mainOnly(totalAttachedPremium > 0 ? formatVND(totalAttachedPremium) : "—")}
            />
            <BenefitRow
              label="Tổng cộng SP chính &amp; đính kèm &amp; Topup dự kiến"
              values={mainOnly(formatVND(totalMainPremium + totalAttachedPremium))}
            />
            <BenefitRow
              label="Giá trị hoàn lại đảm bảo (lãi suất cam kết) — năm 15"
              values={mainOnly(accountValue.checkpoints.guaranteedYear15 != null ? formatVND(accountValue.checkpoints.guaranteedYear15) : "—")}
            />
            <BenefitRow
              label="Giá trị hoàn lại đảm bảo (lãi suất cam kết) — năm 20"
              values={mainOnly(accountValue.checkpoints.guaranteedYear20 != null ? formatVND(accountValue.checkpoints.guaranteedYear20) : "—")}
            />
            <BenefitRow
              label="Giá trị hoàn lại ở lãi suất minh họa 4.6%/năm — năm 15"
              values={mainOnly(accountValue.checkpoints.illustratedYear15 != null ? formatVND(accountValue.checkpoints.illustratedYear15) : "—")}
            />
            <BenefitRow
              label="Giá trị hoàn lại ở lãi suất minh họa 4.6%/năm — năm 20"
              values={mainOnly(accountValue.checkpoints.illustratedYear20 != null ? formatVND(accountValue.checkpoints.illustratedYear20) : "—")}
            />

            {RIDER_ORDER.some((meta) => perPersonRows.some((pr) => pr.rows.some((r) => r.key === meta.key))) && (
              <BannerRow colSpan={columnCount}>🏥 QUYỀN LỢI ĐÍNH KÈM</BannerRow>
            )}
            {RIDER_ORDER.map((meta) => {
              const anyone = perPersonRows.some((pr) => pr.rows.some((r) => r.key === meta.key));
              if (!anyone) return null;
              return (
                <BenefitRow
                  key={meta.key}
                  label={meta.label}
                  sub={
                    people
                      .map((p, i) => {
                        const row = perPersonRows[i].rows.find((r) => r.key === meta.key);
                        if (!row) return null;
                        return `${p.name || (i === 0 ? "NĐBH Chính" : `NĐBH ĐK ${i}`)}: ${RIDER_DESCRIPTIONS[meta.key]?.(p.riders[meta.key]) || ""}`;
                      })
                      .filter(Boolean)
                      .join(" · ")
                  }
                  values={people.map((p, i) => {
                    const row = perPersonRows[i].rows.find((r) => r.key === meta.key);
                    return row ? `${formatVND(row.fee)}/năm` : "-";
                  })}
                />
              );
            })}
          </tbody>
        </table>

        <p className="text-xs text-gray-400 mt-3">
          Bản tóm tắt mang tính chất minh họa, không thay thế điều khoản hợp đồng chính thức.
        </p>
      </div>
    </div>
  );
}
