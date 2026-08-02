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

// Chi tiết quyền lợi thẻ SK Trọn Đời — Nội trú (hạng "Cơ bản", hạn mức năm
// 150 triệu), lấy từ bảng minh họa tham chiếu. Các hạng khác được quy đổi tỷ
// lệ theo hạn mức năm (Nâng cao/Toàn diện/Hoàn hảo so với Cơ bản).
export const INPATIENT_BENEFIT_ITEMS = [
  { label: "Phí năm hợp đồng đầu tiên", isFee: true, italic: true },
  { label: "Hạn mức mỗi năm HĐ (nhân đôi bảo vệ BV công khi đã chi hết)", useTierLimit: true },
  { label: "Phòng, giường bệnh (tối đa 100 ngày/năm)", base: 850_000 },
  { label: "Phòng chăm sóc đặc biệt (tối đa 30 ngày/năm)", text: "Chi phí thực tế" },
  {
    label: "Giường dành cho người thân (tối đa 30 ngày/năm)",
    sub: "Chỉ áp dụng 1 người thân lưu lại cùng NĐBH < 18 tuổi hoặc NĐBH ≥ 70 tuổi",
    base: 150_000,
  },
  { label: "Hỗ trợ chi phí nằm viện khi sử dụng BHYT (tối đa 30 ngày/năm)", base: 150_000 },
  { label: "Phẫu thuật (tối đa 30 ngày trước NV; 2 lần khám/đợt điều trị)", text: "Chi phí thực tế" },
  { label: "Điều trị trước khi nhập viện (tối đa 60 ngày trước khi nhập viện)", text: "Chi phí thực tế" },
  { label: "Điều trị sau khi nhập viện", text: "Chi phí thực tế" },
  { label: "Chi phí y tế nội trú khác", text: "Chi phí thực tế" },
  { label: "Dịch vụ chăm sóc y tế tại nhà (tối đa 30 ngày/năm)", base: 150_000 },
  { label: "Cho người được phép ghép tạng (NĐBH)", text: "Chi phí thực tế" },
  { label: "Cho người hiến tạng (không phải NĐBH)", text: "50% chi phí phẫu thuật" },
  { label: "Phẫu thuật thủ thuật trong ngày", text: "Chi phí thực tế" },
  { label: "Điều trị trong ngày: viêm phế quản, sốt xuất huyết, cúm, viêm phổi (tối đa 3 lần/năm)", base: 1_500_000 },
  { label: "Lọc máu", base: 5_000_000 },
  { label: "Điều trị giảm nhẹ", text: "Không áp dụng" },
  { label: "Điều trị ung thư", text: "Chi phí thực tế" },
  { label: "Điều trị cấp cứu do tai nạn hoặc bệnh", base: 3_000_000 },
  { label: "Vận chuyển cấp cứu do tai nạn hoặc bệnh", base: 1_500_000 },
];

const INPATIENT_BASE_LIMIT = 150_000_000;

