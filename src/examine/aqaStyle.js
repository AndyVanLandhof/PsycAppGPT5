// Attempts to load style exemplars from past paper extracts in /public/vault/PastPapers/*_extracted.txt
// Falls back to built-in templates if fetch fails.

// In Vite, assets under public/ are served at the root, so omit "/public"
const candidateFiles = [
  '/vault/PastPapers/AQA-71821-QP-JUN19_extracted.txt',
  '/vault/PastPapers/AQA-71821-QP-JUN22_extracted.txt',
  '/vault/PastPapers/AQA-71822-QP-JUN19_extracted.txt',
  '/vault/PastPapers/AQA-71822-QP-JUN22_extracted.txt'
];

export async function getAqaStyleExamples() {
  const examples = { mcq: [], short: [], scenario: [], essay: [] };
  try {
    const texts = await Promise.all(candidateFiles.map(async (p) => {
      try { const res = await fetch(p); if (!res.ok) return ''; return await res.text(); } catch { return ''; }
    }));
    const body = texts.join('\n');
    const lines = body.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    for (const ln of lines) {
      const m = ln.match(/\[(\d+)\s*marks?\]/i);
      if (m) {
        const marks = parseInt(m[1], 10);
        if (marks >= 2 && marks <= 6) examples.short.push(ln);
        else if (marks >= 7 && marks <= 12) examples.scenario.push(ln);
        else if (marks >= 16) examples.essay.push(ln);
        continue;
      }
      if (/which of the following|which statement|identify|select/i.test(ln)) {
        examples.mcq.push(ln);
      }
    }
  } catch {}
  // Fallbacks if empty
  if (examples.mcq.length === 0) examples.mcq = [
    'Which of the following is an example of [concept]?',
    'Which statement best describes [concept]?' 
  ];
  if (examples.short.length === 0) examples.short = [
    'Outline [concept]. [4 marks]',
    'Explain one [concept] in context. [6 marks]'
  ];
  if (examples.scenario.length === 0) examples.scenario = [
    'Apply [theory] to the scenario described. [6 marks]'
  ];
  if (examples.essay.length === 0) examples.essay = [
    'Discuss [theory/model], including AO1/AO3. [16 marks]'
  ];
  return examples;
}

export async function getAqaStyleExamplesCached() {
  try {
    const cached = sessionStorage.getItem('aqa-style-examples');
    if (cached) return JSON.parse(cached);
  } catch {}
  const ex = await getAqaStyleExamples();
  try { sessionStorage.setItem('aqa-style-examples', JSON.stringify(ex)); } catch {}
  return ex;
}


