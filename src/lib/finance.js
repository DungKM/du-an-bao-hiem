// Small set of transparent, standard financial-math helpers used across
// the calculators. These are illustrative estimates, not official
// insurer illustrations.

export function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Present value of a growing annuity (first payment C1, growing at `g` per
// period for `n` periods, discounted at rate `r`).
export function growingAnnuityPV(firstPayment, growthRate, discountRate, years) {
  const C = toNumber(firstPayment);
  const g = toNumber(growthRate);
  const r = toNumber(discountRate);
  const n = toNumber(years);
  if (n <= 0 || C <= 0) return 0;

  if (Math.abs(r - g) < 1e-9) {
    return (C * n) / (1 + r);
  }

  const ratio = Math.pow((1 + g) / (1 + r), n);
  return (C * (1 - ratio)) / (r - g);
}

// Future value of a present amount after `n` years at rate `r`.
export function futureValue(principal, rate, years) {
  const P = toNumber(principal);
  const r = toNumber(rate);
  const n = toNumber(years);
  return P * Math.pow(1 + r, n);
}

// Present value of a single future lump sum.
export function presentValue(amount, rate, years) {
  const A = toNumber(amount);
  const r = toNumber(rate);
  const n = toNumber(years);
  return A / Math.pow(1 + r, n);
}

// Level annual payment (PMT) required to reach a future value target after
// `n` years at rate `r`.
export function pmtForFutureValue(targetFV, rate, years) {
  const FV = toNumber(targetFV);
  const r = toNumber(rate);
  const n = toNumber(years);
  if (n <= 0) return 0;
  if (Math.abs(r) < 1e-9) return FV / n;
  return (FV * r) / (Math.pow(1 + r, n) - 1);
}

// Future value of a level annuity (end-of-year payments) after `n` years.
export function annuityFV(payment, rate, years) {
  const C = toNumber(payment);
  const r = toNumber(rate);
  const n = toNumber(years);
  if (n <= 0) return 0;
  if (Math.abs(r) < 1e-9) return C * n;
  return C * ((Math.pow(1 + r, n) - 1) / r);
}

// Lãi suất tháng tương đương lãi suất năm (compound đúng: (1+i)^12 = 1+r),
// để dòng tiền tiết kiệm hàng tháng nhất quán với các mốc tăng trưởng theo năm.
function monthlyRateFromAnnual(annualRate) {
  const r = toNumber(annualRate);
  return Math.pow(1 + r, 1 / 12) - 1;
}

// Future value of a level monthly annuity (end-of-month payments) after
// `years` years, compounded at the monthly-equivalent of the annual rate.
export function monthlyAnnuityFV(payment, annualRate, years) {
  const P = toNumber(payment);
  const i = monthlyRateFromAnnual(annualRate);
  const n = toNumber(years) * 12;
  if (n <= 0) return 0;
  if (Math.abs(i) < 1e-9) return P * n;
  return P * ((Math.pow(1 + i, n) - 1) / i);
}

// Level monthly payment (PMT) required to reach a future value target after
// `years` years, compounded at the monthly-equivalent of the annual rate.
export function monthlyPmtForFutureValue(targetFV, annualRate, years) {
  const FV = toNumber(targetFV);
  const i = monthlyRateFromAnnual(annualRate);
  const n = toNumber(years) * 12;
  if (n <= 0) return 0;
  if (Math.abs(i) < 1e-9) return FV / n;
  return (FV * i) / (Math.pow(1 + i, n) - 1);
}

export function formatVND(value) {
  const n = Math.round(toNumber(value));
  return n.toLocaleString("vi-VN") + " đ";
}

// Rút gọn dạng "triệu đ" cho các ô tóm tắt (vd: 15.000.000 -> "15 triệu đ").
export function formatVNDShort(value) {
  const n = toNumber(value);
  if (Math.abs(n) < 1_000_000) return formatVND(n);
  const millions = Math.round((n / 1_000_000) * 10) / 10;
  const str = Number.isInteger(millions) ? String(millions) : String(millions).replace(".", ",");
  return `${str} triệu đ`;
}

// Ngày dạng "yyyy-mm-dd" (giá trị input type="date") -> tuổi tại một ngày tham chiếu.
export function calcAgeFromDOB(dobISO, referenceISO) {
  if (!dobISO) return null;
  const dob = new Date(dobISO);
  const ref = referenceISO ? new Date(referenceISO) : new Date();
  if (Number.isNaN(dob.getTime()) || Number.isNaN(ref.getTime())) return null;
  let age = ref.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    ref.getMonth() > dob.getMonth() || (ref.getMonth() === dob.getMonth() && ref.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return Math.max(age, 0);
}

export function formatDateVN(dateISO) {
  if (!dateISO) return "";
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
}
