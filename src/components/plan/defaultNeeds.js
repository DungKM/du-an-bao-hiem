import { defaultEducationChild } from "./EducationPanel";

export function getDefaultNeeds() {
  return {
    protection: {
      selected: null,
      monthlyIncome: 30_000_000,
      protectPct: 70,
      protectYears: 20,
      liquidAssets: 300_000_000,
      existingInsurance: 0,
      existingDebt: 0,
      inflationRate: 4,
      investReturnRate: 6,
    },
    education: {
      selected: null,
      numChildren: 1,
      children: [defaultEducationChild()],
    },
    retirement: {
      selected: null,
      currentAge: 30,
      retireAge: 60,
      lifeExpectancyYears: 20,
      monthlyExpenseNow: 15_000_000,
      currentSavings: 100_000_000,
      monthlySaving: 0,
      inflation: 3,
      investReturn: 5,
    },
    wealth: {
      selected: null,
      targetAmount: 1_000_000_000,
      currentSavings: 100_000_000,
      monthlySaving: 0,
      years: 5,
      inflationRate: 3,
      expectedReturn: 8,
    },
    health: {
      selected: null,
      criticalIllnessFund: 0,
      accidentFund: 0,
      hospitalFund: 0,
      roomFeePerDay: 0,
      hasHealthCard: "chua_co",
      planMoreChildren: "khong_ap_dung",
    },
  };
}
