import React, { useState } from 'react';
import { Sparkles, Clock, Play, CheckCircle, Loader2, Volume2, VolumeX, Pause } from 'lucide-react';
import { getSelectedCurriculum } from '../config/curricula';
import { useAIService } from '../hooks/useAIService';
import { useElevenLabsTTS } from '../hooks/useElevenLabsTTS';
import SyntheticExam from './SyntheticExam.jsx';

// Paper configurations by curriculum
// durationMinutes is used for the timed SyntheticExam; duration is the display label.
const PAPER_CONFIG = {
  'aqa-psych': {
    examBoard: 'AQA',
    subject: 'Psychology',
    code: '7182',
    papers: [
      {
        id: 'paper1',
        name: 'Paper 1: Introductory Topics',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 96,
        paperCode: '7182/1',
        topics: ['Social Influence', 'Memory', 'Attachment', 'Psychopathology']
      },
      {
        id: 'paper2',
        name: 'Paper 2: Psychology in Context',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 96,
        paperCode: '7182/2',
        topics: ['Approaches', 'Biopsychology', 'Research Methods']
      },
      {
        id: 'paper3',
        name: 'Paper 3: Issues and Options',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 96,
        paperCode: '7182/3',
        topics: ['Issues and Debates', 'Relationships', 'Schizophrenia', 'Forensic Psychology']
      },
    ]
  },
  'ocr-rs': {
    examBoard: 'OCR',
    subject: 'Religious Studies',
    code: 'H573',
    papers: [
      {
        id: 'paper1',
        name: 'Paper 1: Philosophy of Religion',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 120,
        paperCode: 'H573/01',
        questionsToAnswer: 3, // mirror "answer 3 of 4" behaviour
        topics: ['Ancient Philosophical Influences', 'Soul, Mind and Body', 'Arguments for God', 'Religious Experience', 'Religious Language']
      },
      {
        id: 'paper2',
        name: 'Paper 2: Religion and Ethics',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 120,
        paperCode: 'H573/02',
        topics: ['Natural Law', 'Situation Ethics', 'Kantian Ethics', 'Utilitarianism', 'Euthanasia', 'Business Ethics']
      },
      {
        id: 'paper3',
        name: 'Paper 3: Developments in Christian Thought',
        duration: '2 hours',
        durationMinutes: 120,
        marks: 120,
        paperCode: 'H573/03',
        topics: ['Augustine', 'Death and Afterlife', 'Knowledge of God', 'Jesus Christ', 'Pluralism', 'Secularism']
      },
    ]
  },
  'edexcel-englit': {
    examBoard: 'Edexcel',
    subject: 'English Literature',
    code: '9ET0',
    papers: [
      {
        id: 'paper1',
        name: 'Paper 1: Drama',
        duration: '2 hours 15 mins',
        durationMinutes: 135,
        marks: 60,
        paperCode: '9ET0/01',
        topics: ['Hamlet', 'Waiting for Godot', 'Tragedy/Comedy Critical Anthology']
      },
      {
        id: 'paper2',
        name: 'Paper 2: Prose',
        duration: '1 hour 15 mins',
        durationMinutes: 75,
        marks: 40,
        paperCode: '9ET0/02',
        topics: ['Heart of Darkness', 'The Lonely Londoners', 'Comparative Themes']
      },
      {
        id: 'paper3',
        name: 'Paper 3: Poetry',
        duration: '2 hours 15 mins',
        durationMinutes: 135,
        marks: 60,
        paperCode: '9ET0/03',
        topics: ['Poems of the Decade', 'Keats Selected Poems', 'Unseen Poetry']
      },
    ]
  }
};

function SyntheticPastPapers({ onBack }) {
  const curriculum = getSelectedCurriculum() || 'aqa-psych';
  const config = PAPER_CONFIG[curriculum] || PAPER_CONFIG['aqa-psych'];
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startExam, setStartExam] = useState(false);
  const { callAIWithPublicSources } = useAIService();
  // Free Question state
  const [fqQuestion, setFqQuestion] = useState('');
  const [fqMarks, setFqMarks] = useState(16);
  const [fqAnswer, setFqAnswer] = useState('');
  const [fqResult, setFqResult] = useState(null);
  const [fqError, setFqError] = useState('');
  const [fqLoading, setFqLoading] = useState(false);
  const [annotateLoading, setAnnotateLoading] = useState(false);
  const [annotatedText, setAnnotatedText] = useState('');
