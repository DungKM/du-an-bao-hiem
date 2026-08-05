"use client";

import { FINANCIAL_SURVEY_QUESTIONS } from "./surveyData";

export default function FinancialSurvey({ answers, onChange }) {
  function toggle(questionId, optionId) {
    const current = answers?.[questionId] || [];
    onChange({
      ...answers,
      [questionId]: current.includes(optionId)
        ? current.filter((value) => value !== optionId)
        : [...current, optionId],
    });
  }

  return (
    <section className="space-y-4" aria-label="Câu hỏi khảo sát tài chính">
      <div>
        <h2 className="text-[18px] font-bold text-[#312629]">Câu hỏi khảo sát tài chính</h2>
        <p className="text-[13px] text-[#6B7876] mt-1">Có thể chọn nhiều câu trả lời phù hợp với khách hàng.</p>
      </div>

      {FINANCIAL_SURVEY_QUESTIONS.map((question) => (
        <fieldset key={question.id} className="bg-white border border-[#E2D6DA] rounded-[14px] overflow-hidden">
          <legend className="sr-only">Câu hỏi {question.number}: {question.title}</legend>
          <div className="bg-[#D31145] text-white font-bold text-[14px] px-4 py-3">
            Câu hỏi {question.number}: {question.title}
          </div>
          <div className="px-4 py-2.5 divide-y divide-[#EEF2EF]">
            {question.options.map((option) => {
              const checked = (answers?.[question.id] || []).includes(option.id);
              return (
                <label key={option.id} className="flex items-start gap-3 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(question.id, option.id)}
                    className="mt-0.5 h-4 w-4 accent-[#D31145] shrink-0"
                  />
                  <span>
                    <span className="block text-[14px] font-bold text-[#303633]">{option.label}</span>
                    <span className="block text-[12.5px] leading-5 text-[#68716C] mt-0.5">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </section>
  );
}
