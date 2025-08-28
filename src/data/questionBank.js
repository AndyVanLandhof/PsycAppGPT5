// 🔹 Question Bank Loader (works with EITHER a single big JSON OR per-question JSON files)
//
// Supported layouts:
//  A) One big array:   /src/vault/bank.json        -> [ { ...question... }, ... ]
//  B) Many files:      /src/vault/questions/**.json (e.g. /memory/mcq/*.json)
//
// Normalised schema we expose to the app:
//  {
//    id: string,
//    topic: string,           // e.g. "memory", "attachment", ...
//    mode: "mcq"|"short"|"scenario"|"essay",
//    marks: number,           // 1..16
//    stem: string,
//    choices?: string[],      // for mcq
//    answer?: number|string,  // index (for mcq) or canonical string
//    indicative: string[],    // keywords / indicative points
//    band?: any,
//    meta?: object
//  }

// Try to import a single big bank.json if it exists (safely via glob)
let bigArray = [];
try {
  const big = import.meta.glob('/src/vault/bank.json', { eager: true, import: 'default' });
  const mods = Object.values(big);
  if (mods.length && Array.isArray(mods[0])) bigArray = mods[0];
} catch (_) { bigArray = []; }

// Also try to import scattered per-question files
const modules = import.meta.glob('/src/vault/questions/**/*.json', { eager: true, import: 'default' });

const _byTopicMode = new Map(); // key: `${topic}::${mode}` -> array

function logError(msg, file, raw) {
  // eslint-disable-next-line no-console
  console.error(`[VAULT] ${msg}${file ? ' @ ' + file : ''}`, raw);
}

// 🔧 Mapper: adapt various raw schemas to our normalised one.
// If your bank uses different keys, adjust here (or send me one example and I'll tailor it).
function fromRaw(raw, file) {
  if (!raw || typeof raw !== 'object') return null;

  // Heuristics for common key names
  const id        = raw.id ?? raw._id ?? raw.key ?? null;
  const topic     = (raw.topic ?? raw.section ?? raw.domain ?? '').toString().toLowerCase();
  const mode      = (raw.mode ?? raw.type ?? '').toString().toLowerCase(); // expect: mcq|short|scenario|essay
  const marks     = Number(raw.marks ?? raw.maxMarks ?? (mode === 'mcq' ? 1 : (mode === 'essay' ? 16 : 6)));
  const stem      = (raw.stem ?? raw.question ?? raw.prompt ?? '').toString();
  const choices   = Array.isArray(raw.choices) ? raw.choices
                   : Array.isArray(raw.options) ? raw.options
                   : null;
  const answer    = (typeof raw.answer !== 'undefined') ? raw.answer
                   : (typeof raw.correctIndex !== 'undefined') ? raw.correctIndex
                   : (typeof raw.correct !== 'undefined') ? raw.correct
                   : null;
  const indicative= Array.isArray(raw.indicative) ? raw.indicative
                   : Array.isArray(raw.keywords) ? raw.keywords
                   : [];
  const band      = raw.band ?? null;
  const meta      = raw.meta ?? {};

  if (!id || !topic || !mode || !stem) {
    logError('Missing required fields (id/topic/mode/stem)', file, raw);
    return null;
  }

  const q = { id: String(id), topic, mode, marks, stem, choices, answer, indicative, band, meta };

  if (q.mode === 'mcq') {
    if (!q.choices || q.answer === null || typeof q.answer === 'undefined') {
      logError('MCQ missing choices/answer', file, raw);
      return null;
    }
  }

  return q;
}

// Index builder for any array of raw questions
function indexMany(rawArray, fileLabel = '') {
  for (const raw of rawArray) {
    const q = fromRaw(raw, fileLabel);
    if (!q) continue;
    const key = `${q.topic}::${q.mode}`;
    if (!_byTopicMode.has(key)) _byTopicMode.set(key, []);
    _byTopicMode.get(key).push(q);
  }
}

// 1) Add big array (if present)
if (Array.isArray(bigArray) && bigArray.length) {
  indexMany(bigArray, '/src/vault/bank.json');
}

// 2) Add scattered files (if present)
Object.entries(modules).forEach(([file, json]) => {
  // if file held an array, index all; else index single
  if (Array.isArray(json)) indexMany(json, file);
  else {
    const q = fromRaw(json, file);
    if (!q) return;
    const key = `${q.topic}::${q.mode}`;
    if (!_byTopicMode.has(key)) _byTopicMode.set(key, []);
    _byTopicMode.get(key).push(q);
  }
});

// ---------- Public API ----------

export function countQuestions({ topic, mode }) {
  const key = `${topic.toLowerCase()}::${mode.toLowerCase()}`;
  return _byTopicMode.get(key)?.length ?? 0;
}

export function fetchAll({ topic, mode }) {
  const key = `${topic.toLowerCase()}::${mode.toLowerCase()}`;
  return [...(_byTopicMode.get(key) ?? [])];
}

export function sample({ topic, mode, n }) {
  const arr = fetchAll({ topic, mode });
  if (!arr.length) {
    console.warn(`[VAULT] No questions for ${topic}/${mode}`);
    return [];
  }
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

export function sampleSeeded({ topic, mode, n, seed = 123456 }) {
  let s = seed >>> 0;
  const rand = () => {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const arr = fetchAll({ topic, mode });
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}