const [annotatedHtml, setAnnotatedHtml] = useState('');
const [annotationNotes, setAnnotationNotes] = useState([]);
  const [levelMode, setLevelMode] = useState('alevel'); // 'alevel' | 'university'

  // ElevenLabs TTS for audio feedback
  const { speak, playPreparedAudio, audioReady, audioLoading, audioError, stop, ttsState, isConfigured } = useElevenLabsTTS();

  // Compile feedback into readable text for TTS
  const compileFeedbackForAudio = () => {
    if (!fqResult) return '';
    const parts = [];
    parts.push(`You scored ${fqResult.awarded} out of ${fqMarks}. ${fqResult.levelDescriptor || ''}`);
    if (fqResult.feedback) parts.push(fqResult.feedback);
    if (fqResult.structureComment) parts.push(`Essay Structure: ${fqResult.structureComment}`);
    if (Array.isArray(fqResult.structureSuggestions) && fqResult.structureSuggestions.length > 0) {
      parts.push(`To improve your structure: ${fqResult.structureSuggestions.join('. ')}`);
    }
    if (fqResult.ao1Comment) parts.push(`For AO1: ${fqResult.ao1Comment}`);
    if (fqResult.ao2Comment) parts.push(`For AO2: ${fqResult.ao2Comment}`);
    if (fqResult.whyNotNextLevel) parts.push(`To reach the next level: ${fqResult.whyNotNextLevel}`);
    if (Array.isArray(fqResult.strengths) && fqResult.strengths.length > 0) {
      parts.push(`Your strengths were: ${fqResult.strengths.join('. ')}`);
    }
    if (Array.isArray(fqResult.improvements) && fqResult.improvements.length > 0) {
      parts.push(`Areas to improve: ${fqResult.improvements.join('. ')}`);
    }
    return parts.join('\n\n');
  };

  const handleListenToFeedback = () => {
    const text = compileFeedbackForAudio();
    if (text) {
      speak(text);
    }
  };

  const isEngLit = curriculum === 'edexcel-englit';
  const isPsych = curriculum === 'aqa-psych';
  const isOcrRs = curriculum === 'ocr-rs';

  const handleLevelMode = (mode) => {
    setLevelMode(mode);
    setFqMarks(mode === 'university' ? 100 : 40);
  };

  const printFreeQuestion = (includeAnnotated = false) => {
    if (!fqResult) return;
    const win = window.open('', '_blank', 'width=900,height=1200');
    if (!win) return;

    const escapeHtml = (str) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const listHtml = (title, items) => {
      if (!Array.isArray(items) || items.length === 0) return '';
      return `<h4>${escapeHtml(title)}</h4><ul>${items
        .map((i) => `<li>${escapeHtml(i)}</li>`)
        .join('')}</ul>`;
    };

    const body = `
      <div style="font-family: Arial, sans-serif; color: #111; padding: 16px; line-height: 1.5;">
        <h2 style="margin: 0 0 12px 0;">Free Question Marking</h2>
        <p style="margin: 0 0 8px 0;"><strong>Question:</strong> ${escapeHtml(fqQuestion)}</p>
        <p style="margin: 0 0 8px 0;"><strong>Max marks:</strong> ${escapeHtml(fqMarks)}</p>
        <p style="margin: 0 0 8px 0;"><strong>Score:</strong> ${escapeHtml(fqResult.awarded)} / ${escapeHtml(fqMarks)}</p>
        ${fqResult.levelDescriptor ? `<p style="margin: 0 0 8px 0;"><strong>Level:</strong> ${escapeHtml(fqResult.levelDescriptor)}</p>` : ''}
        ${fqResult.ao1Awarded !== undefined ? `<p style="margin: 0 0 8px 0;"><strong>AO1:</strong> ${escapeHtml(fqResult.ao1Awarded)} out of 16</p>` : ''}
        ${fqResult.ao2Awarded !== undefined ? `<p style="margin: 0 0 8px 0;"><strong>AO2:</strong> ${escapeHtml(fqResult.ao2Awarded)} out of 24</p>` : ''}
        ${fqResult.feedback ? `<p style="margin: 0 0 12px 0;"><strong>Feedback:</strong> ${escapeHtml(fqResult.feedback)}</p>` : ''}
        ${fqResult.ao1Comment ? `<p style="margin: 0 0 8px 0;"><strong>AO1:</strong> ${escapeHtml(fqResult.ao1Comment)}</p>` : ''}
        ${fqResult.ao2Comment ? `<p style="margin: 0 0 8px 0;"><strong>AO2:</strong> ${escapeHtml(fqResult.ao2Comment)}</p>` : ''}
        ${fqResult.ao3Comment ? `<p style="margin: 0 0 8px 0;"><strong>AO3:</strong> ${escapeHtml(fqResult.ao3Comment)}</p>` : ''}
        ${fqResult.whyNotNextLevel ? `<p style="margin: 0 0 12px 0;"><strong>${levelMode === 'university' ? 'What you need for a First:' : 'Why not next level:'}</strong> ${escapeHtml(fqResult.whyNotNextLevel)}</p>` : ''}
        ${fqResult.structureComment ? `
          <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 12px; margin: 12px 0;">
            <strong style="color: #4338ca;">📐 Essay Structure:</strong>
            <p style="margin: 8px 0 0 0;">${escapeHtml(fqResult.structureComment)}</p>
            ${Array.isArray(fqResult.structureSuggestions) && fqResult.structureSuggestions.length > 0 ? `
              <p style="margin: 8px 0 4px 0;"><strong style="color: #4f46e5;">How to improve structure:</strong></p>
              <ul style="margin: 0; padding-left: 20px;">${fqResult.structureSuggestions.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
            ` : ''}
          </div>
        ` : ''}
        ${listHtml('AO1 – What you got right:', fqResult.ao1Strengths)}
        ${listHtml('AO1 – What you missed / to reach next level:', fqResult.ao1Improvements)}
        ${listHtml('AO2 – What you got right:', fqResult.ao2Strengths)}
        ${listHtml('AO2 – What you missed / to reach next level:', fqResult.ao2Improvements)}
        ${listHtml('Strengths:', fqResult.strengths)}
        ${listHtml('Improvements:', fqResult.improvements)}
        ${
          includeAnnotated
            ? `
              <hr style="margin: 16px 0;" />
              <h3 style="margin: 0 0 8px 0;">Annotated essay (clean text)</h3>
              <pre style="white-space: pre-wrap; background: #f7f7f7; padding: 12px; border-radius: 6px; border: 1px solid #e2e2e2;">${escapeHtml(annotatedText || '(no annotation returned)')}</pre>
              ${listHtml('Coach notes (caps):', annotationNotes)}
            `
            : ''
        }
      </div>
    `;

    win.document.write(`<!doctype html><html><head><title>Marking Print</title></head><body>${body}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const generatePaper = async (paper) => {
    setSelectedPaper(paper);
    setLoading(true);
    setGeneratedPaper(null);
    setStartExam(false);

    try {
      const isAqa = curriculum === 'aqa-psych';
      const isOcr = curriculum === 'ocr-rs';
      const isEng = curriculum === 'edexcel-englit';

      let styleHint = '';
      if (isAqa) {
        styleHint = `
- Include a mix of short answer (2–6 marks), application questions (4–8 marks), and extended response (8–16 marks)
- Use scenarios/stimulus material where appropriate
- Cover AO1 (knowledge), AO2 (application), and AO3 (evaluation)
- Ensure the TOTAL of all question marks equals ${paper.marks}. Do NOT exceed the total marks.
- Keep sections realistic to the AQA layout for this paper.
- State clearly: "Answer ALL questions in all sections."
- Do NOT include hints or guidance lines for candidates (no lightbulb tips or cues).`;
        if (paper.id === 'paper2') {
          styleHint += `
- For Paper 2, match the AQA 7182/2 structure and totals exactly:
  - Section A: Approaches (3 questions, marks = 6, 8, 16)
  - Section B: Biopsychology (3 questions, marks = 6, 8, 16)
  - Section C: Research Methods (3 questions, marks = 6, 10, 20) — total paper marks = 96
- Keep Section C tied to one shared scenario (e.g., sleep deprivation and cognitive performance) so operationalisation, design, and ethics all reference that same scenario.
- Do NOT invent extra sections or change the mark pattern; adhere to the above layout.`;
        } else if (paper.id === 'paper1') {
          styleHint += `
- For Paper 1, include 1–2 short MCQs per section (e.g., one 2-mark MCQ and one 4-mark short answer), then longer items. Keep total marks = 96. A suggested pattern:
  - Section A (Social Influence): 2, 4, 6, 12 (total 24)
  - Section B (Memory): 2, 4, 6, 12 (total 24)
  - Section C (Attachment): 2, 4, 6, 12 (total 24)
  - Section D (Psychopathology): 2, 4, 6, 12 (total 24)
- Use MCQs as the first 1–2 items in each section.`;
        }
      } else if (isOcr) {
        if (paper.id === 'paper1') {
          // OCR H573/01 – Philosophy of Religion style
          styleHint = `
- Mirror OCR H573/01 Philosophy of Religion format
- Create exactly FOUR long-form essay questions, numbered 1–4, each worth 40 marks (total 120 marks)
- Each 40-mark question should integrate AO1 (knowledge/understanding) and AO2 (analysis/evaluation) in one combined essay
- Use authentic OCR-style command stems such as "Analyse...", "To what extent...", "Critically assess...", "Discuss..."
- Ensure coverage across these areas: Ancient philosophical influences; Soul, mind and body; Arguments for the existence of God; Religious experience / religious language (you may combine closely-related areas in a single question)
- Make the paper instructions clear that this is a 2-hour exam with FOUR questions on the paper and the candidate must answer ANY THREE of the four 40-mark questions
- Return exactly one section named "Philosophy of Religion" containing exactly four questions with "number": "1", "2", "3", "4" and each "marks": 40
- Set "totalMarks" to 120 in the JSON.`;
        } else {
          styleHint = `
- Create long-form essay questions in the OCR H573 style (typically 40-mark essays combining AO1 and AO2)
- Use OCR-style command words such as "Analyse...", "Evaluate...", "To what extent..."
- Cover AO1 (knowledge/understanding) and AO2 (analysis/evaluation) in each question
- Ensure the total marks equal ${paper.marks}`;
        }
      } else if (isEng) {
        styleHint = `
- Include extract-based and/or comparative essay questions
- Cover AO1 (knowledge), AO2 (analysis of language/form/structure), AO3 (context), AO4 (connections/comparisons), AO5 (critical interpretations)
- Use Edexcel 9ET0-style wording and mark weighting
- Ensure the total marks equal ${paper.marks}`;
      }

      const prompt = `You are an expert ${config.examBoard} ${config.subject} examiner creating a synthetic past paper.

PAPER: ${paper.name}
DURATION: ${paper.duration}
TOTAL MARKS: ${paper.marks}
TOPICS TO COVER: ${paper.topics.join(', ')}

Create a realistic exam paper with questions that match the ${config.examBoard} ${config.code} specification style.

For ${config.examBoard} ${config.subject}:
${styleHint}

Return STRICT JSON:
{
  "title": "Paper title",
  "instructions": "Brief exam instructions (e.g., Answer all questions.)",
  "sections": [
    {
      "name": "Section name",
      "questions": [
        {
          "number": "1",
          "text": "Question text",
          "marks": 8
        }
      ]
    }
  ],
  "totalMarks": ${paper.marks}
}`;

      const res = await callAIWithPublicSources(prompt, paper.name, paper.topics[0]);
      let parsed;
      try {
        parsed = JSON.parse(res);
      } catch {
        const match = res.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      }
      // Ensure instructions present and strip any unused guidance/hints
      const cleanedSections = (parsed?.sections || []).map(sec => ({
        ...sec,
        questions: (sec.questions || []).map(q => ({
          ...q,
          guidance: undefined
        }))
      }));
      setGeneratedPaper({
        ...parsed,
        instructions: parsed?.instructions || 'Answer all questions in all sections.',
        sections: cleanedSections
      });
    } catch (e) {
      console.error('Failed to generate paper:', e);
      setGeneratedPaper({ error: 'Failed to generate paper. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const markFreeQuestion = async () => {
    setFqError('');
    setFqResult(null);
    setAnnotatedText('');
    setAnnotatedHtml('');
    setAnnotationNotes([]);
    setAnnotateLoading(false);
    if (!fqQuestion.trim() || !fqAnswer.trim()) {
      setFqError('Please enter both a question and your answer.');
      return;
    }
    setFqLoading(true);
    try {
      const examBoard = curriculum === 'aqa-psych'
        ? 'AQA Psychology'
        : curriculum === 'ocr-rs'
          ? 'OCR Religious Studies'
          : 'Edexcel English Literature';

      const isOCR = curriculum === 'ocr-rs';
      const ao1Max = isOCR ? Math.min(16, fqMarks) : null;
      const ao2Max = isOCR ? Math.min(24, fqMarks - (ao1Max || 0)) : null;

      // Detect OCR RS module from question keywords
      const questionLower = fqQuestion.toLowerCase();
      const isEthicsQuestion = isOCR && (
        /\b(kant|kantian|categorical imperative|duty|deontolog|utilitarian|bentham|mill|greatest good|hedonic|natural law|aquinas.*(ethics|moral)|situation ethics|fletcher|meta.?ethics|normative|applied ethics|euthanasia|business ethics|sexual ethics|conscience|freud.*(ethics|moral|conscience)|aquinas.*freud|freud.*aquinas|superego|synderesis|conscientia|abortion|capital punishment|just war|genetic engineer|cloning|embryo|stem cell|animal rights|environmental ethics|poverty|wealth|global ethics|whistleblow|corporate|csr)\b/i.test(fqQuestion)
      );
      const isPhilReligionQuestion = isOCR && (
        /\b(god.*(exist|nature|attributes)|existence of god|five ways|cosmological|teleological|ontological|design argument|problem of evil|theodicy|religious experience|miracles?|natural theology|revealed theology|religious language|verificat|falsificat|via negativa|analogy|symbol|myth)\b/i.test(fqQuestion)
      );
      const isChristianityQuestion = isOCR && !isEthicsQuestion && !isPhilReligionQuestion && (
        /\b(jesus|christ|christian|church|trinity|incarnation|atonement|salvation|grace|scripture|bible|gospel|augustine|pelagius|luther|calvin|original sin|human nature|afterlife|life after death|heaven|hell|purgatory|soul|dualism|monism|pluralism|hick.*religion|rahner|exclusiv|inclusiv|feminist theolog|ruether|hampson|liberation theolog|gutierrez|political theolog|omnipoten|omniscien|omnibenevolent|boethius|eternity|immutab|process theolog|christolog|predestination|resurrection.*body|replica theory|anonymous christian)\b/i.test(fqQuestion)
      );

      // Detect AQA Psychology topic from question keywords
      const isPsychSocialInfluence = isPsych && /\b(conformity|obedience|milgram|asch|zimbardo|minority influence|social change|resistance|locus of control)\b/i.test(fqQuestion);
      const isPsychMemory = isPsych && /\b(memory|multi.?store|working memory|baddeley|forgetting|interference|retrieval|eyewitness|loftus|cognitive interview)\b/i.test(fqQuestion);
      const isPsychAttachment = isPsych && /\b(attachment|bowlby|ainsworth|strange situation|deprivation|privation|institutionali|romanian|monotropic|internal working)\b/i.test(fqQuestion);
      const isPsychPsychopathology = isPsych && /\b(abnormal|phobia|depression|ocd|obsessive|anxiety|cognitive.*(explanation|approach)|behavioural.*(explanation|approach)|biological.*(explanation|approach)|systematic desensiti|flooding|cbt|cognitive behavio|drug|ssri|antidepressant)\b/i.test(fqQuestion);
      const isPsychApproaches = isPsych && /\b(behaviourist|behaviorist|classical conditioning|operant|skinner|pavlov|social learning|bandura|cognitive approach|schema|psychodynamic|freud|unconscious|humanistic|rogers|maslow|biological approach|genes|evolution|neurotransmitter)\b/i.test(fqQuestion);
      const isPsychBiopsychology = isPsych && /\b(biopsychology|nervous system|neuron|synap|endocrine|hormone|adrenaline|cortisol|fight.?or.?flight|locali[sz]ation|broca|wernicke|hemisphere|split.?brain|plasticity|circadian|sleep|biological rhythm)\b/i.test(fqQuestion);
      const isPsychResearchMethods = isPsych && /\b(research method|experiment|hypothesis|variable|operationali|sampling|random|stratified|opportunity|ethics|bps|deception|informed consent|validity|reliability|demand characteristic|investigator effect|correlation|observation|self.?report|questionnaire|interview|case study|content analysis)\b/i.test(fqQuestion);

      // Detect Edexcel English Literature text from question keywords
      const isHamletQuestion = isEngLit && /\b(hamlet|claudius|gertrude|ophelia|polonius|laertes|horatio|ghost|elsinore|denmark|to be or not|yorick|gravedigger|mousetrap|play.?within)\b/i.test(fqQuestion);
      const isGodotQuestion = isEngLit && /\b(godot|vladimir|estragon|pozzo|lucky|beckett|absurd|waiting|tragicomedy|existential|meaningless|nothing to be done)\b/i.test(fqQuestion);
      const isHeartOfDarknessQuestion = isEngLit && /\b(heart of darkness|marlow|kurtz|conrad|congo|africa|ivory|coloniali|imperial|nellie|darkness|horror|intended)\b/i.test(fqQuestion);
      const isLonelyLondonersQuestion = isEngLit && /\b(lonely londoners|selvon|moses|galahad|windrush|caribbean|trinidad|london|immigrant|dialect|creole)\b/i.test(fqQuestion);
      const isPoetryQuestion = isEngLit && /\b(poem|poet|stanza|verse|meter|rhyme|sonnet|anthology|compare.*poem|poem.*compare)\b/i.test(fqQuestion);

      let prompt = '';

      if (levelMode === 'university') {
        prompt = `You are a university examiner (BA Philosophy, University of Nottingham style). Mark out of 100 using UK HE norms and these bands. You may award ANY integer 0–100 (e.g., 69, 59, 49); the bands are guidance, not hard bins:

- 90–100: Exceptional Class I (“starred first”): superb structure, precise argument, original/innovative thought, outstanding evidence and scholarship, outstanding criticism of others’ arguments, lucid professional presentation.
- 80–89: Strong First: excellent structure and coherent argument; innovative/original thought; excellent use of reliable academic sources; comprehensive/effective answer; wide-ranging knowledge; accurate analysis and effective criticism; clear writing, accurate English, professional presentation with proper referencing/bibliography.
- 70–79: First: very good structure/argument, strong knowledge and criticism, clear and well-presented with solid referencing.
- 60–69: Class II.i (2:1): good/very good structure; sound argument directed to the question; some independence/originality; supports arguments with appropriate evidence; thorough answer to most aspects; good/very good knowledge; wide reading (well digested); appropriate handling of analytical terms; critical awareness and satisfactory analysis; generally clear writing and presentation with referencing.
- 50–59: Class II.ii (2:2): generally coherent structure; adequate/relevant argument; some independence but often derivative; some evidence, sources may be only partly appropriate; adequate/good answer to main aspects; fair reading; awareness of different views with deficiencies; moderate clarity/presentation and referencing.
- 40–49: Class III: adequate/weak structure, some irrelevance; limited independence; poorly supported arguments; limited knowledge with errors/omissions; moderate fluency with errors; poor presentation/referencing.
- 30–39: Soft fail; 0–29: Hard fail (incoherent, minimal knowledge, very poor presentation/referencing).

Criteria: structure/argument, knowledge/understanding, use of sources/scholarship and criticism of others’ arguments, clarity/English/presentation/referencing, relevance to the question.

Tone: Warm, encouraging junior lecturer (candid but kind); highlight what worked, then what to tighten. Borderline calls: if coherent, mostly accurate, and serviceable structure, lean slightly upward within the band.

QUESTION [${fqMarks} marks]:
${fqQuestion}

STUDENT ANSWER:
${fqAnswer}

Instructions:
- Place the script in the best-fit band; justify briefly.
- Reward what is present; do not infer missing content.
- Penalize factual errors; allow minor typos.
- In whatYouNeedForFirst, be specific: e.g., argument thread drifts; self-refutation undeveloped; citations thin beyond Plato/Kuhn/Boghossian; structure/signposting could be clearer; needs a concrete example (e.g., paradigm shift) or page/section for key sources; analysis of opposing views too light.
- In improvements, suggest 1–2 precise fixes (e.g., complete self-refutation section, add Kuhn example from Structure, tidy spelling “Protagoras”, add clear paragraph signposts, add a well-chosen citation/page).
- Return STRICT JSON:
{
  "awarded": <number 0-100>,
  "feedback": "Overall comment",
  "strengths": ["..."],
  "improvements": ["..."],
  "levelDescriptor": "Band description",
  "whatYouNeedForFirst": "What is missing to reach First (70+) band"
}`;
      } else {
        const subjectGuard = isEngLit
          ? 'Subject = Edexcel English Literature 9ET0. Use only literature material (text, critics, stage/production notes, language/form/structure, historical/contextual links). Do NOT introduce psychology, theology, or RS content.'
          : isPsych
            ? 'Subject = AQA Psychology 7182. Use only psychology content (studies, theories, methods, applications). Do NOT introduce theology/RS or literature content.'
            : 'Subject = OCR Religious Studies H573. Use RS content (philosophy/ethics/theology as appropriate). Do NOT introduce psychology or literature content.';

        const engLitAnchors = isEngLit
          ? `For Edexcel English Literature, a response that includes at least two of these named critics WITH their work/source title counts as having critical anchors: A.C. Bradley ("Shakespearean Tragedy"), Harvey Granville-Barker (Prefaces), G. Wilson Knight ("The Embassy of Death"), T.S. Eliot ("Hamlet and His Problems"). If two or more are present, do NOT penalize for "missing critical anchors". Do NOT ask for theology in EngLit; keep within literature criticism, language/form/structure, and historical/contextual links.

Top-band sufficiency (ceiling):
- If the answer has ≥2 of the above critics named with source, ≥3 close-read quotes (word/phrase + effect), and ≥1 contextual link (e.g., succession anxiety, gender norms, stigma around "self-slaughter"/mental health), do NOT ask for more detail/anchors. Place it in the top appropriate band based on coherence/accuracy.
- Limit "Improvements" to at most 2 concise, specific items when sufficiency is met; otherwise, give up to 3 as needed. Avoid generic "add more detail".`
          : '';

        // Universal OCR H573 level descriptors — always injected, never conditional
        const ocrLevelDescriptors = isOCR ? `OCR H573 Level Descriptors (40-mark essays — AO1 out of 16, AO2 out of 24):
- Level 4 (33–40 marks): Excellent and thorough knowledge of the topic; insightful, well-sustained critical analysis and evaluation; scholars and their positions explained accurately and in depth; coherent, well-signposted argument throughout; precise use of specialist vocabulary. AO1 14–16: multiple scholars/concepts explained with detail and accuracy. AO2 20–24: genuine comparative evaluation; counter-arguments engaged and assessed rather than merely listed; sustained and developed argument.
- Level 3 (25–32 marks): Good knowledge and understanding; good analysis and evaluation, generally well-developed; mostly accurate use of technical terms; evaluation may be less sustained or precise than Level 4. AO1 10–13: good coverage with minor gaps or imprecision. AO2 15–19: evaluation present but may lack depth or be one-sided.
- Level 2 (15–24 marks): Adequate knowledge; some analysis but largely descriptive; argument only partly developed; some accurate technical terms. AO1 6–9: key scholars mentioned but explanations superficial. AO2 9–14: evaluative language present but reasoning often thin.
- Level 1 (0–14 marks): Limited, fragmented, or inaccurate knowledge; little or no genuine analysis; unclear or incoherent argument.
Best-fit principle: place the essay at the point within the band that best reflects the quality present. Award the TOP of a band when all criteria are clearly met — do not default to the middle. Award 36–40 when knowledge, evaluation, and argument are all clearly excellent and sustained.` : '';

        // Topic-specific scholar/concept hints — additive on top of level descriptors
        const ocrTopicHints = isOCR ? (
          isEthicsQuestion
            ? `Ethics topic guidance (OCR H573 Component 2 — do NOT penalize for missing Natural Theology content):
- Kantian ethics: duty, good will, categorical imperative (universal law, humanity formula, kingdom of ends), Three Postulates (freedom, immortality, God), autonomy/heteronomy. Critics: Hume (is/ought gap), Mill (consequences matter), Bernard Williams (integrity objection), Philippa Foot (trolley problem), W.D. Ross (prima facie duties).
- Utilitarianism: Bentham (hedonic calculus, principle of utility), Mill (higher/lower pleasures, rule utilitarianism), Singer (preference utilitarianism). Critics: Nozick (experience machine), Williams (integrity), McCloskey (sheriff scenario).
- Natural law: Aquinas' primary precepts (BRILL: life, reproduction, knowledge, society, worship), secondary precepts, real vs apparent goods, doctrine of double effect, synderesis rule. Critics: proportionalism (Hoose), situation ethics, Vardy.
- Situation ethics: Fletcher's six propositions, agape love, four working principles (pragmatism, relativism, positivism, personalism). Critics: legalism, antinomianism, Barclay.
- Conscience: Aquinas (synderesis, conscientia, imago dei, ratio, real/apparent goods, vincible/invincible ignorance), Freud (Id/Ego/Superego, Oedipus/Electra complex, phallic stage ages 3–6), Butler (supreme moral authority, principle of reflection), Newman ("I shall drink to the Pope, but to Conscience first"), Fromm (authoritarian vs humanistic conscience).
- Sexual ethics: Christian/natural law views (sex for procreation, within marriage), Kantian duty vs consequentialist accounts, feminist perspectives, LGBT+ inclusion debates (Church of England, Vatican), virtue ethics approach.
- Euthanasia/death and dying: sanctity of life (Aquinas, Christian teaching), quality of life (Singer), voluntary/non-voluntary/involuntary euthanasia, doctrine of double effect (terminal sedation), hospice movement (Saunders), Kant on autonomy vs duty to live.
- Business ethics: whistleblowing (loyalty vs honesty), CSR (Friedman vs stakeholder theory), Kant on using people as means, Singer on global poverty and corporate exploitation, virtue ethics in business.
- Meta-ethics: cognitivism vs non-cognitivism; naturalism (defining good in natural terms); intuitionism (Moore — naturalistic fallacy, Ross — prima facie duties); emotivism (Ayer — "boo/hurrah", Stevenson); prescriptivism (Hare — universalisability); error theory (Mackie — no objective moral facts).
- Level 4 sufficiency: 2+ named scholars accurately explained + sustained comparative evaluation + counter-arguments addressed = 33–40. Award 36–40 when knowledge, evaluation, and argument are all clearly strong.`
            : isPhilReligionQuestion
              ? `Philosophy of Religion topic guidance (OCR H573 Component 1):
- Natural theology anchors ARE relevant: Aquinas' Five Ways (motion, causation, contingency, gradation, teleology), Paley's design argument (watch analogy, Hume's objections), Anselm's ontological argument ("that than which nothing greater can be conceived"), Descartes' ontological argument.
- Revealed theology: propositional vs non-propositional revelation, accommodation (Calvin), scripture authority, religious experience (Swinburne's four criteria: public/private; Otto's numinous; William James' four marks: noetic, ineffable, transient, passive).
- Problem of evil: logical problem (Mackie), evidential problem (Rowe); Augustinian theodicy (original perfection, Fall, natural/moral evil, hell); Irenean/Hick soul-making theodicy (humans as immature, epistemic distance); free will defence (Plantinga); process theology response.
- Religious language: verification principle (Ayer — strong/weak, logical positivism); falsification (Flew — death by a thousand qualifications, Hare — blick, Mitchell — partisan); via negativa (apophatic — Maimonides); analogy (Aquinas — attribution and proportion); symbol (Tillich — participates in what it points to); myth (Bultmann — demythologisation).
- Level 4 sufficiency: named argument + named objection + evaluative response that goes beyond restating views = 33–40. Award 36–40 when scholars are named precisely and evaluation is sustained and genuinely critical.`
              : isChristianityQuestion
                ? `Developments in Christian Thought topic guidance (OCR H573 Component 3):
- Nature of God: omnipotence (Aquinas — can do all that is logically possible; Descartes — absolute omnipotence), omniscience (open theism vs classical theism), omnibenevolence, eternity (Boethius — eternal now/atemporal; Swinburne — everlasting/temporal), immutability, impassibility. Process theology (Whitehead, Hartshorne) as critique of classical attributes.
- Jesus Christ: Christology — fully human/fully divine (Chalcedonian definition 451 CE); liberal theology (Schleiermacher, Harnack — Jesus as supreme moral teacher, not divine); liberation theology (Gutierrez — Jesus as liberator of the poor, preferential option); Son of God, incarnation, atonement theories (substitutionary — Anselm; moral influence — Abelard).
- Human nature: Augustine (original sin, Fall, total depravity, need for grace, predestination); Pelagius (humans have free will and capacity for good without grace); Luther (justification by faith alone, bondage of the will, simul justus et peccator); Calvin (double predestination, TULIP). Key debate: can humans achieve goodness without divine grace?
- Death and afterlife: resurrection of the body (Aquinas — bodily resurrection; Hick — replica theory, eschatological verification); immortality of the soul (Platonic dualism — soul survives death); near-death experiences and their evidential value (Swinburne); physicalism (no soul separate from body; resurrection as recreation). Christian vs secular philosophical accounts.
- Religious pluralism: Hick (pluralist — all religions are culturally conditioned responses to the same transcendent Real; "Copernican revolution"); Rahner (inclusivist — anonymous Christians; grace available beyond the Church); Barth (exclusivist — salvation only through explicit faith in Christ); Knitter. Credit critiques of each position.
- Liberation theology / political theology: Gutierrez ("preferential option for the poor", base communities); political reading of Jesus as social revolutionary; Marxist influence and Vatican critique; Christian duty to social justice and structural sin.
- Feminist theology / gender and sexuality: Ruether (sexism in traditional Christianity, feminine divine, need for reform); Hampson (post-Christian feminism — Christianity irredeemably patriarchal); Mary Daly (radical feminist); debates on women's ordination (Church of England vs Roman Catholic); LGBTQ+ inclusion (Vines, liberal vs traditional interpretations of Scripture).
- Level 4 sufficiency: 2+ named theologians/scholars accurately explained + sustained evaluative engagement + counter-argument addressed = 33–40. Award 36–40 when all three are clearly strong and the argument is sustained throughout.`
                : `OCR H573 topic guidance:
- Credit named scholars and accurate explanation of their views (AO1).
- Credit genuine evaluation: counter-arguments, limitations of views, comparative judgements (AO2).
- Do NOT penalize for missing content from other OCR H573 modules.
- Use the level descriptors above to determine the band; award based on what IS present, not what is absent.`
        ) : '';

        // AQA Psychology universal level descriptors (scaled to fqMarks)
        const psychLevelDescriptors = isPsych ? (() => {
          const m = fqMarks;
          const l4 = m <= 6 ? `${Math.ceil(m*0.8)}–${m}` : m <= 12 ? `${Math.ceil(m*0.75)}–${m}` : `13–${m}`;
          const l3 = m <= 6 ? `${Math.ceil(m*0.5)}–${Math.ceil(m*0.8)-1}` : m <= 12 ? `${Math.ceil(m*0.5)}–${Math.ceil(m*0.75)-1}` : `9–12`;
          const l2 = m <= 6 ? `${Math.ceil(m*0.25)}–${Math.ceil(m*0.5)-1}` : m <= 12 ? `${Math.ceil(m*0.25)}–${Math.ceil(m*0.5)-1}` : `5–8`;
          const l1 = `1–${m <= 6 ? Math.ceil(m*0.25)-1 : m <= 12 ? Math.ceil(m*0.25)-1 : 4}`;
          return `AQA Psychology Level Descriptors (${m}-mark question):
- Level 4 (${l4}): Thorough and accurate knowledge and understanding; effective and relevant application to the context; clear and coherent evaluation with a well-developed line of argument; accurate use of psychological terminology throughout.
- Level 3 (${l3}): Mostly accurate knowledge and understanding; some application to context though may be limited; some evaluation though argument may lack full development; generally accurate use of terminology.
- Level 2 (${l2}): Some relevant psychological knowledge, some inaccuracies; limited or partial application; some evaluation though limited in scope or depth; some appropriate terminology.
- Level 1 (${l1}): Minimal relevant knowledge; limited or no meaningful application; minimal or no evaluation; many inaccuracies; limited use of appropriate terminology.
Best-fit: place the answer at the point in the band that best matches the quality present. Award the top of the band when AO1 knowledge is accurate and AO3 evaluation is clearly developed with a line of argument.`;
        })() : '';

        // AQA Psychology topic hints (additive)
        const psychTopicHints = isPsych ? `Psychology topic guidance — stay within the SPECIFIC TOPIC asked. Do NOT import content from other topics.
${isPsychSocialInfluence ? `TOPIC: Social Influence. Credit: types of conformity (compliance, identification, internalisation); Asch (conformity, 75% conformed at least once, variables: unanimity, group size, task difficulty); Milgram (obedience, 65% to 450V, situational variables: proximity, location, uniform; agentic state, legitimacy of authority); Zimbardo/SPE (social roles, dehumanisation — note ethical issues); minority influence (Moscovici — consistency, commitment, flexibility); social change (role of dissenter, snowball effect).` : ''}
${isPsychMemory ? `TOPIC: Memory. Credit: Multi-Store Model (Atkinson & Shiffrin — sensory, STM, LTM; encoding, capacity, duration; evaluation: case studies HM, Clive Wearing but oversimplified); Working Memory Model (Baddeley & Hitch — central executive, phonological loop, visuospatial sketchpad, episodic buffer; evaluation: dual-task studies but CE vague); types of LTM (episodic, semantic, procedural — Tulving); EWT (Loftus & Palmer — leading questions, post-event information, anxiety/weapon focus effect, cognitive interview); forgetting (interference — proactive/retroactive; retrieval failure — Godden & Baddeley, context-dependent).` : ''}
${isPsychAttachment ? `TOPIC: Attachment. Credit: Bowlby (monotropic theory — one primary caregiver, critical period, internal working model, continuity hypothesis); Ainsworth (Strange Situation — secure, insecure-avoidant, insecure-resistant; cultural variations — Van IJzendoorn); learning theory (Dollard & Miller — cupboard love, association with food); Harlow (rhesus monkeys — contact comfort over food); deprivation (Bowlby's 44 juvenile thieves, Rutter — separation vs deprivation) vs privation (Koluchova twins, Romanian orphan studies — Rutter); effects of institutionalisation; day care research (NICHD study).` : ''}
${isPsychPsychopathology ? `TOPIC: Psychopathology. Credit: definitions of abnormality (statistical infrequency, deviation from social norms, failure to function adequately — Rosenhan & Seligman, deviation from ideal mental health — Jahoda); phobias (two-process model — Watson & Raynor Little Albert; systematic desensitisation, flooding); depression (Beck's cognitive triad, Ellis ABC model; CBT, drug therapy — SSRIs); OCD (biological — genetic, neural; drug therapy — SSRIs, CBT).` : ''}
${isPsychApproaches ? `TOPIC: Approaches. Credit: behaviourism (classical conditioning — Pavlov, Watson; operant conditioning — Skinner, reinforcement/punishment; social learning theory — Bandura, Bobo doll, vicarious reinforcement, identification, self-efficacy); cognitive approach (schemas, cognitive neuroscience, models of memory); psychodynamic (Freud — id/ego/superego, unconscious, psychosexual stages, defence mechanisms; evaluation: lack of falsifiability, case study method); humanistic (Rogers — self-concept, congruence, UPR; Maslow — hierarchy of needs; evaluation: cultural bias, idiographic); biological (genes, neurochemistry, brain structure, evolution; evaluation: reductionism, nature-nurture).` : ''}
${isPsychBiopsychology ? `TOPIC: Biopsychology. Credit: nervous system (CNS — brain/spinal cord; PNS — somatic/autonomic — sympathetic/parasympathetic); neurons (sensory, relay, motor; structure — dendrites, cell body, axon, myelin); synaptic transmission (neurotransmitters, excitatory/inhibitory); endocrine system (hormones, pituitary gland); fight-or-flight (adrenaline, sympathetic NS); localisation of function (Broca's area — speech production, Wernicke's area — speech comprehension, motor/somatosensory cortex); lateralisation (split-brain research — Sperry); plasticity and functional recovery (Maguire taxi drivers); sleep/biological rhythms (circadian — sleep-wake; infradian — menstrual; ultradian — sleep stages; endogenous pacemakers — SCN; exogenous zeitgebers — light).` : ''}
${isPsychResearchMethods ? `TOPIC: Research Methods. Credit: experimental methods (lab, field, natural, quasi; IV/DV; operationalisation; control of extraneous variables); experimental design (independent groups, repeated measures, matched pairs; order effects, counterbalancing); sampling (random, stratified, opportunity, volunteer; bias); ethics (BPS guidelines — informed consent, deception, right to withdraw, confidentiality, protection from harm, debriefing); validity (internal — controls; external — ecological/population; mundane realism); reliability (inter-rater, test-retest; improving reliability); non-experimental methods (observations — covert/overt, participant/non-participant, structured/unstructured; self-report — questionnaires, interviews; correlational analysis; case studies; content analysis); statistical testing (significance p<0.05; chi-square, Mann-Whitney, Wilcoxon, Spearman's rho, Pearson's r; type I/II errors).` : ''}
General AQA Psychology credits: named researcher + study/finding + evaluation point (strength or limitation). AO1 = knowledge; AO2 = application to scenario; AO3 = evaluation with clear reasoning.` : '';

        // Edexcel English Literature universal level descriptors
        const engLitLevelDescriptors = isEngLit ? `Edexcel English Literature Level Descriptors (${fqMarks}-mark question — AO1: informed personal response/argument; AO2: language/form/structure analysis; AO3: context):
- Level 5 (${Math.ceil(fqMarks*0.83)}–${fqMarks}): Convincing, sophisticated personal response with a well-sustained argument; insightful, precise analysis of language/form/structure with well-chosen textual detail; confident, specific connections to context that illuminate meaning; assured use of critical terminology.
- Level 4 (${Math.ceil(fqMarks*0.63)}–${Math.ceil(fqMarks*0.83)-1}): Perceptive personal response with a well-developed argument; detailed analysis of language/form/structure; clear and relevant contextual connections; accurate critical terminology.
- Level 3 (${Math.ceil(fqMarks*0.43)}–${Math.ceil(fqMarks*0.63)-1}): Explained personal response with some argument development; some analysis of language/form/structure (may describe rather than analyse at times); some contextual awareness; generally appropriate terminology.
- Level 2 (${Math.ceil(fqMarks*0.23)}–${Math.ceil(fqMarks*0.43)-1}): Some relevant points but largely descriptive; limited analysis; limited contextual reference; some use of terminology.
- Level 1 (1–${Math.ceil(fqMarks*0.23)-1}): Minimal response; asserts rather than argues; little or no analysis; no meaningful contextual reference.
Best-fit: award the top of a band when AO1 argument, AO2 analysis, and AO3 context are all clearly demonstrated at that level. Do not default to the middle.` : '';

        // Edexcel English Literature topic hints (additive)
        const engLitTopicHints = isEngLit ? `English Literature topic guidance — stay within the TEXT asked about:
${isHamletQuestion ? `TEXT: Hamlet (Shakespeare). AO2: soliloquy form (direct address to audience, psychological revelation), imagery (corruption/decay — "rank and gross", "unweeded garden"), dramatic irony, prose vs verse (Hamlet's feigned madness), stichomythia, metatheatre ("The play's the thing"). AO3: revenge tragedy conventions; Elizabethan/Jacobean court politics and surveillance; Protestant theology and the ghost's purgatory; gender and early modern femininity (Ophelia's silence/madness). Key critics (AO5): A.C. Bradley ("Shakespearean Tragedy" — Hamlet's delay as tragic flaw); G. Wilson Knight ("The Embassy of Death" — Hamlet as death-bringer); Harvey Granville-Barker (Prefaces — performance and structure); T.S. Eliot ("Hamlet and His Problems" — Hamlet as aesthetic failure, objective correlative); Elaine Showalter (on Ophelia — feminine madness as culturally constructed). If 2+ critics are named with source titles, do NOT say "critical anchor missing".` : ''}
${isHeartOfDarknessQuestion ? `TEXT: Heart of Darkness (Conrad). AO2: frame narrative (Marlow as unreliable narrator, Chinese-box structure), darkness/light imagery (ironic inversion), repetition of "horror", impressionistic style, symbolic geography (river as journey into self/past), ellipsis and reticence. AO3: Belgian colonialism in Congo Free State (1890s), rubber trade, Leopold II; Conrad's own 1890 Congo journey; late-Victorian attitudes to race and empire; Modernist narrative experimentation. Key critics (AO5): Chinua Achebe ("An Image of Africa" — Conrad as "thoroughgoing racist", dehumanisation of Africans); F.R. Leavis (Conrad's adjectival insistence, "heart of darkness" as moral core); Edward Said (Orientalism framework — othering); Ian Watt (impressionism and delayed decoding). If Achebe is named with source, do NOT say "critical anchor missing".` : ''}
${isGodotQuestion ? `TEXT: Waiting for Godot (Beckett). AO2: cyclical structure (each act ends as it began — nothing happens twice), repetition and contradiction ("Let's go." / "They do not move."), vaudeville/music hall routines (comic doubling), stage directions as meaning, sparse language and pauses (silence as speech), hat-swapping routine, metatheatre. AO3: post-WWII existential crisis; Holocaust and human suffering; Beckett's own experience of the French Resistance; Theatre of the Absurd (rejection of realist conventions). Key critics (AO5): Martin Esslin ("The Theatre of the Absurd" — Godot as paradigm of absurdism); Beckett's own refusal to explain Godot; Ruby Cohn on language and repetition; Vivian Mercier ("nothing happens, twice"). If Esslin named with source, do NOT say "critical anchor missing".` : ''}
${isLonelyLondonersQuestion ? `TEXT: The Lonely Londoners (Selvon). AO2: free indirect discourse blending narrator/character voice, Caribbean creole/dialect (syntactic and lexical — "ballad", "old talk"), stream-of-consciousness passages (the "summer" episode), absence of chapters (episodic structure mirroring dislocation), humour as resistance. AO3: Windrush generation (1948–1971) and post-war Commonwealth immigration; racism and housing discrimination in 1950s London; Caribbean identity and colonial legacy; nostalgia and belonging. Key critics: Ken Ramchand (West Indian novel tradition); Sandra Pouchet Paquet (Caribbean autobiography and diaspora identity); Victor Ramraj (humour and survival). Credit awareness of dialect as political and aesthetic choice.` : ''}
${isPoetryQuestion ? `POETRY: AO2 = close reading of specific words/phrases and their effects (imagery, sound, rhythm, form, stanza structure, enjambment/caesura). AO3 = historical/social/biographical context linked to specific poems. Credit comparison of at least two poems with sustained argument. Do NOT just list techniques — analyse the effect on meaning.` : ''}
General EngLit credits: AO1 = sustained personal argument with a clear interpretive stance; AO2 = analysis of specific language/form/structure (quote a word or phrase and explain its effect); AO3 = context linked specifically to the text's meaning; AO5 = named critic with source title and engagement with their argument. Do NOT mix texts. Keep theology/psychology out of EngLit responses.` : '';

        prompt = `You are an expert ${examBoard} examiner. ${subjectGuard} Mark the student's answer to a single question using typical A-Level mark scheme criteria for this board. Give concise but specific feedback, with concrete examples/quotes (from the specification or typical sources) of what stronger AO1/AO2/AO3 would look like. Use best-fit judgement: place the essay at the point within the band that best reflects the quality present. Award the top of a band when core anchors, accuracy, and evaluation are clearly demonstrated — do not default to the middle.

${engLitAnchors}

${isPsych
  ? `${psychLevelDescriptors}

${psychTopicHints}`
  : isEngLit
  ? `${engLitLevelDescriptors}

${engLitTopicHints}`
  : `${ocrLevelDescriptors}

${ocrTopicHints}
- IMPORTANT: The levelDescriptor in your JSON response MUST match the awarded score. If you award 33–40, say "Level 4". If you award 25–32, say "Level 3". Do NOT mismatch.`}

Candidate context (realism):
- 17–18 year-old writing under ~40-minute exam pressure for a 40-mark essay.
- Concise, signposted paragraphs are expected; not a dissertation.
- Minor spelling/grammar/typos should NOT be penalized unless meaning is unclear.
- Positive marking: reward what is present; best-fit level judgement; do not item-count.
- Top band can be earned with ~3–4 named scholars/terms plus 2–3 targeted critiques, if accurate, comparative, and evaluative.

QUESTION [${fqMarks} marks]:
${fqQuestion}

STUDENT ANSWER:
${fqAnswer}

Subject reminder:
- ${isPsych
    ? `AQA Psychology: Stay within the topic area. Do NOT mix topics or ask for content from other areas.`
    : isEngLit
    ? `English Literature: Stay within the TEXT asked about. AO2 = language/form/structure; AO3 = context. Do NOT mix texts or ask for theology/psychology.`
    : `OCR Religious Studies H573: Topic guidance and level descriptors are already provided above. Do NOT penalize for missing content from other OCR modules.`}

Instructions:
- Use the board's level descriptors/banding to decide the mark.
- Do not invent content; credit only what is present.
- Be fair but rigorous; partial credit for partial answers.

CRITICAL - VERIFY BEFORE CLAIMING MISSING:
- Before saying ANY content is "missing", RE-READ the essay to check if it's actually there.
- If content IS present but could be stronger, say "underdeveloped" or "could be expanded" - NOT "missing".
- Only say "missing" if the content is genuinely absent from the essay.
- Example: If the essay mentions "Three Postulates" or discusses freedom/immortality/God as postulates, do NOT say "missing Three Postulates".
- If in doubt, assume the student covered it and look for where they did so.

POSITIVE MARKING (as real examiners do):
- Real examiners mark POSITIVELY: they look for what IS there to credit, not hunt for gaps.
- If key content is present (even if brief), give credit and note it could be "expanded" rather than penalizing as missing.
- A solid essay with 3-4 key thinkers, clear structure, and some evaluation = upper Level 3 or Level 4.
- 35-40/40 is appropriate for a well-structured essay with strong coverage, named scholars, and genuine evaluation; award 39-40 when the essay shows exceptional analytical depth.

- In AO1 comment: mention at least one concrete piece of content (e.g., key term, theorist, study, date) that the student included, and one high-value item that would lift to top band. ${isEngLit ? 'If a named critic + source is present (e.g., Bradley/Granville-Barker/Wilson Knight/Eliot), say how the answer used or could better use that critic (agree/challenge/complicate).' : ''}
- In AO2 comment: ${isEngLit ? 'focus on analysis of language/form/structure with a quoted word/phrase and its effect' : 'focus on evaluation/argument quality; give a specific improvement'}.
${isOCR ? '- OCR H573 has NO AO3. Do NOT mention AO3 at all. Only use AO1 (knowledge/understanding) and AO2 (analysis/evaluation).' : `- In AO3 comment: ${isEngLit ? 'focus on context (historical/social/intellectual) with one concrete linkage to the text' : 'add a concise contextual or methodological link'}.`}
- In whyNotNextLevel: name ONLY genuinely missing elements (not underdeveloped ones) that block the next band. If the essay covers the main content, focus on HOW it could be deeper rather than WHAT is absent.
- In structureComment: evaluate the essay's structure - intro/conclusion quality, paragraph organization, argument/counter-argument balance, logical flow, signposting. Be specific about what works and what could improve (e.g., "intro sets up thesis clearly but conclusion is abrupt", "good use of 'however' to signal counter-arguments", "paragraphs jump between ideas - try one point per paragraph").
- If the board is OCR RS and this is a 40-mark essay, award AO1 out of 16 and AO2 out of 24. Spell out what was right and what was missing for each AO.
- For strengths/improvements, be concrete: cite at least 1–2 specific examples/quotes/critics or studies that were present or missing. Avoid vague phrases like "add more detail"; say exactly what content or critique would raise the band. If the EngLit top-band criteria are already met (critics + quotes + context), give at most 2 concise improvements.
- If the answer shows good structure, multiple key figures, and comparative evaluation, award in the 35–40/40 range for OCR 40-mark essays; reserve 39–40 for essays with exceptional depth, precision, and evaluative sophistication. Only cap below 35 if there are clear factual errors or missing entire sections.
- Always return exactly 3 strengths and exactly 3 improvements (truncate or combine if needed).
- For strengths and improvements, each bullet must start with a bracketed AO tag: ${isOCR ? '"[AO1] ..." or "[AO2] ..." only (OCR H573 has no AO3).' : '"[AO1] ..." or "[AO2] ..." or "[AO3] ..." (choose the dominant AO for that point).'} Always return exactly 3 strengths and exactly 3 improvements (truncate or combine if needed).
- Return STRICT JSON:
{
  "awarded": <number 0-${fqMarks}>,
  ${isOCR ? `"ao1Awarded": <number 0-${ao1Max}>, "ao2Awarded": <number 0-${ao2Max}>,` : ''}
  "feedback": "Overall comment",
  "strengths": ["...","...","..."],
  "improvements": ["...","...","..."],
  "levelDescriptor": "Level X (range) - must match awarded score",
  "ao1Comment": "Short AO1 note",
  "ao2Comment": "Short AO2 note (analysis/evaluation)",
  ${isOCR ? '' : '"ao3Comment": "Short AO3 note (context)",'}
  "structureComment": "Essay structure feedback - intro, conclusion, paragraph flow, argument/counter-argument balance, signposting",
  "structureSuggestions": ["specific suggestion 1", "specific suggestion 2"],
  ${isOCR ? `"ao1Strengths": ["what AO1 did well"], "ao1Improvements": ["what AO1 missed"], "ao2Strengths": ["what AO2 did well"], "ao2Improvements": ["what AO2 missed"],` : ''}
  "whyNotNextLevel": "Why not in the next higher band"
}`;
      }

      const res = await callAIWithPublicSources(prompt, 'Synthetic Free Question', fqQuestion.slice(0, 80));
      let parsed;
      try { parsed = JSON.parse(res); } catch { const m = String(res || '').match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : {}; }

      const getNum = (val) => {
        const n = Number(val);
        if (Number.isFinite(n)) return n;
        if (typeof val === 'string') {
          const m = val.match(/-?\d+(\.\d+)?/);
          if (m) {
            const num = Number(m[0]);
            if (Number.isFinite(num)) return num;
          }
        }
        return null;
      };

      const awardedNum = getNum(parsed.awarded);
      const ao1Num = isOCR ? getNum(parsed.ao1Awarded) : undefined;
      const ao2Num = isOCR ? getNum(parsed.ao2Awarded) : undefined;

      if (awardedNum === null) {
        throw new Error('Invalid examiner response (awarded missing)');
      }

      setFqResult({
        awarded: Math.min(awardedNum, fqMarks),
        ao1Awarded: isOCR && ao1Num !== null ? Math.min(ao1Num, ao1Max || 0) : undefined,
        ao2Awarded: isOCR && ao2Num !== null ? Math.min(ao2Num, ao2Max || 0) : undefined,
        feedback: parsed.feedback || '',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : [],
        levelDescriptor: parsed.levelDescriptor || '',
        ao1Comment: parsed.ao1Comment || '',
        ao2Comment: parsed.ao2Comment || '',
        ao3Comment: parsed.ao3Comment || '',
        ao1Strengths: parsed.ao1Strengths || [],
        ao1Improvements: parsed.ao1Improvements || [],
        ao2Strengths: parsed.ao2Strengths || [],
        ao2Improvements: parsed.ao2Improvements || [],
        whyNotNextLevel: parsed.whatYouNeedForFirst || parsed.whyNotNextLevel || '',
        structureComment: parsed.structureComment || '',
        structureSuggestions: Array.isArray(parsed.structureSuggestions) ? parsed.structureSuggestions : [],
        annotatedEssay: parsed.annotatedEssay || ''
      });
    } catch (e) {
      setFqError(e?.message || 'Failed to mark this answer.');
    } finally {
      setFqLoading(false);
    }
  };

  // If we have a fully generated paper and the user has chosen to start the exam,
  // hand off to the SyntheticExam component which mirrors the InteractiveExam UX.
  if (selectedPaper && generatedPaper && !loading && startExam) {
    const flatQuestions = [];
    (generatedPaper.sections || []).forEach((section) => {
      (section.questions || []).forEach((q, idx) => {
        flatQuestions.push({
          number: q.number || String(flatQuestions.length + 1),
          text: q.text,
          marks: q.marks,
          section: section.name || '',
        });
      });
    });

    return (
      <SyntheticExam
        curriculum={curriculum}
        paperMeta={{
          title: generatedPaper.title || selectedPaper.name,
          session: 'Synthetic',
          year: 'N/A',
          code: selectedPaper.paperCode || config.code,
          durationMinutes: selectedPaper.durationMinutes,
          totalMarks: generatedPaper.totalMarks || selectedPaper.marks,
          questionsToAnswer: selectedPaper.questionsToAnswer || null,
        }}
        questions={flatQuestions}
        onBack={() => {
          setStartExam(false);
          setSelectedPaper(null);
          setGeneratedPaper(null);
        }}
      />
    );
  }

  if (selectedPaper && (loading || generatedPaper)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={() => { setSelectedPaper(null); setGeneratedPaper(null); }} className="text-purple-600 underline mb-6">← Back to Paper Selection</button>
          
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">Generating {selectedPaper.name}...</h2>
              <p className="text-gray-600 mt-2">Creating exam-style questions based on the specification</p>
            </div>
          ) : generatedPaper?.error ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-red-600">{generatedPaper.error}</p>
              <button onClick={() => generatePaper(selectedPaper)} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                Try Again
              </button>
            </div>
          ) : generatedPaper ? (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">{generatedPaper.title}</h2>
                <p className="text-gray-600 mt-1">{config.examBoard} {config.subject} • {selectedPaper.duration} • {generatedPaper.totalMarks} marks</p>
              </div>
              
              {generatedPaper.instructions && (
                <div className="bg-gray-50 rounded p-4 text-sm text-gray-700">
                  <strong>Instructions:</strong> {generatedPaper.instructions}
                </div>
              )}

              {(generatedPaper.sections || []).map((section, sIdx) => (
                <div key={sIdx} className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">{section.name}</h3>
                  {(section.questions || []).map((q, qIdx) => {
                    const label = q.marks <= 2 ? `Question ${q.number} (MCQ)` : `Question ${q.number}`;
                    return (
                      <div key={qIdx} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-800">{label}</span>
                          <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">{q.marks} marks</span>
                        </div>
                        <p className="text-gray-700 mb-2">{q.text}</p>
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className="flex justify-center gap-4 pt-4 border-t">
                <button
                  onClick={() => setStartExam(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold"
                >
                  ▶ Start Timed Exam
                </button>
                <button onClick={() => generatePaper(selectedPaper)} className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded hover:bg-purple-50">
                  🔄 Generate New Paper
                </button>
                <button
                  onClick={() => {
                    setSelectedPaper(null);
                    setGeneratedPaper(null);
                    setStartExam(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Choose Different Paper
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="text-purple-600 underline mb-6">← Back to Home</button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-700" />
            <h1 className="text-3xl font-bold text-purple-800">Synthetic Past Papers</h1>
          </div>
          <p className="text-purple-600">{config.examBoard} {config.subject} ({config.code})</p>
          <p className="text-sm text-gray-600 mt-2">AI-generated exam papers matching the specification style</p>
        </div>

        {/* Free Question single-marking box */}
        <div className="mb-8 bg-white border border-purple-200 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-purple-800">Free Question (single marking)</h3>
            <span className="text-xs text-gray-500">{config.examBoard} {config.subject}</span>
          </div>
          <div className="flex items-center gap-3 mb-3 text-sm">
            <span className="text-gray-700">Mode:</span>
            <button
              onClick={() => handleLevelMode('alevel')}
              className={`px-3 py-1 rounded border ${levelMode === 'alevel' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              A-Level
            </button>
            <button
              onClick={() => handleLevelMode('university')}
              className={`px-3 py-1 rounded border ${levelMode === 'university' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              University
            </button>
            <span className="text-xs text-gray-500">{levelMode === 'alevel' ? 'Band marking, 40-ish marks' : 'Nottingham-style BA Philosophy, /100'}</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              value={fqQuestion}
              onChange={(e) => setFqQuestion(e.target.value)}
              placeholder="Paste or type your exam question here"
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Max marks:</label>
              <input
                type="number"
                min="2"
              max="100"
                value={fqMarks}
                onChange={(e) => setFqMarks(parseInt(e.target.value, 10) || 0)}
                className="w-20 border rounded px-2 py-1 text-sm"
              />
            </div>
            <textarea
              value={fqAnswer}
              onChange={(e) => setFqAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full border rounded px-3 py-2 text-sm h-28"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={markFreeQuestion}
                disabled={fqLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold"
              >
                {fqLoading ? 'Marking…' : 'Mark my answer'}
              </button>
              {fqError && <span className="text-sm text-red-600">{fqError}</span>}
            </div>
            {fqResult && (
              <div className="border rounded p-3 bg-gray-50 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Score: {fqResult.awarded} / {fqMarks}</span>
                  {fqResult.levelDescriptor && <span className="text-gray-600">{fqResult.levelDescriptor}</span>}
                </div>
                {/* Celebratory/Encouraging message based on score */}
                {(() => {
                  const pct = (fqResult.awarded / fqMarks) * 100;
                  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
                  const excellent = [
                    "🎉 Excellent work - you're smashing it!",
                    "🌟 Brilliant! This is top-tier stuff - keep it up!",
                    "🔥 You're on fire! This is A/A* territory!",
                    "✨ Amazing work! You should be really proud of this!",
                    "🏆 This is genuinely impressive - examiner's dream!"
                  ];
                  const good = [
                    "💪 Great job! Solid work - just a few tweaks to make it even better.",
                    "👏 Nice one! You're in good shape - small refinements will push this higher.",
                    "📈 Strong effort! You're close to the top band - keep polishing!",
                    "💫 Well done! This is solid B/A territory - nearly there!",
                    "🎯 Good work! The foundations are strong - just tighten up a few areas."
                  ];
                  const developing = [
                    "👍 Good effort! You've got the foundations - let's build on them.",
                    "📝 You're on the right track! Focus on the feedback to level up.",
                    "🌱 Nice start! With some more depth, this could really shine.",
                    "💡 The ideas are there! Now let's work on expressing them more fully.",
                    "🔧 Good attempt! A bit more detail and structure will boost this."
                  ];
                  const needsWork = [
                    "📚 You might want to revisit this topic before tackling more essays.",
                    "🎒 Let's go back to basics on this one - the knowledge needs consolidating.",
                    "📖 More revision needed here - then come back and try again!",
                    "🔄 This topic needs more attention - review the notes and have another go.",
                    "💪 Don't worry - everyone struggles sometimes! Let's build up the basics first."
                  ];
                  if (pct >= 85) {
                    return <div className="bg-green-100 border border-green-300 text-green-800 rounded px-3 py-2 font-medium">{pick(excellent)}</div>;
                  } else if (pct >= 70) {
                    return <div className="bg-blue-100 border border-blue-300 text-blue-800 rounded px-3 py-2 font-medium">{pick(good)}</div>;
                  } else if (pct >= 50) {
                    return <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded px-3 py-2 font-medium">{pick(developing)}</div>;
                  } else {
                    return <div className="bg-orange-100 border border-orange-300 text-orange-800 rounded px-3 py-2 font-medium">{pick(needsWork)}</div>;
                  }
                })()}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => printFreeQuestion(false)}
                    className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded hover:bg-purple-50"
                  >
                    Print feedback
                  </button>
                  <button
                    onClick={() => printFreeQuestion(true)}
                    className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded hover:bg-purple-50"
                  >
                    Print feedback + annotation
                  </button>
                  {/* Audio feedback buttons */}
                  {isConfigured && (
                    <>
                      {!audioReady && !audioLoading && ttsState === 'idle' && (
                        <button
                          onClick={handleListenToFeedback}
                          className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded hover:from-green-600 hover:to-emerald-700 flex items-center gap-1"
                        >
                          <Volume2 className="w-4 h-4" /> Listen to feedback
                        </button>
                      )}
                      {audioLoading && (
                        <button disabled className="px-3 py-1 bg-gray-300 text-gray-600 rounded flex items-center gap-1">
                          <Loader2 className="w-4 h-4 animate-spin" /> Preparing audio...
                        </button>
                      )}
                      {audioReady && ttsState === 'idle' && (
                        <button
                          onClick={playPreparedAudio}
                          className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded hover:from-green-600 hover:to-emerald-700 flex items-center gap-1"
                        >
                          <Play className="w-4 h-4" /> Play feedback
                        </button>
                      )}
                      {ttsState === 'playing' && (
                        <button
                          onClick={stop}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                        >
                          <VolumeX className="w-4 h-4" /> Stop
                        </button>
                      )}
                      {audioError && (
                        <span className="text-sm text-red-600 flex items-center gap-1">
                          <VolumeX className="w-4 h-4" /> Audio error - check Settings
                        </span>
                      )}
                    </>
                  )}
                  {!isConfigured && (
                    <span className="text-xs text-gray-500 italic">Add ElevenLabs key in Settings for audio</span>
                  )}
                </div>
                {(fqResult.ao1Awarded !== undefined || fqResult.ao2Awarded !== undefined) && (
                  <div className="flex gap-3 text-gray-700">
                    {fqResult.ao1Awarded !== undefined && <span>AO1: {fqResult.ao1Awarded}{Number.isFinite(fqMarks) && curriculum === 'ocr-rs' ? ` out of 16` : ''}</span>}
                    {fqResult.ao2Awarded !== undefined && <span>AO2: {fqResult.ao2Awarded}{Number.isFinite(fqMarks) && curriculum === 'ocr-rs' ? ` out of 24` : ''}</span>}
                  </div>
                )}
                {fqResult.feedback && <div><strong>Feedback:</strong> {fqResult.feedback}</div>}
                {fqResult.ao1Comment && <div><strong>AO1:</strong> {fqResult.ao1Comment}</div>}
                {fqResult.ao2Comment && <div><strong>AO2:</strong> {fqResult.ao2Comment}</div>}
                {fqResult.ao3Comment && <div><strong>AO3:</strong> {fqResult.ao3Comment}</div>}
                {fqResult.whyNotNextLevel && (
                  <div>
                    <strong>{levelMode === 'university' ? 'What you need for a First:' : 'Why not next level:'}</strong> {fqResult.whyNotNextLevel}
                  </div>
                )}
                {fqResult.structureComment && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded p-3 mt-2">
                    <strong className="text-indigo-800">📐 Essay Structure:</strong>
                    <div className="text-gray-700 mt-1">{fqResult.structureComment}</div>
                    {Array.isArray(fqResult.structureSuggestions) && fqResult.structureSuggestions.length > 0 && (
                      <div className="mt-2">
                        <strong className="text-indigo-700">How to improve structure:</strong>
                        <ul className="list-disc ml-5 text-gray-700">
                          {fqResult.structureSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <h4 className="font-semibold text-gray-800 mb-2">📝 Detailed Feedback</h4>
                </div>
                {Array.isArray(fqResult.ao1Strengths) && fqResult.ao1Strengths.length > 0 && (
                  <div>
                    <strong>AO1 – What you got right:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.ao1Strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(fqResult.ao1Improvements) && fqResult.ao1Improvements.length > 0 && (
                  <div>
                    <strong>AO1 – What you missed / to reach next level:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.ao1Improvements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(fqResult.ao2Strengths) && fqResult.ao2Strengths.length > 0 && (
                  <div>
                    <strong>AO2 – What you got right:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.ao2Strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(fqResult.ao2Improvements) && fqResult.ao2Improvements.length > 0 && (
                  <div>
                    <strong>AO2 – What you missed / to reach next level:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.ao2Improvements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(fqResult.strengths) && fqResult.strengths.length > 0 && (
                  <div>
                    <strong>Strengths:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(fqResult.improvements) && fqResult.improvements.length > 0 && (
                  <div>
                    <strong>Improvements:</strong>
                    <ul className="list-disc ml-5">
                      {fqResult.improvements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {annotatedText && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <strong>Annotated essay (clean text):</strong>
                    {annotatedHtml ? (
                      <div
                        className="whitespace-pre-wrap text-sm text-gray-800 mt-2"
                        dangerouslySetInnerHTML={{ __html: annotatedHtml }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm text-gray-800 mt-2">{annotatedText}</div>
                    )}
                    {Array.isArray(annotationNotes) && annotationNotes.length > 0 && (
                      <div className="mt-3">
                        <strong>Coach notes (caps):</strong>
                        <ul className="list-disc ml-5 text-sm text-gray-800">
                          {annotationNotes.map((n, i) => (
                            <li key={i}>{n}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {fqResult && !annotatedText && (
                  <button
                    onClick={async () => {
                      if (!fqResult) return;
                      setAnnotateLoading(true);
                      try {
                          const annPrompt = `You are a supportive examiner annotating the student's own essay. Do NOT refuse. No safety concerns: simply add study-skills notes. Keep student text intact; insert brief inline ALL-CAPS bracketed comments immediately after the relevant sentence/phrase. Use:
[ADD: ...] for missing AO1 examples/quotes/critics.
[EVAL: ...] for stronger AO2 (language/form/structure or argument critique) with a concrete example.
[CLARIFY: ...] where meaning is unclear.
[FIX: ...] if factually wrong.
Return only the annotated essay text.
Be specific: quote a word/phrase you are commenting on where possible. Include 4–8 inline tags total, each under 12 words.`;
                        const annRes = await callAIWithPublicSources(
                          `${annPrompt}\n\nQUESTION: ${fqQuestion}\n\nSTUDENT ANSWER:\n${fqAnswer}`,
                          'Annotate Essay',
                          fqQuestion.slice(0, 80)
                        );
                        const clean = (annRes || '').trim();
                        const refusal = /i['’]m sorry|cannot assist|can[’']t assist|unable to comply|cannot comply|not able to/i;
                        const escapeHtml = (str) =>
                          String(str || '')
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#39;');

                        if (refusal.test(clean)) {
                          setAnnotatedText('Annotation unavailable (model declined).');
                          setAnnotatedHtml('Annotation unavailable (model declined).');
                          setAnnotationNotes([]);
                        } else {
                          const upperBrackets = clean.replace(/\[([^\]]+)\]/g, (_, inner) => `[${inner.toUpperCase()}]`);
                          const noteMatches = [...upperBrackets.matchAll(/\[([A-Z]+:[^\]]+)\]/g)];
                          const notes = noteMatches.map((m) => m[1].trim());
                          const html = escapeHtml(upperBrackets).replace(/\[([A-Z]+:[^\]]+)\]/g, '<strong>[$1]</strong>');
                          setAnnotatedText(upperBrackets.trim());
                          setAnnotatedHtml(html.trim());
                          setAnnotationNotes(notes);
                        }
                      } catch (e) {
                        setAnnotatedText('Annotation failed.');
                        setAnnotatedHtml('Annotation failed.');
                        setAnnotationNotes([]);
                      } finally {
                        setAnnotateLoading(false);
                      }
                    }}
                    className="mt-3 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                    disabled={annotateLoading}
                  >
                    {annotateLoading ? 'Annotating…' : 'Annotate My Answer'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Paper selection */}
        <div className="space-y-4">
          {config.papers.map((paper) => (
            <div key={paper.id} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{paper.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {paper.duration}</span>
                    <span>{paper.marks} marks</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {paper.topics.map((t, i) => (
                      <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => generatePaper(paper)}
                  className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Generate
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">✨ About Synthetic Papers</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Generated by AI to match the {config.examBoard} specification style</li>
            <li>• Includes realistic question types and mark allocations</li>
            <li>• Perfect for extra practice beyond past papers</li>
            <li>• Each generation creates a unique paper</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SyntheticPastPapers;

