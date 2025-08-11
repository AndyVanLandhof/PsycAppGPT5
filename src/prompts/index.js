export function buildAO1SummaryPrompt(topicTitle, subTopicTitle) {
  return `You are an expert AQA Psychology teacher creating a concise AO1 summary for AQA Psychology 7182.

TOPIC: ${topicTitle}
SUB-TOPIC: ${subTopicTitle}

Return ONLY plain text. Include:
- Key definitions and mechanisms (crisp, exam-ready)
- 2–3 named studies with researcher + year + one precise finding (number/percentage/measure)
- Any key models/frameworks and components
- Typical exam pitfalls to avoid (brief)`;
}

export function buildAO3EvaluationPrompt(topicTitle, subTopicTitle) {
  return `You are an expert AQA Psychology teacher creating AO3 evaluation for AQA Psychology 7182.

TOPIC: ${topicTitle}
SUB-TOPIC: ${subTopicTitle}

Return ONLY plain text with exactly 5 PEEL-style bullet points. For each point:
- Point (clear evaluative claim)
- Evidence (named study/reason)
- Explain (why it matters)
- Link (to question or theory)`;
}

export function buildScenarioPrompt(topicTitle, subTopicTitle) {
  return `You are an expert AQA Psychology teacher generating an AO2 scenario for AQA Psychology 7182.

TOPIC: ${topicTitle}
SUB-TOPIC: ${subTopicTitle}

1) Create a short, novel 2–3 sentence scenario (no names from textbooks) requiring application of this sub-topic.
2) Provide a model applied answer in <=120 words.

Format:
Scenario:\n...
Answer:\n...`;
}

export function buildMarkschemeCheckerPrompt(questionText, essayText) {
  return `You are an experienced AQA Psychology 7182 examiner. Mark the student's answer.

QUESTION: ${questionText}
STUDENT ANSWER:\n${essayText}

Mark out of 16 with AO1/AO3 split. Return JSON only:
{
  "mark": number, 
  "max": 16,
  "aoBreakdown": { "ao1": number, "ao3": number },
  "band": "A*|A|B|C|D|E|U",
  "improvements": ["...", "...", "..."]
}`;
} 