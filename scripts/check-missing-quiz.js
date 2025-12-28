// ESM script: Check missing quiz banks for AQA, OCR RS, and Edexcel EngLit
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getTopicData(relPath) {
  const mod = await import(path.join(__dirname, relPath));
  const data = mod.topicData || mod.default || mod;
  // Some modules export { topicData }, others export { default: { topicData } }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.topicData)) return data.topicData;
  return data;
}

function findMissing(curr, topicData) {
  const base = path.join(__dirname, '..', 'public', 'banks', curr);
  const files = new Set(fs.readdirSync(base).filter(f => f.endsWith('_quiz.json')));
  const missing = [];
  const list = Array.isArray(topicData) ? topicData : Object.values(topicData || {});
  list.forEach(t => {
    (t.subTopics || []).forEach(st => {
      const name = `${t.id}_${st.id}_quiz.json`;
      if (!files.has(name)) missing.push(name);
    });
  });
  return { have: files.size, missing };
}

const aqa = await getTopicData('../src/psychologyTopics.js');
const ocr = await getTopicData('../src/topicData.js');
const eng = await getTopicData('../src/englishLitTopics.js');

console.log('AQA:', findMissing('aqa-psych', aqa));
console.log('OCR:', findMissing('ocr-rs', ocr));
console.log('EngLit:', findMissing('edexcel-englit', eng));

