// Toàn bộ tỷ lệ/phí trong file này là SỐ MINH HỌA tự ước lượng cho mục đích
// demo giao diện, KHÔNG phải bảng phí chính thức của bất kỳ công ty bảo hiểm
// nào. Số phí thật phụ thuộc bảng tỷ lệ nội bộ của công ty bảo hiểm.
import { toNumber, calcAgeFromDOB } from "./finance";

// Tuổi thực tế dùng cho mọi phép tính: ưu tiên suy từ ngày sinh (so với ngày
// thiết kế phương án) nếu có, nếu không thì dùng tuổi nhập tay.
export function getEffectiveAge(person, designDate) {
  if (person.dob) {
    const age = calcAgeFromDOB(person.dob, designDate);
    if (age != null) return age;
  }
  return toNumber(person.age);
}

export const OCCUPATION_CLASSES = [
  { value: 1, label: "Nhóm 1 — Văn phòng, ít rủi ro", accidentMultiplier: 1 },
  { value: 2, label: "Nhóm 2 — Rủi ro nhẹ (bán hàng, kỹ thuật viên...)", accidentMultiplier: 1.5 },
  { value: 3, label: "Nhóm 3 — Rủi ro trung bình (thợ, tài xế...)", accidentMultiplier: 2.2 },
  { value: 4, label: "Nhóm 4 — Rủi ro cao (xây dựng, khai thác...)", accidentMultiplier: 3.5 },
];

export const HEALTH_CARD_TIERS = {
  inpatient: [
    { tier: "Cơ bản", limit: 150_000_000, feeVN: 3_200_000, feeGlobal: 5_600_000 },
    { tier: "Nâng cao", limit: 350_000_000, feeVN: 5_500_000, feeGlobal: 9_600_000 },
    { tier: "Toàn diện", limit: 700_000_000, feeVN: 9_000_000, feeGlobal: 15_800_000 },
    { tier: "Hoàn hảo", limit: 1_200_000_000, feeVN: 14_000_000, feeGlobal: 24_500_000 },
  ],
  outpatient: [
    { tier: "Cơ bản", limit: 6_000_000, fee: 1_800_000 },
    { tier: "Nâng cao", limit: 12_000_000, fee: 3_200_000 },
    { tier: "Toàn diện", limit: 24_000_000, fee: 5_600_000 },
    { tier: "Hoàn hảo", limit: 48_000_000, fee: 9_800_000 },
  ],
  dental: [
    { tier: "Cơ bản", limit: 2_000_000, fee: 600_000 },
    { tier: "Nâng cao", limit: 4_000_000, fee: 1_100_000 },
    { tier: "Toàn diện", limit: 6_000_000, fee: 1_700_000 },
    { tier: "Hoàn hảo", limit: 10_000_000, fee: 2_600_000 },
  ],
};

// Tỷ lệ phí rủi ro minh họa theo tuổi (trên 1.000đ STBH/năm) — dùng chung cho
// tử kỳ & bệnh hiểm nghèo, tăng dần theo tuổi giống cơ chế tái tục hàng năm.
// Hàm mũ được khớp (hồi quy log-tuyến-tính) từ 31 điểm dữ liệu tuổi 36–66 của
// bảng minh họa GTTK tham chiếu (sai số <2% trong suốt vùng đã khớp).
const MORTALITY_BASE = 0.081969;
const MORTALITY_GROWTH = 0.08511;
const FEMALE_MORTALITY_RATIO = 0.76;

export function getMortalityRate(age, gender) {
  const rate = MORTALITY_BASE * Math.exp(MORTALITY_GROWTH * toNumber(age));
  return gender === "Nữ" ? rate * FEMALE_MORTALITY_RATIO : rate;
}

export function calcHealthCardFee(type, tier, scope) {
  const table = HEALTH_CARD_TIERS[type];
  if (!table) return 0;
  const row = table.find((t) => t.tier === tier);
  if (!row) return 0;
  if (type === "inpatient") {
    return scope === "global" ? row.feeGlobal : row.feeVN;
  }
  return row.fee;
}

export function calcHospitalCashFee(amountPerDay) {
  // Ước lượng: đơn giá/ngày × 300 (xấp xỉ chi phí rủi ro cho quyền lợi trợ cấp).
  return toNumber(amountPerDay) * 300;
}

