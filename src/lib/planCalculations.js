import {
  futureValue,
  presentValue,
  monthlyAnnuityFV,
  monthlyPmtForFutureValue,
  toNumber,
} from "./finance";

// Bảo vệ thu nhập tính theo kiểu "cần ngay từ hôm nay" (annuity-due): năm 1
// không bị chiết khấu, các năm sau tăng theo lạm phát và chiết khấu về hiện tại
// theo lãi suất tiền gửi.
export function calcProtection(i) {
  const firstPayment = toNumber(i.monthlyIncome) * 12 * (toNumber(i.protectPct) / 100);
  const g = toNumber(i.inflationRate) / 100;
  const r = toNumber(i.investReturnRate) / 100;
  const n = Math.max(toNumber(i.protectYears), 0);

  const yearly = [];
  let futureTotal = 0;
  let pv = 0;
  for (let year = 1; year <= n; year++) {
    const nominal = firstPayment * Math.pow(1 + g, year - 1);
    const presentValue = nominal / Math.pow(1 + r, year - 1);
    yearly.push({ year, nominal, presentValue });
    futureTotal += nominal;
    pv += presentValue;
  }

  const debtNeed = toNumber(i.existingDebt);
  const currentFund = toNumber(i.liquidAssets) + toNumber(i.existingInsurance);
  const simpleFutureTotal = firstPayment * n;
  const gap = pv - currentFund + debtNeed;

  return { firstPayment, debtNeed, simpleFutureTotal, currentFund, futureTotal, pv, gap, yearly };
}

// Tính học phí từng năm học (tăng theo lạm phát giáo dục tính từ hôm nay) và
// quy giá trị hiện tại của mỗi năm học về thời điểm con bắt đầu đại học
// (chiết khấu theo lãi suất, năm học đầu tiên không bị chiết khấu).
export function calcEducationChild(child) {
  const currentAge = toNumber(child.currentAge);
  const startAge = toNumber(child.startAge);
  const studyYears = Math.max(toNumber(child.studyYears), 0);
  const eduInflation = toNumber(child.eduInflation) / 100;
  const investReturn = toNumber(child.investReturn) / 100;
  const yearsUntilStart = Math.max(startAge - currentAge, 0);

  const yearly = [];
  let nominalTotal = 0;
  let pvTotal = 0;
  for (let k = 1; k <= studyYears; k++) {
    const age = startAge + (k - 1);
    const yearsFromNow = yearsUntilStart + (k - 1);
    const nominal = futureValue(child.annualCostNow, eduInflation, yearsFromNow);
    const presentVal = presentValue(nominal, investReturn, k - 1);
    yearly.push({ year: k, age, nominal, presentValue: presentVal });
    nominalTotal += nominal;
    pvTotal += presentVal;
  }

  const savingsFromMonthly = monthlyAnnuityFV(child.monthlySaving, investReturn, yearsUntilStart);
  const savingsFromCurrent = futureValue(child.currentSavings, investReturn, yearsUntilStart);
  const totalSavings = savingsFromMonthly + savingsFromCurrent;

  const targetTotal = pvTotal;
  const gap = Math.max(targetTotal - totalSavings, 0);
  const requiredMonthly = monthlyPmtForFutureValue(gap, investReturn, yearsUntilStart);

  return {
    yearsUntilStart,
    nominalTotal,
    targetTotal,
    savingsFromMonthly,
    savingsFromCurrent,
    totalSavings,
    gap,
    requiredMonthly,
    yearly,
  };
}

export function calcEducation(children) {
  const list = Array.isArray(children) ? children : [];
  const results = list.map(calcEducationChild);
  const gap = results.reduce((sum, r) => sum + Math.max(r.gap, 0), 0);
  return { children: results, gap };
}

