"use client";

import { formatVND } from "@/lib/finance";
import { budgetTotals } from "./budgetItems";
import {
  ShieldCheckIcon,
  GraduationCapIcon,
  PiggyBankIcon,
  TrendingUpIcon,
  HeartPulseIcon,
  PrinterIcon,
} from "./icons";

const NEED_META = {
  protection: { Icon: ShieldCheckIcon, title: "1. Bảo vệ tài chính cho người thân" },
  education: { Icon: GraduationCapIcon, title: "2. Quỹ học đại học cho con" },
  retirement: { Icon: PiggyBankIcon, title: "3. Quỹ hưu trí" },
  wealth: { Icon: TrendingUpIcon, title: "4. Gia tăng tài sản" },
  health: { Icon: HeartPulseIcon, title: "5. Quỹ chăm sóc sức khỏe" },
};

function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between py-1.5 ${strong ? "border-t-2 border-brand mt-1 pt-2" : "border-b border-dashed border-gray-200"}`}>
      <span className={strong ? "font-semibold" : "text-gray-600"}>{label}</span>
      <span className={strong ? "font-bold text-brand" : "font-semibold"}>{value}</span>
    </div>
  );
}

export default function PlanReport({ customerName, income, needs, results, agent, reportDate, onPrint }) {
  const totals = budgetTotals(income);
  const pctStr = (v) => v.toFixed(1);

  const totalGap = Object.entries(results).reduce((sum, [key, r]) => {
    if (!needs[key]?.selected || !r) return sum;
    const gap = r.gap ?? 0;
    return sum + Math.max(gap, 0);
  }, 0);

  return (
    <div className="print-area bg-white rounded-xl shadow-sm p-8 max-w-3xl mx-auto text-sm">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-12 h-12 rounded-full bg-[#FDE8E9] flex items-center justify-center shrink-0">
          <PiggyBankIcon className="w-[26px] h-[26px] text-brand" />
        </div>
        <div>
          <h2 className="text-lg font-bold">BÁO CÁO TỔNG QUAN HOẠCH ĐỊNH TÀI CHÍNH</h2>
          <p className="text-gray-400 text-xs">Ngày lập báo cáo: {reportDate}</p>
        </div>
      </div>
      {customerName && (
        <p className="text-brand font-semibold mt-2">Khách hàng: {customerName}</p>
      )}

      <h3 className="text-brand font-bold border-b-2 border-brand pb-1 mt-6 mb-2">
        Phân bổ thu nhập theo quy tắc 50/30/20
      </h3>
      <Row label="Thu nhập ròng bình quân/tháng" value={formatVND(income.monthlyIncome)} />
      <Row label="A. Tổng chi nhu cầu thiết yếu" value={formatVND(totals.essentialTotal)} />
      <Row label="% Nhu cầu thiết yếu / thu nhập (mục tiêu ≤ 50%)" value={pctStr(totals.essentialPct) + "%"} />
      <Row label="B. Tổng chi không thiết yếu" value={formatVND(totals.nonEssentialTotal)} />
      <Row label="% Không thiết yếu / thu nhập (mục tiêu ≤ 30%)" value={pctStr(totals.nonEssentialPct) + "%"} />
      <Row label="C. Tổng trả nợ / tiết kiệm / đầu tư" value={formatVND(totals.savingsTotal)} />
      <Row label="% Trả nợ/tiết kiệm/đầu tư / thu nhập (mục tiêu ≥ 20%)" value={pctStr(totals.savingsPct) + "%"} />
      <Row label="Thu nhập khả dụng (sau thiết yếu)" value={formatVND(totals.disposable)} strong />
      <Row label="Dự định cho mục tiêu ưu tiên mỗi tháng" value={formatVND(income.monthlyGoal)} />
      <Row label="Dự định cho mục tiêu ưu tiên mỗi năm" value={formatVND((income.monthlyGoal || 0) * 12)} />

      <h3 className="text-brand font-bold border-b-2 border-brand pb-1 mt-6 mb-3">
        Nhu cầu ưu tiên hiện nay về tài chính
      </h3>
      <div className="grid grid-cols-2 gap-2.5 mb-2">
        {Object.entries(NEED_META).map(([key, meta]) => {
          const selected = !!needs[key]?.selected;
          const Icon = meta.Icon;
          return (
            <div
              key={key}
              className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5"
              style={{ background: selected ? "#FDE8E9" : "#F4F4F2" }}
            >
              <div
                className="w-[34px] h-[34px] rounded-lg bg-white flex items-center justify-center shrink-0"
                style={{ opacity: selected ? 1 : 0.7 }}
              >
                <Icon className={`w-[18px] h-[18px] ${selected ? "text-brand" : "text-[#9AA39E]"}`} />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[13px] font-semibold">{meta.title.replace(/^\d+\.\s*/, "")}</div>
                <div
                  className="text-[11px] font-semibold"
                  style={{ color: selected ? "#D31145" : "#9AA39E" }}
                >
                  {selected ? "Có" : "Chưa chọn"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="text-brand font-bold border-b-2 border-brand pb-1 mt-6 mb-3">
        Tính toán hoạch định chi tiết cho từng nhu cầu
      </h3>
      <p className="text-xs text-gray-400 mb-3">Đơn vị: VND</p>

      {Object.entries(NEED_META).map(([key, meta]) => {
        const need = needs[key];
        const r = results[key];
        if (!need?.selected) return null;
        const Icon = meta.Icon;
        return (
          <div key={key} className="mb-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#FDE8E9] flex items-center justify-center shrink-0">
                <Icon className="w-[18px] h-[18px] text-brand" />
              </div>
              <h3 className="text-[14.5px] font-bold m-0">{meta.title}</h3>
            </div>
            {key === "protection" && (
              <>
                <Row label="Thu nhập hàng tháng hiện tại" value={formatVND(need.monthlyIncome)} />
                <Row label="Mong muốn bảo vệ thu nhập" value={need.protectPct + "%"} />
                <Row label="Số năm muốn bảo vệ thu nhập" value={need.protectYears + " năm"} />
                <Row label="Tài sản thanh khoản được ngay" value={formatVND(need.liquidAssets)} />
                <Row label="Bảo hiểm nhân thọ đã có" value={formatVND(need.existingInsurance)} />
                <Row label="Khoản vay nợ đang có" value={formatVND(need.existingDebt)} />
                <Row label="Lạm phát" value={need.inflationRate + "%"} />
                <Row label="Lãi suất tiền gửi hàng năm" value={need.investReturnRate + "%"} />
                <Row label="Bảo vệ thu nhập theo năm" value={formatVND(r?.firstPayment)} />
                <Row label="Nhu cầu tương lai (đã tính lạm phát)" value={formatVND(r?.futureTotal)} />
                <Row label="Nhờ có công cụ tiết kiệm" value={formatVND(r?.pv)} />
                <Row label="Khoản thiếu hụt cần bảo vệ" value={formatVND(r?.gap)} strong />
              </>
            )}
            {key === "education" &&
              (need.children || []).map((child, idx) => {
                const childResult = r?.children?.[idx];
                return (
                  <div key={idx} className="mb-3">
                    <p className="font-semibold text-brand text-xs mb-1">Con {idx + 1}</p>
                    <Row label="Tuổi hiện tại → Tuổi vào đại học" value={`${child.currentAge} → ${child.startAge}`} />
                    <Row label="Số năm học đại học" value={child.studyYears + " năm"} />
                    <Row label="Học phí theo năm hiện nay" value={formatVND(child.annualCostNow)} />
                    <Row label="Lạm phát giáo dục" value={child.eduInflation + "%"} />
                    <Row label="Lãi suất hàng năm" value={child.investReturn + "%"} />
                    <Row label="Tiết kiệm hiện có / hàng tháng" value={`${formatVND(child.currentSavings)} / ${formatVND(child.monthlySaving)}`} />
                    <Row label="Cần tiết kiệm thêm mỗi tháng" value={formatVND(childResult?.requiredMonthly) + "/tháng"} strong />
                  </div>
                );
              })}
            {key === "retirement" && (
              <>
                <Row label="Tuổi hiện tại → Tuổi nghỉ hưu" value={`${need.currentAge} → ${need.retireAge}`} />
                <Row label="Thời gian hưởng hưu trí" value={need.lifeExpectancyYears + " năm"} />
                <Row label="Sinh hoạt hàng tháng khi nghỉ hưu" value={formatVND(need.monthlyExpenseNow)} />
                <Row label="Tổng tài sản hiện có dành cho hưu trí" value={formatVND(need.currentSavings)} />
                <Row label="Tiết kiệm hàng tháng hiện tại" value={formatVND(need.monthlySaving)} />
                <Row label="Tỷ lệ lạm phát" value={need.inflation + "%"} />
                <Row label="Lãi suất hàng năm" value={need.investReturn + "%"} />
                <Row label="Khoản cần cho kế hoạch hưu trí" value={formatVND(r?.targetTotal)} />
                <Row label="Cần tiết kiệm thêm mỗi tháng" value={formatVND(r?.requiredMonthly) + "/tháng"} strong />
              </>
            )}
            {key === "wealth" && (
              <>
                <Row label="Mục tiêu tiết kiệm/đầu tư" value={formatVND(need.targetAmount)} />
                <Row label="Khoản tiết kiệm/đầu tư hiện có" value={formatVND(need.currentSavings)} />
                <Row label="Dự tính tiết kiệm hàng tháng" value={formatVND(need.monthlySaving)} />
                <Row label="Thời gian tiết kiệm/đầu tư" value={need.years + " năm"} />
                <Row label="Tỷ lệ lạm phát" value={need.inflationRate + "%"} />
                <Row label="Lãi suất hàng năm" value={need.expectedReturn + "%"} />
                <Row label="Khoản tích lũy mong muốn" value={formatVND(r?.desiredTarget)} />
                <Row label="Cần tiết kiệm mỗi tháng để đạt mục tiêu" value={formatVND(r?.requiredMonthly) + "/tháng"} strong />
              </>
            )}
            {key === "health" && (
              <>
                <Row label="Quỹ dự phòng khi mắc bệnh hiểm nghèo" value={formatVND(need.criticalIllnessFund)} />
                <Row label="Quỹ dự phòng khi không may tai nạn" value={formatVND(need.accidentFund)} />
                <Row label="Quỹ dự phòng nếu phải nằm viện điều trị" value={formatVND(need.hospitalFund)} />
                <Row label="Tiền phòng giường viện ưu tiên" value={formatVND(need.roomFeePerDay) + "/ngày"} />
                <Row
                  label="Đã có thẻ sức khỏe rời ngoài BHYT Nhà nước?"
                  value={need.hasHealthCard === "da_co" ? "Đã có" : "Chưa có"}
                />
                <Row
                  label="Dự định sinh con nữa"
                  value={
                    need.planMoreChildren === "co"
                      ? "Có"
                      : need.planMoreChildren === "khong"
                      ? "Không"
                      : "Không áp dụng"
                  }
                />
                <Row
                  label="Quy đổi tiền phòng (30 ngày/năm)"
                  value={formatVND(r?.hospitalDaysCost)}
                />
                <Row label="Tổng quỹ dự phòng sức khỏe cần chuẩn bị" value={formatVND(r?.gap)} strong />
              </>
            )}
          </div>
        );
      })}

      <Row label="TỔNG NHU CẦU TÀI CHÍNH CẦN HOẠCH ĐỊNH" value={formatVND(totalGap)} strong />

      <hr className="my-6" />

      <div className="bg-brand-light rounded-lg p-4 flex gap-3 items-center">
        <div className="w-12 h-12 rounded-full bg-white overflow-hidden shrink-0 flex items-center justify-center">
          {agent?.avatarDataUrl ? (
            <img src={agent.avatarDataUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">🧑‍💼</span>
          )}
        </div>
        <div className="text-xs">
          <p className="font-bold">{agent?.name}</p>
          <p className="text-brand font-medium">Tư vấn viên tài chính</p>
          {agent?.phone && <p>📞 {agent.phone} {agent?.email && <>· ✉️ {agent.email}</>}</p>}
          {agent?.bio && <p className="text-gray-500">{agent.bio}</p>}
        </div>
      </div>

      <p className="text-center text-gray-400 italic text-xs mt-6">
        "Tiết kiệm là một nghệ thuật lớn hơn cả việc kiếm tiền" – Ngạn ngữ Đức
      </p>
      <p className="text-center text-[11px] text-gray-400 mt-2">
        ⚠️ Lưu ý: Công cụ này chỉ hỗ trợ quá trình tư vấn trước khi đến với bảng minh họa cuối cùng cùng điều khoản sản phẩm.
        <br />
        Trust Tool
      </p>

      {onPrint && (
        <button
          onClick={onPrint}
          className="no-print fixed bottom-6 right-6 z-50 bg-brand-accent hover:bg-brand text-white rounded-full px-5 py-3 font-semibold shadow-lg flex items-center gap-2"
        >
          <PrinterIcon className="w-4 h-4" />
          In / Lưu PDF
        </button>
      )}
    </div>
  );
}