export function calcCriticalIllnessFee(age, gender, sumInsured) {
  const rate = getMortalityRate(age, gender) * 2.2; // bệnh hiểm nghèo có xác suất chi trả cao hơn tử kỳ thuần
  return (toNumber(sumInsured) / 1000) * rate;
}

export function calcTermLifeFee(age, gender, sumInsured) {
  const rate = getMortalityRate(age, gender);
  return (toNumber(sumInsured) / 1000) * rate;
}

export function calcAccidentFee(occupationClass, sumInsured) {
  const cls = OCCUPATION_CLASSES.find((o) => o.value === Number(occupationClass)) || OCCUPATION_CLASSES[0];
  return (toNumber(sumInsured) / 1000) * 0.4 * cls.accidentMultiplier;
}

export function calcWaiverFee(totalFamilyPremium) {
  // Ước lượng: phí miễn đóng ~ 3% tổng phí cả gia đình mỗi năm.
  return toNumber(totalFamilyPremium) * 0.03;
}

const DEFAULT_RIDERS = () => ({
  healthCardInpatient: { enabled: false, tier: "Cơ bản", scope: "vn" },
  healthCardOutpatient: { enabled: false, tier: "Cơ bản" },
  healthCardDental: { enabled: false, tier: "Cơ bản" },
  hospitalCash: { enabled: false, amountPerDay: 0 },
  criticalIllness: { enabled: false, sumInsured: 0 },
  termLife: { enabled: false, sumInsured: 0 },
  accident: { enabled: false, sumInsured: 0 },
  waiver: { enabled: false },
});

export function defaultPerson(role) {
  return {
    role, // "main" | "attached"
    name: "",
    dob: "",
    age: role === "main" ? 30 : 10,
    gender: "Nam",
    occupationName: "",
    occupationClass: 1,
    riders: DEFAULT_RIDERS(),
  };
}

// Tính phí các quyền lợi đính kèm của 1 người (không gồm sản phẩm chính).
// `familyPremiumWithoutWaiver` dùng để tính phí miễn đóng (áp lên tổng phí cả nhà).
export function calcPersonRiders(person, familyPremiumWithoutWaiver, designDate) {
  const rows = [];
  const r = person.riders;
  const age = getEffectiveAge(person, designDate);

  if (r.healthCardInpatient.enabled) {
    const limit = HEALTH_CARD_TIERS.inpatient.find((t) => t.tier === r.healthCardInpatient.tier)?.limit || 0;
    rows.push({
      key: "healthCardInpatient",
      label: "Thẻ SK Trọn Đời — Nội trú",
      sumInsured: limit,
      fee: calcHealthCardFee("inpatient", r.healthCardInpatient.tier, r.healthCardInpatient.scope),
    });
  }
  if (r.healthCardOutpatient.enabled) {
    const limit = HEALTH_CARD_TIERS.outpatient.find((t) => t.tier === r.healthCardOutpatient.tier)?.limit || 0;
    rows.push({
      key: "healthCardOutpatient",
      label: "Thẻ SK Trọn Đời — Ngoại trú",
      sumInsured: limit,
      fee: calcHealthCardFee("outpatient", r.healthCardOutpatient.tier),
    });
  }
  if (r.healthCardDental.enabled) {
    const limit = HEALTH_CARD_TIERS.dental.find((t) => t.tier === r.healthCardDental.tier)?.limit || 0;
    rows.push({
      key: "healthCardDental",
      label: "Thẻ SK Trọn Đời — Nha khoa",
      sumInsured: limit,
      fee: calcHealthCardFee("dental", r.healthCardDental.tier),
    });
  }
  if (r.hospitalCash.enabled) {
    rows.push({
      key: "hospitalCash",
      label: "Hỗ trợ chi phí nằm viện",
      sumInsured: toNumber(r.hospitalCash.amountPerDay),
      fee: calcHospitalCashFee(r.hospitalCash.amountPerDay),
      unit: "đ/ngày",
    });
  }
  if (r.criticalIllness.enabled) {
    rows.push({
      key: "criticalIllness",
      label: "Bệnh hiểm nghèo 2.0",
      sumInsured: toNumber(r.criticalIllness.sumInsured),
      fee: calcCriticalIllnessFee(age, person.gender, r.criticalIllness.sumInsured),
    });
  }
  if (r.termLife.enabled) {
    rows.push({
      key: "termLife",
      label: "Tử kỳ gia hạn hàng năm",
      sumInsured: toNumber(r.termLife.sumInsured),
      fee: calcTermLifeFee(age, person.gender, r.termLife.sumInsured),
    });
  }
  if (r.accident.enabled) {
    rows.push({
      key: "accident",
      label: "Tử vong & thương tật do tai nạn",
      sumInsured: toNumber(r.accident.sumInsured),
      fee: calcAccidentFee(person.occupationClass, r.accident.sumInsured),
    });
  }
  if (r.waiver.enabled) {
    rows.push({
      key: "waiver",
      label: "Miễn đóng phí 3.0",
      sumInsured: null,
      fee: calcWaiverFee(familyPremiumWithoutWaiver),
    });
  }

  const total = rows.reduce((s, row) => s + row.fee, 0);
  return { rows, total };
}

