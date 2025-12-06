#!/usr/bin/env node
/**
 * Batch Generation Script for Flashcards, Quiz, and Active Recall Banks
 * 
 * Usage:
 *   node scripts/generate-banks.cjs [--curriculum aqa-psych|ocr-rs] [--type flashcards|quiz|recall|all] [--topic <topic-id>]
 * 
 * Examples:
 *   node scripts/generate-banks.cjs                           # Generate all for all curricula
 *   node scripts/generate-banks.cjs --curriculum aqa-psych    # Generate all for AQA Psychology
 *   node scripts/generate-banks.cjs --type flashcards         # Generate only flashcards
 *   node scripts/generate-banks.cjs --topic memory            # Generate only for 'memory' topic
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY in .env file');
  process.exit(1);
}

const MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 2000;
const RATE_LIMIT_DELAY_MS = 1500; // Delay between API calls to avoid rate limiting

// ============================================================================
// Topic Data (copied from src files for Node.js compatibility)
// ============================================================================

const psychologyTopics = {
  "social-influence": {
    id: "social-influence",
    title: "Social Influence",
    subTopics: [
      { id: "types-of-conformity", title: "Types of conformity" },
      { id: "explanations-for-conformity", title: "Explanations for conformity" },
      { id: "obedience", title: "Obedience" },
      { id: "resistance-to-social-influence", title: "Resistance to social influence" },
      { id: "minority-influence", title: "Minority influence" }
    ]
  },
  "memory": {
    id: "memory",
    title: "Memory",
    subTopics: [
      { id: "multi-store-model", title: "Multi-store model" },
      { id: "working-memory-model", title: "Working memory model" },
      { id: "explanations-for-forgetting", title: "Explanations for forgetting" },
      { id: "eyewitness-testimony", title: "Eyewitness testimony" }
    ]
  },
  "attachment": {
    id: "attachment",
    title: "Attachment",
    subTopics: [
      { id: "animal-studies", title: "Animal studies" },
      { id: "explanations-of-attachment", title: "Explanations of attachment" },
      { id: "strange-situation", title: "Ainsworth's Strange Situation" },
      { id: "cultural-variations", title: "Cultural variations" },
      { id: "maternal-deprivation", title: "Maternal deprivation" }
    ]
  },
  "approaches-in-psychology": {
    id: "approaches-in-psychology",
    title: "Approaches in Psychology",
    subTopics: [
      { id: "origins-of-psychology", title: "Origins of psychology" },
      { id: "learning-approaches-behaviourism", title: "Learning approaches: Behaviourist" },
      { id: "learning-approaches-slt", title: "Learning approaches: Social Learning Theory" },
      { id: "cognitive-approach", title: "Cognitive approach" },
      { id: "biological-approach", title: "Biological approach" },
      { id: "psychodynamic-approach", title: "Psychodynamic approach" },
      { id: "humanistic-approach", title: "Humanistic approach" }
    ]
  },
  "biopsychology": {
    id: "biopsychology",
    title: "Biopsychology",
    subTopics: [
      { id: "nervous-system", title: "The divisions of the nervous system" },
      { id: "neurons-synaptic-transmission", title: "Neurons and synaptic transmission" },
      { id: "endocrine-system", title: "The endocrine system" },
      { id: "fight-or-flight", title: "The fight or flight response" },
      { id: "localisation-of-function", title: "Localisation of function in the brain" },
      { id: "plasticity-functional-recovery", title: "Plasticity and functional recovery" }
    ]
  },
  "psychopathology": {
    id: "psychopathology",
    title: "Psychopathology",
    subTopics: [
      { id: "definitions-abnormality", title: "Definitions of abnormality" },
      { id: "phobias", title: "Phobias" },
      { id: "depression", title: "Depression" },
      { id: "ocd", title: "OCD" }
    ]
  },
  "research-methods": {
    id: "research-methods",
    title: "Research Methods",
    subTopics: [
      { id: "experimental-method", title: "Experimental method" },
      { id: "observational-techniques", title: "Observational techniques" },
      { id: "self-report-techniques", title: "Self-report techniques" },
      { id: "correlations", title: "Correlations" },
      { id: "scientific-processes", title: "Scientific processes" },
      { id: "data-handling-analysis", title: "Data handling and analysis" }
    ]
  },
  "issues-and-debates": {
    id: "issues-and-debates",
    title: "Issues and Debates",
    subTopics: [
      { id: "gender-culture-bias", title: "Gender and culture in Psychology" },
      { id: "free-will-determinism", title: "Free will and determinism" },
      { id: "nature-nurture", title: "The nature-nurture debate" },
      { id: "holism-reductionism", title: "Holism and reductionism" }
    ]
  }
};

const ocrTopics = {
  "ancient-philosophical-influences": {
    id: "ancient-philosophical-influences",
    title: "Ancient Philosophical Influences",
    subTopics: [
      { id: "plato", title: "Plato's Theory of Forms" },
      { id: "aristotle", title: "Aristotle's Four Causes" },
      { id: "comparison", title: "Plato vs Aristotle" }
    ]
  },
  "soul-mind-body": {
    id: "soul-mind-body",
    title: "Soul, Mind and Body",
    subTopics: [
      { id: "plato-soul", title: "Plato's View of the Soul" },
      { id: "aristotle-soul", title: "Aristotle's View of the Soul" },
      { id: "descartes", title: "Descartes' Dualism" }
    ]
  },
  "arguments-existence-god": {
    id: "arguments-existence-god",
    title: "Arguments for the Existence of God",
    subTopics: [
      { id: "cosmological", title: "Cosmological Argument" },
      { id: "teleological", title: "Teleological Argument" },
      { id: "ontological", title: "Ontological Argument" }
    ]
  },
  "problem-of-evil": {
    id: "problem-of-evil",
    title: "Problem of Evil",
    subTopics: [
      { id: "logical", title: "Logical Problem of Evil" },
      { id: "theodicies", title: "Theodicies and Defenses" }
    ]
  },
  "religious-experience": {
    id: "religious-experience",
    title: "Religious Experience",
    subTopics: [
      { id: "types", title: "Types of Religious Experience" },
      { id: "otto-james", title: "Otto & William James" },
      { id: "verification", title: "Verification Challenges" }
    ]
  },
  "natural-law": {
    id: "natural-law",
    title: "Natural Law",
    subTopics: [
      { id: "aquinas", title: "Aquinas' 5 Primary Precepts" },
      { id: "double-effect", title: "Doctrine of Double Effect" }
    ]
  },
  "situation-ethics": {
    id: "situation-ethics",
    title: "Situation Ethics",
    subTopics: [
      { id: "agape", title: "Agape and Relativism" },
      { id: "principles", title: "Four Working Principles" }
    ]
  },
  "utilitarianism": {
    id: "utilitarianism",
    title: "Utilitarianism",
    subTopics: [
      { id: "bentham-hedonic", title: "Bentham & the Hedonic Calculus" },
      { id: "mill-rule-util", title: "Mill & Rule Utilitarianism" }
    ]
  },
  "augustine": {
    id: "augustine",
    title: "Augustine's Teachings",
    subTopics: [
      { id: "original", title: "Original Sin" },
      { id: "grace", title: "Grace and Salvation" }
    ]
  }
};

const CURRICULA = {
  'aqa-psych': {
    name: 'AQA Psychology 7182',
    topics: psychologyTopics,
    spec: 'AQA Psychology 7182'
  },
  'ocr-rs': {
    name: 'OCR Religious Studies H573',
    topics: ocrTopics,
    spec: 'OCR Religious Studies H573'
  }
};

// ============================================================================
// Prompt Templates
// ============================================================================

function getFlashcardPrompt(curriculum, topic, subTopic) {
  const spec = CURRICULA[curriculum].spec;
  return `You are an expert ${spec} teacher creating flashcards for A-Level students.

TOPIC: ${topic.title}
SUB-TOPIC: ${subTopic.title}

Create EXACTLY 20 flashcards for high-velocity revision with THIS DISTRIBUTION:
- 12 x AO1 (knowledge/understanding - key terms, definitions, studies with dates and findings)
- 4 x AO2 (application - apply theory to short scenarios)
- 4 x AO3 (evaluation - strengths, limitations, methodological critiques)

Each flashcard must have:
- A clear, concise question
- A precise answer (max 40 words)
- An AO tag (AO1, AO2, or AO3)

Rules:
- AO1 questions: "What is...?", "Define...", "What did [Researcher, Year] find about...?"
- AO2 questions: "How does X apply to...?", "Apply X to this scenario: ..."
- AO3 questions: "Give one strength/limitation of X", "Evaluate the methodology of [Study]"
- Include named studies with researcher names and years where relevant
- Keep answers exam-focused and evidence-based

Return in this JSON format:
{
  "flashcards": [
    {
      "question": "Clear question text",
      "answer": "Precise answer (max 40 words)",
      "ao": "AO1" | "AO2" | "AO3"
    }
  ]
}`;
}

function getQuizPrompt(curriculum, topic, subTopic) {
  const spec = CURRICULA[curriculum].spec;
  return `You are an expert ${spec} teacher creating a quiz for A-Level students.

TOPIC: ${topic.title}
SUB-TOPIC: ${subTopic.title}

Create EXACTLY 15 multiple-choice questions (MCQs), each with 4 options:
- 1 correct answer
- 3 plausible but incorrect distractors

Distribution:
- 9 x AO1 (knowledge - terms, theories, studies with dates)
- 3 x AO2 (application - short scenario/data-based)
- 3 x AO3 (evaluation - methodological critique or comparative judgement)

Rules:
- Questions must be clear and unambiguous
- Options must be mutually exclusive
- Avoid "all of the above" or "none of the above"
- Include named studies with researcher names and years
- Explanations should reference specific evidence

Return in this JSON format:
{
  "questions": [
    {
      "question": "Clear MCQ question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "ao": "AO1" | "AO2" | "AO3",
      "explanation": "1-2 sentence rationale with evidence"
    }
  ]
}`;
}

function getRecallPrompt(curriculum, topic, subTopic) {
  const spec = CURRICULA[curriculum].spec;
  return `You are an expert ${spec} teacher creating Active Recall prompts for A-Level students.

TOPIC: ${topic.title}
SUB-TOPIC: ${subTopic.title}

Create EXACTLY 9 Active Recall prompts with THIS DISTRIBUTION:
- 3 x AO1 (knowledge recall - ask student to recall key concepts, studies, definitions)
- 3 x AO2 (application - give a scenario and ask student to apply theory)
- 3 x AO3 (evaluation - ask student to evaluate using PEEL structure)

For each prompt, provide:
- A clear prompt question
- Key points the student should include in their answer (for self-marking)
- Expected word count range
- Marking criteria (what constitutes full/partial/no marks)

Return in this JSON format:
{
  "prompts": [
    {
      "ao": "AO1" | "AO2" | "AO3",
      "prompt": "Clear recall prompt",
      "keyPoints": ["Point 1 student should mention", "Point 2", "Point 3"],
      "wordRange": "50-100",
      "markingCriteria": {
        "full": "Includes all key points with accurate detail",
        "partial": "Includes 1-2 key points or lacks detail",
        "none": "Missing key points or inaccurate"
      }
    }
  ]
}`;
}

// ============================================================================
// API Functions
// ============================================================================

async function callOpenAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  try {
    return JSON.parse(content);
  } catch (e) {
    // Try to extract JSON from the response
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error(`Failed to parse JSON response: ${content.substring(0, 200)}...`);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Generation Functions
// ============================================================================

async function generateFlashcards(curriculum, topic, subTopic) {
  const prompt = getFlashcardPrompt(curriculum, topic, subTopic);
  const result = await callOpenAI(prompt);
  return {
    curriculum,
    topic: topic.id,
    topicTitle: topic.title,
    subTopic: subTopic.id,
    subTopicTitle: subTopic.title,
    type: 'flashcards',
    generatedAt: new Date().toISOString(),
    items: result.flashcards || []
  };
}

async function generateQuiz(curriculum, topic, subTopic) {
  const prompt = getQuizPrompt(curriculum, topic, subTopic);
  const result = await callOpenAI(prompt);
  
  // Normalize quiz questions to match component expectations
  const questions = (result.questions || []).map((q, idx) => ({
    id: `${subTopic.id}-q${idx + 1}`,
    question: q.question,
    options: q.options,
    correctAnswer: q.answer,
    ao: q.ao,
    explanation: q.explanation
  }));
  
  return {
    curriculum,
    topic: topic.id,
    topicTitle: topic.title,
    subTopic: subTopic.id,
    subTopicTitle: subTopic.title,
    type: 'quiz',
    generatedAt: new Date().toISOString(),
    items: questions
  };
}

async function generateRecall(curriculum, topic, subTopic) {
  const prompt = getRecallPrompt(curriculum, topic, subTopic);
  const result = await callOpenAI(prompt);
  return {
    curriculum,
    topic: topic.id,
    topicTitle: topic.title,
    subTopic: subTopic.id,
    subTopicTitle: subTopic.title,
    type: 'recall',
    generatedAt: new Date().toISOString(),
    items: result.prompts || []
  };
}

// ============================================================================
// File Operations
// ============================================================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveBank(bank) {
  const baseDir = path.join(__dirname, '..', 'public', 'banks', bank.curriculum);
  ensureDir(baseDir);
  
  const filename = `${bank.topic}_${bank.subTopic}_${bank.type}.json`;
  const filepath = path.join(baseDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(bank, null, 2));
  return filepath;
}

// ============================================================================
// Main Generation Loop
// ============================================================================

async function generateAll(options = {}) {
  const { curriculum: targetCurriculum, type: targetType, topic: targetTopic } = options;
  
  const curricula = targetCurriculum ? [targetCurriculum] : Object.keys(CURRICULA);
  const types = targetType === 'all' || !targetType ? ['flashcards', 'quiz', 'recall'] : [targetType];
  
  let totalGenerated = 0;
  let totalErrors = 0;
  
  for (const curriculumId of curricula) {
    const curriculum = CURRICULA[curriculumId];
    if (!curriculum) {
      console.error(`❌ Unknown curriculum: ${curriculumId}`);
      continue;
    }
    
    console.log(`\n📚 Processing ${curriculum.name}...`);
    
    const topics = Object.values(curriculum.topics);
    const filteredTopics = targetTopic ? topics.filter(t => t.id === targetTopic) : topics;
    
    for (const topic of filteredTopics) {
      console.log(`\n  📖 ${topic.title}`);
      
      for (const subTopic of topic.subTopics) {
        for (const type of types) {
          const label = `${type.padEnd(10)} ${subTopic.title}`;
          process.stdout.write(`    ⏳ ${label}...`);
          
          try {
            let bank;
            switch (type) {
              case 'flashcards':
                bank = await generateFlashcards(curriculumId, topic, subTopic);
                break;
              case 'quiz':
                bank = await generateQuiz(curriculumId, topic, subTopic);
                break;
              case 'recall':
                bank = await generateRecall(curriculumId, topic, subTopic);
                break;
            }
            
            const filepath = saveBank(bank);
            const itemCount = bank.items?.length || 0;
            process.stdout.write(`\r    ✅ ${label} (${itemCount} items) → ${path.basename(filepath)}\n`);
            totalGenerated++;
            
            // Rate limiting
            await delay(RATE_LIMIT_DELAY_MS);
            
          } catch (error) {
            process.stdout.write(`\r    ❌ ${label} - ${error.message}\n`);
            totalErrors++;
          }
        }
      }
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Generated: ${totalGenerated} banks`);
  if (totalErrors > 0) {
    console.log(`❌ Errors: ${totalErrors}`);
  }
  console.log(`📁 Output: public/banks/`);
}

// ============================================================================
// CLI
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--curriculum' && args[i + 1]) {
      options.curriculum = args[i + 1];
      i++;
    } else if (args[i] === '--type' && args[i + 1]) {
      options.type = args[i + 1];
      i++;
    } else if (args[i] === '--topic' && args[i + 1]) {
      options.topic = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage: node scripts/generate-banks.cjs [options]

Options:
  --curriculum <id>   Generate for specific curriculum (aqa-psych, ocr-rs)
  --type <type>       Generate specific type (flashcards, quiz, recall, all)
  --topic <id>        Generate for specific topic only
  --help, -h          Show this help

Examples:
  node scripts/generate-banks.cjs                           # Generate all
  node scripts/generate-banks.cjs --curriculum aqa-psych    # AQA Psychology only
  node scripts/generate-banks.cjs --type flashcards         # Flashcards only
  node scripts/generate-banks.cjs --topic memory            # Memory topic only
      `);
      process.exit(0);
    }
  }
  
  return options;
}

// Run
const options = parseArgs();
console.log('🚀 Starting Bank Generation...');
console.log(`   Curriculum: ${options.curriculum || 'all'}`);
console.log(`   Type: ${options.type || 'all'}`);
console.log(`   Topic: ${options.topic || 'all'}`);

generateAll(options).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

