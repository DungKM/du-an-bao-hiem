"use client";

import { useMemo } from "react";
import { formatVND, formatVNDShort, formatDateVN } from "@/lib/finance";
import {
  calcPersonRiders,
  calcAccountValue,
  calcThyroidEarlyStageBenefit,
  calcInpatientBenefitValue,
  getEffectiveAge,
  INPATIENT_BENEFIT_ITEMS,
} from "@/lib/premiumCalc";

const RIDER_ORDER = [
  { key: "healthCardOutpatient", label: "Thẻ SK Trọn Đời — Ngoại trú" },
  { key: "healthCardDental", label: "Thẻ SK Trọn Đời — Nha khoa" },
  { key: "hospitalCash", label: "Hỗ trợ chi phí nằm viện" },
  { key: "criticalIllness", label: "Bệnh hiểm nghèo 2.0" },
  { key: "termLife", label: "Tử kỳ gia hạn hàng năm" },
  { key: "accident", label: "Tử vong & thương tật do tai nạn" },
  { key: "waiver", label: "Miễn thu phí 3.0" },
];

const RIDER_DESCRIPTIONS = {
  healthCardOutpatient: (r) => `Ngoại trú, hạn mức theo hạng "${r.tier}".`,
  healthCardDental: (r) => `Nha khoa, hạn mức theo hạng "${r.tier}".`,
  hospitalCash: (r) => `Trợ cấp ${formatVND(r.amountPerDay)}/ngày nằm viện.`,
  criticalIllness: () => "Chi trả một lần khi mắc bệnh hiểm nghèo thuộc danh mục.",
  termLife: () => "Chi trả khi tử vong trong thời hạn hợp đồng.",
  accident: () => "Chi trả khi tử vong/thương tật do tai nạn.",
  waiver: () => "Miễn phí các năm còn lại cho cả gia đình nếu người này tử vong/mất khả năng lao động.",
};

function BannerRow({ colSpan, compact, children }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{ background: "#D31145" }}
        className={`text-white font-bold ${compact ? "text-[10px] py-1 px-2" : "text-xs py-1.5 px-2"}`}
      >
        {children}
      </td>
    </tr>
  );
}

function SubHeaderRow({ colSpan, compact, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className={`bg-[#FDF3F6] font-semibold text-[#312629] ${compact ? "text-[10px] py-1 px-2" : "text-xs py-1.5 px-2"}`}>
        {children}
      </td>
    </tr>
  );
}

function BenefitRow({ label, sub, values, compact, indent, italic }) {
  return (
    <tr className="border-b border-dashed border-gray-200 align-top">
      <td className={`py-2 pr-3 ${indent ? "pl-5" : ""}`}>
        <p className={`text-[#312629] ${italic ? "italic font-normal" : "font-semibold"} ${compact ? "text-xs" : "text-sm"}`}>{label}</p>
        {sub && <p className={`text-gray-500 italic mt-0.5 ${compact ? "text-[9px]" : "text-xs"}`}>{sub}</p>}
      </td>
      {values.map((v, i) => (
        <td key={i} className={`py-2 px-2 text-right font-semibold ${compact ? "text-xs" : "text-sm"}`}>{v}</td>
      ))}
    </tr>
  );
}

