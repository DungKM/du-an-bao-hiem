function digitSum(n) {
  return String(Math.abs(n))
    .split("")
    .reduce((s, d) => s + Number(d), 0);
}

export function reduceNumber(n) {
  let value = n;
  while (value > 9 && ![11, 22, 33].includes(value)) {
    value = digitSum(value);
  }
  return value;
}

export function calcNumerology(birthDate) {
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;

  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  const allDigits = `${day}${month}${year}`.split("").reduce((s, c) => s + Number(c), 0);
  const lifePath = reduceNumber(allDigits);

  const now = new Date();
  const personalYear = reduceNumber(reduceNumber(day + month) + now.getFullYear());
  const personalMonth = reduceNumber(personalYear + (now.getMonth() + 1));

  const birthDayNumber = reduceNumber(day);
  const attitude = reduceNumber(reduceNumber(day) + reduceNumber(month));

  return {
    day,
    month,
    year,
    lifePath,
    personalYear,
    personalMonth,
    birthDayNumber,
    attitude,
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth() + 1,
  };
}

const LETTER_VALUES = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

function sumLetters(name, predicate) {
  const letters = String(name)
    .toUpperCase()
    .split("")
    .filter((ch) => LETTER_VALUES[ch] && predicate(ch));
  if (!letters.length) return 0;
  return reduceNumber(letters.reduce((s, ch) => s + LETTER_VALUES[ch], 0));
}

export function calcNameNumbers(fullName) {
  return {
    destiny: sumLetters(fullName, () => true),
    soulUrge: sumLetters(fullName, (ch) => VOWELS.has(ch)),
    personality: sumLetters(fullName, (ch) => !VOWELS.has(ch)),
  };
}

function reduceFully(n) {
  let value = n;
  while (value > 9) value = digitSum(value);
  return value;
}

export function calcPinnacles(lifePath, birthYear) {
  const firstEndAge = 36 - reduceFully(lifePath);
  return [1, 2, 3, 4].map((n) => {
    const age = firstEndAge + (n - 1) * 9;
    return { label: `Đỉnh ${n}`, age, year: birthYear + age };
  });
}

function emptyDigitCounts() {
  const counts = {};
  for (let i = 1; i <= 9; i++) counts[i] = 0;
  return counts;
}

// Frequency of each digit 1-9 across every letter of the full name (Pythagorean values).
export function calcNameChart(fullName) {
  const counts = emptyDigitCounts();
  String(fullName)
    .toUpperCase()
    .split("")
    .forEach((ch) => {
      const v = LETTER_VALUES[ch];
      if (v) counts[v] += 1;
    });
  return counts;
}

// Frequency of each digit 1-9 across every digit of the birth date (day+month+year, zeros ignored).
export function calcBirthChart(day, month, year) {
  const counts = emptyDigitCounts();
  `${day}${String(month).padStart(2, "0")}${year}`
    .split("")
    .forEach((ch) => {
      const v = Number(ch);
      if (v >= 1 && v <= 9) counts[v] += 1;
    });
  return counts;
}

// Karmic Lesson numbers: digits 1-9 absent from the name chart.
export function calcKarmicLessons(nameChart) {
  const missing = [];
  for (let i = 1; i <= 9; i++) {
    if (!nameChart[i]) missing.push(i);
  }
  return missing;
}

const ARROW_DIGIT_GROUPS = [
  [1, 5, 9],
  [3, 5, 7],
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7],
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

// Whether each of the 8 classic Pythagorean arrows is present (all 3 digits on that
// line have frequency > 0) in a given digit-frequency chart.
export function calcArrowPresence(chart) {
  return ARROW_DIGIT_GROUPS.map(([a, b, c]) => chart[a] > 0 && chart[b] > 0 && chart[c] > 0);
}

export function getNameChartTierText(tiers, digit, count) {
  const list = tiers[digit] || [];
  const tier = list.find((t) => count >= t.min && (t.max === null || count <= t.max));
  return tier ? tier.text : null;
}