export function calcInpatientBenefitValue(item, tier) {
  const tierRow = HEALTH_CARD_TIERS.inpatient.find((t) => t.tier === tier);
  if (!tierRow) return null;
  if (item.text) return item.text;
  if (item.useTierLimit) return tierRow.limit;
  const scale = tierRow.limit / INPATIENT_BASE_LIMIT;
  return Math.round((item.base * scale) / 1000) * 1000;
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
    name: role === "main" ? "Trần Văn Huy" : "",
    dob: role === "main" ? "1990-01-01" : "",
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

// Giá trị tài khoản dự kiến tại đúng 1 năm hợp đồng, dùng riêng cho công cụ so
// sánh thời hạn đóng phí (VD: đóng 10 năm nhưng xem giá trị ở năm hợp đồng thứ
// 20). Khác với calcAccountValue (dừng chiếu & kẹp về 0 khi mất hiệu lực để vẽ
// bảng GTTK suốt đời hợp đồng), hàm này chiếu tiếp không kẹp âm, để lộ ra giá
// trị âm/không đủ khi ngừng đóng phí sớm — đúng như một cảnh báo rủi ro, không
// phải giá trị hoàn lại thật (không thể âm trên hợp đồng thật).
export function calcAccountValueAtYear({ sumInsured, annualPremium, age, gender, paymentTerm, evalYear }, rateForYear) {
  const premium = toNumber(annualPremium);
  const term = Math.max(toNumber(paymentTerm), 1);
  const startAge = toNumber(age);
  const targetYear = Math.max(toNumber(evalYear), 1);

  let value = 0;
  for (let year = 1; year <= targetYear; year++) {
    const currentAge = startAge + year - 1;
    const yearPremium = year <= term ? premium : 0;
    const allocated = yearPremium * allocationRate(year);
    const mortalityRate = getMortalityRate(currentAge, gender);
    const netAmountAtRisk = Math.max(toNumber(sumInsured) - value, 0);
    const coi = (netAmountAtRisk / 1000) * mortalityRate;
    const adminFee = adminFeeAnnual(year);
    const bonus = loyaltyBonus(year, premium, term);
    value = (value + allocated + bonus - coi - adminFee) * (1 + rateForYear(year, term));
  }
  return value;
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

// Bảng tỷ lệ phí cố định (‰ của STBH/năm) theo tuổi & giới tính cho 4 biến thể
// "Khỏe Trọn Vẹn" — lấy nguyên từ sheet "KTV" trong bảng minh họa chính thức
// AIA (v9.1_TrustTools2026_AIA). "Tối Ưu" chỉ bán từ 18 tuổi trở lên.
const KTV_RATES = {
  0: { tronDoi: { nam: 6.1, nu: 5.7 }, toanDien: { nam: 6.1, nu: 5.7 }, benVung: { nam: 7.8, nu: 6 }, toiUu: { nam: null, nu: null } },
  1: { tronDoi: { nam: 6.1, nu: 5.7 }, toanDien: { nam: 6.1, nu: 5.7 }, benVung: { nam: 7.8, nu: 6 }, toiUu: { nam: null, nu: null } },
  2: { tronDoi: { nam: 6.1, nu: 5.7 }, toanDien: { nam: 6.1, nu: 5.7 }, benVung: { nam: 7.8, nu: 6 }, toiUu: { nam: null, nu: null } },
  3: { tronDoi: { nam: 6.1, nu: 5.7 }, toanDien: { nam: 6.1, nu: 5.7 }, benVung: { nam: 7.8, nu: 6 }, toiUu: { nam: null, nu: null } },
  4: { tronDoi: { nam: 6.1, nu: 5.7 }, toanDien: { nam: 6.1, nu: 5.7 }, benVung: { nam: 7.8, nu: 6 }, toiUu: { nam: null, nu: null } },
  5: { tronDoi: { nam: 6.1, nu: 5.7 }, toanDien: { nam: 6.1, nu: 5.7 }, benVung: { nam: 7.9, nu: 6.2 }, toiUu: { nam: null, nu: null } },
  6: { tronDoi: { nam: 6.1, nu: 5.7 }, toanDien: { nam: 6.1, nu: 5.7 }, benVung: { nam: 8.1, nu: 6.3 }, toiUu: { nam: null, nu: null } },
  7: { tronDoi: { nam: 6.1, nu: 5.8 }, toanDien: { nam: 6.1, nu: 5.8 }, benVung: { nam: 8.1, nu: 6.3 }, toiUu: { nam: null, nu: null } },
  8: { tronDoi: { nam: 6.2, nu: 5.8 }, toanDien: { nam: 6.2, nu: 5.8 }, benVung: { nam: 8.5, nu: 6.4 }, toiUu: { nam: null, nu: null } },
  9: { tronDoi: { nam: 6.2, nu: 5.8 }, toanDien: { nam: 6.2, nu: 5.8 }, benVung: { nam: 8.8, nu: 6.8 }, toiUu: { nam: null, nu: null } },
  10: { tronDoi: { nam: 6.3, nu: 5.9 }, toanDien: { nam: 6.3, nu: 5.9 }, benVung: { nam: 9.1, nu: 7 }, toiUu: { nam: null, nu: null } },
  11: { tronDoi: { nam: 6.3, nu: 5.9 }, toanDien: { nam: 6.3, nu: 5.9 }, benVung: { nam: 9.4, nu: 7.3 }, toiUu: { nam: null, nu: null } },
  12: { tronDoi: { nam: 6.3, nu: 6 }, toanDien: { nam: 6.3, nu: 6 }, benVung: { nam: 9.8, nu: 7.5 }, toiUu: { nam: null, nu: null } },
  13: { tronDoi: { nam: 6.4, nu: 6 }, toanDien: { nam: 6.4, nu: 6 }, benVung: { nam: 9.8, nu: 7.8 }, toiUu: { nam: null, nu: null } },
  14: { tronDoi: { nam: 6.4, nu: 6 }, toanDien: { nam: 6.4, nu: 6 }, benVung: { nam: 10.3, nu: 8.1 }, toiUu: { nam: null, nu: null } },
  15: { tronDoi: { nam: 6.5, nu: 6.1 }, toanDien: { nam: 6.5, nu: 6.1 }, benVung: { nam: 10.7, nu: 8.3 }, toiUu: { nam: null, nu: null } },
  16: { tronDoi: { nam: 6.5, nu: 6.1 }, toanDien: { nam: 6.5, nu: 6.1 }, benVung: { nam: 11.4, nu: 8.8 }, toiUu: { nam: null, nu: null } },
  17: { tronDoi: { nam: 6.5, nu: 6.1 }, toanDien: { nam: 6.5, nu: 6.1 }, benVung: { nam: 11.5, nu: 9.2 }, toiUu: { nam: null, nu: null } },
  18: { tronDoi: { nam: 6.6, nu: 6.2 }, toanDien: { nam: 6.6, nu: 6.2 }, benVung: { nam: 12.3, nu: 9.6 }, toiUu: { nam: 68, nu: 48.2 } },
  19: { tronDoi: { nam: 6.6, nu: 6.2 }, toanDien: { nam: 6.6, nu: 6.2 }, benVung: { nam: 12.5, nu: 9.8 }, toiUu: { nam: 68, nu: 49 } },
  20: { tronDoi: { nam: 6.7, nu: 6.3 }, toanDien: { nam: 6.7, nu: 6.3 }, benVung: { nam: 13, nu: 10.5 }, toiUu: { nam: 68, nu: 49.9 } },
  21: { tronDoi: { nam: 6.8, nu: 6.3 }, toanDien: { nam: 6.8, nu: 6.3 }, benVung: { nam: 13.6, nu: 11 }, toiUu: { nam: 68, nu: 50.8 } },
  22: { tronDoi: { nam: 6.8, nu: 6.4 }, toanDien: { nam: 6.8, nu: 6.4 }, benVung: { nam: 14.5, nu: 11.6 }, toiUu: { nam: 68, nu: 51.8 } },
  23: { tronDoi: { nam: 6.9, nu: 6.5 }, toanDien: { nam: 6.9, nu: 6.5 }, benVung: { nam: 15.3, nu: 12.2 }, toiUu: { nam: 68, nu: 52.9 } },
  24: { tronDoi: { nam: 7, nu: 6.6 }, toanDien: { nam: 7, nu: 6.6 }, benVung: { nam: 16.2, nu: 12.8 }, toiUu: { nam: 68.2, nu: 54.2 } },
  25: { tronDoi: { nam: 7.1, nu: 6.7 }, toanDien: { nam: 7.1, nu: 6.7 }, benVung: { nam: 17.1, nu: 13.5 }, toiUu: { nam: 68.8, nu: 55.5 } },
  26: { tronDoi: { nam: 7.2, nu: 6.8 }, toanDien: { nam: 7.2, nu: 6.8 }, benVung: { nam: 18, nu: 14.3 }, toiUu: { nam: 69.9, nu: 57.1 } },
  27: { tronDoi: { nam: 7.4, nu: 6.9 }, toanDien: { nam: 7.4, nu: 6.9 }, benVung: { nam: 19.1, nu: 14.9 }, toiUu: { nam: 71.6, nu: 58.9 } },
  28: { tronDoi: { nam: 7.5, nu: 7.1 }, toanDien: { nam: 7.5, nu: 7.1 }, benVung: { nam: 20.6, nu: 15.9 }, toiUu: { nam: 73.7, nu: 61 } },
  29: { tronDoi: { nam: 7.6, nu: 7.2 }, toanDien: { nam: 7.6, nu: 7.2 }, benVung: { nam: 21.8, nu: 16.9 }, toiUu: { nam: 76.4, nu: 63.4 } },
  30: { tronDoi: { nam: 7.7, nu: 7.4 }, toanDien: { nam: 7.7, nu: 7.4 }, benVung: { nam: 23.6, nu: 17.6 }, toiUu: { nam: 79.6, nu: 66.2 } },
  31: { tronDoi: { nam: 7.9, nu: 7.6 }, toanDien: { nam: 8.2, nu: 7.6 }, benVung: { nam: 25.3, nu: 18.3 }, toiUu: { nam: 83.5, nu: 69.5 } },
  32: { tronDoi: { nam: 8.1, nu: 7.8 }, toanDien: { nam: 9, nu: 7.8 }, benVung: { nam: 27, nu: 19.4 }, toiUu: { nam: 87.9, nu: 73.3 } },
  33: { tronDoi: { nam: 8.3, nu: 7.9 }, toanDien: { nam: 9.9, nu: 7.9 }, benVung: { nam: 28.9, nu: 20.6 }, toiUu: { nam: 92.9, nu: 77.5 } },
  34: { tronDoi: { nam: 8.5, nu: 8.1 }, toanDien: { nam: 10.5, nu: 8.1 }, benVung: { nam: 31.7, nu: 22.1 }, toiUu: { nam: 98.6, nu: 82.1 } },
  35: { tronDoi: { nam: 8.7, nu: 8.3 }, toanDien: { nam: 11.1, nu: 8.3 }, benVung: { nam: 34, nu: 23.4 }, toiUu: { nam: 104.8, nu: 87.2 } },
  36: { tronDoi: { nam: 9.1, nu: 8.7 }, toanDien: { nam: 11.8, nu: 8.7 }, benVung: { nam: 36.6, nu: 25.2 }, toiUu: { nam: 111.9, nu: 92.7 } },
  37: { tronDoi: { nam: 9.5, nu: 9.1 }, toanDien: { nam: 12.5, nu: 9.1 }, benVung: { nam: 39.2, nu: 26.7 }, toiUu: { nam: 119.2, nu: 98.5 } },
  38: { tronDoi: { nam: 10, nu: 9.5 }, toanDien: { nam: 13.5, nu: 9.5 }, benVung: { nam: 42.3, nu: 28.5 }, toiUu: { nam: 126.9, nu: 104.6 } },
  39: { tronDoi: { nam: 10.5, nu: 10 }, toanDien: { nam: 14.6, nu: 10.1 }, benVung: { nam: 45.3, nu: 30.5 }, toiUu: { nam: 135.2, nu: 110.9 } },
  40: { tronDoi: { nam: 11.1, nu: 10.5 }, toanDien: { nam: 15.7, nu: 10.8 }, benVung: { nam: 49.4, nu: 33.3 }, toiUu: { nam: 143.9, nu: 117.8 } },
  41: { tronDoi: { nam: 11.5, nu: 10.9 }, toanDien: { nam: 16.9, nu: 11.5 }, benVung: { nam: 52.6, nu: 34.9 }, toiUu: { nam: 153.3, nu: 124.6 } },
  42: { tronDoi: { nam: 11.9, nu: 11.2 }, toanDien: { nam: 18.2, nu: 12.2 }, benVung: { nam: 56.1, nu: 37.8 }, toiUu: { nam: 163.3, nu: 131.5 } },
  43: { tronDoi: { nam: 12.3, nu: 11.6 }, toanDien: { nam: 19.6, nu: 13.1 }, benVung: { nam: 62.1, nu: 40.9 }, toiUu: { nam: 174, nu: 138.8 } },
  44: { tronDoi: { nam: 12.8, nu: 12 }, toanDien: { nam: 21.3, nu: 14.4 }, benVung: { nam: 66.2, nu: 43.1 }, toiUu: { nam: 185.5, nu: 146.6 } },
  45: { tronDoi: { nam: 13.3, nu: 12.5 }, toanDien: { nam: 23, nu: 15.5 }, benVung: { nam: 71.4, nu: 47.3 }, toiUu: { nam: 197.8, nu: 154.8 } },
  46: { tronDoi: { nam: 14.3, nu: 13.3 }, toanDien: { nam: 24.6, nu: 16.8 }, benVung: { nam: 77.2, nu: 50.8 }, toiUu: { nam: 211, nu: 163.5 } },
  47: { tronDoi: { nam: 15.4, nu: 14.3 }, toanDien: { nam: 26.7, nu: 17.4 }, benVung: { nam: 80.5, nu: 54.5 }, toiUu: { nam: 225, nu: 172.6 } },
  48: { tronDoi: { nam: 16.7, nu: 15.4 }, toanDien: { nam: 29.4, nu: 19.6 }, benVung: { nam: 88.5, nu: 58.6 }, toiUu: { nam: 239.9, nu: 181.9 } },
  49: { tronDoi: { nam: 18.2, nu: 16.7 }, toanDien: { nam: 31.1, nu: 21.6 }, benVung: { nam: 93.8, nu: 63.5 }, toiUu: { nam: 255.6, nu: 191.4 } },
  50: { tronDoi: { nam: 20, nu: 18.2 }, toanDien: { nam: 32.6, nu: 23.1 }, benVung: { nam: 100.6, nu: 68.7 }, toiUu: { nam: 272, nu: 201.2 } },
  51: { tronDoi: { nam: 21.3, nu: 19.2 }, toanDien: { nam: 36.2, nu: 25.3 }, benVung: { nam: 106.7, nu: 73.4 }, toiUu: { nam: 289.3, nu: 211.3 } },
  52: { tronDoi: { nam: 22.7, nu: 20.4 }, toanDien: { nam: 36.2, nu: 27.2 }, benVung: { nam: 112.7, nu: 77.9 }, toiUu: { nam: 307.3, nu: 221.9 } },
  53: { tronDoi: { nam: 24.4, nu: 21.7 }, toanDien: { nam: 40.1, nu: 29.4 }, benVung: { nam: 119.6, nu: 87 }, toiUu: { nam: 326.1, nu: 233.2 } },
  54: { tronDoi: { nam: 26.3, nu: 23.3 }, toanDien: { nam: 42.5, nu: 31.3 }, benVung: { nam: 126.2, nu: 91 }, toiUu: { nam: 345.7, nu: 245.3 } },
  55: { tronDoi: { nam: 28.6, nu: 25 }, toanDien: { nam: 45.3, nu: 33.3 }, benVung: { nam: 132.4, nu: 99.3 }, toiUu: { nam: 365.9, nu: 258.5 } },
  56: { tronDoi: { nam: 30.3, nu: 26.3 }, toanDien: { nam: 49.4, nu: 35.4 }, benVung: { nam: 138.3, nu: 105 }, toiUu: { nam: 386.8, nu: 272.8 } },
  57: { tronDoi: { nam: 32.3, nu: 27.8 }, toanDien: { nam: 51.2, nu: 38.5 }, benVung: { nam: 144.5, nu: 113.1 }, toiUu: { nam: 408.2, nu: 288.2 } },
  58: { tronDoi: { nam: 34.5, nu: 29.4 }, toanDien: { nam: 53.2, nu: 41.7 }, benVung: { nam: 152.7, nu: 118.9 }, toiUu: { nam: 430.1, nu: 304.5 } },
  59: { tronDoi: { nam: 37, nu: 31.3 }, toanDien: { nam: 57.2, nu: 45 }, benVung: { nam: 157.5, nu: 131 }, toiUu: { nam: 452.3, nu: 321.9 } },
  60: { tronDoi: { nam: 40, nu: 33.3 }, toanDien: { nam: 58.8, nu: 45.9 }, benVung: { nam: 164.1, nu: 134.6 }, toiUu: { nam: 474.9, nu: 340.3 } },
  61: { tronDoi: { nam: 41.7, nu: 34.5 }, toanDien: { nam: 62.5, nu: 47.1 }, benVung: { nam: 169.6, nu: 141.3 }, toiUu: { nam: 497.8, nu: 359.7 } },
  62: { tronDoi: { nam: 43.5, nu: 35.7 }, toanDien: { nam: 66, nu: 52.1 }, benVung: { nam: 176.4, nu: 152.2 }, toiUu: { nam: 521, nu: 380.2 } },
  63: { tronDoi: { nam: 45.5, nu: 37 }, toanDien: { nam: 68, nu: 56 }, benVung: { nam: 183.1, nu: 160.1 }, toiUu: { nam: 544.3, nu: 401.9 } },
  64: { tronDoi: { nam: 47.6, nu: 38.5 }, toanDien: { nam: 71, nu: 58.5 }, benVung: { nam: 187.4, nu: 165.7 }, toiUu: { nam: 567.8, nu: 424.7 } },
  65: { tronDoi: { nam: 55.6, nu: 43.5 }, toanDien: { nam: 74, nu: 62.5 }, benVung: { nam: 192.3, nu: 171.8 }, toiUu: { nam: 591.2, nu: 448.6 } },
  66: { tronDoi: { nam: 62.5, nu: 47.6 }, toanDien: { nam: 76.7, nu: 65.4 }, benVung: { nam: 196.2, nu: 178.9 }, toiUu: { nam: 614.5, nu: 473.6 } },
  67: { tronDoi: { nam: 71.4, nu: 52.6 }, toanDien: { nam: 80.2, nu: 68.7 }, benVung: { nam: 202.4, nu: 186.7 }, toiUu: { nam: 637.4, nu: 499.4 } },
  68: { tronDoi: { nam: 83.3, nu: 58.8 }, toanDien: { nam: 83.1, nu: 71.2 }, benVung: { nam: 205.7, nu: 190.9 }, toiUu: { nam: 659.8, nu: 526 } },
  69: { tronDoi: { nam: 100, nu: 66.7 }, toanDien: { nam: 111.1, nu: 83.3 }, benVung: { nam: 222.3, nu: 196.7 }, toiUu: { nam: 681.6, nu: 553 } },
  70: { tronDoi: { nam: 100, nu: 66.7 }, toanDien: { nam: 125, nu: 100 }, benVung: { nam: 250, nu: 250 }, toiUu: { nam: 702.7, nu: 580.5 } },
};

// Hệ số Min/Max theo tuổi dùng để tính dải phí gợi ý cho "Vững Tương Lai" &
// "Khỏe Bình An" (2 sản phẩm dùng chung 1 bảng "KBA" trong file minh họa gốc).
// min premium = STBH / maxFactor, max premium = STBH / minFactor.
const KBA_RANGE_FACTORS = {
  0: { minFactor: 55, maxFactor: 150 },
  1: { minFactor: 55, maxFactor: 150 },
  2: { minFactor: 55, maxFactor: 150 },
  3: { minFactor: 55, maxFactor: 150 },
  4: { minFactor: 55, maxFactor: 150 },
  5: { minFactor: 55, maxFactor: 150 },
  6: { minFactor: 55, maxFactor: 150 },
  7: { minFactor: 50, maxFactor: 150 },
  8: { minFactor: 50, maxFactor: 150 },
  9: { minFactor: 50, maxFactor: 150 },
  10: { minFactor: 45, maxFactor: 150 },
  11: { minFactor: 45, maxFactor: 150 },
  12: { minFactor: 45, maxFactor: 150 },
  13: { minFactor: 45, maxFactor: 150 },
  14: { minFactor: 45, maxFactor: 150 },
  15: { minFactor: 45, maxFactor: 150 },
  16: { minFactor: 45, maxFactor: 150 },
  17: { minFactor: 40, maxFactor: 150 },
  18: { minFactor: 40, maxFactor: 150 },
  19: { minFactor: 40, maxFactor: 150 },
  20: { minFactor: 35, maxFactor: 140 },
  21: { minFactor: 35, maxFactor: 140 },
  22: { minFactor: 35, maxFactor: 140 },
  23: { minFactor: 35, maxFactor: 140 },
  24: { minFactor: 35, maxFactor: 140 },
  25: { minFactor: 35, maxFactor: 140 },
  26: { minFactor: 35, maxFactor: 140 },
  27: { minFactor: 35, maxFactor: 140 },
  28: { minFactor: 35, maxFactor: 140 },
  29: { minFactor: 35, maxFactor: 140 },
  30: { minFactor: 25, maxFactor: 120 },
  31: { minFactor: 25, maxFactor: 120 },
  32: { minFactor: 25, maxFactor: 120 },
  33: { minFactor: 25, maxFactor: 120 },
  34: { minFactor: 25, maxFactor: 120 },
  35: { minFactor: 20, maxFactor: 100 },
  36: { minFactor: 20, maxFactor: 100 },
  37: { minFactor: 20, maxFactor: 100 },
  38: { minFactor: 20, maxFactor: 100 },
  39: { minFactor: 20, maxFactor: 100 },
  40: { minFactor: 20, maxFactor: 70 },
  41: { minFactor: 20, maxFactor: 70 },
  42: { minFactor: 20, maxFactor: 70 },
  43: { minFactor: 20, maxFactor: 70 },
  44: { minFactor: 20, maxFactor: 70 },
  45: { minFactor: 20, maxFactor: 50 },
  46: { minFactor: 20, maxFactor: 50 },
  47: { minFactor: 20, maxFactor: 50 },
  48: { minFactor: 20, maxFactor: 50 },
  49: { minFactor: 20, maxFactor: 50 },
  50: { minFactor: 15, maxFactor: 40 },
  51: { minFactor: 15, maxFactor: 40 },
  52: { minFactor: 15, maxFactor: 40 },
  53: { minFactor: 15, maxFactor: 40 },
  54: { minFactor: 15, maxFactor: 40 },
  55: { minFactor: 8, maxFactor: 20 },
  56: { minFactor: 8, maxFactor: 20 },
  57: { minFactor: 8, maxFactor: 20 },
  58: { minFactor: 8, maxFactor: 20 },
  59: { minFactor: 8, maxFactor: 20 },
  60: { minFactor: 5, maxFactor: 10 },
  61: { minFactor: 5, maxFactor: 10 },
  62: { minFactor: 5, maxFactor: 10 },
  63: { minFactor: 5, maxFactor: 10 },
  64: { minFactor: 5, maxFactor: 10 },
  65: { minFactor: 5, maxFactor: 10 },
  66: { minFactor: 5, maxFactor: 10 },
  67: { minFactor: 5, maxFactor: 10 },
  68: { minFactor: 5, maxFactor: 10 },
  69: { minFactor: 5, maxFactor: 10 },
  70: { minFactor: 5, maxFactor: 10 },
};

const KTV_VARIANT_BY_PRODUCT = {
  "Khỏe Trọn Vẹn - Trọn Đời": "tronDoi",
  "Khỏe Trọn Vẹn - Toàn Diện": "toanDien",
  "Khỏe Trọn Vẹn - Bền Vững": "benVung",
  "Khỏe Trọn Vẹn - Tối Ưu": "toiUu",
};

// "Vững Tương Lai" và "Khỏe Bình An" dùng chung bảng hệ số KBA cho dải gợi ý.
const RANGE_HINT_PRODUCTS = new Set(["Vững Tương Lai", "Khỏe Bình An"]);

export function isFixedPremiumProduct(productName) {
  return Object.prototype.hasOwnProperty.call(KTV_VARIANT_BY_PRODUCT, productName);
}

// Phí cố định (Khỏe Trọn Vẹn *): STBH/1000 × tỷ lệ‰ tra theo tuổi/giới tính.
// Không phụ thuộc thời gian đóng phí (đúng như công thức gốc trong bảng minh
// họa AIA). Trả về null nếu chưa đủ dữ liệu (chưa chọn sản phẩm KTV, hoặc
// tuổi ngoài phạm vi bảng — VD "Tối Ưu" chỉ bán từ 18 tuổi).
export function getKtvFixedPremium(productName, age, gender, sumInsured) {
  const variant = KTV_VARIANT_BY_PRODUCT[productName];
  if (!variant) return null;
  const row = KTV_RATES[Math.round(toNumber(age))];
  const rate = row?.[variant]?.[gender === "Nữ" ? "nu" : "nam"];
  if (rate == null) return null;
  return Math.round((toNumber(sumInsured) / 1000) * rate);
}

// Dải phí hợp lệ CHƯA làm tròn (Vững Tương Lai / Khỏe Bình An): min =
// STBH/maxFactor(tuổi), max = STBH/minFactor(tuổi). Dùng để KIỂM TRA phí đã
// nhập có hợp lệ không — trusttool.co so sánh với số thật, chưa làm tròn.
// Trả về null nếu sản phẩm không thuộc nhóm này hoặc chưa đủ dữ liệu tuổi.
export function getSuggestedPremiumRangeRaw(productName, age, sumInsured) {
  if (!RANGE_HINT_PRODUCTS.has(productName)) return null;
  const row = KBA_RANGE_FACTORS[Math.round(toNumber(age))];
  if (!row) return null;
  const stbh = toNumber(sumInsured);
  return { min: stbh / row.maxFactor, max: stbh / row.minFactor };
}

// Dải phí gợi ý để HIỂN THỊ dưới ô nhập — làm tròn "vào trong" đến hàng
// nghìn: Min làm tròn lên, Max làm tròn xuống, để dải gợi ý hiển thị không
// bao giờ vượt ra ngoài phạm vi thật.
export function getSuggestedPremiumRange(productName, age, sumInsured) {
  const raw = getSuggestedPremiumRangeRaw(productName, age, sumInsured);
  if (!raw) return null;
  return {
    min: Math.ceil(raw.min / 1000) * 1000,
    max: Math.floor(raw.max / 1000) * 1000,
  };
}

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

// Danh sách nghề nghiệp — dùng chung nội dung với danh sách ở module Thần Số
// Học (src/components/numerology/NumerologyClient.js), có gắn thêm nhóm rủi
// ro tai nạn (1-4) để tính phí. LƯU Ý: workbook AIA gốc không có bảng phân
// nhóm nghề theo tên — nhóm 1-4 dưới đây là suy đoán tạm theo tính chất công
// việc (văn phòng/ít va chạm = 1 → lao động chân tay/rủi ro cao = 4), CẦN
// người có bảng phân nhóm chính thức rà soát lại.
export const OCCUPATION_SEARCH_LIST = [
  { name: "Dịch vụ/Thương mại: Quản lý nhà hàng/khách sạn qui mô lớn, quốc tế", classValue: 1 },
  { name: "Dịch vụ/Thương mại: Quản lý, điều hành, Quản lý dịch vụ vệ sinh", classValue: 2 },
  { name: "Dịch vụ/Thương mại: Chủ dịch vụ cho thuê", classValue: 1 },
  { name: "Dịch vụ/Thương mại: Chủ/Quản lý nhà hàng, khách sạn qui mô nhỏ", classValue: 2 },
  { name: "Dịch vụ/Thương mại: Buôn bán, kinh doanh tại địa điểm cố định", classValue: 2 },
  { name: "Dịch vụ/Thương mại: Buôn bán, kinh doanh tại lô, sạp ở chợ", classValue: 2 },
  { name: "Dịch vụ/Thương mại: Kinh doanh kiều hối, kim loại đá quý", classValue: 2 },
  { name: "Dịch vụ/Thương mại: Kinh doanh bất động sản", classValue: 1 },
  { name: "Dịch vụ/Thương mại: Tư vấn, môi giới, Đại lý bảo hiểm", classValue: 1 },
  { name: "Dịch vụ/Thương mại: Nhân viên kinh doanh, bán hàng", classValue: 1 },
  { name: "Dịch vụ/Thương mại: Kinh doanh dược phẩm/ Nhân viên kinh doanh", classValue: 1 },
  { name: "Dịch vụ/Thương mại: Tín dụng tín chấp, thế chấp", classValue: 1 },
  { name: "Dịch vụ/Thương mại: Thợ làm tóc/Làm móng/Trang điểm/Chủ cơ sở", classValue: 2 },
  { name: "Dịch vụ/Thương mại: Buôn bán, kinh doanh lưu động", classValue: 2 },
  { name: "Dịch vụ/Thương mại: Nhân viên làm việc trạm xăng dầu", classValue: 3 },
  { name: "Dịch vụ/Thương mại: Giúp việc nhà", classValue: 2 },
  { name: "Dịch vụ/Thương mại: Pha chế", classValue: 2 },
  { name: "Dịch vụ/Thương mại: Nhân viên/Thợ lắp đặt, sửa chữa, bảo hành, bảo trì", classValue: 3 },
  { name: "Dịch vụ/Thương mại: Công nhân chăm sóc cây xanh/Công nhân vệ sinh", classValue: 3 },
  { name: "Dịch vụ/Thương mại: Công nhân vệ sinh đường phố, công cộng", classValue: 3 },
  { name: "Dịch vụ/Thương mại: Nhân viên giao hàng/Bưu tá", classValue: 3 },
  { name: "Dịch vụ/Thương mại: Đầu bếp, thợ nấu", classValue: 2 },
  { name: "Ngành giao thông vận tải: Nhân viên thủ tục/phục vụ hành khách", classValue: 1 },
  { name: "Ngành giao thông vận tải: Nhân viên điều độ chạy tàu tuyến/ga", classValue: 2 },
  { name: "Ngành giao thông vận tải: Nhân viên điều khiển không lưu", classValue: 2 },
  { name: "Ngành giao thông vận tải: Nhân viên mặt đất", classValue: 3 },
  { name: "Ngành giao thông vận tải: An ninh hàng không", classValue: 2 },
  { name: "Ngành giao thông vận tải: Trưởng tàu", classValue: 2 },
  { name: "Ngành giao thông vận tải: Tiếp viên hàng không", classValue: 2 },
  { name: "Ngành giao thông vận tải: Phi công máy bay thương mại", classValue: 3 },
  { name: "Ngành giao thông vận tải: Nhân viên dịch vụ vệ sinh", classValue: 3 },
  { name: "Ngành giao thông vận tải: Lái tàu/Phụ lái", classValue: 3 },
  { name: "Ngành giao thông vận tải: Tài xế xe buýt/khách/tải", classValue: 3 },
  { name: "Ngành giao thông vận tải: Tài xế xe gắn máy/ba gác", classValue: 4 },
  { name: "Ngành giao thông vận tải: Nhân viên giao nhận / vận tải", classValue: 3 },
  { name: "Khai thác/Sản xuất/Xây dựng/Xử lý chất thải: Kiến trúc sư/ Thiết kế/Kỹ sư xây dựng", classValue: 2 },
  { name: "Khai thác/Sản xuất/Xây dựng/Xử lý chất thải: Nhân viên văn phòng/Giám đốc/Quản lý nhà máy", classValue: 1 },
  { name: "Khai thác/Sản xuất/Xây dựng/Xử lý chất thải: Kỹ sư môi trường, Kỹ sư nhà máy", classValue: 2 },
  { name: "Khai thác/Sản xuất/Xây dựng/Xử lý chất thải: Quản lý, giám sát công trình", classValue: 3 },
  { name: "Khai thác/Sản xuất/Xây dựng/Xử lý chất thải: Quản đốc, đốc công", classValue: 3 },
  { name: "Khai thác/Sản xuất/Xây dựng/Xử lý chất thải: Kỹ sư chế tạo/Kỹ sư công nghiệp", classValue: 2 },
  { name: "Khai thác/Sản xuất/Xây dựng/Xử lý chất thải: Sản xuất bao bì, Dệt may, Sản xuất giầy dép", classValue: 3 },
  { name: "Khai thác/Sản xuất/Xây dựng/Xử lý chất thải: Chế biến thủy sản/nông sản, Sản xuất bia/đường", classValue: 3 },
  { name: "Khai thác/Sản xuất/Xây dựng/Xử lý chất thải: Công nhân cơ khí/Thợ máy/Kỹ thuật, bảo trì", classValue: 3 },
  { name: "Khai thác/Sản xuất/Xây dựng/Xử lý chất thải: Công nhân xây dựng, thi công/Thợ hồ", classValue: 4 },
  { name: "Hành chính văn phòng: Ban giám đốc", classValue: 1 },
  { name: "Hành chính văn phòng: Nhân viên văn phòng", classValue: 1 },
  { name: "Hành chính văn phòng: Kỹ sư công nghệ thông tin", classValue: 1 },
  { name: "Nông Lâm Ngư Nghiệp: Nghiên cứu, đào tạo, hướng dẫn", classValue: 1 },
  { name: "Nông Lâm Ngư Nghiệp: Nuôi trồng thủy hải sản", classValue: 3 },
  { name: "Nông Lâm Ngư Nghiệp: Làm ruộng/Trồng trọt/Chăn nuôi", classValue: 3 },
  { name: "Nông Lâm Ngư Nghiệp: Làm muối", classValue: 3 },
  { name: "Nông Lâm Ngư Nghiệp: Trồng rừng, cao su", classValue: 3 },
  { name: "Nông Lâm Ngư Nghiệp: Đánh bắt cá ở sông hồ", classValue: 3 },
  { name: "Nghệ thuật/Truyền thông/Thể thao/Du lịch: Tác giả truyện, thơ, văn/Quản lý/Tổng biên tập", classValue: 1 },
  { name: "Nghệ thuật/Truyền thông/Thể thao/Du lịch: Người chỉ huy dàn nhạc", classValue: 1 },
  { name: "Nghệ thuật/Truyền thông/Thể thao/Du lịch: Diễn viên lồng tiếng", classValue: 1 },
  { name: "Nghệ thuật/Truyền thông/Thể thao/Du lịch: Thể thao trí tuệ, bida", classValue: 1 },
  { name: "Nghệ thuật/Truyền thông/Thể thao/Du lịch: Hướng dẫn viên du lịch", classValue: 2 },
  { name: "Nghệ thuật/Truyền thông/Thể thao/Du lịch: Nhạc sĩ, nhạc công biểu diễn ở nhà hát", classValue: 1 },
  { name: "Nghệ thuật/Truyền thông/Thể thao/Du lịch: Thể thao dùng vợt/Golf/Bowling", classValue: 2 },
  { name: "Nghệ thuật/Truyền thông/Thể thao/Du lịch: Biểu diễn lưu động", classValue: 3 },
  { name: "Nghệ thuật/Truyền thông/Thể thao/Du lịch: Điền kinh/Thể dục/Thể hình", classValue: 3 },
  { name: "Nghệ thuật/Truyền thông/Thể thao/Du lịch: Đua xe đạp hoặc thiết bị chuyển động được nhờ đạp", classValue: 3 },
  { name: "Tư pháp/Quân đội/Cảnh sát/Bảo vệ: Tư vấn luật/Luật sư/Thẩm phán/Công tố viên", classValue: 1 },
  { name: "Tư pháp/Quân đội/Cảnh sát/Bảo vệ: Cấp lãnh đạo, chỉ huy", classValue: 2 },
  { name: "Tư pháp/Quân đội/Cảnh sát/Bảo vệ: Sĩ quan không thuộc đặc công/đặc nhiệm", classValue: 3 },
  { name: "Tư pháp/Quân đội/Cảnh sát/Bảo vệ: Thi hành án", classValue: 3 },
  { name: "Tư pháp/Quân đội/Cảnh sát/Bảo vệ: Điều phối giao thông", classValue: 3 },
  { name: "Tư pháp/Quân đội/Cảnh sát/Bảo vệ: Tuần tra, giữ gìn an ninh trật tự", classValue: 4 },
  { name: "Công việc khác: Trẻ em", classValue: 1 },
  { name: "Công việc khác: Học sinh/sinh viên", classValue: 1 },
  { name: "Công việc khác: Tu hành", classValue: 1 },
  { name: "Công việc khác: Thầy cúng/Thầy phong thủy", classValue: 1 },
  { name: "Công việc khác: Hưu trí", classValue: 1 },
  { name: "Công việc khác: Nội trợ", classValue: 1 },
  { name: "Công việc khác: Lao động tự do", classValue: 3 },
];

export function searchOccupations(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return OCCUPATION_SEARCH_LIST;
  return OCCUPATION_SEARCH_LIST.filter((o) => o.name.toLowerCase().includes(q));
}
