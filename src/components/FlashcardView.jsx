import React, { useState, useEffect } from 'react';
import { useAIService } from "../hooks/useAIService";
import { useVaultService } from "../hooks/useVaultService";
import { useElevenLabsTTS } from "../hooks/useElevenLabsTTS";
import { getSelectedCurriculum } from "../config/curricula";
import { logPlannerEvent } from "../progress/plannerEvents";
import { Loader2, Volume2, Pause, StopCircle, ChevronLeft, ChevronRight, RotateCcw, Shuffle, History, Play, Download, Save, FileText, Calendar, Clock, Target } from "lucide-react";
import jsPDF from 'jspdf';

// Spaced Repetition System (SM-2 Algorithm)
class SRS {
  constructor() {
    this.examDate = new Date('2026-05-01'); // May 2026 exam
  }

  // Calculate days until exam
  getDaysUntilExam() {
    const today = new Date();
    const timeDiff = this.examDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // SM-2 Algorithm for spaced repetition
  calculateNextReview(card, quality) {
    // quality: 0-5 (0=complete blackout, 5=perfect response)
    const { repetitions = 0, easeFactor = 2.5, interval = 0 } = card;
    
    let newEaseFactor = easeFactor;
    let newInterval = interval;
    let newRepetitions = repetitions;

    if (quality >= 3) {
      // Successful recall
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * easeFactor);
      }
      newRepetitions = repetitions + 1;
    } else {
      // Failed recall - reset
      newInterval = 1;
      newRepetitions = 0;
    }

    // Adjust ease factor
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum ease factor

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    return {
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      interval: newInterval,
      nextReview: nextReview,
      lastReviewed: new Date()
    };
  }

  // Check if card is due for review
  isCardDue(card) {
    if (!card.nextReview) return true;
    const today = new Date();
    return today >= new Date(card.nextReview);
  }

  // Get due cards from a set of cards
  getDueCards(cards) {
    return cards.filter(card => this.isCardDue(card));
  }

  // Get cards due today
  getCardsDueToday(cards) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return cards.filter(card => {
      if (!card.nextReview) return true;
      const reviewDate = new Date(card.nextReview);
      return reviewDate >= today && reviewDate < tomorrow;
    });
  }

  // Get cards due this week
  getCardsDueThisWeek(cards) {
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return cards.filter(card => {
      if (!card.nextReview) return true;
      const reviewDate = new Date(card.nextReview);
      return reviewDate >= today && reviewDate <= weekFromNow;
    });
  }
}

