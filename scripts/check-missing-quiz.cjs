// Check missing quiz banks for AQA, OCR RS, and Edexcel EngLit (CommonJS)
const fs = require('fs');
const path = require('path');

function getTopicData(file) {
  const mod = require(file);
  return mod.topicData || mod.default || mod;
}

function findMissing(curr, topicData) {
  const base = path.join('public', 'banks', curr);
  const files = new Set(fs.readdirSync(base).filter(f => f.endsWith('_quiz.json')));
  const missing = [];
  (topicData || []).forEach(t => {
    (t.subTopics || []).forEach(st => {
      const name = `${t.id}_${st.id}_quiz.json`;
      if (!files.has(name)) missing.push(name);
    });
  });
  return { have: files.size, missing };
}

const aqa = getTopicData('./src/psychologyTopics.js');
const ocr = getTopicData('./src/topicData.js');
const eng = getTopicData('./src/englishLitTopics.js');

console.log('AQA:', findMissing('aqa-psych', aqa));
console.log('OCR:', findMissing('ocr-rs', ocr));
console.log('EngLit:', findMissing('edexcel-englit', eng));

