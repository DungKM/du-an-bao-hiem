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
    <div
      className={
        strong
          ? "flex justify-between pt-2 pb-1 mt-1 text-[13.5px] border-t-2 border-brand"
          : "flex justify-between py-[5px] text-[13px] border-b border-[#F0F0EE]"
      }
    >
      <span className="text-[#5C6B65]">{label}</span>
      <span className={strong ? "font-extrabold text-brand text-[15px]" : "font-semibold"}>{value}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-[15px] font-bold text-brand border-b-2 border-brand pb-1.5 mt-6 mb-3.5">{children}</h2>
  );
}

function NeedTitle({ Icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <div className="w-8 h-8 rounded-lg bg-[#FDE8E9] flex items-center justify-center shrink-0">
        <Icon className="w-[18px] h-[18px] text-brand" />
      </div>
      <h3 className="text-[14.5px] font-bold m-0">{title}</h3>
    </div>
  );
}

const EDU_ROWS = [
  { label: "Tuổi con hiện tại", value: (c) => c.currentAge + " tuổi" },
  { label: "Tuổi bắt đầu đại học", value: (c) => c.startAge + " tuổi" },
  { label: "Thời gian học đại học", value: (c) => c.studyYears + " năm" },
  { label: "Học phí theo năm hiện nay", value: (c) => formatVND(c.annualCostNow) },
  { label: "Lạm phát giáo dục", value: (c) => c.eduInflation + "%" },
  { label: "Lãi suất hàng năm", value: (c) => c.investReturn + "%" },
  { label: "Tiết kiệm hiện có cho giáo dục", value: (c) => formatVND(c.currentSavings) },
  { label: "Tiết kiệm hàng tháng (dự định)", value: (c) => formatVND(c.monthlySaving) },
  { label: "Tổng số tiền cần cho con học đại học", value: (c, r) => formatVND(r?.targetTotal) },
];