// Chi tiêu hưu trí từng năm tăng theo lạm phát tính từ hôm nay, quy giá trị
// hiện tại về đúng thời điểm nghỉ hưu (năm hưu đầu tiên không bị chiết khấu).
// Tài sản hiện có được lũy kế riêng theo năm cho đến khi nghỉ hưu.
export function calcRetirement(i) {
  const currentAge = toNumber(i.currentAge);
  const retireAge = toNumber(i.retireAge);
  const yearsToRetire = Math.max(retireAge - currentAge, 0);
  const lifeExpectancyYears = Math.max(toNumber(i.lifeExpectancyYears), 0);
  const inflation = toNumber(i.inflation) / 100;
  const investReturn = toNumber(i.investReturn) / 100;
  const annualExpenseNow = toNumber(i.monthlyExpenseNow) * 12;

  const spendingYearly = [];
  let spendingNominalTotal = 0;
  let spendingPvTotal = 0;
  for (let k = 1; k <= lifeExpectancyYears; k++) {
    const age = retireAge + (k - 1);
    const yearsFromNow = yearsToRetire + (k - 1);
    const nominal = futureValue(annualExpenseNow, inflation, yearsFromNow);
    const presentVal = presentValue(nominal, investReturn, k - 1);
    spendingYearly.push({ year: k, age, nominal, presentValue: presentVal });
    spendingNominalTotal += nominal;
    spendingPvTotal += presentVal;
  }

  const assetYearly = [];
  for (let y = 1; y <= yearsToRetire; y++) {
    const age = currentAge + y;
    const value = futureValue(i.currentSavings, investReturn, y);
    assetYearly.push({ year: y, age, value });
  }
  const futureAsset = assetYearly.length ? assetYearly[assetYearly.length - 1].value : toNumber(i.currentSavings);

  const savingsFromMonthly = monthlyAnnuityFV(i.monthlySaving, investReturn, yearsToRetire);
  const totalSavings = futureAsset + savingsFromMonthly;

  const targetTotal = spendingPvTotal;
  const gap = Math.max(targetTotal - totalSavings, 0);
  const requiredMonthly = monthlyPmtForFutureValue(gap, investReturn, yearsToRetire);

  return {
    yearsToRetire,
    futureAsset,
    savingsFromMonthly,
    totalSavings,
    targetTotal,
    gap,
    requiredMonthly,
    spendingYearly,
    spendingNominalTotal,
    assetYearly,
  };
}

// Mục tiêu bị trượt giá theo lạm phát (năm 1 giữ nguyên, kiểu "due"); khoản
// tiết kiệm hiện có sinh lời theo lãi suất thông thường (năm 1 đã sinh lời).
export function calcWealth(i) {
  const targetAmount = toNumber(i.targetAmount);
  const inflation = toNumber(i.inflationRate) / 100;
  const investReturn = toNumber(i.expectedReturn) / 100;
  const years = Math.max(toNumber(i.years), 0);

  const yearly = [];
  for (let year = 1; year <= years; year++) {
    const targetNominal = targetAmount * Math.pow(1 + inflation, year - 1);
    const savingsValue = futureValue(i.currentSavings, investReturn, year);
    yearly.push({ year, targetNominal, savingsValue });
  }

  const desiredTarget = yearly.length ? yearly[yearly.length - 1].targetNominal : targetAmount;
  const currentSavingsFV = yearly.length
    ? yearly[yearly.length - 1].savingsValue
    : toNumber(i.currentSavings);
  const monthlySavingsFV = monthlyAnnuityFV(i.monthlySaving, investReturn, years);
  const totalSavings = currentSavingsFV + monthlySavingsFV;
  const gap = Math.max(desiredTarget - totalSavings, 0);
  const requiredMonthly = monthlyPmtForFutureValue(gap, investReturn, years);

  return { desiredTarget, currentSavingsFV, monthlySavingsFV, totalSavings, gap, requiredMonthly, yearly };
}

// Số ngày nằm viện mặc định dùng để quy đổi "tiền phòng/ngày" thành quỹ dự phòng theo năm.
const DEFAULT_HOSPITAL_DAYS = 30;

export function calcHealth(i) {
  const hospitalDaysCost = toNumber(i.roomFeePerDay) * DEFAULT_HOSPITAL_DAYS;
  const totalNeed =
    toNumber(i.criticalIllnessFund) + toNumber(i.accidentFund) + toNumber(i.hospitalFund) + hospitalDaysCost;
  return { hospitalDaysCost, totalNeed, gap: totalNeed };
}
