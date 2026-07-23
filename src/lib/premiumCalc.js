// Illustrative base rate per 1,000 VND of sum insured, per year — for demo
// purposes only. Not an official insurer rate table.
const BASE_RATE_TABLE = [
  { max: 30, male: 2.5, female: 2.1 },
  { max: 40, male: 3.2, female: 2.8 },
  { max: 50, male: 4.5, female: 3.9 },
  { max: 60, male: 6.8, female: 5.9 },
  { max: 999, male: 10.5, female: 9.0 },
];

export function getBaseRate(age, gender) {
  const band = BASE_RATE_TABLE.find((b) => Number(age) < b.max) || BASE_RATE_TABLE[BASE_RATE_TABLE.length - 1];
  return gender === "Nữ" ? band.female : band.male;
}

// Riders: rate riders scale with sumInsured/1000; flat riders are a fixed
// annual amount regardless of sumInsured.
export const RIDERS = [
  { key: "accident", label: "Tử vong & thương tật do tai nạn", type: "rate", rate: 0.3 },
  { key: "criticalIllness", label: "Bệnh hiểm nghèo", type: "rate", rate: 1.8 },
  { key: "waiver", label: "Miễn đóng phí khi mất khả năng lao động", type: "rate", rate: 0.5 },
  { key: "hospitalCash", label: "Trợ cấp nằm viện", type: "flat", amount: 500_000 },
  { key: "healthCard", label: "Thẻ chăm sóc sức khỏe", type: "flat", amount: 6_000_000 },
];

export function calcPremium({ sumInsured, age, gender, riderKeys }) {
  const base = (Number(sumInsured) / 1000) * getBaseRate(age, gender);
  const riderBreakdown = RIDERS.filter((r) => riderKeys.includes(r.key)).map((r) => {
    const amount = r.type === "rate" ? (Number(sumInsured) / 1000) * r.rate : r.amount;
    return { ...r, amount };
  });
  const ridersTotal = riderBreakdown.reduce((s, r) => s + r.amount, 0);
  return { base, riderBreakdown, ridersTotal, total: base + ridersTotal };
}
