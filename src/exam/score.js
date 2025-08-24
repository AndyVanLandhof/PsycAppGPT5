// Scoring helpers for examine flows (MCQ, short, scenario, essay)

export const defaultScale = [
  { min: 90, grade: 'A*' },
  { min: 80, grade: 'A' },
  { min: 70, grade: 'B' },
  { min: 60, grade: 'C' },
  { min: 0, grade: 'D' }
];

export function toPercent(raw, max) {
  const maximum = Math.max(0, Number(max) || 0);
  if (maximum === 0) return 0;
  const clamped = Math.max(0, Math.min(maximum, Number(raw) || 0));
  return Math.round((clamped / maximum) * 100);
}

export function gradeFromPercent(percent, scale = defaultScale) {
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  // assume scale sorted desc by min
  for (const band of [...scale].sort((a, b) => b.min - a.min)) {
    if (pct >= band.min) return band.grade;
  }
  return (scale[scale.length - 1] && scale[scale.length - 1].grade) || 'D';
}

export function scoreMCQ(questions, pickedIndices) {
  const qs = Array.isArray(questions) ? questions : [];
  const picks = Array.isArray(pickedIndices) ? pickedIndices : [];
  const max = qs.length;
  let raw = 0;
  for (let i = 0; i < qs.length; i++) {
    const correctIndex = Number(qs[i]?.correctIndex);
    if (Number(picks[i]) === correctIndex) raw += 1;
  }
  return { raw, max, percent: toPercent(raw, max) };
}