// Bảng giá trị tài khoản minh họa cho sản phẩm chính, chạy suốt vòng đời hợp
// đồng (không dừng ở cuối thời hạn đóng phí) cho tới khi mất hiệu lực hoặc đạt
// tuổi 99. Các bậc phân bổ/phí quản lý/lãi suất dưới đây được khớp từ bảng
// GTTK của bản minh họa tham chiếu (Vững Tương Lai, nam 36 tuổi, STBH 1 tỷ,
// phí 10tr/năm, đóng 20 năm) — vẫn là số MINH HỌA, không phải bảng phí chính
// thức của công ty bảo hiểm.
const MAX_PROJECTION_AGE = 99;

function allocationRate(year) {
  const table = [0.5, 0.7, 0.8, 0.8, 0.8, 0.98, 0.98, 0.98, 0.98, 0.98];
  return table[year - 1] ?? 1.0;
}

function adminFeeAnnual(year) {
  if (year <= 3) return 480_000;
  if (year === 4) return 540_000;
  if (year <= 8) return 600_000;
  if (year === 9) return 660_000;
  return 720_000;
}

function loyaltyBonus(year, premium, term) {
  return year >= 5 && year <= term ? premium * 0.03 : 0;
}

// Lãi suất cam kết theo năm hợp đồng: 3.5% → 3.0% → 2.0% → 1.5% → 1.0% → 0.5%.
export function guaranteedRateForYear(year) {
  if (year === 1) return 0.035;
  if (year <= 3) return 0.03;
  if (year <= 5) return 0.02;
  if (year <= 10) return 0.015;
  if (year <= 15) return 0.01;
  return 0.005;
}

// Phí hủy hợp đồng (nếu rút GTTK sớm), theo % phí đóng năm, giảm dần rồi về 0.
export function surrenderChargeRate(year) {
  if (year <= 2) return null; // chưa có giá trị hoàn lại
  if (year === 3) return 0.45;
  if (year === 4) return 0.3;
  if (year === 5) return 0.2;
  return 0;
}

export function calcAccountValue({ sumInsured, annualPremium, age, gender, paymentTerm, illustratedRate, illustratedRateAfterTerm }) {
  const premium = toNumber(annualPremium);
  const term = Math.max(toNumber(paymentTerm), 1);
  const startAge = toNumber(age);
  const illuRate = toNumber(illustratedRate) / 100;
  const illuRateAfterTerm = illustratedRateAfterTerm != null && illustratedRateAfterTerm !== "" ? toNumber(illustratedRateAfterTerm) / 100 : null;

  function project(rateForYear) {
    const rows = [];
    let value = 0;
    let cumulativePremium = 0;
    let breakEvenYear = null;
    let lapseYear = null;
    let year = 1;

    while (startAge + year - 1 <= MAX_PROJECTION_AGE) {
      const currentAge = startAge + year - 1;
      const isPaying = year <= term;
      const yearPremium = isPaying ? premium : 0;
      const allocated = yearPremium * allocationRate(year);
      cumulativePremium += yearPremium;

      const mortalityRate = getMortalityRate(currentAge, gender);
      const netAmountAtRisk = Math.max(toNumber(sumInsured) - value, 0);
      const coi = (netAmountAtRisk / 1000) * mortalityRate;
      const adminFee = adminFeeAnnual(year);
      const bonus = loyaltyBonus(year, premium, term);
      const rate = rateForYear(year);

      const nextValue = (value + allocated + bonus - coi - adminFee) * (1 + rate);
      const surrenderRate = surrenderChargeRate(year);

      if (nextValue <= 0) {
        lapseYear = year;
        rows.push({ year, age: currentAge, premium: yearPremium, allocated, coi, adminFee, bonus, cumulativePremium, accountValue: 0, surrenderValue: 0, lapsed: true });
        break;
      }

      value = nextValue;
      if (breakEvenYear === null && value >= cumulativePremium) breakEvenYear = year;

      rows.push({
        year,
        age: currentAge,
        premium: yearPremium,
        allocated,
        coi,
        adminFee,
        bonus,
        cumulativePremium,
        accountValue: value,
        surrenderValue: surrenderRate == null ? null : Math.max(value - premium * surrenderRate, 0),
        lapsed: false,
      });
      year++;
    }

    return { rows, breakEvenYear, lapseYear, finalValue: value };
  }

  const guaranteed = project((year) => guaranteedRateForYear(year));
  const illustrated = project((year) => (year <= term ? illuRate : illuRateAfterTerm ?? guaranteedRateForYear(year)));

  const valueAtYear = (proj, y) => proj.rows.find((r) => r.year === y && !r.lapsed)?.accountValue ?? null;

  return {
    guaranteed,
    illustrated,
    checkpoints: {
      guaranteedYear15: valueAtYear(guaranteed, 15),
      guaranteedYear20: valueAtYear(guaranteed, 20),
      illustratedYear15: valueAtYear(illustrated, 15),
      illustratedYear20: valueAtYear(illustrated, 20),
    },
    // rétro-compat cho code cũ đang đọc rows/breakEvenYear/finalGuaranteed/finalIllustrated
    rows: illustrated.rows,
    breakEvenYear: illustrated.breakEvenYear,
    finalGuaranteed: guaranteed.finalValue,
    finalIllustrated: illustrated.finalValue,
  };
}

