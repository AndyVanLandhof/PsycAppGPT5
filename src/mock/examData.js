// Minimal mock data; replace with vault-driven later

export const mcqBank = {
  memory: [
    { question: 'Which component is NOT part of the multi-store model?', options: ['Sensory register', 'Short-term memory', 'Long-term memory', 'Procedural buffer'], correctIndex: 3 },
    { question: 'Capacity of STM is about…', options: ['3 items', '7±2 items', '15 items', 'Unlimited'], correctIndex: 1 },
  ],
};

export const shortBank = {
  memory: [
    { prompt: 'Outline and briefly evaluate the working memory model.', max: 6, markscheme: ['central executive', 'phonological loop', 'visuo-spatial sketchpad', 'episodic buffer', 'dual-task', 'Baddeley'] },
    { prompt: 'Define coding in memory with one example.', max: 4, markscheme: ['acoustic', 'semantic', 'visual', 'Baddeley 1966'] },
  ]
};

export const scenarioBank = {
  memory: [
    { prompt: 'Apply interference theory to explain exam forgetting.', max: 6, markscheme: ['proactive', 'retroactive', 'similarity', 'McGeoch & McDonald'] },
    { prompt: 'Explain context-dependent cues with an example.', max: 6, markscheme: ['context', 'Godden & Baddeley', 'state', 'cues'] },
  ]
};

export const essayBank = {
  memory: [
    { prompt: 'Discuss the multi-store model of memory (16 marks).', bandDescriptors: {
      L1: 'Limited AO1/AO3; largely descriptive; little evaluation.',
      L2: 'Some accurate AO1; limited AO3; basic evaluation and structure.',
      L3: 'Generally accurate AO1; reasonable AO3 with some balance; mostly coherent.',
      L4: 'Accurate, detailed AO1; balanced AO3 with depth; coherent, logical, well-supported.'
    }}
  ]
};

// Helpers to get sets with fallback and simple sampling
function sample(arr, n) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[i % arr.length]);
  return out;
}

export function getMCQSet(topicId, n = 10) {
  const bank = mcqBank[topicId] || [];
  const items = sample(bank, n);
  return items.map((q) => ({ ...q }));
}

export function getShortSet(topicId, n = 6) {
  const bank = shortBank[topicId] || [];
  const items = sample(bank, n);
  return items.map((q) => ({ ...q }));
}

export function getScenarioSet(topicId, n = 2) {
  const bank = scenarioBank[topicId] || [];
  const items = sample(bank, n);
  return items.map((q) => ({ ...q }));
}

export function getEssayStem(topicId) {
  const bank = essayBank[topicId] || [];
  return bank[0] || { prompt: `Write a 16-mark essay about ${topicId}.`, bandDescriptors: {} };
}


