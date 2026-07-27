"use client";

import { Fragment } from "react";
import { formatVND, formatDateVN } from "@/lib/finance";
import { calcPersonRiders, getEffectiveAge } from "@/lib/premiumCalc";

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

function Cells({ row }) {
  if (!row) {
    return (
      <>
        <td className="text-center text-gray-300 py-2 px-2">-</td>
        <td className="text-center text-gray-300 py-2 px-2">-</td>
      </>
    );
  }
  return (
    <>
      <td className="text-right py-2 px-2 text-gray-500 text-xs">{row.sumInsured != null ? formatVND(row.sumInsured) : "-"}</td>
      <td className="text-right py-2 px-2 font-semibold">{formatVND(row.fee)}</td>
    </>
  );
}

function BannerRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ background: "#D31145" }} className="text-white text-xs font-bold py-2 px-2">
        {children}
      </td>
    </tr>
  );
}

export default function SummaryTable({ mainProduct, people, familyTotal, designDate }) {
  const perPersonRows = people.map((p) => calcPersonRiders(p, familyTotal.withoutWaiver, designDate));
  const columnCount = 1 + people.length * 2;

  return (
    <div className="bg-white border border-[#DED6D8] rounded-[14px] overflow-hidden">
      <div className="bg-brand text-white px-[18px] py-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-[15px] font-bold">📋 BẢNG TỔNG HỢP PHÍ &amp; QUYỀN LỢI BẢO HIỂM</p>
          <p className="text-xs opacity-90 mt-0.5">
            {mainProduct.productName} — Thời hạn đóng phí: {mainProduct.paymentTerm} năm
          </p>
        </div>
        <div className="text-right text-[11px] opacity-90 space-y-0.5">
          <p>Ngày thiết kế: {formatDateVN(designDate)}</p>
          <p>Tổng phí đóng năm đầu: {formatVND(familyTotal.total)}</p>
          <p>Tiết kiệm/tháng: {formatVND(familyTotal.total / 12)}</p>
        </div>
      </div>

      <div className="px-[18px] pt-3">
        <p className="text-[11px] text-gray-400">Đơn vị: VNĐ</p>
      </div>

      <div className="overflow-x-auto px-[18px] pb-[18px]">
        <table className="w-full text-sm zebra-table">
          <thead>
            <tr className="border-b border-[#DED6D8] text-left">
              <th className="py-2 align-bottom">Tên quyền lợi</th>
              {people.map((p, i) => (
                <th key={i} colSpan={2} className="text-center px-2 pb-1 text-brand font-bold">
                  {p.name || (i === 0 ? "NĐBH Chính" : `NĐBH Đính Kèm ${i}`)}
                  <div className="text-[11px] font-normal text-gray-400">
                    Tuổi {getEffectiveAge(p, designDate) || "?"} • {p.gender}
                  </div>
                </th>
              ))}
            </tr>
            <tr className="border-b-2 border-[#DED6D8] text-left bg-[#FDF3F6]">
              <th className="px-0 py-1 text-[11px] font-semibold italic text-gray-500">Chi tiết</th>
              {people.map((_, i) => (
                <Fragment key={i}>
                  <th className="text-right px-2 py-1 text-[11px] font-semibold text-gray-500">STBH / Hạn mức</th>
                  <th className="text-right px-2 py-1 text-[11px] font-semibold text-gray-500">Phí/năm</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            <BannerRow colSpan={columnCount}>📋 SẢN PHẨM CHÍNH — {mainProduct.productName}</BannerRow>
            <tr className="border-b border-dashed border-gray-200">
              <td className="py-2 font-semibold">{mainProduct.productName} ({mainProduct.paymentTerm} năm)</td>
              {people.map((p, i) =>
                i === 0 ? (
                  <Cells key={i} row={{ sumInsured: mainProduct.sumInsured, fee: mainProduct.annualPremium }} />
                ) : (
                  <Cells key={i} row={null} />
                )
              )}
            </tr>
            {RIDER_ORDER.map((meta) => {
              const anyone = perPersonRows.some((pr) => pr.rows.some((r) => r.key === meta.key));
              if (!anyone) return null;
              return (
                <tr key={meta.key} className="border-b border-dashed border-gray-200">
                  <td className="py-2 text-gray-600">{meta.label}</td>
                  {perPersonRows.map((pr, i) => (
                    <Cells key={i} row={pr.rows.find((r) => r.key === meta.key)} />
                  ))}
                </tr>
              );
            })}
            <tr style={{ background: "rgb(234,212,218)" }} className="font-bold">
              <td className="py-2.5 px-2">TỔNG PHÍ ĐÓNG NĂM ĐẦU TIÊN</td>
              {people.map((p, i) => {
                const own = i === 0 ? mainProduct.annualPremium : 0;
                const rider = perPersonRows[i].total;
                return (
                  <td key={i} colSpan={2} className="text-right py-2.5 px-2 text-brand">
                    {formatVND(own + rider)}
                  </td>
                );
              })}
            </tr>
            <tr style={{ background: "rgb(245,232,235)" }}>
              <td colSpan={columnCount} className="text-right py-2 px-2 text-sm font-bold text-brand">
                Tổng cả gia đình: {formatVND(familyTotal.total)}/năm &nbsp;|&nbsp; {formatVND(familyTotal.total / 12)}/tháng
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
