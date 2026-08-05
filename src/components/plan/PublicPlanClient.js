"use client";

import { useMemo, useState } from "react";
import { NumField, SelectField } from "./fields";
import NeedCard from "./NeedCard";
import BudgetPanel from "./BudgetPanel";
import ProtectionResult from "./ProtectionResult";
import EducationPanel from "./EducationPanel";
import RetirementResult from "./RetirementResult";
import WealthResult from "./WealthResult";
import PlanReport from "./PlanReport";
import FinancialSurvey from "./financialSurvey";
import { getDefaultSurveyAnswers } from "./surveyData";
import { defaultIncome } from "./budgetItems";
import { getDefaultNeeds } from "./defaultNeeds";
import { calcAgeFromDOB } from "@/lib/finance";
import {
  WalletIcon,
  ShieldCheckIcon,
  GraduationCapIcon,
  PiggyBankIcon,
  TrendingUpIcon,
  HeartPulseIcon,
} from "./icons";
import {
  calcProtection,
  calcEducation,
  calcRetirement,
  calcWealth,
  calcHealth,
} from "@/lib/planCalculations";

export default function PublicPlanClient({ agent, token }) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerDob, setCustomerDob] = useState("");
  const [customerGender, setCustomerGender] = useState("");

  const [income, setIncome] = useState(defaultIncome);
  const [needs, setNeeds] = useState(getDefaultNeeds);
  const [surveyAnswers, setSurveyAnswers] = useState(getDefaultSurveyAnswers);
  const [budgetOpen, setBudgetOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saved, setSaved] = useState(false);
  const [showReport, setShowReport] = useState(false);

  function updateNeed(key, patch) {
    setNeeds((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  const results = useMemo(
    () => ({
      protection: needs.protection.selected ? calcProtection(needs.protection) : null,
      education: needs.education.selected ? calcEducation(needs.education.children) : null,
      retirement: needs.retirement.selected ? calcRetirement(needs.retirement) : null,
      wealth: needs.wealth.selected ? calcWealth(needs.wealth) : null,
      health: needs.health.selected ? calcHealth(needs.health) : null,
    }),
    [needs]
  );

  const totalGap = useMemo(() => {
    return Object.entries(results).reduce((sum, [key, r]) => {
      if (!r) return sum;
      const gap = r.gap ?? 0;
      return sum + Math.max(gap, 0);
    }, 0);
  }, [results]);

  async function handleSave() {
    if (!customerName.trim()) {
      setSaveMsg("Vui lòng nhập tên của bạn trước khi lưu.");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    const res = await fetch("/api/public/plan-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim(),
        dob: customerDob,
        gender: customerGender,
        expectedFee: Math.round(totalGap / 1_000_000),
        financialPlan: { income, needs, surveyAnswers, computedAt: new Date().toISOString() },
      }),
    });
    setSaving(false);
    const data = await res.json();
    if (!res.ok) {
      setSaveMsg(data.error || "Không thể gửi. Vui lòng thử lại.");
      return;
    }
    setSaved(true);
    setSaveMsg("Đã gửi thông tin cho tư vấn viên, cảm ơn bạn! ✔");
  }

  function handlePrint() {
    window.print();
  }

  const reportDate = new Intl.DateTimeFormat("vi-VN").format(new Date());

  return (
    <div className="space-y-6">
      {showReport && (
        <div className="no-print flex justify-between mb-4 max-w-[760px] mx-auto w-full">
          <button
            type="button"
            onClick={() => setShowReport(false)}
            className="rounded-lg bg-[#0000C1] hover:bg-[#00009c] text-white font-semibold text-[13px] px-4 py-2 transition"
          >
            ← Quay lại
          </button>
        </div>
      )}

      {!showReport && (
        <div className="no-print bg-[#F5F1F2] rounded-2xl px-4 sm:px-6 py-8">
          <div className="max-w-[760px] mx-auto space-y-3.5">
            <header className="flex items-center gap-4 mb-4">
              <div className="w-[52px] h-[52px] rounded-full bg-brand flex items-center justify-center shrink-0">
                <PiggyBankIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-[24px] font-bold text-[#312629] m-0">Hoạch Định Tài Chính</h1>
                <p className="mt-1 text-sm text-[#6B7876]">
                  {agent?.name
                    ? `Điền thông tin bên dưới để tư vấn viên ${agent.name} đồng hành cùng bạn`
                    : "Xác định và tính toán 5 nhu cầu tài chính của bạn"}
                </p>
              </div>
            </header>

            <div className="bg-white border border-[#DED6D8] rounded-[14px] p-[18px] space-y-3">
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1">Tên của bạn *</span>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nhập họ tên..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-700 mb-1">Ngày sinh</span>
                  <input type="date" value={customerDob} onChange={(e) => setCustomerDob(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-700 mb-1">Giới tính</span>
                  <select value={customerGender} onChange={(e) => setCustomerGender(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Chưa chọn</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                    <option value="Khác">Khác</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại</span>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="09xxxxxxxx"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-700 mb-1">Email</span>
                  <input
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="ban@email.com"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </div>

            <FinancialSurvey answers={surveyAnswers} onChange={setSurveyAnswers} />

            <div className="bg-white border border-[#DED6D8] rounded-[14px] p-[18px]">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-brand flex items-center justify-center shrink-0">
                    <WalletIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-[#312629]">Chi tiêu 50/30/20</p>
                    <p className="text-[13px] text-[#6B7876] mt-0.5">
                      Phân bổ thu nhập theo quy tắc 50/30/20 của Elizabeth Warren
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBudgetOpen((v) => !v)}
                  className={
                    budgetOpen
                      ? "text-sm font-semibold px-[18px] py-2 rounded-lg border border-[#DED6D8] bg-transparent text-[#312629]"
                      : "text-sm font-semibold px-[18px] py-2 rounded-lg border border-brand bg-brand text-white"
                  }
                >
                  {budgetOpen ? "Thu gọn" : "Hoạch định"}
                </button>
              </div>
              {budgetOpen && (
                <BudgetPanel income={income} onChange={(patch) => setIncome((p) => ({ ...p, ...patch }))} />
              )}
            </div>

            <NeedCard
              icon={<ShieldCheckIcon className="w-5 h-5 text-white" />}
              title="1. Bảo vệ tài chính cho người thân"
              subtitle="Chu cấp cho người thân khi không may có biến cố"
              selected={needs.protection.selected}
              onToggle={(v) => updateNeed("protection", { selected: v })}
            >
              <NumField label="Thu nhập hàng tháng hiện tại" value={needs.protection.monthlyIncome} onChange={(v) => updateNeed("protection", { monthlyIncome: v })} suffix="đ" />
              <NumField label="Mong muốn bảo vệ thu nhập (% hiện tại)" value={needs.protection.protectPct} onChange={(v) => updateNeed("protection", { protectPct: v })} suffix="%" />
              <NumField label="Số năm muốn bảo vệ thu nhập" value={needs.protection.protectYears} onChange={(v) => updateNeed("protection", { protectYears: v })} suffix="năm" hint="Thường 10-20 năm" />
              <NumField label="Tài sản thanh khoản được ngay" value={needs.protection.liquidAssets} onChange={(v) => updateNeed("protection", { liquidAssets: v })} suffix="đ" />
              <NumField label="Bảo hiểm nhân thọ đã có" value={needs.protection.existingInsurance} onChange={(v) => updateNeed("protection", { existingInsurance: v })} suffix="đ" />
              <NumField label="Khoản vay nợ đang có" value={needs.protection.existingDebt} onChange={(v) => updateNeed("protection", { existingDebt: v })} suffix="đ" />
              <NumField label="Lạm phát" value={needs.protection.inflationRate} onChange={(v) => updateNeed("protection", { inflationRate: v })} suffix="%" />
              <NumField label="Lãi suất tiền gửi hàng năm" value={needs.protection.investReturnRate} onChange={(v) => updateNeed("protection", { investReturnRate: v })} suffix="%" />
              <ProtectionResult need={needs.protection} result={results.protection} />
            </NeedCard>

            <NeedCard
              icon={<GraduationCapIcon className="w-5 h-5 text-white" />}
              title="2. Quỹ học đại học cho con"
              subtitle="Tích lũy chi phí giáo dục đại học"
              selected={needs.education.selected}
              onToggle={(v) => updateNeed("education", { selected: v })}
            >
              <EducationPanel education={needs.education} onChange={(patch) => updateNeed("education", patch)} />
            </NeedCard>

            <NeedCard
              icon={<PiggyBankIcon className="w-5 h-5 text-white" />}
              title="3. Quỹ hưu trí"
              subtitle="Tích lũy cho tương lai khi nghỉ hưu"
              selected={needs.retirement.selected}
              onToggle={(v) => updateNeed("retirement", { selected: v })}
            >
              <NumField label="Tuổi hiện tại" value={needs.retirement.currentAge} onChange={(v) => updateNeed("retirement", { currentAge: v })} suffix="tuổi" />
              <NumField label="Tuổi nghỉ hưu" value={needs.retirement.retireAge} onChange={(v) => updateNeed("retirement", { retireAge: v })} suffix="tuổi" />
              <NumField label="Thời gian hưởng hưu trí" value={needs.retirement.lifeExpectancyYears} onChange={(v) => updateNeed("retirement", { lifeExpectancyYears: v })} suffix="năm" hint="VD: 20 năm" />
              <NumField label="Sinh hoạt hàng tháng khi nghỉ hưu (thời giá hiện tại)" value={needs.retirement.monthlyExpenseNow} onChange={(v) => updateNeed("retirement", { monthlyExpenseNow: v })} suffix="đ" />
              <NumField label="Tổng tài sản hiện có dành cho hưu trí" value={needs.retirement.currentSavings} onChange={(v) => updateNeed("retirement", { currentSavings: v })} suffix="đ" />
              <NumField label="Tiết kiệm hàng tháng hiện tại" value={needs.retirement.monthlySaving} onChange={(v) => updateNeed("retirement", { monthlySaving: v })} suffix="đ" />
              <NumField label="Tỷ lệ lạm phát" value={needs.retirement.inflation} onChange={(v) => updateNeed("retirement", { inflation: v })} suffix="%" />
              <NumField label="Lãi suất hàng năm" value={needs.retirement.investReturn} onChange={(v) => updateNeed("retirement", { investReturn: v })} suffix="%" hint="Tiền gửi, chứng khoán..." />
              <RetirementResult need={needs.retirement} result={results.retirement} />
            </NeedCard>

            <NeedCard
              icon={<TrendingUpIcon className="w-5 h-5 text-white" />}
              title="4. Gia tăng tài sản"
              subtitle="Đầu tư/tiết kiệm cho mục tiêu lớn"
              selected={needs.wealth.selected}
              onToggle={(v) => updateNeed("wealth", { selected: v })}
            >
              <NumField label="Mục tiêu tiết kiệm/đầu tư" value={needs.wealth.targetAmount} onChange={(v) => updateNeed("wealth", { targetAmount: v })} suffix="đ" />
              <NumField label="Khoản tiết kiệm/đầu tư hiện có" value={needs.wealth.currentSavings} onChange={(v) => updateNeed("wealth", { currentSavings: v })} suffix="đ" />
              <NumField label="Dự tính tiết kiệm hàng tháng" value={needs.wealth.monthlySaving} onChange={(v) => updateNeed("wealth", { monthlySaving: v })} suffix="đ" />
              <NumField label="Thời gian tiết kiệm/đầu tư" value={needs.wealth.years} onChange={(v) => updateNeed("wealth", { years: v })} suffix="năm" />
              <NumField label="Tỷ lệ lạm phát" value={needs.wealth.inflationRate} onChange={(v) => updateNeed("wealth", { inflationRate: v })} suffix="%" />
              <NumField label="Lãi suất hàng năm" value={needs.wealth.expectedReturn} onChange={(v) => updateNeed("wealth", { expectedReturn: v })} suffix="%" hint="Tiền gửi, chứng khoán..." />
              <WealthResult need={needs.wealth} result={results.wealth} />
            </NeedCard>

            <NeedCard
              icon={<HeartPulseIcon className="w-5 h-5 text-white" />}
              title="5. Quỹ chăm sóc sức khỏe"
              subtitle="Khảo sát nhu cầu bảo vệ sức khỏe"
              selected={needs.health.selected}
              onToggle={(v) => updateNeed("health", { selected: v })}
            >
              <NumField label="Quỹ dự phòng khi mắc bệnh hiểm nghèo" value={needs.health.criticalIllnessFund} onChange={(v) => updateNeed("health", { criticalIllnessFund: v })} suffix="đ" />
              <NumField label="Quỹ dự phòng khi không may tai nạn" value={needs.health.accidentFund} onChange={(v) => updateNeed("health", { accidentFund: v })} suffix="đ" />
              <NumField label="Quỹ dự phòng nếu phải nằm viện điều trị" value={needs.health.hospitalFund} onChange={(v) => updateNeed("health", { hospitalFund: v })} suffix="đ" />
              <NumField label="Tiền phòng giường viện ưu tiên" value={needs.health.roomFeePerDay} onChange={(v) => updateNeed("health", { roomFeePerDay: v })} suffix="đ/ngày" />
              <SelectField
                label="Đã có thẻ sức khỏe rời ngoài BHYT Nhà nước?"
                value={needs.health.hasHealthCard}
                onChange={(v) => updateNeed("health", { hasHealthCard: v })}
                options={[
                  { value: "da_co", label: "Đã có" },
                  { value: "chua_co", label: "Chưa có" },
                ]}
              />
              <SelectField
                label="(Nữ giới) Có định sinh con nữa không?"
                value={needs.health.planMoreChildren}
                onChange={(v) => updateNeed("health", { planMoreChildren: v })}
                options={[
                  { value: "co", label: "Có" },
                  { value: "khong", label: "Không" },
                  { value: "khong_ap_dung", label: "Không áp dụng" },
                ]}
              />
            </NeedCard>

            <button
              type="button"
              onClick={() => {
                if (!saved) handleSave();
                setShowReport(true);
              }}
              disabled={saving}
              className="w-full rounded-full bg-[#1D1466] hover:bg-[#150F4D] text-white font-bold text-[15px] py-3.5 transition disabled:opacity-60"
            >
              {saving ? "Đang gửi..." : saved ? "Xem lại báo cáo tổng quan" : "Lưu và xem báo cáo tổng quan"}
            </button>
            {saveMsg && <p className="text-sm text-gray-600 text-center">{saveMsg}</p>}
          </div>
        </div>
      )}

      {showReport && (
        <PlanReport
          customerName={customerName}
          customer={{
            name: customerName,
            dob: customerDob,
            age: customerDob ? calcAgeFromDOB(customerDob) : null,
            gender: customerGender,
            phone: customerPhone,
            email: customerEmail,
          }}
          income={income}
          needs={needs}
          surveyAnswers={surveyAnswers}
          results={results}
          agent={agent}
          reportDate={reportDate}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
}
