# Reinforce Content Banks

Pre-generated content for Flashcards, Quiz, and Active Recall.

## Directory Structure

```
banks/
├── aqa-psych/           # AQA Psychology 7182
│   ├── memory_multi-store-model_flashcards.json
│   ├── memory_multi-store-model_quiz.json
│   ├── memory_multi-store-model_recall.json
│   └── ...
├── ocr-rs/              # OCR Religious Studies H573
│   ├── ancient-philosophical-influences_plato_flashcards.json
│   └── ...
└── README.md
```

## File Naming Convention

`{topic-id}_{subtopic-id}_{type}.json`

Where `type` is one of: `flashcards`, `quiz`, `recall`

## Generating Banks

Run the batch generation script:

```bash
# Generate all banks for all curricula
node scripts/generate-banks.cjs

# Generate for specific curriculum
node scripts/generate-banks.cjs --curriculum aqa-psych

# Generate specific type only
node scripts/generate-banks.cjs --type flashcards

# Generate for specific topic
node scripts/generate-banks.cjs --topic memory

# Combine options
node scripts/generate-banks.cjs --curriculum aqa-psych --type quiz --topic memory
```

## Bank JSON Structure

### Flashcards
```json
{
  "curriculum": "aqa-psych",
  "topic": "memory",
  "topicTitle": "Memory",
  "subTopic": "multi-store-model",
  "subTopicTitle": "Multi-store model",
  "type": "flashcards",
  "generatedAt": "2025-12-06T...",
  "items": [
    {
      "question": "What are the three stores in the MSM?",
      "answer": "Sensory register, STM, LTM",
      "ao": "AO1"
    }
  ]
}
```

### Quiz
```json
{
  "items": [
    {
      "id": "multi-store-model-q1",
      "question": "Which store has unlimited capacity?",
      "options": ["Sensory register", "STM", "LTM", "Working memory"],
      "correctAnswer": 2,
      "ao": "AO1",
      "explanation": "LTM has unlimited capacity..."
    }
  ]
}
```

### Active Recall
```json
{
  "items": [
    {
      "ao": "AO1",
      "prompt": "Describe the Multi-Store Model of memory.",
      "keyPoints": ["Three stores", "Linear flow", "Rehearsal loop"],
      "wordRange": "100-150",
      "markingCriteria": {
        "full": "All 3 stores described with characteristics",
        "partial": "1-2 stores or lacking detail",
        "none": "Missing key components"
      }
    }
  ]
}
```

## Usage in Components

```javascript
import { sampleFlashcards, sampleQuizQuestions, getRandomRecallPrompt } from '../utils/reinforceBank';

// Load 5 random flashcards
const cards = await sampleFlashcards('memory', 'multi-store-model', 5);

// Load 10 random quiz questions
const questions = await sampleQuizQuestions('memory', 'multi-store-model', 10);

// Get an AO1 recall prompt
const prompt = await getRandomRecallPrompt('memory', 'multi-store-model', 'AO1');
```