export default function BenefitSummary({ mainProduct, people, familyTotal, designDate }) {
  const mainPerson = people[0];
  const mainAge = getEffectiveAge(mainPerson, designDate);
  const thyroidEarly = calcThyroidEarlyStageBenefit(mainProduct.sumInsured);
  const columnCount = 1 + people.length;
  const compact = people.length >= 3;

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

  const inpatientTiers = people.map((p) => (p.riders.healthCardInpatient.enabled ? p.riders.healthCardInpatient.tier : null));
  const anyInpatient = inpatientTiers.some(Boolean);

  return (
    <div className="bg-white border border-[#E0D4D7] rounded-[10px] overflow-hidden">
      <div className="bg-brand text-white px-[18px] py-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-[15px] font-black tracking-wide">TÓM TẮT QUYỀN LỢI BẢO HIỂM</p>
            <p className="text-xs opacity-90 mt-0.5">{mainProduct.productName}</p>
          </div>
          <div className="text-right text-[11px] opacity-90 space-y-0.5">
            <p>Ngày thiết kế: {formatDateVN(designDate)}</p>
            <p>Thời hạn đóng phí: <b className="font-bold">{mainProduct.paymentTerm} năm</b></p>
            <p>Phí đóng năm đầu: <b className="font-bold">{formatVNDShort(familyTotal.total)}</b></p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
          {people.map((p, i) => (
            <span key={i}>
              <span className="opacity-70">{i === 0 ? "NĐBH Chính" : `NĐBH Đính Kèm ${i}`}: </span>
              <b>{p.name || "—"}</b> — {getEffectiveAge(p, designDate) || "?"} tuổi — {p.gender}
            </span>
          ))}
        </div>
      </div>

      <div className="px-[18px] pb-[18px] pt-3 overflow-x-auto">
        <table className="w-full zebra-table table-fixed min-w-[560px]">
          <colgroup>
            <col style={{ width: `${Math.max(30, 55 - people.length * 6)}%` }} />
            {people.map((_, i) => (
              <col key={i} />
            ))}
          </colgroup>
          <thead>
            <tr className={`border-b-2 border-[#DED6D8] text-left bg-[#FDF3F6] ${compact ? "text-[10px]" : "text-sm"}`}>
              <th className="py-2 px-2 text-[#1A1A1A]">Tên Quyền Lợi</th>
              {people.map((p, i) => (
                <th key={i} className="text-center px-2 text-[#1A1A1A] font-bold">
                  {p.name || "—"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <BannerRow colSpan={columnCount} compact={compact}>📋 SẢN PHẨM CHÍNH</BannerRow>
            <BenefitRow compact={compact} label="Số tiền bảo hiểm sản phẩm chính (STBH)" values={mainOnly(formatVND(mainProduct.sumInsured))} />

            <BannerRow colSpan={columnCount} compact={compact}>1.1. Quyền lợi bảo hiểm Tử vong</BannerRow>
            <BenefitRow
              compact={compact}
              label="Chi trả Số lớn hơn giữa STBH và GTTK cơ bản + GTTK đóng thêm"
              sub="Số lớn hơn giữa Số tiền bảo hiểm và GTTK cơ bản, cộng với GTTK đóng thêm"
              values={mainOnly("—")}
            />

            <BannerRow colSpan={columnCount} compact={compact}>1.2. Quyền lợi bảo hiểm Thương tật toàn bộ vĩnh viễn (TTTBVV)</BannerRow>
            <BenefitRow
              compact={compact}
              label="1.2.1. Quyền lợi bảo hiểm TTTBVV không do ung thư tuyến giáp"
              sub="TTTBVV do tổn thương cơ thể (không bao gồm tỷ lệ tổn thương cơ thể do ung thư tuyến giáp) trước 75 tuổi hoặc từ ngày đạt 75 tuổi cho đến trước Ngày kỷ niệm hợp đồng kế tiếp, chi trả Số lớn hơn giữa STBH và GTTK cơ bản + GTTK đóng thêm."
              values={mainOnly("Chi trả Số lớn hơn giữa STBH và GTTK cơ bản + GTTK đóng thêm")}
            />
            <SubHeaderRow colSpan={columnCount} compact={compact}>1.2.2. Quyền lợi bảo hiểm TTTBVV do ung thư tuyến giáp</SubHeaderRow>
            <BenefitRow
              compact={compact}
              indent
              label="a) Giai đoạn sớm"
              sub={`TTTBVV do ung thư tuyến giáp giai đoạn sớm, chi trả 1 lần 10% STBH, không vượt quá 200 triệu đồng. = MIN(${Math.round(mainProduct.sumInsured * 0.1).toLocaleString("vi-VN")}, 200.000.000)`}
              values={mainOnly(formatVND(thyroidEarly))}
            />
            <BenefitRow
              compact={compact}
              indent
              label="b) Giai đoạn nghiêm trọng"
              sub="TTTBVV do ung thư tuyến giáp giai đoạn nghiêm trọng, chi trả Số lớn hơn giữa STBH và GTTK cơ bản + GTTK đóng thêm."
              values={mainOnly("Chi trả Số lớn hơn giữa STBH và GTTK cơ bản + GTTK đóng thêm")}
            />

            {anyInpatient && (
              <>
                <BannerRow colSpan={columnCount} compact={compact}>🏥 BẢO HIỂM CHĂM SÓC SỨC KHỎE TRỌN ĐỜI — NỘI TRÚ</BannerRow>
                <BenefitRow compact={compact} label="Hạng thẻ" values={inpatientTiers.map((t) => t || "-")} />
                {INPATIENT_BENEFIT_ITEMS.map((item, idx) => (
                  <BenefitRow
                    key={idx}
                    compact={compact}
                    indent
                    italic={item.italic}
                    label={item.label}
                    sub={item.sub}
                    values={people.map((p, i) => {
                      if (!inpatientTiers[i]) return "-";
                      if (item.isFee) {
                        const row = perPersonRows[i].rows.find((r) => r.key === "healthCardInpatient");
                        return row ? formatVND(row.fee) : "-";
                      }
                      const v = calcInpatientBenefitValue(item, inpatientTiers[i]);
                      return typeof v === "number" ? formatVND(v) : v;
                    })}
                  />
                ))}
              </>
            )}

            <BannerRow colSpan={columnCount} compact={compact}>💰 GIÁ TRỊ HOÀN LẠI &amp; TỔNG PHÍ</BannerRow>
            <BenefitRow
              compact={compact}
              label={`Tổng số tiền SP chính dự kiến (${mainProduct.paymentTerm} năm)`}
              values={mainOnly(formatVND(totalMainPremium))}
            />
            <BenefitRow
              compact={compact}
              label={`Tổng số tiền SP đính kèm dự kiến (${mainProduct.paymentTerm} năm)`}
              values={mainOnly(totalAttachedPremium > 0 ? formatVND(totalAttachedPremium) : "—")}
            />
            <BenefitRow
              compact={compact}
              label="Tổng cộng SP chính &amp; đính kèm &amp; Topup dự kiến"
              values={mainOnly(formatVND(totalMainPremium + totalAttachedPremium))}
            />
            <BenefitRow
              compact={compact}
              label="Giá trị hoàn lại đảm bảo (lãi suất cam kết) — năm 15"
              values={mainOnly(accountValue.checkpoints.guaranteedYear15 != null ? formatVND(accountValue.checkpoints.guaranteedYear15) : "—")}
            />
            <BenefitRow
              compact={compact}
              label="Giá trị hoàn lại đảm bảo (lãi suất cam kết) — năm 20"
              values={mainOnly(accountValue.checkpoints.guaranteedYear20 != null ? formatVND(accountValue.checkpoints.guaranteedYear20) : "—")}
            />
            <BenefitRow
              compact={compact}
              label="Giá trị hoàn lại ở lãi suất minh họa 4.6%/năm — năm 15"
              values={mainOnly(accountValue.checkpoints.illustratedYear15 != null ? formatVND(accountValue.checkpoints.illustratedYear15) : "—")}
            />
            <BenefitRow
              compact={compact}
              label="Giá trị hoàn lại ở lãi suất minh họa 4.6%/năm — năm 20"
              values={mainOnly(accountValue.checkpoints.illustratedYear20 != null ? formatVND(accountValue.checkpoints.illustratedYear20) : "—")}
            />

            {RIDER_ORDER.some((meta) => perPersonRows.some((pr) => pr.rows.some((r) => r.key === meta.key))) && (
              <BannerRow colSpan={columnCount} compact={compact}>🏥 QUYỀN LỢI ĐÍNH KÈM KHÁC</BannerRow>
            )}
            {RIDER_ORDER.map((meta) => {
              const anyone = perPersonRows.some((pr) => pr.rows.some((r) => r.key === meta.key));
              if (!anyone) return null;
              return (
                <BenefitRow
                  key={meta.key}
                  compact={compact}
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
          Bản tóm tắt mang tính chất minh họa, không thay thế điều khoản hợp đồng chính thức. Hạn mức các quyền lợi
          thẻ sức khỏe ngoài hạng "Cơ bản" được quy đổi tỷ lệ theo hạn mức năm, mang tính chất minh họa.
        </p>
      </div>
    </div>
  );
}
