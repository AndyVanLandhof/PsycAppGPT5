import { toPercent } from '../../exam/score.js';
// Markers expect a caller function with signature: (prompt: string) => Promise<string>

// Note: these are functions, but in React usage you can wrap in a hook or pass in callAI

export async function markShortAnswer(topicTitle, payload, callAI) {
  const prompt = `You are an AQA 7182 examiner. Mark the short answer strictly per AQA mark scheme.
Return JSON ONLY: { raw:number, max:number, percent:number, perItem:number[], rationale:string }
Rules: Do not rewrite the answer. Cap marks to max. Award credit based on markscheme keywords/ideas.`;
  const body = `${prompt}\n\n${JSON.stringify(payload)}`;
  const text = await callAI(body, 'ChatGPT', { useVault: false });
  return normalize(text, payload.items);
}

export async function markScenario(topicTitle, payload, callAI) {
  const prompt = `You are an AQA 7182 examiner. Mark AO2 scenario/application responses.
Return JSON ONLY: { raw:number, max:number, percent:number, perItem:number[], rationale:string }
Rules: Cap marks; assess application accuracy, relevance, linkage to theory; reference markscheme cues.`;
  const body = `${prompt}\n\n${JSON.stringify(payload)}`;
  const text = await callAI(body, 'ChatGPT', { useVault: false });
  return normalize(text, payload.items);
}

export async function markEssay16(topicTitle, question, answer, callAI) {
  const payload = { stem: question, studentAnswer: answer };
  const prompt = `You are an AQA 7182 examiner. Mark a 16-mark essay using level descriptors.
Return JSON ONLY: { raw:0..16, max:16, percent:number, band:1|2|3|4, rationale:string, AO1:string, AO2:string, AO3:string }
Rules: Cap marks; do not rewrite the answer; include succinct AO1/AO2/AO3 commentary.`;
  const body = `${prompt}\n\n${JSON.stringify(payload)}`;
  const text = await callAI(body, 'ChatGPT', { useVault: false });
  return normalizeEssay(text);
}

function safeParse(text) {
  try { return JSON.parse(text); } catch(_) {}
  try { return JSON.parse(String(text).replace(/^```json\n?|```$/g, '').trim()); } catch(_) {}
  const m = String(text).match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch(_) {} }
  return null;
}

function normalize(text, items) {
  const parsed = safeParse(text) || {};
  const max = Number(parsed.max) || items.reduce((a,b)=> a + (Number(b.max)||0), 0) || 0;
  const raw = Math.max(0, Math.min(max, Number(parsed.raw)||0));
  const percent = toPercent(raw, max);
  return { raw, max, percent, perItem: Array.isArray(parsed.perItem) ? parsed.perItem : [], rationale: parsed.rationale || '' };
}

function normalizeEssay(text) {
  const parsed = safeParse(text) || {};
  const max = 16;
  const raw = Math.max(0, Math.min(max, Number(parsed.raw)||0));
  const percent = toPercent(raw, max);
  return { raw, max, percent, rationale: parsed.rationale || parsed.feedback || '' };
}


