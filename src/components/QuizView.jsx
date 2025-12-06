import React, { useState, useEffect } from 'react';
import { useAIService } from "../hooks/useAIService";
import { useVaultService } from "../hooks/useVaultService";
import { useElevenLabsTTS } from "../hooks/useElevenLabsTTS";
import { Loader2, Volume2, CheckCircle, XCircle, RotateCcw, History, Play, Download, Save, FileText, Pause, StopCircle } from "lucide-react";
import jsPDF from 'jspdf';

function QuizView({ topic, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [storedQuizzes, setStoredQuizzes] = useState([]);
  const [showStoredQuizzes, setShowStoredQuizzes] = useState(false);
  const [activeAudioSection, setActiveAudioSection] = useState(null);
  const [mode, setMode] = useState(null); // 'blind' or 'show'
  const [bankSet, setBankSet] = useState('live'); // 'live' | 'lab'
  const [quizStarted, setQuizStarted] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [detailedSummary, setDetailedSummary] = useState(null); // { answers: [{ index, detailed, sources: [{file, page}]}] }
  
  // Stats for current quiz
  const [quizStats, setQuizStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });

  const { callAIWithVault, callAIJsonOnly } = useAIService();
  const { createVaultPrompt, getRelevantContext, isVaultLoaded, vaultLoaded } = useVaultService();
  const { callAI } = useAIService();
  const { speak, playPreparedAudio, audioReady, audioLoading, audioError, pause, stop, ttsState } = useElevenLabsTTS();

  // Load quiz history and stored quizzes from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(`quiz-history-${topic.subTopic.id}`);
    if (savedHistory) {
      setQuizHistory(JSON.parse(savedHistory));
    }
    
    const savedQuizzes = localStorage.getItem(`quiz-stored-${topic.subTopic.id}`);
    if (savedQuizzes) {
      setStoredQuizzes(JSON.parse(savedQuizzes));
    }
  }, [topic.subTopic.id]);

  // Reset active audio section when audio ends
  useEffect(() => {
    if (ttsState === 'idle') {
      setActiveAudioSection(null);
    }
  }, [ttsState]);

  // Only generate after vault is loaded AND the user starts the quiz
  // Note: We don't call generateQuiz here anymore - the button onClick handlers do it directly
  // This useEffect is only for the edge case where vault loads AFTER quizStarted is set
  const generationStartedRef = React.useRef(false);
  useEffect(() => {
    if (vaultLoaded && quizStarted && !generationStartedRef.current) {
      // Don't call here - button handlers call generateQuiz directly
      // This prevents duplicate calls
    }
  }, [vaultLoaded, quizStarted]);

  const extractFirstJson = (text) => {
    // Regex to find the first {...} JSON block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return match[0];
    }
    return null;
  };

  // Keyword hints per sub-topic for validation
  const getKeywordsForSubTopic = (subTitle) => {
    const t = String(subTitle || '').toLowerCase();
    if (t.includes('social learning') || t.includes('bandura')) {
      return ['Bandura', 'Bobo', 'modelling', 'modeling', 'imitation', 'vicarious', 'reinforcement', 'identification', 'mediational', 'attention', 'retention', 'reproduction', 'motivation', 'observational learning'];
    }
    if (t.includes('religious experience') || t.includes('otto') || t.includes('william james') || t.includes('james')) {
      return ['Otto', 'William James', 'numinous', 'mysterium tremendum', 'fascinans', 'ineffable', 'noetic', 'passive', 'transient', 'veridical', 'Swinburne', 'principle of credulity', 'principle of testimony'];
    }
    if (t.includes('memory')) {
      return ['STM', 'short-term', 'LTM', 'long-term', 'encoding', 'capacity', 'duration', 'Baddeley', 'Miller', 'Peterson'];
    }
    if (t.includes('attachment')) {
      return ['Bowlby', 'Ainsworth', 'Strange Situation', 'secure', 'insecure', 'privation', 'deprivation'];
    }
    // Generic: derive from title tokens
    const stop = new Set(['the','and','of','in','to','for','a','an','on','at','by','or','from','with','within','approaches','topic','subtopic','studies','study']);
    const base = (subTitle || '').split(/[^a-zA-Z0-9]+/).filter(w => w && w.length > 2 && !stop.has(w.toLowerCase()));
    return base;
  };

  const curatedSLTQuestions = () => ([
    {
      question: 'Which term in Social Learning Theory refers to learning by watching others? ',
      options: ['Classical conditioning', 'Operant conditioning', 'Observational learning', 'Habituation'],
      correctAnswer: 2,
      explanation: 'Bandura proposed observational learning: behaviour is learned by observing models and the consequences they receive.'
    },
    {
      question: 'In Bandura et al. (1961), children who observed an aggressive model were more likely to…',
      options: ['Avoid toys', 'Show aggressive acts to the Bobo doll', 'Cry frequently', 'Ignore the model'],
      correctAnswer: 1,
      explanation: 'Exposure to the aggressive adult increased imitative aggression toward the Bobo doll.'
    },
    {
      question: 'Vicarious reinforcement means that behaviour is…',
      options: ['Reinforced by direct rewards only', 'Reduced by punishment only', 'Influenced by observing someone else being rewarded', 'Unaffected by consequences'],
      correctAnswer: 2,
      explanation: 'Observers are more likely to imitate behaviours that they see being rewarded in models.'
    },
    {
      question: 'Which is NOT one of Bandura’s mediational processes?',
      options: ['Attention', 'Retention', 'Reproduction', 'Extinction'],
      correctAnswer: 3,
      explanation: 'Mediational processes are attention, retention, reproduction and motivation.'
    },
    {
      question: 'Identification in SLT is more likely when the model is…',
      options: ['Dissimilar and low status', 'Similar and high status', 'Unfamiliar and low status', 'Unrelated and anonymous'],
      correctAnswer: 1,
      explanation: 'People identify with models they perceive as similar, attractive or with high status, increasing imitation.'
    },
    {
      question: 'Which finding best supports SLT from Bandura’s 1963 film model study?',
      options: ['No effect of models on behaviour', 'Equal aggression after non-aggressive model', 'Imitation occurred after viewing filmed aggression', 'Punishment always prevented imitation'],
      correctAnswer: 2,
      explanation: 'Children imitated aggression even when it was seen in film/cartoon models.'
    },
    {
      question: '“Mediational processes” in SLT are best described as…',
      options: ['Innate reflexes', 'Cognitive factors between stimulus and response', 'Only external rewards', 'Biological drives only'],
      correctAnswer: 1,
      explanation: 'Attention, retention, reproduction, motivation mediate observation and imitation.'
    },
    {
      question: 'Self-efficacy in SLT refers to…',
      options: ['Belief that one can perform the behaviour', 'Belief that others can perform it', 'General intelligence', 'Emotional arousal'],
      correctAnswer: 0,
      explanation: 'Higher self-efficacy increases likelihood of attempting and imitating behaviour.'
    },
    {
      question: 'Compared to behaviourism, SLT specifically adds the idea of…',
      options: ['Unconscious conflict', 'Maturation', 'Learning via observation of models', 'Psychic determinism'],
      correctAnswer: 2,
      explanation: 'SLT extends conditioning by including observational learning and cognition.'
    },
    {
      question: 'Which scenario best illustrates vicarious punishment?',
      options: ['Model gets told off; observer imitates anyway', 'Model gets punished; observer is less likely to imitate', 'Observer is punished after imitation', 'Observer is rewarded after imitation'],
      correctAnswer: 1,
      explanation: 'Seeing a model punished reduces observer’s likelihood to imitate the behaviour.'
    },
    {
      question: 'According to SLT, imitation is most likely when…',
      options: ['The behaviour is complex and unrehearsed', 'The model is disliked and low status', 'The observer expects similar rewards', 'The observer is very young only'],
      correctAnswer: 2,
      explanation: 'Expectancy of similar outcomes (vicarious reinforcement) increases imitation.'
    },
    {
      question: 'A teacher praises a student’s helpfulness in front of the class. SLT predicts classmates will…',
      options: ['Become less helpful', 'Imitate helpful behaviour', 'Ignore social cues', 'Only act when directly rewarded later'],
      correctAnswer: 1,
      explanation: 'Observed rewards for a model can increase similar behaviour via vicarious reinforcement.'
    }
  ]);

  const curatedREQuestions = () => ([
    {
      question: 'Which pair best captures Rudolf Otto’s description of the numinous?',
      options: ['Rational and empirical', 'Mysterium tremendum et fascinans', 'Moral and legal', 'Subjective and illusory'],
      correctAnswer: 1,
      explanation: 'Otto argued religious experience is the numinous: awe/fear (tremendum) and attraction (fascinans).'
    },
    {
      question: 'Which is NOT one of William James’s four characteristics?',
      options: ['Ineffable', 'Noetic', 'Transient', 'Coercive'],
      correctAnswer: 3,
      explanation: 'James: ineffable, noetic, transient, passive. Coercive is not one of the four.'
    },
    {
      question: 'James described mystical experiences as “noetic,” meaning they…',
      options: ['Provide authoritative knowledge/insight', 'Cause physical healings only', 'Are irrational by nature', 'Are purely emotional without cognition'],
      correctAnswer: 0,
      explanation: 'Noetic indicates a sense of gaining knowledge or insight.'
    },
    {
      question: 'According to Otto, “tremendum” refers to…',
      options: ['The attractive pull of the holy', 'The awe/fear aspect of the holy', 'Ethical transformation', 'Logical proof of God'],
      correctAnswer: 1,
      explanation: 'Tremendum is the overwhelming awe/fear in the presence of the holy.'
    },
    {
      question: 'According to Otto, “fascinans” refers to…',
      options: ['The fear of divine judgement', 'The compelling attraction of the holy', 'The moral law within', 'An illusion of the senses'],
      correctAnswer: 1,
      explanation: 'Fascinans is the attractive, compelling element drawing one toward the holy.'
    },
    {
      question: 'Which best states James’s stance on the validity of religious experience?',
      options: ['Always false', 'Always true', 'Judge by fruits (effects) not roots (origins)', 'Only true if verified by science'],
      correctAnswer: 2,
      explanation: 'James recommended evaluating by practical outcomes rather than origins.'
    },
    {
      question: 'James’s “passive” characteristic implies the subject…',
      options: ['Controls the experience fully', 'Feels acted upon by a superior power', 'Engages in deliberate self-suggestion', 'Uses critical reasoning alone'],
      correctAnswer: 1,
      explanation: 'Passive: the subject experiences being grasped by something beyond their control.'
    },
    {
      question: 'Which critique challenges the veridicality of religious experience?',
      options: ['Swinburne’s testimony principle', 'Naturalistic/psychological explanations', 'James’s pragmatism', 'Otto’s numinous'],
      correctAnswer: 1,
      explanation: 'Naturalistic accounts (e.g., psychology, neurology) can explain experiences without positing the divine.'
    },
    {
      question: 'Swinburne’s Principle of Credulity (later thinkers) suggests that…',
      options: ['We should trust experiences as they seem unless we have reason to doubt', 'Only scientific experiences are credible', 'Religious experience is never reliable', 'Only group experiences count as evidence'],
      correctAnswer: 0,
      explanation: 'Credulity supports taking experiences at face value unless disconfirming reasons exist.'
    },
    {
      question: 'The term “ineffable” in James’s account means…',
      options: ['Easily expressible in language', 'Beyond expression in words', 'Entirely emotional', 'Entirely rational'],
      correctAnswer: 1,
      explanation: 'Ineffable: cannot be fully expressed linguistically.'
    }
  ]);

  const looksDomainRelevant = (text, keywords) => {
    const s = String(text || '').toLowerCase();
    return keywords.some(k => s.includes(k.toLowerCase()));
  };

  const sanitizeQuestionText = (text) => {
    let s = (text || '').trim();
    s = s.replace(/\s*Reference\s*\d+\.?/gi, '');
    s = s.replace(/[.!…]+\s*$/,'');
    if (!/\?$/.test(s)) s += '?';
    return s.replace(/\?+$/,'?');
  };
  const isGenericStem = (text) => /\b(key concept|important aspect|relate[s]? to the broader topic|best fits within)\b/i.test(String(text||''));
  const rewriteGenericStem = (subTitle) => `Which of the following best describes ${subTitle}?`;

  // Normalize AI output questions into app format: { question, options, correctAnswer, explanation }
  const normalizeQuestionsFromAI = (rawQuestions = []) => {
    const methodFlawPool = [
      'Low ecological validity',
      'Demand characteristics',
      'Researcher bias',
      'Small or biased sample',
      'Lack of random assignment',
      'Social desirability bias',
      'Lack of control',
      'Confounding variables',
      'Low reliability',
      'Poor operationalization'
    ];
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const normalized = [];
    for (const q of rawQuestions) {
      const questionText = typeof q.question === 'string' ? q.question : '';
      const explanationText = typeof q.explanation === 'string' ? q.explanation : '';
      const type = q.type || (Array.isArray(q.options) ? 'mcq' : 'mcq');

      if (type === 'mcq' && Array.isArray(q.options) && Number.isInteger(q.answer)) {
        normalized.push({
          question: sanitizeQuestionText(questionText),
          options: q.options.slice(0, 4),
          correctAnswer: Math.max(0, Math.min(3, q.answer)),
          explanation: explanationText
        });
        continue;
      }

      if (type === 'truefalse' && typeof q.answer === 'boolean') {
        const options = ['True', 'False'];
        const correctIndex = q.answer ? 0 : 1;
        normalized.push({
          question: sanitizeQuestionText(questionText),
          options,
          correctAnswer: correctIndex,
          explanation: explanationText
        });
        continue;
      }

      if (type === 'methodflaw' && typeof q.answer === 'string' && q.answer.trim().length > 0) {
        // Ensure the provided answer is included, add plausible distractors, and shuffle
        const answerStr = q.answer.trim();
        const pool = methodFlawPool.filter((p) => p.toLowerCase() !== answerStr.toLowerCase());
        const distractors = shuffle(pool).slice(0, 3);
        let options = [answerStr, ...distractors];
        options = shuffle(options);
        const correctIndex = options.findIndex(o => o.toLowerCase() === answerStr.toLowerCase());
        normalized.push({
          question: questionText,
          options,
          correctAnswer: correctIndex >= 0 ? correctIndex : 0,
          explanation: explanationText
        });
        continue;
      }

      // Fallback: if options/answer present in a different shape
      if (Array.isArray(q.options) && (Number.isInteger(q.correctAnswer) || Number.isInteger(q.answer))) {
        normalized.push({
          question: sanitizeQuestionText(questionText),
          options: q.options.slice(0, 4),
          correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : q.answer,
          explanation: explanationText
        });
      }
    }

    return normalized;
  };

  // Ensure uniqueness by question stem and top-up from curated pool without repeats
  const dedupeAndTopUp = (items, curatedPool) => {
    const used = new Set();
    const out = [];
    const signature = (q) => String(q.question || '').trim().toLowerCase();
    for (const it of items) {
      const sig = signature(it);
      if (!sig || used.has(sig)) continue;
      used.add(sig);
      out.push(it);
    }
    for (const c of curatedPool) {
      if (out.length >= 10) break;
      const sig = signature(c);
      if (!used.has(sig)) { used.add(sig); out.push(c); }
    }
    return out.slice(0, 10);
  };

  // De-duplicate and pad options to 4 uniques; adjust correct index
  const normalizeOptions = (q) => {
    const sltDistractors = ['Classical conditioning', 'Operant conditioning', 'Habituation', 'Maturation', 'Reflexes'];
    if (!Array.isArray(q.options)) return q;
    const seen = new Set();
    const uniq = [];
    const origCorrectText = q.options[q.correctAnswer];
    for (const opt of q.options) {
      const key = String(opt || '').trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      uniq.push(opt);
    }
    while (uniq.length < 4 && sltDistractors.length > 0) {
      const next = sltDistractors.shift();
      const key = next.toLowerCase();
      if (!seen.has(key)) { uniq.push(next); seen.add(key); }
    }
    let correctIndex = uniq.findIndex(o => String(o).toLowerCase() === String(origCorrectText || '').toLowerCase());
    if (correctIndex < 0) correctIndex = 0;
    return { ...q, options: uniq.slice(0, 4), correctAnswer: correctIndex };
  };

  const alignExplanation = (q) => {
    const questionText = String(q.question || '');
    const options = Array.isArray(q.options) ? q.options : [];
    const correctText = options[q.correctAnswer] || '';
    let expl = String(q.explanation || '').trim();
    const ensurePeriod = (s) => s.replace(/[.!?]*\s*$/,'').trim() + '.';
    const hasKeyword = (a, b) => String(a).toLowerCase().includes(String(b).toLowerCase());
    if (!expl) {
      expl = `Correct answer: ${correctText}.`;
    } else {
      // If explanation misses the core wording of the correct option, append a tie-back sentence
      const token = String(correctText).split(/[^a-zA-Z]+/).filter(w => w.length > 5)[0] || '';
      if (token && !hasKeyword(expl, token)) {
        expl = ensurePeriod(expl) + ' This corresponds to: ' + correctText + '.';
      }
    }
    // Special reinforcement for mediational processes in SLT
    if (/mediational\s+process/i.test(questionText) && !/(attention|retention|reproduction|motivation)/i.test(expl)) {
      expl = ensurePeriod(expl) + ' Mediational processes are attention, retention, reproduction and motivation.';
    }
    return { ...q, explanation: expl };
  };

  const loadBankIfAvailable = async () => {
    try {
      // Note: We don't check bankSet here - the caller (generateQuiz) already verified effectiveBankSet === 'lab'
      const curr = (window?.localStorage?.getItem('curriculum') || 'aqa-psych');
      
      // First try to load from pre-generated bank files in public/banks/
      const bankPath = `/banks/${curr}/${topic.id}_${topic.subTopic.id}_quiz.json`;
      console.log('[Quiz] Attempting to load bank from:', bankPath);
      try {
        const response = await fetch(bankPath);
        if (response.ok) {
          const bankData = await response.json();
          if (bankData.items && Array.isArray(bankData.items) && bankData.items.length > 0) {
            console.log('[Quiz] Loaded', bankData.items.length, 'questions from bank file');
            // Normalize the bank items to match expected format
            const normalized = bankData.items.map(q => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              ao: q.ao
            }));
            return normalized;
          }
        }
      } catch (fetchErr) {
        console.log('[Quiz] Bank file not found, trying localStorage fallback');
      }
      
      // Fallback to localStorage (legacy behavior)
      const libKey = `quiz-lab-lib-${curr}-${topic.id}-${topic.subTopic.id}`;
      const latestKey = `quiz-lab-latest-${curr}-${topic.id}-${topic.subTopic.id}`;
      const libRaw = window?.localStorage?.getItem(libKey);
      if (libRaw) {
        const lib = JSON.parse(libRaw);
        if (Array.isArray(lib) && lib.length > 0 && Array.isArray(lib[0]?.items)) return lib[0].items;
      }
      const raw = window?.localStorage?.getItem(latestKey);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
      }
      return null;
    } catch (_) {
      return null;
    }
  };

  const generateQuiz = async (overrideBankSet = null) => {
    const effectiveBankSet = overrideBankSet || bankSet;
    setIsLoading(true);
    console.log('[Quiz] generateQuiz called, bankSet:', effectiveBankSet);
    // New AQA Psychology prompt
    const basePrompt = `You are an expert AQA Psychology teacher creating a quiz for AQA Psychology 7182 students.

TOPIC: ${topic.title}
SUB-TOPIC: ${topic.subTopic.title}

Create EXACTLY 10 multiple-choice questions (MCQs) suitable for A-Level students, each with 4 options:
- 1 correct answer
- 3 plausible but incorrect distractors

Coverage:
- AO1: Knowledge and understanding (terms, theories, named studies with year)
- AO2: Application (short scenario/data-based)
- AO3: Analysis/evaluation (methodological critique or comparative judgement)

Requirements:
- Each question must be concise and unambiguous
- Options must be mutually exclusive and credible
- Avoid “all of the above” or “none of the above”
- Do NOT include phrases like "according to the materials", "based on the materials", or similar meta-references in the question text
- Where relevant, include named study + year in the correct answer’s explanation
- Base questions ONLY on the provided OCR/Revision Guide references

Return in this JSON format:
{
  "questions": [
    {
      "question": "A clear MCQ about ${topic.subTopic.title}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0, // index (0-3) of the correct option
      "ao": "AO1" | "AO2" | "AO3",
      "explanation": "1–2 sentence rationale referencing the provided materials"
    }
  ]
}`;
    try {
      // If using Lab, load locally saved questions; if none, auto-build and save
      if (effectiveBankSet === 'lab') {
        const lab = await loadBankIfAvailable();
        if (!lab || lab.length === 0) {
          // Auto-build: generate with strict JSON path and persist to Lab keys
          const vaultPromptLab = createVaultPrompt(basePrompt, topic.title, topic.subTopic.title, true, { quiz: true });
          let resultLab;
          try {
            resultLab = await callAIJsonOnly(vaultPromptLab, null, 'gpt-4o-mini');
          } catch (_) {
            resultLab = await callAIWithVault(vaultPromptLab, topic.title, topic.subTopic.title, { includeAdditional: true });
          }
          let parsedLab;
          try {
            const jsonStr = extractFirstJson(resultLab);
            if (!jsonStr) throw new Error('No JSON found in AI output');
            parsedLab = JSON.parse(jsonStr);
          } catch (e) {
            // Fall back to curated if parsing fails
            const fallback = generateFallbackQuestions();
            const itemsFallback = fallback.slice(0, 10);
            const curr = (window?.localStorage?.getItem('curriculum') || 'aqa-psych');
            const labKeyPersist = `quiz-lab-latest-${curr}-${topic.id}-${topic.subTopic.id}`;
            const libKeyPersist = `quiz-lab-lib-${curr}-${topic.id}-${topic.subTopic.id}`;
            try {
              window?.localStorage?.setItem(labKeyPersist, JSON.stringify(itemsFallback));
              const existing = JSON.parse(window?.localStorage?.getItem(libKeyPersist) || '[]');
              const next = [{ id: Date.now(), createdAt: new Date().toISOString(), set: 'LAB', items: itemsFallback }, ...existing].slice(0, 10);
              window?.localStorage?.setItem(libKeyPersist, JSON.stringify(next));
            } catch (_) {}
            setQuestions(itemsFallback);
            setCurrentQuestionIndex(0);
            setUserAnswers([]);
            setQuizComplete(false);
            setShowResults(false);
            setQuizStats({ correct: 0, incorrect: 0, total: 0 });
            return;
          }
          const quizQuestionsLab = Array.isArray(parsedLab.questions) ? parsedLab.questions : [];
          let normalizedLab = normalizeQuestionsFromAI(quizQuestionsLab);
          // Validate and normalize as usual
          const kwsLab = getKeywordsForSubTopic(topic.subTopic.title);
          const isSLT = topic.subTopic.title.toLowerCase().includes('social learning') || topic.subTopic.title.toLowerCase().includes('bandura');
          const isRE = topic.subTopic.title.toLowerCase().includes('religious experience') || topic.subTopic.title.toLowerCase().includes('otto') || topic.subTopic.title.toLowerCase().includes('william james') || topic.subTopic.title.toLowerCase().includes('james');
          const curatedLab = isSLT ? curatedSLTQuestions() : (isRE ? curatedREQuestions() : []);
          const curatedIterLab = curatedLab[Symbol.iterator]();
          const isBadOption = (opt) => /religious|philosoph|ethical|historical/i.test(String(opt || ''));
          const validatedLab = normalizedLab.map(item => {
            const domainOk = looksDomainRelevant(item.question, kwsLab) || looksDomainRelevant(item.explanation, kwsLab) || (item.options || []).some(o => looksDomainRelevant(o, kwsLab));
            const optionsOk = Array.isArray(item.options) && item.options.length === 4 && item.options.every(o => !isBadOption(o));
            const answerOk = Number.isInteger(item.correctAnswer) && item.correctAnswer >= 0 && item.correctAnswer < 4;
            if (domainOk && optionsOk && answerOk && !isGenericStem(item.question)) return item;
            if (domainOk && optionsOk && answerOk && isGenericStem(item.question)) {
              return { ...item, question: sanitizeQuestionText(rewriteGenericStem(topic.subTopic.title)) };
            }
            const next = curatedIterLab.next();
            return next.done ? item : next.value;
          });
          normalizedLab = validatedLab.map(normalizeOptions);
          normalizedLab = dedupeAndTopUp(normalizedLab, curatedLab).map(alignExplanation).slice(0, 10);
          // Persist to Lab keys
          const curr = (window?.localStorage?.getItem('curriculum') || 'aqa-psych');
          const labKeyPersist = `quiz-lab-latest-${curr}-${topic.id}-${topic.subTopic.id}`;
          const libKeyPersist = `quiz-lab-lib-${curr}-${topic.id}-${topic.subTopic.id}`;
          try {
            window?.localStorage?.setItem(labKeyPersist, JSON.stringify(normalizedLab));
            const existing = JSON.parse(window?.localStorage?.getItem(libKeyPersist) || '[]');
            const next = [{ id: Date.now(), createdAt: new Date().toISOString(), set: 'LAB', items: normalizedLab }, ...existing].slice(0, 10);
            window?.localStorage?.setItem(libKeyPersist, JSON.stringify(next));
          } catch (_) {}
          // Load into session
          setQuestions(normalizedLab);
          setCurrentQuestionIndex(0);
          setUserAnswers([]);
          setQuizComplete(false);
          setShowResults(false);
          setQuizStats({ correct: 0, incorrect: 0, total: 0 });
          return;
        }
        const items = lab.slice(0, 10).map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        }));
        console.log('[Quiz] Using bank questions:', items.length);
        setQuestions(items);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setQuizComplete(false);
        setShowResults(false);
        setQuizStats({ correct: 0, incorrect: 0, total: 0 });
        setIsLoading(false);
        return;
      }
      const vaultPrompt = createVaultPrompt(basePrompt, topic.title, topic.subTopic.title, true, { quiz: true });
      let result;
      try {
        result = await callAIJsonOnly(vaultPrompt, null, 'gpt-4o-mini');
      } catch (_) {
        result = await callAIWithVault(
          vaultPrompt,
          topic.title,
          topic.subTopic.title,
          { includeAdditional: true }
        );
      }
      console.log('[Quiz][AI Raw Result]', result);
      let parsed;
      try {
        const jsonStr = extractFirstJson(result);
        if (!jsonStr) throw new Error('No JSON found in AI output');
        parsed = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.warn('[Quiz][Parse Error] Could not parse AI output as JSON:', parseErr);
        console.warn('[Quiz][Fallback] Using fallback questions (AI parse error)');
        setQuestions(generateFallbackQuestions());
        setIsLoading(false);
        return;
      }
      const quizQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
      let normalized = normalizeQuestionsFromAI(quizQuestions);
      // Validate domain relevance; replace weak items with curated fallbacks where available
      const kws = getKeywordsForSubTopic(topic.subTopic.title);
      const isSLT = topic.subTopic.title.toLowerCase().includes('social learning') || topic.subTopic.title.toLowerCase().includes('bandura');
      const isRE = topic.subTopic.title.toLowerCase().includes('religious experience') || topic.subTopic.title.toLowerCase().includes('otto') || topic.subTopic.title.toLowerCase().includes('william james') || topic.subTopic.title.toLowerCase().includes('james');
      const curated = isSLT ? curatedSLTQuestions() : (isRE ? curatedREQuestions() : []);
      const curatedIter = curated[Symbol.iterator]();
      const isBadOption = (opt) => /religious|philosoph|ethical|historical/i.test(String(opt || ''));
      const validated = normalized.map(item => {
        const domainOk = looksDomainRelevant(item.question, kws) || looksDomainRelevant(item.explanation, kws) || (item.options || []).some(o => looksDomainRelevant(o, kws));
        const optionsOk = Array.isArray(item.options) && item.options.length === 4 && item.options.every(o => !isBadOption(o));
        const answerOk = Number.isInteger(item.correctAnswer) && item.correctAnswer >= 0 && item.correctAnswer < 4;
        if (domainOk && optionsOk && answerOk && !isGenericStem(item.question)) return item;
        if (domainOk && optionsOk && answerOk && isGenericStem(item.question)) {
          return { ...item, question: sanitizeQuestionText(rewriteGenericStem(topic.subTopic.title)) };
        }
        const next = curatedIter.next();
        return next.done ? item : next.value;
      });
      normalized = validated.map(normalizeOptions);
      // De-duplicate and top-up from curated without repeats
      normalized = dedupeAndTopUp(normalized, curated).map(alignExplanation);
      if (normalized.length < 10) {
        console.warn('[Quiz] Normalized fewer than 10 questions; topping up with fallbacks');
        const fallback = generateFallbackQuestions();
        // Append fallback until we have 10
        for (let i = 0; i < fallback.length && normalized.length < 10; i++) {
          normalized.push(fallback[i]);
        }
      }
      setQuestions(normalized.slice(0, 10));
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setQuizComplete(false);
      setShowResults(false);
      setQuizStats({ correct: 0, incorrect: 0, total: 0 });
    } catch (err) {
      console.warn('[Quiz][Fallback] Using fallback questions (AI error)', err);
      setQuestions(generateFallbackQuestions());
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackQuestions = () => {
    // Curated fallbacks for key sub-topics
    const sltFallback = curatedSLTQuestions();
    const reFallback = curatedREQuestions();

    // Psychology-first: detect SLT (Bandura)
    const sub = String(topic.subTopic.title || '').toLowerCase();
    if (sub.includes('social learning') || sub.includes('bandura')) {
      const questions = [...sltFallback];
      while (questions.length < 10) {
        questions.push({
          question: 'Which of the following best describes identification in SLT?',
          options: ['Copying any adult', 'Imitating a model with whom one shares characteristics/status', 'Learning by trial and error', 'Innate reflex imitation'],
          correctAnswer: 1,
          explanation: 'Identification: imitation is more likely when the observer perceives similarity or status in the model.'
        });
      }
      return questions.slice(0, 10);
    }
    if (sub.includes('religious experience') || sub.includes('otto') || sub.includes('william james') || sub.includes('james')) {
      const questions = [...reFallback];
      while (questions.length < 10) {
        questions.push({
          question: 'Which statement best fits James’s view of mystical experience?',
          options: ['It is always delusional', 'It often carries a sense of insight (noetic quality)', 'It is primarily linguistic', 'It has no practical effects'],
          correctAnswer: 1,
          explanation: 'James emphasised the noetic quality and “fruits” (practical effects) of experiences.'
        });
      }
      return questions.slice(0, 10);
    }

    // Legacy RS-specific fallbacks (kept for OCR RS pages)
    const topicSpecificQuestions = {
      'Philosophy of Religion': {
        'Religious Experience': [
          {
            question: "What is William James' definition of religious experience?",
            options: [
              "A feeling of being at one with the universe",
              "A sense of the presence of the divine",
              "An experience that is ineffable, noetic, transient, and passive",
              "A mystical encounter with God"
            ],
            correctAnswer: 2,
            explanation: "James identified four characteristics of religious experience: ineffable (cannot be described), noetic (provides knowledge), transient (temporary), and passive (beyond control)."
          },
          {
            question: "Which philosopher argued that religious experiences are 'veridical'?",
            options: [
              "William James",
              "Richard Swinburne",
              "Rudolf Otto",
              "Sigmund Freud"
            ],
            correctAnswer: 1,
            explanation: "Swinburne argued that religious experiences are veridical (genuine encounters with the divine) and should be trusted unless there are good reasons to doubt them."
          }
        ],
        'The Problem of Evil': [
          {
            question: "What is the logical problem of evil?",
            options: [
              "The question of why evil exists",
              "The apparent contradiction between God's existence and evil's existence",
              "The problem of defining what evil is",
              "The question of how to respond to evil"
            ],
            correctAnswer: 1,
            explanation: "The logical problem of evil argues that the existence of an all-powerful, all-knowing, all-good God is logically incompatible with the existence of evil."
          },
          {
            question: "Which philosopher developed the Free Will Defence?",
            options: [
              "Alvin Plantinga",
              "John Hick",
              "Augustine",
              "Irenaeus"
            ],
            correctAnswer: 0,
            explanation: "Alvin Plantinga developed the Free Will Defence, arguing that evil exists because God gave humans free will, which is necessary for genuine moral choice."
          }
        ]
      },
      'Religion and Ethics': {
        'Natural Law': [
          {
            question: "What is the primary precept of Natural Law according to Aquinas?",
            options: [
              "Do good and avoid evil",
              "Follow God's commands",
              "Maximize happiness",
              "Respect human dignity"
            ],
            correctAnswer: 0,
            explanation: "Aquinas identified 'do good and avoid evil' as the primary precept of Natural Law, from which all other moral principles derive."
          },
          {
            question: "What are the four tiers of law in Aquinas' system?",
            options: [
              "Eternal, Natural, Human, Divine",
              "Moral, Legal, Religious, Social",
              "Universal, Particular, Temporal, Spiritual",
              "Primary, Secondary, Tertiary, Quaternary"
            ],
            correctAnswer: 0,
            explanation: "Aquinas identified four tiers: Eternal Law (God's plan), Natural Law (human reason), Human Law (civil laws), and Divine Law (revelation)."
          }
        ],
        'Situation Ethics': [
          {
            question: "What is the central principle of Situation Ethics?",
            options: [
              "Do unto others as you would have them do unto you",
              "The greatest good for the greatest number",
              "Love is the only absolute",
              "Follow your conscience"
            ],
            correctAnswer: 2,
            explanation: "Joseph Fletcher argued that 'love is the only absolute' and all other moral rules are relative to this principle."
          }
        ]
      },
      'Developments in Christian Thought': {
        'Knowledge of God': [
          {
            question: "What is the via negativa approach to knowing God?",
            options: [
              "Knowing God through what God is not",
              "Knowing God through revelation",
              "Knowing God through reason",
              "Knowing God through experience"
            ],
            correctAnswer: 0,
            explanation: "The via negativa (negative way) involves understanding God by saying what God is not, rather than what God is."
          },
          {
            question: "Which theologian emphasized the importance of revelation in knowing God?",
            options: [
              "Karl Barth",
              "Thomas Aquinas",
              "Moses Maimonides",
              "John Calvin"
            ],
            correctAnswer: 0,
            explanation: "Karl Barth emphasized that knowledge of God comes through divine revelation, not through human reason or experience."
          }
        ]
      }
    };

    // Get topic-specific questions or use generic psychology ones
    const topicQuestions = topicSpecificQuestions[topic.title]?.[topic.subTopic.title] || [
      {
        question: `Which key term is central to ${topic.subTopic.title}?`,
        options: [
          'A well-evidenced concept in this sub-topic',
          'An unrelated pseudoscience',
          'A historical curiosity',
          'A purely moral slogan'
        ],
        correctAnswer: 0,
        explanation: `${topic.subTopic.title} should be assessed with relevant, evidence-based content.`
      },
      {
        question: `Which option best fits within ${topic.title}?`,
        options: [
          'Evidence-based theories and studies',
          'Unfalsifiable spiritual claims',
          'Purely historical narratives',
          'Random opinion polls'
        ],
        correctAnswer: 0,
        explanation: `${topic.title} relies on empirical research and testable theories.`
      }
    ];

    // Ensure we have 10 questions by repeating or adding generic ones
    const questions = [...topicQuestions];
    while (questions.length < 10) {
      questions.push({
        question: `What is an important aspect of ${topic.subTopic.title}?`,
        options: [
          "Understanding key principles",
          "Memorizing facts",
          "Ignoring other views",
          "Accepting everything uncritically"
        ],
        correctAnswer: 0,
        explanation: `Understanding key principles is essential for mastering ${topic.subTopic.title}.`
      });
    }

    return questions.slice(0, 10);
  };

  const handleAnswerSelect = (selectedOption) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = selectedOption;
    setUserAnswers(updatedAnswers);

    // Update stats
    const isCorrect = selectedOption === questions[currentQuestionIndex].correctAnswer;
    setQuizStats(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1,
      total: prev.total + 1
    }));

    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      if (mode === 'blind') {
        // In Blind Test, immediately advance to next question (no feedback delay)
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // In Show the Answers, show feedback for 8s
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 8000);
      }
    } else {
      if (mode === 'blind') {
        setQuizComplete(true);
        setShowResults(true);
      } else {
        setTimeout(() => {
          setQuizComplete(true);
          setShowResults(true);
        }, 8000);
      }
    }
  };

  const getSuccessRate = () => {
    const total = quizStats.correct + quizStats.incorrect;
    if (total === 0) return 0;
    return Math.round((quizStats.correct / total) * 100);
  };

  const saveQuiz = () => {
    // Validate questions and userAnswers
    if (!Array.isArray(questions) || questions.length === 0) {
      alert("Cannot save quiz: No questions available.");
      return;
    }
    if (!Array.isArray(userAnswers) || userAnswers.length !== questions.length) {
      alert("Cannot save quiz: Answers are missing or mismatched.");
      return;
    }

    const quiz = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      topic: topic.title,
      subTopic: topic.subTopic.title,
      successRate: getSuccessRate(),
      stats: { ...quizStats },
      questions: questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswers[index] || null,
        explanation: q.explanation
      }))
    };

    const updatedHistory = [quiz, ...quizHistory].slice(0, 20); // Keep last 20 quizzes
    setQuizHistory(updatedHistory);
    try {
      localStorage.setItem(`quiz-history-${topic.subTopic.id}`, JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('Failed to save quiz history:', err);
      alert('Failed to save quiz. Your browser storage may be full or unavailable.');
      return;
    }
    // Return to main quiz view
    setQuizComplete(false);
    setShowResults(false);
    setShowHistory(false);
  };

  const deleteQuiz = () => {
    // Return to main quiz view without saving
    setQuizComplete(false);
    setShowResults(false);
    setShowHistory(false);
  };

  const storeQuiz = () => {
    const quiz = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      topic: topic.title,
      subTopic: topic.subTopic.title,
      successRate: getSuccessRate(),
      stats: { ...quizStats },
      questions: questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswers[index] || null,
        explanation: q.explanation
      }))
    };

    const updatedQuizzes = [quiz, ...storedQuizzes].slice(0, 50); // Keep last 50 quizzes
    setStoredQuizzes(updatedQuizzes);
    localStorage.setItem(`quiz-stored-${topic.subTopic.id}`, JSON.stringify(updatedQuizzes));
  };

  const exportQuiz = () => {
    const quizData = {
      topic: topic.title,
      subTopic: topic.subTopic.title,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      successRate: getSuccessRate(),
      stats: quizStats,
      questions: questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.options[q.correctAnswer],
        userAnswer: userAnswers[index] !== null ? q.options[userAnswers[index]] : 'Not answered',
        explanation: q.explanation
      }))
    };

    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text('QUIZ RESULTS', 10, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Topic: ${quizData.topic}`, 10, y); y += 7;
    doc.text(`Sub-Topic: ${quizData.subTopic}`, 10, y); y += 7;
    doc.text(`Date: ${quizData.date}`, 10, y); y += 7;
    doc.text(`Time: ${quizData.time}`, 10, y); y += 7;
    doc.text(`Success Rate: ${quizData.successRate}%`, 10, y); y += 10;
    doc.text(`RESULTS:`, 10, y); y += 7;
    doc.text(`- Correct: ${quizData.stats.correct}`, 10, y); y += 7;
    doc.text(`- Incorrect: ${quizData.stats.incorrect}`, 10, y); y += 10;
    doc.text('DETAILED REVIEW:', 10, y); y += 8;
    quizData.questions.forEach((q, index) => {
      if (y > 270) { doc.addPage(); y = 10; }
      doc.setFontSize(12);
      doc.text(`Q${index + 1}: ${q.question}`, 10, y); y += 7;
      q.options.forEach((option, optIndex) => {
        doc.text(`${String.fromCharCode(65 + optIndex)}. ${option}`, 14, y); y += 6;
      });
      doc.text(`Your Answer: ${q.userAnswer}`, 14, y); y += 6;
      doc.text(`Correct Answer: ${q.correctAnswer}`, 14, y); y += 6;
      doc.text(`Explanation: ${q.explanation}`, 14, y); y += 8;
    });
    doc.save(`quiz-results-${topic.subTopic.title}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Generate detailed answer summary with references from the vault
  const generateDetailedSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      // Prepare a compact JSON of questions with the correct answer text
      const compact = questions.map((q, idx) => ({
        index: idx + 1,
        question: q.question,
        correct: Array.isArray(q.options) && Number.isInteger(q.correctAnswer) ? q.options[q.correctAnswer] : ''
      }));
      const basePrompt = `You are an expert AQA Psychology teacher.

Create a DETAILED ANSWER SUMMARY for the following MCQs using ONLY the OCR/Revision Guide references provided below. For each question, provide:
- A 2–3 sentence evidence-based explanation that justifies the correct option
- A list of sources with file name and page number, extracted from the REFERENCE headers (e.g., "AQA Psychology For A Level Year 1 & AS 2nd ED.pdf", page as shown)

QUESTIONS (with correct answers):
${JSON.stringify(compact, null, 2)}

Return ONLY this JSON:
{
  "answers": [
    {
      "index": 1,
      "detailed": "...",
      "sources": [ { "file": "...pdf", "page": 34 } ]
    }
  ]
}`;
      const vaultPrompt = createVaultPrompt(basePrompt, topic.title, topic.subTopic.title, true, { quiz: true });
      const result = await callAIWithVault(
        vaultPrompt,
        topic.title,
        topic.subTopic.title,
        { includeAdditional: true }
      );
      let parsed;
      try {
        const jsonStr = extractFirstJson(result);
        if (!jsonStr) throw new Error('No JSON found in AI output');
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        console.warn('[Quiz][Summary Parse Error]', e);
        setDetailedSummary(null);
        return;
      }
      setDetailedSummary(parsed);
    } catch (err) {
      console.error('[Quiz] Failed to generate detailed summary', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const deleteStoredQuiz = (quizId) => {
    const updatedQuizzes = storedQuizzes.filter(quiz => quiz.id !== quizId);
    setStoredQuizzes(updatedQuizzes);
    localStorage.setItem(`quiz-stored-${topic.subTopic.id}`, JSON.stringify(updatedQuizzes));
  };

  const exportStoredQuiz = (quiz) => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text('QUIZ RESULTS', 10, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Topic: ${quiz.topic}`, 10, y); y += 7;
    doc.text(`Sub-Topic: ${quiz.subTopic}`, 10, y); y += 7;
    doc.text(`Date: ${new Date(quiz.timestamp).toLocaleDateString()}`, 10, y); y += 7;
    doc.text(`Time: ${new Date(quiz.timestamp).toLocaleTimeString()}`, 10, y); y += 7;
    doc.text(`Success Rate: ${quiz.successRate}%`, 10, y); y += 10;
    doc.text(`RESULTS:`, 10, y); y += 7;
    doc.text(`- Correct: ${quiz.stats.correct}`, 10, y); y += 7;
    doc.text(`- Incorrect: ${quiz.stats.incorrect}`, 10, y); y += 10;
    doc.text('DETAILED REVIEW:', 10, y); y += 8;
    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions.forEach((q, index) => {
        if (y > 270) { doc.addPage(); y = 10; }
        doc.setFontSize(12);
        doc.text(`Q${index + 1}: ${q.question || 'Question not available'}`, 10, y); y += 7;
        if (q.options && Array.isArray(q.options)) {
          q.options.forEach((option, optIndex) => {
            doc.text(`${String.fromCharCode(65 + optIndex)}. ${option}`, 14, y); y += 6;
          });
        }
        doc.text(`Your Answer: ${q.userAnswer !== null && q.userAnswer !== undefined && q.options && q.options[q.userAnswer] ? q.options[q.userAnswer] : 'Not answered'}`, 14, y); y += 6;
        doc.text(`Correct Answer: ${q.options && q.correctAnswer !== undefined && q.options[q.correctAnswer] ? q.options[q.correctAnswer] : 'Answer not available'}`, 14, y); y += 6;
        doc.text(`Explanation: ${q.explanation || 'No explanation available'}`, 14, y); y += 8;
      });
    }
    doc.save(`quiz-results-${quiz.subTopic}-${new Date(quiz.timestamp).toISOString().split('T')[0]}.pdf`);
  };

  // Helper to extract unique references from explanations
  const getReferencesUsed = () => {
    const refs = new Set();
    questions.forEach(q => {
      const matches = q.explanation.match(/Reference\s*\d+/gi);
      if (matches) matches.forEach(ref => refs.add(ref));
    });
    return Array.from(refs);
  };

  // In the question display, strip 'Reference X' from the explanation
  const cleanExplanation = (explanation) => explanation.replace(/\s*Reference\s*\d+\.?/gi, '').trim();

  // Utility to clean 'Reference X' from questions and options
  const cleanReferenceMentions = (text) => text.replace(/\s*Reference\s*\d+\.?/gi, '').replace(/\(\s*Reference\s*\d+\s*\)/gi, '').trim();

  // Utility to remove meta-phrases like "according to the materials"
  const cleanMaterialPhrases = (text) => (
    (text || '')
      .replace(/,?\s*\(?\s*according to the materials\s*\)?/gi, '')
      .replace(/,?\s*\(?\s*based on the materials\s*\)?/gi, '')
      .replace(/,?\s*\(?\s*using the materials\s*\)?/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
  );

  if (!quizStarted) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800 flex flex-col justify-center items-center`}>
        <div className="max-w-xl w-full bg-white border rounded-lg shadow-sm p-8 space-y-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">{topic.subTopic.title} Quiz</h2>
          <p className="text-gray-600 text-center mb-6">Choose your quiz mode:</p>
          <div className="flex justify-center gap-6 mb-6">
            <button
              className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all ${mode === 'blind' ? 'bg-blue-600 text-white border-blue-700 shadow-lg' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50'}`}
              onClick={() => setMode('blind')}
            >
              Blind Test
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all ${mode === 'show' ? 'bg-purple-600 text-white border-purple-700 shadow-lg' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-purple-50'}`}
              onClick={() => setMode('show')}
            >
              Show the Answers
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 mb-2">
            <label className="text-sm text-gray-600">Question Source</label>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={async () => {
                  if (!mode) return;
                  generationStartedRef.current = true;
                  setBankSet('live');
                  setQuizStarted(true);
                  if (vaultLoaded) await generateQuiz('live');
                }}
                disabled={!mode}
                className={`px-6 py-2 rounded-lg font-semibold ${mode ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                LIVE
              </button>
              <button
                onClick={async () => {
                  if (!mode) return;
                  generationStartedRef.current = true;
                  setBankSet('lab');
                  setQuizStarted(true);
                  if (vaultLoaded) await generateQuiz('lab');
                }}
                disabled={!mode}
                className={`px-6 py-2 rounded-lg font-semibold ${mode ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                LAB
              </button>
            </div>
          </div>
          {/* Quiz Library (local LAB history) */}
          <QuizLibraryPreview topic={topic} />
          <div className="text-center mt-4">
            <button
              className="text-blue-600 hover:underline font-medium"
              onClick={onBack}
            >
              ← Back to {topic.title}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!vaultLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <div className="text-lg text-gray-700">Loading study materials...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {onBack && (
            <div className="flex justify-center mb-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                onClick={onBack}
              >
                ← Back to {topic.title}
              </button>
            </div>
          )}
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
            Practice Quiz
          </h2>
          <div className="bg-white border rounded-lg shadow-sm p-12 max-w-2xl mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Generating quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {onBack && (
            <div className="flex justify-center mb-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                onClick={onBack}
              >
                ← Back to {topic.title}
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quiz History
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStoredQuizzes(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
              >
                View Stored Quizzes ({storedQuizzes.length})
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
              >
                New Quiz
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {topic.subTopic.title} - Previous Quizzes
            </h3>
            
            {quizHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No quizzes yet</h3>
                <p className="text-gray-600 mb-6">Complete your first quiz to see your progress here.</p>
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                >
                  Start First Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {quizHistory.map((quiz) => (
                  <div key={quiz.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Quiz on {new Date(quiz.timestamp).toLocaleDateString()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(quiz.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{quiz.successRate}%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-600">{quiz.stats.correct}</div>
                        <div className="text-sm text-green-700">Correct</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-red-600">{quiz.stats.incorrect}</div>
                        <div className="text-sm text-red-700">Incorrect</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showStoredQuizzes) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {onBack && (
            <div className="flex justify-center mb-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                onClick={onBack}
              >
                ← Back to {topic.title}
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stored Quizzes
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                View History ({quizHistory.length})
              </button>
              <button
                onClick={() => setShowStoredQuizzes(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
              >
                New Quiz
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {topic.subTopic.title} - Stored Quizzes
            </h3>
            
            {storedQuizzes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No stored quizzes yet</h3>
                <p className="text-gray-600 mb-6">Complete a quiz and store the results to see them here.</p>
                <button
                  onClick={() => setShowStoredQuizzes(false)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                >
                  Start Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {storedQuizzes.map((quiz) => (
                  <div key={quiz.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Quiz from {new Date(quiz.timestamp).toLocaleDateString()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(quiz.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{quiz.successRate || 0}%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-600">{quiz.stats?.correct || 0}</div>
                        <div className="text-sm text-green-700">Correct</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-red-600">{quiz.stats?.incorrect || 0}</div>
                        <div className="text-sm text-red-700">Incorrect</div>
                      </div>
                    </div>

                    {/* Detailed Review */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                        View Detailed Review
                      </summary>
                      <div className="mt-4 space-y-4">
                        {quiz.questions && quiz.questions.map((q, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="mb-3">
                              <h6 className="font-medium text-gray-800 mb-1">
                                Question {index + 1}:
                              </h6>
                              <p className="text-gray-700 text-sm">{cleanReferenceMentions(q.question || 'Question not available')}</p>
                            </div>
                            
                            <div className="mb-3">
                              <span className="text-xs font-medium text-gray-600">Your Answer:</span>
                              <p className="text-gray-700 text-sm bg-white p-2 rounded border">
                                {q.userAnswer !== null && q.userAnswer !== undefined && q.options && q.options[q.userAnswer] 
                                  ? cleanReferenceMentions(q.options[q.userAnswer]) 
                                  : 'Not answered'}
                              </p>
                            </div>
                            
                            <div className="mb-3">
                              <span className="text-xs font-medium text-gray-600">Correct Answer:</span>
                              <p className="text-gray-800 text-sm bg-blue-50 p-2 rounded border">
                                {q.options && q.correctAnswer !== undefined && q.options[q.correctAnswer] 
                                  ? cleanReferenceMentions(q.options[q.correctAnswer]) 
                                  : 'Answer not available'}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-600">Result:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                q.userAnswer === q.correctAnswer
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {q.userAnswer === q.correctAnswer ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => exportStoredQuiz(quiz)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <button
                        onClick={() => deleteStoredQuiz(quiz.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {onBack && (
            <div className="flex justify-center mb-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                onClick={onBack}
              >
                ← Back to {topic.title}
              </button>
            </div>
          )}
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
            Quiz Results
          </h2>

          <div className="bg-white border rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Results</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{quizStats.correct}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-500">{quizStats.incorrect}</div>
                    <div className="text-sm text-gray-600">Incorrect</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <div className="text-xl font-bold text-blue-600">Success Rate: {getSuccessRate()}%</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-gray-800">Question Review</h4>
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Question {index + 1}:
                    </h5>
                    <p className="text-gray-700">{cleanReferenceMentions(question.question)}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="font-medium text-gray-700 mb-2">Options:</h6>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className={`p-3 rounded border ${
                          optIndex === question.correctAnswer 
                            ? 'bg-green-50 border-green-200' 
                            : optIndex === userAnswers[index]
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                            <span className="text-gray-700">{cleanReferenceMentions(option)}</span>
                            {optIndex === question.correctAnswer && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                            {optIndex === userAnswers[index] && optIndex !== question.correctAnswer && (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium text-gray-700">Your Answer:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userAnswers[index] === question.correctAnswer
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userAnswers[index] === question.correctAnswer ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h6 className="font-medium text-blue-800 mb-2">Explanation:</h6>
                    {mode === 'show' || quizComplete || showResults ? (
                      <p className="text-blue-700 text-sm">{cleanExplanation(question.explanation)}</p>
                    ) : null}
                  </div>

                  {detailedSummary && Array.isArray(detailedSummary.answers) && detailedSummary.answers.find(a => a.index === index + 1) && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4">
                      <h6 className="font-medium text-green-800 mb-2">Detailed Answer (Vault-Sourced):</h6>
                      <p className="text-green-800 text-sm">
                        {detailedSummary.answers.find(a => a.index === index + 1)?.detailed}
                      </p>
                      <div className="mt-2 text-sm text-green-900">
                        <span className="font-medium">Sources:</span>{' '}
                        {(detailedSummary.answers.find(a => a.index === index + 1)?.sources || [])
                          .map(s => `${s.file} - Page ${s.page}`)
                          .join('; ')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center space-y-4">
                <p className="text-gray-600 font-medium">What would you like to do with these results?</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={saveQuiz}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold"
                  >
                    Save Quiz
                  </button>
                  <button
                    onClick={storeQuiz}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    Store Results
                  </button>
                  <button
                    onClick={exportQuiz}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Export Results
                  </button>
                  <button
                    onClick={generateDetailedSummary}
                    disabled={isGeneratingSummary}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-semibold ${isGeneratingSummary ? 'bg-gray-300 text-gray-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                  >
                    {isGeneratingSummary ? 'Generating…' : 'Detailed Summary (with References)'}
                  </button>
                  <button
                    onClick={deleteQuiz}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                  >
                    Delete Quiz
                  </button>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowStoredQuizzes(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    View Stored Quizzes ({storedQuizzes.length})
                  </button>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• <strong>Save Quiz:</strong> Stores with quiz history for progress tracking</p>
                  <p>• <strong>Store Results:</strong> Saves detailed results for later reference</p>
                  <p>• <strong>Export Results:</strong> Downloads as text file to your device</p>
                </div>
              </div>
            </div>

            <div className="mt-4"><strong>References Used:</strong> {getReferencesUsed().join(', ')}</div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800`}>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {onBack && (
          <div className="flex justify-center mb-6">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
              onClick={onBack}
            >
              ← Back to {topic.title}
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {topic.subTopic.title} Quiz
            </h2>
            <p className="text-gray-600">Test your knowledge with multiple choice questions</p>
          </div>
          <div className="flex gap-3">
            {quizHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                View History ({quizHistory.length})
              </button>
            )}
            {storedQuizzes.length > 0 && (
              <button
                onClick={() => setShowStoredQuizzes(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
              >
                View Stored ({storedQuizzes.length})
              </button>
            )}
            <button
              onClick={generateQuiz}
              disabled={!vaultLoaded || isLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'New Quiz'}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="text-center mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Removed Quiz Progress stats (✓/✗) */}

        {/* Question */}
        <div className="bg-white border rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <div className="text-sm text-gray-500">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Speaker button (fetches audio) */}
              <button
                onClick={async () => {
                  setActiveAudioSection('question');
                  await speak(currentQuestion.question);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  activeAudioSection === 'question' && ttsState === 'playing' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={activeAudioSection === 'question' && ttsState === 'playing' ? 'Stop Audio' : 'Fetch Audio'}
                disabled={audioLoading}
              >
                {audioLoading && activeAudioSection === 'question' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <Volume2 className={`w-5 h-5 ${activeAudioSection === 'question' && ttsState === 'playing' ? 'text-blue-800' : 'text-blue-600'}`} />
                )}
              </button>
              {/* Permanent Play button */}
              <button
                onClick={playPreparedAudio}
                disabled={!audioReady || audioLoading}
                className={`p-2 rounded-lg transition-colors ${(!audioReady || audioLoading) ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-gray-100 text-blue-700 hover:bg-blue-100'}`}
                title="Play audio"
              >
                <Play className="w-5 h-5" />
              </button>
              {/* Pause button */}
              <button
                onClick={pause}
                className={`p-2 rounded-lg transition-colors ${activeAudioSection === 'question' && ttsState === 'paused' ? 'bg-blue-200 ring-2 ring-blue-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Pause audio"
              >
                <Pause className={`w-5 h-5 ${activeAudioSection === 'question' && ttsState === 'paused' ? 'text-blue-800' : 'text-blue-600'}`} />
              </button>
              {/* Stop button */}
              <button
                onClick={() => {
                  stop();
                  setActiveAudioSection(null);
                }}
                className={`p-2 rounded-lg transition-colors ${activeAudioSection === 'question' && ttsState === 'idle' ? 'bg-blue-200 ring-2 ring-blue-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Stop audio"
              >
                <StopCircle className={`w-5 h-5 ${activeAudioSection === 'question' && ttsState === 'idle' ? 'text-blue-800' : 'text-blue-600'}`} />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Question:</h2>
            <p className="text-xl text-gray-800 leading-relaxed">{cleanMaterialPhrases(cleanReferenceMentions(currentQuestion.question))}</p>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const answered = userAnswers[currentQuestionIndex] !== undefined;
              const isSelected = userAnswers[currentQuestionIndex] === index;
              const isCorrect = currentQuestion.correctAnswer === index;
              const showImmediate = answered && mode === 'show';
              // Base styles
              let rowCls = 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300';
              // Highlight selection in Blind mode (existing behavior)
              if (isSelected && !showImmediate) {
                rowCls = 'bg-blue-50 border-blue-300 ring-2 ring-blue-400';
              }
              // In Show mode, after answering, highlight correct vs. wrong
              if (showImmediate) {
                if (isCorrect) rowCls = 'bg-green-50 border-green-300 ring-1 ring-green-400';
                else if (isSelected) rowCls = 'bg-red-50 border-red-300 ring-1 ring-red-400';
                else rowCls = 'bg-gray-50 border-gray-200';
              }
              const badgeCls = isSelected && !showImmediate
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white border-gray-300 text-gray-700';
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={answered}
                  className={`w-full p-4 text-left border rounded-lg transition-all ${rowCls} ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${badgeCls}`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-gray-800">{cleanReferenceMentions(option)}</span>
                    {showImmediate && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {showImmediate && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {userAnswers[currentQuestionIndex] !== undefined && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
              {mode === 'show' || quizComplete || showResults ? (
                <p className="text-blue-700">{cleanExplanation(currentQuestion.explanation)}</p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizView; 

function QuizLibraryPreview({ topic }) {
  try {
    const curr = (window?.localStorage?.getItem('curriculum') || 'aqa-psych');
    const libKey = `quiz-lab-lib-${curr}-${topic.id}-${topic.subTopic.id}`;
    const libRaw = window?.localStorage?.getItem(libKey);
    const items = libRaw ? JSON.parse(libRaw) : [];
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
      <div className="w-full border rounded-lg p-3 bg-gray-50">
        <div className="text-sm font-semibold text-gray-800 mb-2">Quiz Library</div>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between text-sm bg-white border rounded p-2">
              <div className="text-gray-700">{new Date(it.createdAt).toLocaleString()}</div>
              <button
                className="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                onClick={() => {
                  try {
                    const labKeyPersist = `quiz-lab-latest-${curr}-${topic.id}-${topic.subTopic.id}`;
                    window?.localStorage?.setItem(labKeyPersist, JSON.stringify(it.items || []));
                    // optional toast could go here
                  } catch (_) {}
                }}
              >
                Use
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (_) {
    return null;
  }
}