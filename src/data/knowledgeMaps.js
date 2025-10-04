// Minimal Knowledge Unit (KU) maps per sub-topic.
// Safe defaults: if a sub-topic has no KUs, the Active Recall scorer
// will fall back to the existing generic logic.

/**
 * KU shape (documentation only):
 * {
 *   id: string,
 *   label: string,           // Human-friendly name
 *   weight: number,          // Relative importance (default 1)
 *   mustInclude: string[],   // Strong tokens to consider as hits
 *   accept?: string[],       // Weaker/alternative tokens
 *   cue?: string             // Micro-prompt cue
 * }
 */

export const KUsBySubTopic = {
  // OCR RS: Arguments for the Existence of God → Teleological Argument
  // topicData id: "arguments-existence-god"; subTopic id: "teleological"
  teleological: [
    {
      id: 'design-analogy',
      label: 'Design Analogy (watch → world)',
      weight: 1,
      mustInclude: ['design', 'analogy', 'purpose'],
      accept: ['complexity', 'order', 'watchmaker'] ,
      cue: 'Explain the design analogy and purpose in nature.'
    },
    {
      id: 'paley-argument',
      label: 'Paley’s Watchmaker (Natural Theology)',
      weight: 1,
      mustInclude: ['Paley', 'watch', 'Natural Theology'],
      accept: ['watchmaker', 'William Paley', 'purpose'],
      cue: 'Summarise Paley’s Watchmaker argument.'
    },
    {
      id: 'regularities-laws',
      label: 'Regularities in nature (laws/order)',
      weight: 1,
      mustInclude: ['order', 'laws of nature'],
      accept: ['regularity', 'fine-tuned'],
      cue: 'Give an example of order/regularity supporting design.'
    },
    {
      id: 'hume-critiques',
      label: 'Hume’s Critiques (Dialogues Concerning Natural Religion)',
      weight: 1,
      mustInclude: ['Hume', 'critique'],
      accept: ['Epicurean hypothesis', 'weak analogy', 'problem of evil'],
      cue: 'Outline one of Hume’s criticisms of design arguments.'
    },
    {
      id: 'anthropic-principle',
      label: 'Anthropic Principle (fine-tuning)',
      weight: 0.8,
      mustInclude: ['anthropic', 'fine-tuning'],
      accept: ['Goldilocks', 'constants'],
      cue: 'What is the anthropic principle and how does it support design?'
    }
  ]
  ,
  // Cosmological Argument
  cosmological: [
    {
      id: 'contingency-necessary',
      label: 'Contingency vs Necessary Being',
      weight: 1.2,
      mustInclude: ['contingent', 'necessary'],
      accept: ['dependency', 'dependent', 'non-contingent'],
      cue: 'Explain contingency and why a necessary being is posited.'
    },
    {
      id: 'first-cause',
      label: 'First Cause (efficient cause series)',
      weight: 1,
      mustInclude: ['first cause', 'efficient cause'],
      accept: ['uncaused cause', 'cause of everything'],
      cue: 'Outline the First Cause argument and the efficient cause series.'
    },
    {
      id: 'infinite-regress',
      label: 'Rejection of Infinite Regress',
      weight: 1,
      mustInclude: ['infinite regress'],
      accept: ['no infinite chain', 'terminates', 'series must start'],
      cue: 'Why does the causal chain need a terminus?'
    },
    {
      id: 'aquinas-ways',
      label: 'Aquinas’ Ways (motion, cause, contingency)',
      weight: 1,
      mustInclude: ['Aquinas'],
      accept: ['Summa Theologiae', 'Three Ways', 'Five Ways'],
      cue: 'Summarise Aquinas’ first three Ways in brief.'
    },
    {
      id: 'criticisms-cosmological',
      label: 'Key Criticisms (Hume/Kant/others)',
      weight: 0.8,
      mustInclude: ['Hume', 'Kant'],
      accept: ['fallacy of composition', 'causality', 'necessary existence'],
      cue: 'Give one Hume or Kant critique of the cosmological argument.'
    }
  ]
  ,
  // Ontological Argument
  ontological: [
    {
      id: 'anselm-proslogion',
      label: 'Anselm (Proslogion II/III)',
      weight: 1.2,
      mustInclude: ['Anselm', 'Proslogion'],
      accept: ['that than which nothing greater can be conceived', 'NTWNGCBC'],
      cue: 'State Anselm’s core definition and how it entails existence.'
    },
    {
      id: 'gaunilo-island',
      label: 'Gaunilo’s Perfect Island Objection',
      weight: 1,
      mustInclude: ['Gaunilo', 'island'],
      accept: ['parody', 'perfect island'],
      cue: 'Explain Gaunilo’s parody and why it challenges Anselm.'
    },
    {
      id: 'descartes-version',
      label: 'Descartes’ Ontological Argument',
      weight: 0.9,
      mustInclude: ['Descartes'],
      accept: ['supremely perfect being'],
      cue: 'Describe Descartes’ version (supremely perfect being).'
    },
    {
      id: 'kant-existence',
      label: 'Kant: Existence is not a predicate',
      weight: 1,
      mustInclude: ['Kant', 'predicate'],
      accept: ['not a real predicate', 'analytic/synthetic'],
      cue: 'What is Kant’s main objection to ontological arguments?'
    },
    {
      id: 'necessary-existence',
      label: 'Necessary Existence vs Contingent Concepts',
      weight: 0.8,
      mustInclude: ['necessary existence'],
      accept: ['modal', 'possible worlds'],
      cue: 'Define necessary existence in this argument’s context.'
    }
  ]
  ,
  // Religious Experience: Otto & William James
  'otto-james': [
    {
      id: 'numinous',
      label: 'Otto: The Numinous',
      weight: 1.1,
      mustInclude: ['numinous'],
      accept: ['holy', 'otherness'],
      cue: 'Define Otto’s numinous in one sentence.'
    },
    {
      id: 'mysterium-tremendum',
      label: 'Mysterium tremendum et fascinans',
      weight: 1,
      mustInclude: ['mysterium', 'tremendum', 'fascinans'],
      accept: ['awe', 'fear', 'attraction'],
      cue: 'What do tremendum and fascinans contribute to the experience?'
    },
    {
      id: 'james-four',
      label: 'James: Ineffable, Noetic, Transient, Passive',
      weight: 1.2,
      mustInclude: ['ineffable', 'noetic', 'transient', 'passive'],
      accept: ['four marks'],
      cue: 'List James’ four characteristics (INTP).'
    },
    {
      id: 'credulity-testimony',
      label: 'Swinburne: Credulity and Testimony',
      weight: 0.9,
      mustInclude: ['credulity', 'testimony'],
      accept: ['Swinburne'],
      cue: 'Explain credulity/testimony principles for religious experience.'
    },
    {
      id: 'naturalistic-critiques',
      label: 'Naturalistic Critiques (psych/neurology)',
      weight: 0.8,
      mustInclude: ['psychology', 'neurology'],
      accept: ['hallucination', 'temporal lobe'],
      cue: 'Give a concise naturalistic explanation of RE.'
    }
  ]
};

// Optional: export a KU typedef for editor intellisense (JS only)
// export type KU = { id: string, label: string, weight: number, mustInclude: string[], accept?: string[], cue?: string };