// 7 sản phẩm chính có thể chọn trong bản minh họa.
export const MAIN_PRODUCTS = [
  "Vững Tương Lai",
  "Khỏe Bình An",
  "Khỏe Trọn Vẹn - Bền Vững",
  "Khỏe Trọn Vẹn - Tối Ưu",
  "Khỏe Trọn Vẹn - Toàn Diện",
  "Khỏe Trọn Vẹn - Trọn Đời",
  "Trọn Bình An",
];

// TTTBVV do ung thư tuyến giáp giai đoạn sớm: chi trả 1 lần 10% STBH, tối đa
// 200 triệu đ/NĐBH.
export function calcThyroidEarlyStageBenefit(sumInsured) {
  return Math.min(toNumber(sumInsured) * 0.1, 200_000_000);
}

// Lãi suất tích lũy Quỹ liên kết chung được công bố 5 năm gần nhất (số MINH HỌA).
export const HISTORICAL_CREDITING_RATES = [
  { year: 2021, rate: 4.86 },
  { year: 2022, rate: 4.23 },
  { year: 2023, rate: 4.93 },
  { year: 2024, rate: 4.79 },
  { year: 2025, rate: 4.23 },
];

// Danh sách nghề nghiệp mẫu để tìm kiếm/tự động suy ra loại nghề (nhóm 1-4).
export const OCCUPATION_SEARCH_LIST = [
  { name: "Nhân viên văn phòng", classValue: 1 },
  { name: "Kế toán", classValue: 1 },
  { name: "Giáo viên", classValue: 1 },
  { name: "Lập trình viên / IT", classValue: 1 },
  { name: "Bác sĩ (khám phòng khám)", classValue: 1 },
  { name: "Luật sư", classValue: 1 },
  { name: "Nhân viên ngân hàng", classValue: 1 },
  { name: "Nhân viên bán hàng", classValue: 2 },
  { name: "Kỹ thuật viên", classValue: 2 },
  { name: "Đầu bếp", classValue: 2 },
  { name: "Hướng dẫn viên du lịch", classValue: 2 },
  { name: "Thợ may", classValue: 2 },
  { name: "Tài xế công nghệ (ô tô)", classValue: 3 },
  { name: "Thợ điện", classValue: 3 },
  { name: "Thợ sửa chữa ô tô", classValue: 3 },
  { name: "Ngư dân (gần bờ)", classValue: 3 },
  { name: "Công nhân nhà máy", classValue: 3 },
  { name: "Thợ xây dựng", classValue: 4 },
  { name: "Thợ hàn/thợ khai thác mỏ", classValue: 4 },
  { name: "Ngư dân (xa bờ)", classValue: 4 },
  { name: "Phi công/lính cứu hỏa", classValue: 4 },
];

export function searchOccupations(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  return OCCUPATION_SEARCH_LIST.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 8);
}