function FlashcardView({ topic, onBack }) {
  const [allFlashcards, setAllFlashcards] = useState([]);
  const [sessionFlashcards, setSessionFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [step, setStep] = useState(1); // 1: question, 2: submitted, 3: revealed, 4: assessed
  const [assessment, setAssessment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [activeAudioSection, setActiveAudioSection] = useState(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [userAssessments, setUserAssessments] = useState([]);
  const [storedSummaries, setStoredSummaries] = useState([]);
  const [showStoredSummaries, setShowStoredSummaries] = useState(false);
  
  // Spaced Repetition System
  const [srs] = useState(new SRS());
  const [srsCards, setSrsCards] = useState([]);
  const [showSrsStats, setShowSrsStats] = useState(false);
  const [srsMode, setSrsMode] = useState(false); // true = SRS mode, false = regular mode
  const [qualityRating, setQualityRating] = useState(null); // 0-5 rating for SRS
  
  // Stats for current session
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    partial: 0,
    incorrect: 0,
    total: 0
  });

  const { callAIWithVault, callAIJsonOnly } = useAIService();
  const { createVaultPrompt, getRelevantContext, isVaultLoaded, vaultLoaded } = useVaultService();
  const { speak, playPreparedAudio, audioReady, audioLoading, audioError, pause, stop, ttsState } = useElevenLabsTTS();

  const [sourceSet, setSourceSet] = useState('lab'); // 'lab' | 'live'

  // Load session history, stored summaries, and SRS cards from localStorage on mount
  useEffect(() => {
    const curr = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
    const savedHistory = localStorage.getItem(`${curr}:flashcard-history-${topic.subTopic.id}`);
    if (savedHistory) {
      setSessionHistory(JSON.parse(savedHistory));
    }
    
    const savedSummaries = localStorage.getItem(`${curr}:flashcard-summaries-${topic.subTopic.id}`);
    if (savedSummaries) {
      setStoredSummaries(JSON.parse(savedSummaries));
    }

    // Load SRS cards
    const savedSrsCards = localStorage.getItem(`${curr}:srs-cards-${topic.subTopic.id}`);
    if (savedSrsCards) {
      setSrsCards(JSON.parse(savedSrsCards));
    }

    // Default sourceSet to LAB if a saved set exists
    try {
      const libKey = `${curr}:flash-lab-lib-${topic.id}-${topic.subTopic.id}`;
      const latestKey = `${curr}:flash-lab-latest-${topic.id}-${topic.subTopic.id}`;
      const hasLib = !!localStorage.getItem(libKey);
      const hasLatest = !!localStorage.getItem(latestKey);
      if (hasLib || hasLatest) setSourceSet('lab');
    } catch (_) {}
  }, [topic.subTopic.id]);

  // Save SRS cards to localStorage whenever they change
  useEffect(() => {
    if (srsCards.length > 0) {
      const curr = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
      localStorage.setItem(`${curr}:srs-cards-${topic.subTopic.id}`, JSON.stringify(srsCards));
    }
  }, [srsCards, topic.subTopic.id]);

  // Reset active audio section when audio ends
  useEffect(() => {
    if (ttsState === 'idle') {
      setActiveAudioSection(null);
    }
  }, [ttsState]);

  // Only generate flashcards after vault is loaded
  useEffect(() => {
    if (vaultLoaded) {
      if (srsMode) {
        loadSrsCards();
      } else {
        generateFlashcards();
      }
    }
  }, [vaultLoaded, srsMode]);

  const extractFirstJson = (text) => {
    // Regex to find the first {...} JSON block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return match[0];
    }
    return null;
  };

  // Quality helpers: align Q↔A entities and tighten phrasing
  const extractStudyRef = (text) => {
    const m = String(text || '').match(/([A-Z][a-z]+)\s*\(((?:19|20)\d{2})\)/);
    return m ? { name: m[1], year: m[2], label: `${m[1]} (${m[2]})` } : null;
  };

  const escapeRegExp = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const toTitleCase = (s) => {
    const ACRONYMS = new Set(['STM','LTM','WMM','MSM','EWT','AQA','AO1','AO2','AO3','RM']);
    const LOWER = new Set(['of','and','in','to','the','for','a','an','on','at','by','or']);
    return String(s || '')
      .split(/\s+/)
      .map((w, i) => {
        const bare = w.replace(/[^a-z0-9]/gi,'');
        if (ACRONYMS.has(bare.toUpperCase())) return bare.toUpperCase();
        if (i > 0 && LOWER.has(bare.toLowerCase())) return bare.toLowerCase();
        return bare.charAt(0).toUpperCase() + bare.slice(1);
      })
      .join(' ');
  };

  const deriveSubjectFromAnswer = (answer, originalQuestion, fallback) => {
    const a = String(answer || '').toLowerCase();
    const q = String(originalQuestion || '').toLowerCase();
    // Animal studies heuristics
    if ((/harlow/i.test(answer) || /rhesus|monkey/.test(a)) && (a.includes('cloth') || a.includes('wire') || a.includes('comfort'))) {
      return 'contact comfort in rhesus monkeys';
    }
    if ((/harlow/i.test(answer) || /monkey|maternal/.test(a)) && (a.includes('maternal deprivation') || a.includes('aggress') || a.includes('socially'))) {
      return 'long-term effects of maternal deprivation';
    }
    if (/lorenz/i.test(answer) || /gosling|geese/.test(a) || /imprinting/.test(a)) {
      if (a.includes('critical period')) return 'the critical period for imprinting in goslings';
      return a.includes('gosling') || a.includes('geese') ? 'imprinting in goslings' : 'imprinting';
    }
    // Extract specific tail from question if present
    const m = q.match(/about\s+([^?]+)\??$/);
    if (m && m[1]) return m[1].trim();
    return fallback;
  };

  const chooseAuxForSubject = (subject) => {
    const s = String(subject || '').toLowerCase();
    if (/(findings|studies|results|data|children|processes|effects|implications)\b/.test(s)) return 'do';
    if (/(\w+s\b)/.test(s)) return 'do';
    return 'does';
  };

  const enforceQuality = (cards) => {
    return cards.map((c) => {
      const ao = String(c.ao || '').toUpperCase();
      let q = String(c.question || '').trim();
      const a = String(c.answer || '').trim();
      const ref = extractStudyRef(a) || extractStudyRef(q);

      if (ao.includes('AO1')) {
        // Canonicalize AO1
        if (ref) {
          // Always prefer canonical findings question; pick a specific subject derived from answer
          const subject = deriveSubjectFromAnswer(a, q, topic.subTopic.title);
          q = `What did ${ref.label} find about ${subject}?`;
        } else {
          // If question already starts with an interrogative, keep it (normalize punctuation)
          const interrogative = /^(what|which|who|how|when|where|why)\b/i.test(q);
          if (interrogative) {
            q = q.replace(/^\s*define\s*:?\s*/i, '').trim();
            q = q.replace(/\?+\s*$/,'?');
          } else {
            // Transform any "Define ..." or generic into a clean interrogative
            let term = q.replace(/^\s*define\s*:?\s*/i, '').trim();
            term = term.replace(/^what\s+is\s+/i, '').trim();
            if (!term) term = topic.subTopic.title;
            q = `What is ${term}?`;
          }
        }
      } else if (ao.includes('AO3')) {
        // If answer cites a study, align Q to that study
        if (ref) {
          q = `Give one limitation or strength of ${ref.label} and why it matters.`;
        }
      } else if (ao.includes('AO2')) {
        // Prefer concise application phrasing; avoid prefixes like Scenario/Apply
        const rest = q.replace(/^\s*(scenario|apply)\s*:?\s*/i, '').trim().replace(/[.\s]+$/,'');
        if (ref) {
          q = `What is one implication of ${ref.label} for ${topic.subTopic.title}?`;
        } else if (rest) {
          const idx = rest.toLowerCase().indexOf(' to ');
          if (idx > 0) {
            const lhs = rest.slice(0, idx).trim();
            const rhs = rest.slice(idx + 4).trim();
            const aux = chooseAuxForSubject(lhs);
            q = `How ${aux} ${lhs} apply to ${rhs}?`;
          } else {
            q = `How does ${topic.subTopic.title} apply to ${rest}?`;
          }
        } else {
          q = `How does ${topic.subTopic.title} apply in practice?`;
        }
      }
      // Final cleanup: remove any lingering command-style prefixes
      q = q.replace(/^\s*Define\s*:?\s*/i, '').replace(/^\s*Scenario\s*:?\s*/i, '').trim();
      // Normalize trailing punctuation: drop trailing periods/exclamations then ensure single ? for questions
      q = q.replace(/[.!\u2026]+\s*$/,'');
      if (ao.includes('AO1') || ao.includes('AO2')) {
        if (!/\?$/.test(q)) q = q + '?';
        q = q.replace(/\?+\s*$/,'?');
      }
      // Collapse malformed endings like '.?' or '?.' to a single '?'
      q = q.replace(/[.!\u2026]+\?$/,'?').replace(/\?\s*[.!\u2026]+$/,'?');
      // Normalize formal terms to canonical casing from topic titles
      const canonSub = toTitleCase(topic?.subTopic?.title || '');
      const canonTop = toTitleCase(topic?.title || '');
      if (canonSub) {
        const subRe = new RegExp(`\\b${escapeRegExp(canonSub)}\\b`, 'gi');
        q = q.replace(subRe, canonSub);
      }
      if (canonTop) {
        const topRe = new RegExp(`\\b${escapeRegExp(canonTop)}\\b`, 'gi');
        q = q.replace(topRe, canonTop);
      }
      // Also fix common lowercased variants of known subtopic words in-place (e.g., 'maternal deprivation')
      if (canonSub && canonSub.toLowerCase() !== canonSub) {
        const subLower = new RegExp(`\\b${escapeRegExp(canonSub.toLowerCase())}\\b`, 'gi');
        q = q.replace(subLower, canonSub);
      }
      return { ...c, question: q, answer: a };
    });
  };

  const loadLabIfAvailable = async () => {
    try {
      const curr = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
      
      // First try to load from pre-generated bank files in public/banks/
      const bankPath = `/banks/${curr}/${topic.id}_${topic.subTopic.id}_flashcards.json`;
      console.log('[Flashcards] Attempting to load bank from:', bankPath);
      try {
        const response = await fetch(bankPath);
        if (response.ok) {
          const bankData = await response.json();
          if (bankData.items && Array.isArray(bankData.items) && bankData.items.length > 0) {
            console.log('[Flashcards] Loaded', bankData.items.length, 'cards from bank file');
            return bankData.items;
          }
        }
      } catch (fetchErr) {
        console.log('[Flashcards] Bank file not found, trying localStorage fallback');
      }
      
      // Fallback to localStorage (legacy behavior)
      const libKey = `${curr}:flash-lab-lib-${topic.id}-${topic.subTopic.id}`;
      const latestKey = `${curr}:flash-lab-latest-${topic.id}-${topic.subTopic.id}`;
      const libRaw = localStorage.getItem(libKey);
      if (libRaw) {
        const lib = JSON.parse(libRaw);
        if (Array.isArray(lib) && lib.length > 0 && Array.isArray(lib[0]?.items)) return lib[0].items;
      }
      const raw = localStorage.getItem(latestKey);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
      }
      return null;
    } catch (_) { return null; }
  };

  const persistLab = (cards) => {
    try {
      const curr = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
      const latestKey = `${curr}:flash-lab-latest-${topic.id}-${topic.subTopic.id}`;
      const libKey = `${curr}:flash-lab-lib-${topic.id}-${topic.subTopic.id}`;
      localStorage.setItem(latestKey, JSON.stringify(cards));
      const existing = JSON.parse(localStorage.getItem(libKey) || '[]');
      const next = [{ id: Date.now(), createdAt: new Date().toISOString(), set: 'LAB', items: cards }, ...existing].slice(0, 10);
      localStorage.setItem(libKey, JSON.stringify(next));
    } catch (_) {}
  };

  const loadFromLabSet = (items) => {
    if (!Array.isArray(items) || items.length === 0) return;
    setSessionFlashcards(items);
    setCurrentIndex(0);
    setUserAnswer('');
    setStep(1);
    setAssessment('');
    setSessionComplete(false);
    setShowSummary(false);
    setSessionStats({ correct: 0, partial: 0, incorrect: 0, total: 0 });
    setUserAnswers([]);
    setUserAssessments([]);
    setIsLoading(false);
  };

  const generateFlashcards = async (opts = { refreshLab: false, source: null }) => {
    setIsLoading(true);
    // New AQA Psychology prompt
    const basePrompt = `You are an expert AQA Psychology teacher creating flashcards for AQA Psychology 7182 students.

TOPIC: ${topic.title}
SUB-TOPIC: ${topic.subTopic.title}

Create EXACTLY 5 flashcards for high-velocity revision with THIS DISTRIBUTION:
- 3 x AO1 (at least one must be AO1 Findings from a named study with specific stat/detail)
- 1 x AO2 (apply to a 1–2 sentence scenario)
- 1 x AO3 (one specific strength or limitation with brief evidence)

Each flashcard must be one of the following types:
- AO1: Test recall of a key term, definition, or concept
- AO1 (Findings): Ask for findings from a named study and ALWAYS include in the answer: researcher(s) + year, sample/method/measure, and a precise key result (number, percentage, correlation, region/volume change)
- AO2: Ask for application of a theory/model to a short scenario (1–2 sentences)
- AO3: Ask for a specific strength or limitation of a theory/model and support with a brief piece of evidence (named study or clear reason)

Rules:
- Avoid vague stems like "Describe findings". Prefer: "What did [Researcher, Year] find about X?", "Name two findings from [Study]", "Which mechanism explains X? Define and give evidence."
- Keep questions concise and exam-focused. Answers should be <= 30 words, precise, and evidence-anchored when applicable.
- If the sub-topic mentions plasticity or trauma, include mechanisms of functional recovery (e.g., axonal sprouting, denervation supersensitivity, recruitment of homologous areas) and at least one supporting study where possible.

Examples:
Front: Define: Cognitive Dissonance | Back: Mental conflict when beliefs contradict... (AO1)
Front: What did Milgram (1963) find about obedience? | Back: 65% to 450V; signs of extreme stress (AO1 findings)
Front: Apply WMM to a dual-task driving-and-audio scenario | Back: Separate stores allow concurrent tasks unless both use phonological loop (AO2)
Front: One strength of the WMM (Baddeley & Hitch)? | Back: Dual-task evidence supports separate stores (AO3)

Return in this JSON format:
{
  "flashcards": [
    {
      "question": "A concise question about ${topic.subTopic.title}",
      "answer": "The correct answer (definition, finding incl. study/year/stat if applicable, application, or explanation)",
      "ao": "AO1" | "AO2" | "AO3"
    }
  ]
}`;
    try {
      // LAB: use saved; if none or refreshLab, build and persist
      const chosenSource = opts && opts.source ? opts.source : sourceSet;
      if (!srsMode && chosenSource === 'lab' && !opts.refreshLab) {
        const saved = await loadLabIfAvailable();
        if (saved && saved.length > 0) { loadFromLabSet(saved); return; }
      }

      const vaultPrompt = createVaultPrompt(basePrompt, topic.title, topic.subTopic.title, true, { flashcards: true });
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
      console.log('[Flashcards][AI Raw Result]', result);
      let parsed;
      try {
        const jsonStr = extractFirstJson(result);
        if (!jsonStr) throw new Error('No JSON found in AI output');
        parsed = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.warn('[Flashcards][Parse Error] Could not parse AI output as JSON:', parseErr);
        console.warn('[Flashcards][Fallback] Using fallback flashcards (AI parse error)');
        setSessionFlashcards(generateFallbackFlashcards());
        setIsLoading(false);
        return;
      }
      const flashcards = parsed.flashcards || [];

      // Enforce distribution: 3 AO1, 1 AO2, 1 AO3 (progressive learning weighting)
      const selectWithDistribution = (cards) => {
        const byAO = { AO1: [], AO2: [], AO3: [] };
        for (const c of cards) {
          const tag = String(c.ao || '').toUpperCase();
          if (tag.includes('AO1')) byAO.AO1.push(c);
          else if (tag.includes('AO2')) byAO.AO2.push(c);
          else if (tag.includes('AO3')) byAO.AO3.push(c);
        }
        const pick = [];
        // 3 AO1
        pick.push(...byAO.AO1.slice(0, 3));
        // 1 AO2
        if (byAO.AO2.length > 0) pick.push(byAO.AO2[0]);
        // 1 AO3
        if (byAO.AO3.length > 0) pick.push(byAO.AO3[0]);
        // If short, top up with any remaining
        if (pick.length < 5) {
          const remaining = cards.filter(c => !pick.includes(c));
          pick.push(...remaining.slice(0, 5 - pick.length));
        }
        return pick.slice(0, 5);
      };

      const selected = enforceQuality(selectWithDistribution(flashcards));
      if (selected.length < 5) {
        console.warn('[Flashcards][Fallback] Using fallback flashcards (AI returned <5 flashcards)');
        setSessionFlashcards(generateFallbackFlashcards());
      } else {
        // Persist to LAB if in lab mode or refreshLab
        if (!srsMode && ((opts && opts.source === 'lab') || sourceSet === 'lab' || opts.refreshLab)) {
          persistLab(selected);
        }
        setSessionFlashcards(selected);
        
        // Add new cards to SRS if not already present
        if (!srsMode) {
          const existingQuestions = srsCards.map(card => card.question);
          const newCards = selected.filter(card => !existingQuestions.includes(card.question));
          if (newCards.length > 0) {
            addCardsToSrs(newCards);
          }
        }
      }
      setCurrentIndex(0);
      setUserAnswer('');
      setStep(1);
      setAssessment('');
      setSessionComplete(false);
      setShowSummary(false);
      setSessionStats({ correct: 0, partial: 0, incorrect: 0, total: 0 });
      setUserAnswers([]);
      setUserAssessments([]);
    } catch (err) {
      console.warn('[Flashcards][Fallback] Using fallback flashcards (AI error)', err);
      setSessionFlashcards(generateFallbackFlashcards());
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackFlashcards = () => {
    // Create topic-specific fallback flashcards based on the actual topic
    const topicSpecificFlashcards = {
      'Philosophy of Religion': {
        'Religious Experience': [
          {
            question: "What are the four characteristics of religious experience according to William James?",
            answer: "Ineffable (cannot be described), noetic (provides knowledge), transient (temporary), and passive (beyond control).",
            explanation: "James identified these characteristics to distinguish religious experiences from ordinary experiences and to show their unique nature."
          },
          {
            question: "What is Richard Swinburne's argument about religious experiences?",
            answer: "Religious experiences are veridical (genuine encounters with the divine) and should be trusted unless there are good reasons to doubt them.",
            explanation: "Swinburne argues that religious experiences provide direct evidence for God's existence and should be given the same weight as other types of experience."
          },
          {
            question: "What is Rudolf Otto's concept of the 'numinous'?",
            answer: "The numinous is the experience of the holy or sacred that is both fascinating and terrifying (mysterium tremendum et fascinans).",
            explanation: "Otto's concept helps explain the unique nature of religious experiences that cannot be fully explained by rational analysis."
          }
        ],
        'The Problem of Evil': [
          {
            question: "What is the difference between the logical and evidential problem of evil?",
            answer: "The logical problem argues that God and evil are logically incompatible, while the evidential problem argues that evil provides evidence against God's existence.",
            explanation: "Understanding this distinction is crucial for evaluating different responses to the problem of evil."
          },
          {
            question: "What is Alvin Plantinga's Free Will Defence?",
            answer: "Evil exists because God gave humans free will, which is necessary for genuine moral choice and is worth the risk of evil.",
            explanation: "Plantinga's defence attempts to show that God and evil are logically compatible by appealing to the value of free will."
          }
        ]
      },
      'Religion and Ethics': {
        'Natural Law': [
          {
            question: "What is the primary precept of Natural Law according to Aquinas?",
            answer: "Do good and avoid evil - this is the fundamental principle from which all other moral principles derive.",
            explanation: "This primary precept is self-evident and forms the foundation of Aquinas's entire ethical system."
          },
          {
            question: "What are the secondary precepts of Natural Law?",
            answer: "Practical applications of the primary precept, such as preserving life, educating children, living in society, worshipping God, and reproducing.",
            explanation: "Secondary precepts help apply the primary precept to specific moral situations and decisions."
          }
        ],
        'Situation Ethics': [
          {
            question: "What is the central principle of Situation Ethics according to Joseph Fletcher?",
            answer: "Love is the only absolute - all other moral rules are relative to the principle of agape (selfless love).",
            explanation: "Fletcher argues that love should be the guiding principle in all moral decisions, making other rules flexible."
          }
        ]
      },
      'Developments in Christian Thought': {
        'Knowledge of God': [
          {
            question: "What is the via negativa approach to knowing God?",
            answer: "Knowing God through what God is not - understanding God by saying what God is not rather than what God is.",
            explanation: "This approach recognizes the limitations of human language and concepts when describing the divine."
          },
          {
            question: "What is Karl Barth's view on knowledge of God?",
            answer: "Knowledge of God comes through divine revelation, not through human reason or experience.",
            explanation: "Barth emphasizes that humans cannot know God through their own efforts - God must reveal himself."
          }
        ]
      }
    };

    // Get topic-specific flashcards or use generic ones
    const topicFlashcards = topicSpecificFlashcards[topic.title]?.[topic.subTopic.title] || [
      {
        question: `What is a key concept in ${topic.subTopic.title}?`,
        answer: `This sub-topic explores key concepts and principles related to ${topic.subTopic.title}.`,
        explanation: `Understanding key concepts helps establish the foundation for this area of study.`
      },
      {
        question: `How does ${topic.subTopic.title} relate to the broader topic of ${topic.title}?`,
        answer: `It connects to the main themes and concepts within ${topic.title}.`,
        explanation: `This connection helps situate the sub-topic within the wider context.`
      }
    ];

    // Ensure we have 5 flashcards by repeating or adding generic ones
    const flashcards = [...topicFlashcards];
    while (flashcards.length < 5) {
      flashcards.push({
        question: `What is an important aspect of ${topic.subTopic.title}?`,
        answer: `Understanding key principles and concepts specific to ${topic.subTopic.title}.`,
        explanation: `Understanding these aspects is essential for mastering this sub-topic.`
      });
    }

    return flashcards.slice(0, 5);
  };

  const handleNext = () => {
    // Save current user answer and assessment
    const updatedAnswers = [...userAnswers];
    const updatedAssessments = [...userAssessments];
    
    updatedAnswers[currentIndex] = userAnswer;
    updatedAssessments[currentIndex] = assessment;
    
    setUserAnswers(updatedAnswers);
    setUserAssessments(updatedAssessments);

    if (currentIndex < sessionFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setStep(1);
      setAssessment('');
    } else {
      // Session complete - show summary immediately
      setShowSummary(true);
      setSessionComplete(true);
    }
  };

  const saveSession = () => {
    const session = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      topic: topic.title,
      subTopic: topic.subTopic.title,
      stats: { ...sessionStats },
      successRate: getSuccessRate(),
      cards: sessionFlashcards.map((card, index) => ({
        question: card.question,
        answer: card.answer,
        userAnswer: userAnswers[index] || '',
        assessment: userAssessments[index] || ''
      }))
    };

    const updatedHistory = [session, ...sessionHistory].slice(0, 20); // Keep last 20 sessions
    setSessionHistory(updatedHistory);
    const curr = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
    localStorage.setItem(`${curr}:flashcard-history-${topic.subTopic.id}`, JSON.stringify(updatedHistory));
    
    // Return to main flashcard view
    setSessionComplete(false);
    setShowSummary(false);
    setShowHistory(false);
  };

  const deleteSession = () => {
    // Return to main flashcard view without saving
    setSessionComplete(false);
    setShowSummary(false);
    setShowHistory(false);
  };

  const handleSubmit = () => {
    if (userAnswer.trim() === '') return;
    setStep(2);
  };

  const handleReveal = () => {
    setStep(3);
  };

  const handleAssessment = (result) => {
    setAssessment(result);
    setStep(4);
    
    // Convert assessment to SRS quality rating
    let quality;
    if (result === 'correct') {
      quality = 5; // Perfect response
    } else if (result === 'partial') {
      quality = 3; // Hard time, but recalled
    } else {
      quality = 1; // Complete blackout
    }
    
    // Update SRS if in SRS mode
    if (srsMode) {
      handleSrsAssessment(quality);
      return;
    }
    
    // Save current user answer and assessment
    const updatedAnswers = [...userAnswers];
    const updatedAssessments = [...userAssessments];
    
    updatedAnswers[currentIndex] = userAnswer;
    updatedAssessments[currentIndex] = result;
    
    setUserAnswers(updatedAnswers);
    setUserAssessments(updatedAssessments);
    
    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      [result]: prev[result] + 1,
      total: prev.total + 1
    }));

    // Check if session is complete
    if (currentIndex === sessionFlashcards.length - 1) {
      setTimeout(() => {
        setSessionComplete(true);
        saveSession();
        try { logPlannerEvent({ phase: 'reinforce', topicId: topic.id, subId: topic.subTopic.id, theme: topic.subTopic.title, curriculum: null }); } catch(_){ }
      }, 2000);
    } else {
      // Auto-advance after 2 seconds
      setTimeout(() => {
        handleNext();
      }, 2000);
    }
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % sessionFlashcards.length);
    setUserAnswer('');
    setStep(1);
    setAssessment('');
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + sessionFlashcards.length) % sessionFlashcards.length);
    setUserAnswer('');
    setStep(1);
    setAssessment('');
  };

  const resetCard = () => {
    setUserAnswer('');
    setStep(1);
    setAssessment('');
  };

  const handleShuffle = () => {
    generateFlashcards();
  };

  const handleReset = () => {
    generateFlashcards();
  };

  const startNewSessionFromHistory = () => {
    setShowHistory(false);
    generateFlashcards();
  };

  const getStepColor = () => {
    switch(step) {
      case 1: return 'border-blue-400';
      case 2: return 'border-yellow-400';
      case 3: return 'border-purple-400';
      case 4: return assessment === 'correct' ? 'border-green-400' : 
                    assessment === 'partial' ? 'border-orange-400' : 'border-red-400';
      default: return 'border-gray-400';
    }
  };

  const getSuccessRate = () => {
    const total = sessionStats.correct + sessionStats.partial + sessionStats.incorrect;
    if (total === 0) return 0;
    
    // Calculate percentage based on 5 cards total
    // Each card represents 20% (100% / 5 cards)
    const correctPercentage = (sessionStats.correct / 5) * 100;
    const partialPercentage = (sessionStats.partial / 5) * 50; // Partial counts as 50% of a card
    
    return Math.round(correctPercentage + partialPercentage);
  };

  const currentCard = sessionFlashcards[currentIndex];

  // Export summary to text file
  const exportSummary = () => {
    const summaryData = {
      topic: topic.title,
      subTopic: topic.subTopic.title,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      successRate: getSuccessRate(),
      stats: sessionStats,
      cards: sessionFlashcards.map((card, index) => ({
        question: card.question,
        answer: card.answer,
        userAnswer: userAnswers[index] || 'No answer provided',
        assessment: userAssessments[index] || 'Not assessed'
      }))
    };

    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text('FLASHCARD SESSION SUMMARY', 10, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Topic: ${summaryData.topic}`, 10, y); y += 7;
    doc.text(`Sub-Topic: ${summaryData.subTopic}`, 10, y); y += 7;
    doc.text(`Date: ${summaryData.date}`, 10, y); y += 7;
    doc.text(`Time: ${summaryData.time}`, 10, y); y += 7;
    doc.text(`Success Rate: ${summaryData.successRate}%`, 10, y); y += 10;
    doc.text(`RESULTS:`, 10, y); y += 7;
    doc.text(`- Correct: ${summaryData.stats.correct}`, 10, y); y += 7;
    doc.text(`- Partial: ${summaryData.stats.partial}`, 10, y); y += 7;
    doc.text(`- Incorrect: ${summaryData.stats.incorrect}`, 10, y); y += 10;
    doc.text('DETAILED REVIEW:', 10, y); y += 8;
    summaryData.cards.forEach((card, index) => {
      if (y > 270) { doc.addPage(); y = 10; }
      doc.setFontSize(12);
      doc.text(`Q${index + 1}: ${card.question}`, 10, y); y += 7;
      doc.text(`Your Answer: ${card.userAnswer}`, 14, y); y += 6;
      doc.text(`Correct Answer: ${card.answer}`, 14, y); y += 6;
      doc.text(`Assessment: ${card.assessment}`, 14, y); y += 8;
    });
    doc.save(`flashcard-summary-${topic.subTopic.title}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Store summary in app
  const storeSummary = () => {
    const summary = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      topic: topic.title,
      subTopic: topic.subTopic.title,
      successRate: getSuccessRate(),
      stats: { ...sessionStats },
      cards: sessionFlashcards.map((card, index) => ({
        question: card.question,
        answer: card.answer,
        userAnswer: userAnswers[index] || 'No answer provided',
        assessment: userAssessments[index] || 'Not assessed'
      }))
    };

    const updatedSummaries = [summary, ...storedSummaries].slice(0, 50); // Keep last 50 summaries
    setStoredSummaries(updatedSummaries);
    const curr = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
    localStorage.setItem(`${curr}:flashcard-summaries-${topic.subTopic.id}`, JSON.stringify(updatedSummaries));
  };

  // Delete stored summary
  const deleteStoredSummary = (summaryId) => {
    const updatedSummaries = storedSummaries.filter(summary => summary.id !== summaryId);
    setStoredSummaries(updatedSummaries);
    localStorage.setItem(`flashcard-summaries-${topic.subTopic.id}`, JSON.stringify(updatedSummaries));
  };

  // Export stored summary
  const exportStoredSummary = (summary) => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text('FLASHCARD SESSION SUMMARY', 10, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Topic: ${summary.topic}`, 10, y); y += 7;
    doc.text(`Sub-Topic: ${summary.subTopic}`, 10, y); y += 7;
    doc.text(`Date: ${new Date(summary.timestamp).toLocaleDateString()}`, 10, y); y += 7;
    doc.text(`Time: ${new Date(summary.timestamp).toLocaleTimeString()}`, 10, y); y += 7;
    doc.text(`Success Rate: ${summary.successRate}%`, 10, y); y += 10;
    doc.text(`RESULTS:`, 10, y); y += 7;
    doc.text(`- Correct: ${summary.stats.correct}`, 10, y); y += 7;
    doc.text(`- Partial: ${summary.stats.partial}`, 10, y); y += 7;
    doc.text(`- Incorrect: ${summary.stats.incorrect}`, 10, y); y += 10;
    doc.text('DETAILED REVIEW:', 10, y); y += 8;
    if (summary.cards && Array.isArray(summary.cards)) {
      summary.cards.forEach((card, index) => {
        if (y > 270) { doc.addPage(); y = 10; }
        doc.setFontSize(12);
        doc.text(`Q${index + 1}: ${card.question}`, 10, y); y += 7;
        doc.text(`Your Answer: ${card.userAnswer}`, 14, y); y += 6;
        doc.text(`Correct Answer: ${card.answer}`, 14, y); y += 6;
        doc.text(`Assessment: ${card.assessment}`, 14, y); y += 8;
      });
    }
    doc.save(`flashcard-summary-${summary.subTopic}-${new Date(summary.timestamp).toISOString().split('T')[0]}.pdf`);
  };

  // SRS Functions
  const loadSrsCards = () => {
    const dueCards = srs.getDueCards(srsCards);
    if (dueCards.length === 0) {
      // No cards due, generate new ones
      generateFlashcards();
      return;
    }
    
    // Load due cards for review
    setSessionFlashcards(dueCards.slice(0, 10)); // Limit to 10 cards per session
    setCurrentIndex(0);
    setUserAnswer('');
    setStep(1);
    setAssessment('');
    setSessionComplete(false);
    setShowSummary(false);
    setSessionStats({ correct: 0, partial: 0, incorrect: 0, total: dueCards.length });
    setUserAnswers([]);
    setUserAssessments([]);
    setIsLoading(false);
  };

  const addCardsToSrs = (cards) => {
    const newSrsCards = cards.map(card => ({
      ...card,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
      nextReview: null,
      lastReviewed: null
    }));
    
    setSrsCards(prev => [...prev, ...newSrsCards]);
  };

  const updateSrsCard = (cardIndex, quality) => {
    const card = sessionFlashcards[cardIndex];
    const updatedCard = {
      ...card,
      ...srs.calculateNextReview(card, quality)
    };
    
    setSrsCards(prev => prev.map(c => 
      c.question === card.question ? updatedCard : c
    ));
  };

  const getSrsStats = () => {
    const totalCards = srsCards.length;
    const dueToday = srs.getCardsDueToday(srsCards).length;
    const dueThisWeek = srs.getCardsDueThisWeek(srsCards).length;
    const daysUntilExam = srs.getDaysUntilExam();
    
    return {
      totalCards,
      dueToday,
      dueThisWeek,
      daysUntilExam
    };
  };

  const handleSrsAssessment = (quality) => {
    // Update the SRS card with the quality rating
    updateSrsCard(currentIndex, quality);
    
    // Update session stats
    const newStats = { ...sessionStats };
    if (quality >= 4) {
      newStats.correct++;
    } else if (quality >= 2) {
      newStats.partial++;
    } else {
      newStats.incorrect++;
    }
    setSessionStats(newStats);
    
    // Move to next card
    if (currentIndex < sessionFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setStep(1);
      setAssessment('');
      setQualityRating(null);
    } else {
      setSessionComplete(true);
      setShowSummary(true);
    }
  };

  if (!isVaultLoaded()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <div className="text-lg text-gray-700">Loading study materials...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
            Flashcards
          </h2>
          <div className="bg-white border rounded-lg shadow-sm p-12 max-w-2xl mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Generating flashcards...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Session History
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStoredSummaries(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
              >
                View Summaries ({storedSummaries.length})
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
              >
                New Session
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {topic.subTopic.title} - Previous Sessions
            </h3>
            
            {sessionHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No sessions yet</h3>
                <p className="text-gray-600 mb-6">Complete your first flashcard session to see your progress here.</p>
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                >
                  Start First Session
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessionHistory.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Session on {new Date(session.timestamp).toLocaleDateString()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(session.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{session.successRate}%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-600">{session.stats.correct}</div>
                        <div className="text-sm text-green-700">Correct</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-orange-600">{session.stats.partial}</div>
                        <div className="text-sm text-orange-700">Partial</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-red-600">{session.stats.incorrect}</div>
                        <div className="text-sm text-red-700">Incorrect</div>
                      </div>
                    </div>

                    {/* Detailed Review */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                        View Detailed Review
                      </summary>
                      <div className="mt-4 space-y-4">
                        {session.cards.map((card, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="mb-3">
                              <h6 className="font-medium text-gray-800 mb-1">
                                Question {index + 1}:
                              </h6>
                              <p className="text-gray-700 text-sm">{card.question}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <span className="text-xs font-medium text-gray-600">Your Answer:</span>
                                <p className="text-gray-700 text-sm bg-white p-2 rounded border">
                                  {card.userAnswer || 'No answer provided'}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-600">Correct Answer:</span>
                                <p className="text-gray-800 text-sm bg-blue-50 p-2 rounded border">
                                  {card.answer}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-600">Assessment:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                card.assessment === 'correct' 
                                  ? 'bg-green-100 text-green-800' 
                                  : card.assessment === 'partial'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {card.assessment === 'correct' ? 'Got it right' :
                                 card.assessment === 'partial' ? 'Partially right' :
                                 card.assessment === 'incorrect' ? 'Got it wrong' : 'Not assessed'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showStoredSummaries) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stored Summaries
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                View History ({sessionHistory.length})
              </button>
              <button
                onClick={() => setShowStoredSummaries(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
              >
                New Session
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {topic.subTopic.title} - Stored Summaries
            </h3>
            
            {storedSummaries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No stored summaries yet</h3>
                <p className="text-gray-600 mb-6">Complete a flashcard session and store the summary to see it here.</p>
                <button
                  onClick={() => setShowStoredSummaries(false)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                >
                  Start Session
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {storedSummaries.map((summary) => (
                  <div key={summary.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Summary from {new Date(summary.timestamp).toLocaleDateString()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(summary.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{summary.successRate}%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-600">{summary.stats.correct}</div>
                        <div className="text-sm text-green-700">Correct</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-orange-600">{summary.stats.partial}</div>
                        <div className="text-sm text-orange-700">Partial</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-lg font-bold text-red-600">{summary.stats.incorrect}</div>
                        <div className="text-sm text-red-700">Incorrect</div>
                      </div>
                    </div>

                    {/* Detailed Review */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                        View Detailed Review
                      </summary>
                      <div className="mt-4 space-y-4">
                        {summary.cards.map((card, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="mb-3">
                              <h6 className="font-medium text-gray-800 mb-1">
                                Question {index + 1}:
                              </h6>
                              <p className="text-gray-700 text-sm">{card.question}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <span className="text-xs font-medium text-gray-600">Your Answer:</span>
                                <p className="text-gray-700 text-sm bg-white p-2 rounded border">
                                  {card.userAnswer || 'No answer provided'}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-600">Correct Answer:</span>
                                <p className="text-gray-800 text-sm bg-blue-50 p-2 rounded border">
                                  {card.answer}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-600">Assessment:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                card.assessment === 'correct' 
                                  ? 'bg-green-100 text-green-800' 
                                  : card.assessment === 'partial'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {card.assessment === 'correct' ? 'Got it right' :
                                 card.assessment === 'partial' ? 'Partially right' :
                                 card.assessment === 'incorrect' ? 'Got it wrong' : 'Not assessed'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => exportStoredSummary(summary)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <button
                        onClick={() => deleteStoredSummary(summary.id)}
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

        {/* SRS Stats Display */}
        {showSrsStats && srsCards.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Spaced Repetition Stats
            </h3>
            {(() => {
              const stats = getSrsStats();
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalCards}</div>
                    <div className="text-sm text-blue-700">Total Cards</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.dueToday}</div>
                    <div className="text-sm text-green-700">Due Today</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.dueThisWeek}</div>
                    <div className="text-sm text-orange-700">Due This Week</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.daysUntilExam}</div>
                    <div className="text-sm text-purple-700">Days Until Exam</div>
                  </div>
                </div>
              );
            })()}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>SRS Mode:</strong> Cards are shown at optimal intervals for long-term retention. 
                {srsMode ? ' You are currently in SRS mode.' : ' Switch to SRS mode to review due cards.'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (sessionComplete && !showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
            Session Complete!
          </h2>

          <div className="bg-white border rounded-lg shadow-sm p-8 max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Great job!</h3>
              <p className="text-gray-600">You've completed your flashcard session.</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Session Results</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">{sessionStats.partial}</div>
                  <div className="text-sm text-gray-600">Partial</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{sessionStats.incorrect}</div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xl font-bold text-blue-600">Success Rate: {getSuccessRate()}%</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center space-y-4">
                <p className="text-gray-600 font-medium">What would you like to do with this summary?</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={saveSession}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold"
                  >
                    Save Session
                  </button>
                  <button
                    onClick={storeSummary}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    Store Summary
                  </button>
                  <button
                    onClick={exportSummary}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Export Summary
                  </button>
                  <button
                    onClick={deleteSession}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                  >
                    Delete Session
                  </button>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowStoredSummaries(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    View Stored Summaries ({storedSummaries.length})
                  </button>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• <strong>Save Session:</strong> Stores with session history for progress tracking</p>
                  <p>• <strong>Store Summary:</strong> Saves detailed summary for later reference</p>
                  <p>• <strong>Export Summary:</strong> Downloads as text file to your device</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
            Session Summary
          </h2>

          <div className="bg-white border rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Results</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">{sessionStats.partial}</div>
                    <div className="text-sm text-gray-600">Partial</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-500">{sessionStats.incorrect}</div>
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
              {sessionFlashcards.map((card, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Question {index + 1}:
                    </h5>
                    <p className="text-gray-700">{card.question}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">Your Answer:</h6>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded border">
                        {userAnswers[index] || 'No answer provided'}
                      </p>
                    </div>
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">Correct Answer:</h6>
                      <p className="text-gray-800 bg-blue-50 p-3 rounded border">
                        {card.answer}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Your Assessment:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userAssessments[index] === 'correct' 
                        ? 'bg-green-100 text-green-800' 
                        : userAssessments[index] === 'partial'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userAssessments[index] === 'correct' ? 'Got it right' :
                       userAssessments[index] === 'partial' ? 'Partially right' :
                       userAssessments[index] === 'incorrect' ? 'Got it wrong' : 'Not assessed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center space-y-4">
                <p className="text-gray-600 font-medium">What would you like to do with this summary?</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={saveSession}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold"
                  >
                    Save Session
                  </button>
                  <button
                    onClick={storeSummary}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    Store Summary
                  </button>
                  <button
                    onClick={exportSummary}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Export Summary
                  </button>
                  <button
                    onClick={deleteSession}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                  >
                    Delete Session
                  </button>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowStoredSummaries(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    View Stored Summaries ({storedSummaries.length})
                  </button>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• <strong>Save Session:</strong> Stores with session history for progress tracking</p>
                  <p>• <strong>Store Summary:</strong> Saves detailed summary for later reference</p>
                  <p>• <strong>Export Summary:</strong> Downloads as text file to your device</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${((getSelectedCurriculum&&getSelectedCurriculum())==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((getSelectedCurriculum&&getSelectedCurriculum())==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800`}>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Back To Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-4 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to {topic.title}
        </button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {topic.subTopic.title} Flashcards
            </h2>
            <p className="text-gray-600">Test your knowledge with AI-generated flashcards</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {/* SRS Mode Toggle */}
            <button
              onClick={() => setSrsMode(!srsMode)}
              className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
                srsMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {srsMode ? 'SRS Mode' : 'Regular Mode'}
            </button>
            
            {/* SRS Stats Button */}
            {srsCards.length > 0 && (
              <button
                onClick={() => setShowSrsStats(!showSrsStats)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-semibold"
              >
                <Target className="w-4 h-4 inline mr-2" />
                SRS Stats
              </button>
            )}
            
            {sessionHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                View History ({sessionHistory.length})
              </button>
            )}
            {storedSummaries.length > 0 && (
              <button
                onClick={() => setShowStoredSummaries(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
              >
                View Summaries ({storedSummaries.length})
              </button>
            )}
            {/* Source controls like Quiz: LIVE/LAB and Refresh Lab */}
            {!srsMode && (
              <>
                <button
                  onClick={() => { setSourceSet('live'); generateFlashcards({ source: 'live' }); }}
                  className={`px-4 py-2 rounded-lg font-semibold ${sourceSet==='live' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  LIVE
                </button>
                <button
                  onClick={() => { setSourceSet('lab'); generateFlashcards({ source: 'lab' }); }}
                  className={`px-4 py-2 rounded-lg font-semibold ${sourceSet==='lab' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  LAB
                </button>
                <button
                  onClick={() => generateFlashcards({ refreshLab: true, source: 'lab' })}
                  className="px-4 py-2 rounded-lg font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  title="Rebuild and save new LAB set"
                >
                  Refresh LAB
                </button>
              </>
            )}
            <button
              onClick={generateFlashcards}
              disabled={!isVaultLoaded() || isLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Start Session'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={generateFlashcards}
                disabled={!isVaultLoaded() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate New Flashcards'
                )}
              </button>
              
              {sessionFlashcards.length > 0 && (
                <button
                  onClick={handleShuffle}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Shuffle & Restart
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Partial</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Incorrect</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flash Library (saved LAB sets) */}
        {!srsMode && (
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <div className="text-sm font-semibold text-gray-800 mb-2">Flash Library</div>
            <FlashLibraryPreview topic={topic} onUse={loadFromLabSet} />
          </div>
        )}

        {/* Stats */}
        {sessionStats.total > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Session Progress: {getSuccessRate()}%</span>
              <div className="flex gap-4">
                <span className="text-green-600 font-medium">✓ {sessionStats.correct}</span>
                <span className="text-orange-500 font-medium">~ {sessionStats.partial}</span>
                <span className="text-red-500 font-medium">✗ {sessionStats.incorrect}</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="text-center mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / sessionFlashcards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Flashcard */}
        <div className={`bg-gradient-to-br from-white to-gray-50 border-2 rounded-lg shadow-sm p-8 mb-6 transition-colors ${getStepColor()}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Question {currentIndex + 1} of {sessionFlashcards.length}
              </h3>
              <div className="text-sm text-gray-500">
                {Math.round(((currentIndex + 1) / sessionFlashcards.length) * 100)}% Complete
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Speaker button (fetches audio) */}
              <button
                onClick={async () => {
                  setActiveAudioSection('question');
                  await speak(currentCard.question);
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

          {/* Question */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Question:</h2>
            <p className="text-xl text-gray-800 leading-relaxed">{currentCard.question}</p>
          </div>

          {/* Step 1: Answer Input */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-700">Your Answer:</label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    handleSubmit();
                  }
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={userAnswer.trim() === ''}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                Submit Answer (⌘+Enter)
              </button>
            </div>
          )}

          {/* Step 2: Answer Submitted */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Your Answer:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{userAnswer}</p>
              </div>
              <button
                onClick={handleReveal}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Reveal Correct Answer
              </button>
            </div>
          )}

          {/* Step 3: Answer Revealed */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Your Answer:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{userAnswer}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
                <h3 className="font-semibold text-blue-800 mb-2">Correct Answer:</h3>
                <p className="text-gray-700 leading-relaxed">{currentCard.answer}</p>
                
                {/* Audio Controls for Answer */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {/* Speaker button (fetches audio) */}
                  <button 
                    onClick={async () => {
                      setActiveAudioSection('answer');
                      await speak(currentCard.answer);
                    }}
                    className={`hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 ${
                      activeAudioSection === 'answer' && ttsState === 'playing' ? 'bg-blue-200 ring-2 ring-blue-400' : ''
                    }`}
                    title="Fetch answer audio"
                    disabled={audioLoading}
                  >
                    {audioLoading && activeAudioSection === 'answer' ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    ) : (
                      <Volume2 className={`w-5 h-5 ${activeAudioSection === 'answer' && ttsState === 'playing' ? 'text-blue-800' : 'text-blue-600'}`} />
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
                    className={`hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 ${
                      activeAudioSection === 'answer' && ttsState === 'paused' ? 'bg-blue-200 ring-2 ring-blue-400' : ''
                    }`}
                    title="Pause audio"
                  >
                    <Pause className={`w-5 h-5 ${activeAudioSection === 'answer' && ttsState === 'paused' ? 'text-blue-800' : 'text-blue-600'}`} />
                  </button>
                  {/* Stop button */}
                  <button 
                    onClick={() => {
                      stop();
                      setActiveAudioSection(null);
                    }}
                    className={`hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 ${
                      activeAudioSection === 'answer' && ttsState === 'idle' ? 'bg-blue-200 ring-2 ring-blue-400' : ''
                    }`}
                    title="Stop audio"
                  >
                    <StopCircle className={`w-5 h-5 ${activeAudioSection === 'answer' && ttsState === 'idle' ? 'text-blue-800' : 'text-blue-600'}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {srsMode ? (
                  // SRS Quality Rating Buttons
                  <>
                    <button
                      onClick={() => handleSrsAssessment(5)}
                      className="bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      Perfect (5) ✓
                    </button>
                    <button
                      onClick={() => handleSrsAssessment(3)}
                      className="bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Hard (3) ~
                    </button>
                    <button
                      onClick={() => handleSrsAssessment(1)}
                      className="bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      Again (1) ✗
                    </button>
                  </>
                ) : (
                  // Regular Assessment Buttons
                  <>
                    <button
                      onClick={() => handleAssessment('correct')}
                      className="bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      Got it Right ✓
                    </button>
                    <button
                      onClick={() => handleAssessment('partial')}
                      className="bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Partially Right ~
                    </button>
                    <button
                      onClick={() => handleAssessment('incorrect')}
                      className="bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      Got it Wrong ✗
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Assessment Complete */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className={`text-2xl font-bold ${
                assessment === 'correct' ? 'text-green-600' : 
                assessment === 'partial' ? 'text-orange-500' : 'text-red-500'
              }`}>
                {assessment === 'correct' ? '✓ Correct!' : 
                 assessment === 'partial' ? '~ Partially Correct' : '✗ Incorrect'}
              </div>
              <p className="text-gray-600">
                {currentIndex === sessionFlashcards.length - 1 ? 'Session complete!' : 'Moving to next card...'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevCard}
            className="flex items-center gap-2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <button
            onClick={resetCard}
            className="flex items-center gap-2 bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
          >
            <RotateCcw size={20} />
            Reset Card
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlashcardView;

// Lightweight preview of saved LAB flashcard sets for the current subtopic
function FlashLibraryPreview({ topic, onUse }) {
  const curr = (getSelectedCurriculum && getSelectedCurriculum()) || 'aqa-psych';
  const libKey = `${curr}:flash-lab-lib-${topic.id}-${topic.subTopic.id}`;
  let lib = [];
  try {
    const raw = localStorage.getItem(libKey);
    lib = raw ? JSON.parse(raw) : [];
  } catch (_) {
    lib = [];
  }

  if (!Array.isArray(lib) || lib.length === 0) {
    return (
      <div className="text-sm text-gray-600">No saved LAB sets yet. Generate once to store here.</div>
    );
  }

  return (
    <div className="space-y-3">
      {lib.slice(0, 5).map((entry) => (
        <div key={entry.id} className="flex items-center justify-between border rounded p-3">
          <div className="text-sm">
            <div className="font-medium text-gray-800">Saved LAB set</div>
            <div className="text-gray-600">{new Date(entry.createdAt).toLocaleString()}</div>
            <div className="text-gray-500">{Array.isArray(entry.items) ? entry.items.length : 0} cards</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUse && onUse(entry.items)}
              className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-semibold"
            >
              Use
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
