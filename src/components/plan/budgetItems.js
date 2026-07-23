export const ESSENTIAL_LABELS = [
  "Thuê nhà/ Trả góp nhà",
  "Gas",
  "Nước",
  "Điện",
  "Xăng dầu",
  "Thuê bao điện thoại",
  "Bảo hiểm xe hơi",
  "Bảo hiểm y tế",
  "Bảo hiểm nhân thọ",
  "Nhu yếu phẩm cần thiết",
  "Quần áo cần thiết",
  "Giáo dục",
  "Y tế",
  "Phụng dưỡng cha mẹ",
  "Khác (chỉ những chi phí bắt buộc)",
];

export const NON_ESSENTIAL_LABELS = [
  "Giao tế xã hội (ma chay hiếu hỉ)",
  "Du lịch",
  "Quần áo xa xỉ",
  "Các loại thuê bao (TV, Internet, Netflix…)",
  "Khác",
];

export const SAVINGS_LABELS = ["Trả nợ", "Tiết kiệm/đầu tư", "Khác"];

function normalizeList(saved, labels) {
  const arr = Array.isArray(saved) ? saved : [];
  return labels.map((_, idx) => Number(arr[idx]) || 0);
}

export function defaultIncome() {
  return {
    monthlyIncome: 70_000_000,
    essential: ESSENTIAL_LABELS.map(() => 0),
    nonEssential: [5_000_000, 2_000_000, 3_000_000, 500_000, 0],
    savings: [2_000_000, 3_000_000, 0],
    monthlyGoal: 0,
  };
}

export function normalizeIncome(saved) {
  return {
    monthlyIncome: Number(saved?.monthlyIncome) || 0,
    essential: normalizeList(saved?.essential, ESSENTIAL_LABELS),
    nonEssential: normalizeList(saved?.nonEssential, NON_ESSENTIAL_LABELS),
    savings: normalizeList(saved?.savings, SAVINGS_LABELS),
    monthlyGoal: Number(saved?.monthlyGoal) || 0,
  };
}

export function sumList(list) {
  return (list || []).reduce((a, b) => a + (Number(b) || 0), 0);
}

export function budgetTotals(income) {
  const essentialTotal = sumList(income.essential);
  const nonEssentialTotal = sumList(income.nonEssential);
  const savingsTotal = sumList(income.savings);
  const disposable = (income.monthlyIncome || 0) - essentialTotal;
  const pct = (part, whole) => (whole ? (part / whole) * 100 : 0);
  return {
    essentialTotal,
    nonEssentialTotal,
    savingsTotal,
    disposable,
    essentialPct: pct(essentialTotal, income.monthlyIncome),
    nonEssentialPct: pct(nonEssentialTotal, income.monthlyIncome),
    savingsPct: pct(savingsTotal, income.monthlyIncome),
  };
}

export function budgetComments({ essentialPct, nonEssentialPct, savingsPct }) {
  const essential =
    essentialPct <= 50
      ? { text: "Bạn thật tuyệt!", warn: false }
      : { text: "Chi phí thiết yếu đang vượt mức khuyến nghị (>50%), hãy xem xét cắt giảm.", warn: true };

  const nonEssential =
    nonEssentialPct > 30
      ? { text: "Bạn đang chi khá nhiều cho các khoản không thiết yếu, hãy cân nhắc điều chỉnh.", warn: true }
      : nonEssentialPct < 15
      ? {
          text: "Bạn đang đi đúng hướng. Nhưng cũng đừng quá keo kiệt nhé. Hãy cho người thân hưởng nhiều hương vị cuộc đời nữa.",
          warn: false,
        }
      : { text: "Bạn đang chi tiêu hợp lý cho cuộc sống, giữ vững nhé!", warn: false };

  const savings =
    savingsPct < 20
      ? { text: "Coi chừng túng quẫn! Lúc không có tiền thật là bi ai!", warn: true }
      : { text: "Tuyệt vời! Bạn đang xây dựng nền tảng tài chính vững chắc.", warn: false };

  return { essential, nonEssential, savings };
}
