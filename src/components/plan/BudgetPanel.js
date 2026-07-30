"use client";

import { formatVND } from "@/lib/finance";
import {
  ESSENTIAL_LABELS,
  NON_ESSENTIAL_LABELS,
  SAVINGS_LABELS,
  budgetTotals,
  budgetComments,
} from "./budgetItems";

function ItemRow({ label, value, onChange, suffix }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-[13px] text-[#4D3F43] flex-1">{label}</label>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-[110px] sm:w-[150px] px-2.5 py-1.5 text-[13px] text-right rounded-lg border border-[#DED6D8] bg-[#FDFBFC] text-[#312629] outline-none focus:border-brand"
        />
        {suffix && <span className="text-xs text-[#9AA39E] w-10 shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function ItemGroup({ title, targetHint, labels, values, onChangeAt }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline flex-wrap gap-1 mb-2">
        <span className="text-[13.5px] font-bold text-[#312629]">{title}</span>
        <span className="text-[11.5px] italic text-[#9AA39E]">{targetHint}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {labels.map((label, idx) => (
          <ItemRow
            key={label}
            label={`${idx + 1}. ${label}`}
            value={values[idx]}
            onChange={(v) => onChangeAt(idx, v)}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div
      className={`flex justify-between py-1.5 text-[13.5px] ${
        strong ? "border-t-2 border-brand mt-1.5 pt-2.5" : "border-b border-[rgba(60,122,106,0.12)]"
      }`}
    >
      <span className="text-[#4D3F43]">{label}</span>
      <span className={strong ? "font-extrabold text-brand text-[16px]" : "font-semibold text-[#312629]"}>
        {value}
      </span>
    </div>
  );
}

function CommentLine({ title, ruleHint, comment }) {
  return (
    <div className="mb-2.5">
      <div className="flex justify-between flex-wrap gap-1 text-[12.5px] font-semibold mb-0.5">
        <span className="text-[#312629]">{title}</span>
        <span className="text-[#6B7876] font-medium">{ruleHint}</span>
      </div>
      <div className={`text-[12.5px] ${comment.warn ? "text-[#E06C5F]" : "text-brand"}`}>{comment.text}</div>
    </div>
  );
}

export default function BudgetPanel({ income, onChange }) {
  const totals = budgetTotals(income);
  const comments = budgetComments(totals);

  function setEssential(idx, v) {
    const next = [...income.essential];
    next[idx] = v;
    onChange({ essential: next });
  }
  function setNonEssential(idx, v) {
    const next = [...income.nonEssential];
    next[idx] = v;
    onChange({ nonEssential: next });
  }
  function setSavings(idx, v) {
    const next = [...income.savings];
    next[idx] = v;
    onChange({ savings: next });
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col">
          <label className="text-[12.5px] font-semibold text-[#5C6B65] mb-1.5">
            Thu nhập ròng bình quân/tháng
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              value={income.monthlyIncome}
              onChange={(e) => onChange({ monthlyIncome: e.target.value === "" ? 0 : Number(e.target.value) })}
              className="w-full px-3 py-2.5 pr-8 text-sm rounded-lg border border-[#DED6D8] bg-[#FDFBFC] text-[#312629] outline-none focus:border-brand"
            />
            <span className="absolute right-3 text-xs text-[#9AA39E] pointer-events-none">đ</span>
          </div>
        </div>
      </div>

      <ItemGroup
        title="A. Nhu cầu thiết yếu"
        targetHint="Mục tiêu: tối đa 50% thu nhập ròng"
        labels={ESSENTIAL_LABELS}
        values={income.essential}
        onChangeAt={setEssential}
      />
      <ItemGroup
        title="B. Các chi phí khác (không thiết yếu)"
        targetHint="Mục tiêu: tối đa 30% thu nhập ròng"
        labels={NON_ESSENTIAL_LABELS}
        values={income.nonEssential}
        onChangeAt={setNonEssential}
      />
      <ItemGroup
        title="C. Tiết kiệm (đầu tư) / Trả nợ"
        targetHint="Mục tiêu: tối thiểu 20% thu nhập ròng"
        labels={SAVINGS_LABELS}
        values={income.savings}
        onChangeAt={setSavings}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col">
          <label className="text-[12.5px] font-semibold text-[#5C6B65] mb-1.5">
            Dự định cho mục tiêu ưu tiên mỗi tháng
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              value={income.monthlyGoal}
              onChange={(e) => onChange({ monthlyGoal: e.target.value === "" ? 0 : Number(e.target.value) })}
              className="w-full px-3 py-2.5 pr-8 text-sm rounded-lg border border-[#DED6D8] bg-[#FDFBFC] text-[#312629] outline-none focus:border-brand"
            />
            <span className="absolute right-3 text-xs text-[#9AA39E] pointer-events-none">đ</span>
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-[12.5px] font-semibold text-[#5C6B65] mb-1.5">
            Dự định cho mục tiêu ưu tiên mỗi năm
          </label>
          <div className="px-3 py-2.5 text-sm rounded-lg border border-[#DED6D8] bg-[#F4F4F2] text-[#5C6B65]">
            {formatVND((income.monthlyGoal || 0) * 12)}
          </div>
        </div>
      </div>

      <div className="bg-[#FDE8E9] rounded-xl px-[18px] py-4">
        <div className="text-sm font-bold text-brand mb-2.5">Tổng hợp phân bổ</div>
        <SummaryRow label="A. Tổng chi nhu cầu thiết yếu" value={formatVND(totals.essentialTotal)} />
        <SummaryRow
          label="Tỷ lệ nhu cầu thiết yếu / thu nhập"
          value={totals.essentialPct.toFixed(1).replace(".", ",") + " %"}
        />
        <SummaryRow label="B. Tổng chi không thiết yếu" value={formatVND(totals.nonEssentialTotal)} />
        <SummaryRow
          label="Tỷ lệ không thiết yếu / thu nhập"
          value={totals.nonEssentialPct.toFixed(1).replace(".", ",") + " %"}
        />
        <SummaryRow label="C. Tổng tiết kiệm/đầu tư/trả nợ" value={formatVND(totals.savingsTotal)} />
        <SummaryRow
          label="Tỷ lệ tiết kiệm / thu nhập"
          value={totals.savingsPct.toFixed(1).replace(".", ",") + " %"}
        />
        <SummaryRow label="Thu nhập khả dụng (sau thiết yếu)" value={formatVND(totals.disposable)} strong />
      </div>

      <div className="mt-3.5">
        <div className="text-sm font-bold text-brand mb-2.5">Nhận xét chung</div>
        <CommentLine
          title="Nhu cầu thiết yếu"
          ruleHint={`Quy tắc ≤ 50% · Bạn đang phân bổ ${totals.essentialPct.toFixed(1)}%`}
          comment={comments.essential}
        />
        <CommentLine
          title="Nhu cầu không thiết yếu"
          ruleHint={`Quy tắc ≤ 30% · Bạn đang phân bổ ${totals.nonEssentialPct.toFixed(1)}%`}
          comment={comments.nonEssential}
        />
        <CommentLine
          title="Trả nợ / Tiết kiệm / Đầu tư"
          ruleHint={`Quy tắc ≥ 20% · Bạn đang phân bổ ${totals.savingsPct.toFixed(1)}%`}
          comment={comments.savings}
        />
      </div>
    </div>
  );
}