export default function PlanReport({ customerName, income, needs, results, agent, reportDate, onPrint }) {
  const totals = budgetTotals(income);
  const pctStr = (v) => v.toFixed(1);

  return (
    <div className="print-area bg-white border border-[#DED6D8] rounded-[14px] px-4 sm:px-[26px] py-7 max-w-3xl mx-auto text-sm">
      <div className="flex items-center gap-3.5 mb-[22px] pb-4 border-b-2 border-[#FDE8E9]">
        <div className="w-12 h-12 rounded-full bg-[#FDE8E9] flex items-center justify-center shrink-0">
          <PiggyBankIcon className="w-[26px] h-[26px] text-brand" />
        </div>
        <div>
          <h2 className="text-lg font-bold m-0">BÁO CÁO TỔNG QUAN HOẠCH ĐỊNH TÀI CHÍNH</h2>
          <p className="text-gray-400 text-xs mt-1">Ngày lập báo cáo: {reportDate}</p>
        </div>
      </div>
      {customerName && (
        <p className="text-brand font-semibold mt-2">Khách hàng: {customerName}</p>
      )}

      <SectionTitle>Phân bổ thu nhập theo quy tắc 50/30/20</SectionTitle>
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

      <SectionTitle>Nhu cầu ưu tiên hiện nay về tài chính</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
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

      <SectionTitle>Tính toán hoạch định chi tiết cho từng nhu cầu</SectionTitle>
      <p className="text-xs text-gray-400 italic mb-3.5">Đơn vị: VND</p>

      {Object.entries(NEED_META).map(([key, meta]) => {
        const need = needs[key];
        const r = results[key];
        if (!need?.selected) return null;

        return (
          <div key={key} className="mb-[18px]">
            <NeedTitle Icon={meta.Icon} title={meta.title} />

            {key === "protection" && (
              <>
                <Row label="Thu nhập năm hiện tại" value={formatVND((need.monthlyIncome || 0) * 12)} />
                <Row label="Mong muốn bảo vệ thu nhập" value={need.protectPct + "%"} />
                <Row label="Số năm muốn bảo vệ thu nhập" value={need.protectYears + " năm"} />
                <Row label="Tài sản thanh khoản được ngay" value={formatVND(need.liquidAssets)} />
                <Row label="Mệnh giá BHNT đã có" value={formatVND(need.existingInsurance)} />
                <Row label="Khoản vay nợ đang có" value={formatVND(need.existingDebt)} />
                <Row label="Lạm phát" value={need.inflationRate + "%"} />
                <Row label="Lãi suất công cụ tiết kiệm/đầu tư" value={need.investReturnRate + "%"} />
                <Row label="Khoản thiếu hụt cần bảo vệ" value={formatVND(r?.gap)} strong />
              </>
            )}

            {key === "education" && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[12.5px] mb-1">
                  <thead>
                    <tr>
                      <th className="text-left px-2 py-1.5 border-b-2 border-[#DED6D8]"></th>
                      {(need.children || []).map((_, idx) => (
                        <th
                          key={idx}
                          className="text-right px-2 py-1.5 font-bold text-[#312629] border-b-2 border-[#DED6D8] whitespace-nowrap"
                        >
                          Con {idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {EDU_ROWS.map((rowDef) => (
                      <tr key={rowDef.label}>
                        <td className="text-left px-2 py-[5px] border-b border-[#F0F0EE] text-[#5C6B65] whitespace-nowrap">
                          {rowDef.label}
                        </td>
                        {(need.children || []).map((child, idx) => (
                          <td
                            key={idx}
                            className="text-right px-2 py-[5px] border-b border-[#F0F0EE] whitespace-nowrap"
                          >
                            {rowDef.value(child, r?.children?.[idx])}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="text-left px-2 pt-2 pb-1 border-t-2 border-brand font-bold text-[#5C6B65] whitespace-nowrap">
                        Khoản cần tiết kiệm thêm hàng tháng
                      </td>
                      {(need.children || []).map((child, idx) => (
                        <td
                          key={idx}
                          className="text-right px-2 pt-2 pb-1 border-t-2 border-brand font-extrabold text-brand whitespace-nowrap"
                        >
                          {formatVND(r?.children?.[idx]?.requiredMonthly)}/tháng
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {key === "retirement" && (
              <>
                <Row label="Tuổi hiện tại" value={need.currentAge + " tuổi"} />
                <Row label="Tuổi nghỉ hưu" value={need.retireAge + " tuổi"} />
                <Row label="Thời gian hưởng hưu trí" value={need.lifeExpectancyYears + " năm"} />
                <Row label="Sinh hoạt hàng tháng khi nghỉ hưu" value={formatVND(need.monthlyExpenseNow)} />
                <Row label="Tổng tài sản hiện tại dành cho hưu trí" value={formatVND(need.currentSavings)} />
                <Row label="Tiết kiệm hàng tháng hiện tại" value={formatVND(need.monthlySaving)} />
                <Row label="Tỷ lệ lạm phát" value={need.inflation + "%"} />
                <Row label="Tỷ suất sinh lời hàng năm" value={need.investReturn + "%"} />
                <Row label="Tổng khoản tiền cần thiết cho hưu trí" value={formatVND(r?.targetTotal)} />
                <Row label="Khoản cần tiết kiệm hàng tháng" value={formatVND(r?.requiredMonthly) + "/tháng"} strong />
              </>
            )}

            {key === "wealth" && (
              <>
                <Row label="Mục tiêu tiết kiệm/đầu tư" value={formatVND(need.targetAmount)} />
                <Row label="Khoản tiết kiệm hiện có" value={formatVND(need.currentSavings)} />
                <Row label="Dự tính tiết kiệm hàng tháng" value={formatVND(need.monthlySaving)} />
                <Row label="Khoảng thời gian tiết kiệm" value={need.years + " năm"} />
                <Row label="Tỷ lệ lạm phát" value={need.inflationRate + "%"} />
                <Row label="Tỷ suất sinh lời hàng năm" value={need.expectedReturn + "%"} />
                <Row label="Khoản cần tiết kiệm thêm hàng tháng" value={formatVND(r?.requiredMonthly) + "/tháng"} strong />
              </>
            )}

            {key === "health" && (
              <>
                <Row label="Quỹ dự phòng khi mắc bệnh hiểm nghèo" value={formatVND(need.criticalIllnessFund)} />
                <Row label="Quỹ dự phòng khi không may tai nạn" value={formatVND(need.accidentFund)} />
                <Row label="Quỹ dự phòng nếu phải nằm viện điều trị" value={formatVND(need.hospitalFund)} />
                <Row label="Tiền phòng giường viện ưu tiên" value={formatVND(need.roomFeePerDay) + "/ngày"} />
                <Row
                  label="Đã có thẻ sức khỏe rời ngoài BHYT"
                  value={need.hasHealthCard === "da_co" ? "Đã có" : "Chưa có"}
                />
                <Row
                  label="(Nữ giới) Định sinh con nữa"
                  value={
                    need.planMoreChildren === "co"
                      ? "Có"
                      : need.planMoreChildren === "khong"
                      ? "Không"
                      : "Không áp dụng"
                  }
                />
              </>
            )}
          </div>
        );
      })}

      <div
        className="flex items-center gap-4 rounded-xl px-[18px] py-3.5"
        style={{ margin: "24px 0 8px", background: "#FFF5F7", border: "1px solid #F0D0D8" }}
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 border-brand bg-[#FDEAEE] flex items-center justify-center">
          {agent?.avatarDataUrl ? (
            <img src={agent.avatarDataUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">🧑‍💼</span>
          )}
        </div>
        <div className="text-left">
          <div className="text-[13px] font-black text-[#1A0A12] mb-1">{agent?.name}</div>
          {(agent?.phone || agent?.email) && (
            <div className="flex flex-wrap gap-x-3.5 gap-y-0.5 text-[11px] text-[#6E5A5F]">
              {agent?.phone && <span>📞 {agent.phone}</span>}
              {agent?.email && <span>✉️ {agent.email}</span>}
            </div>
          )}
          {agent?.bio && <div className="text-[10px] text-[#8E7A7F] italic mt-1">{agent.bio}</div>}
        </div>
      </div>

      <p className="mt-7 pt-4 border-t border-[#DED6D8] text-[12.5px] text-[#9AA39E] italic text-center">
        "Tiết kiệm là một nghệ thuật lớn hơn cả việc kiếm tiền" - Ngạn ngữ Đức
      </p>

      {onPrint && (
        <button
          onClick={onPrint}
          className="no-print fixed bottom-6 right-6 z-50 bg-[#E57B97] hover:bg-brand text-white rounded-xl px-5 py-3 text-[13px] font-bold shadow-lg flex items-center gap-2"
        >
          <PrinterIcon className="w-4 h-4" />
          In / Lưu PDF
        </button>
      )}
    </div>
  );
}
