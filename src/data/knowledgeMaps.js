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
  ,
  // Arguments for God's Existence: General Challenges
  challenges: [
    {
      id: 'fallacy-composition',
      label: 'Fallacy of Composition',
      weight: 0.9,
      mustInclude: ['fallacy of composition'],
      accept: ['whole from parts', 'parts→whole'],
      cue: 'State the fallacy of composition and how it challenges cosmological reasoning.'
    },
    {
      id: 'causality-hume',
      label: 'Hume on Causality/Necessary Connection',
      weight: 0.9,
      mustInclude: ['Hume', 'causality'],
      accept: ['necessary connection', 'cause and effect'],
      cue: 'Summarise Hume’s critique of causal inference in arguments for God.'
    },
    {
      id: 'kant-predicate',
      label: 'Kant: Existence not a Predicate',
      weight: 0.9,
      mustInclude: ['Kant', 'predicate'],
      accept: ['not a real predicate'],
      cue: 'Explain Kant’s objection and what it undermines.'
    },
    {
      id: 'brute-fact',
      label: 'Brute Fact/Alternative Explanations',
      weight: 0.9,
      mustInclude: ['brute fact'],
      accept: ['just is', 'no ultimate reason'],
      cue: 'What is a brute fact response to arguments for God?'
    },
    {
      id: 'weak-analogy',
      label: 'Weak Analogy/Order by Chance',
      weight: 0.9,
      mustInclude: ['weak analogy'],
      accept: ['order from chance', 'Epicurean hypothesis'],
      cue: 'How does weak analogy or chance order challenge design reasoning?'
    }
  ]
  ,
  // Religious Experience: Other Sub‑Topics
  types: [
    {
      id: 'visions-types',
      label: 'Types of Experience (visions etc.)',
      weight: 1.0,
      mustInclude: ['vision'],
      accept: ['corporeal', 'imaginative', 'intellectual', 'auditory'],
      cue: 'Name two types of religious experience (e.g., visionary forms).'
    },
    {
      id: 'conversion',
      label: 'Conversion Experiences',
      weight: 1.0,
      mustInclude: ['conversion'],
      accept: ['St Paul', 'transformation'],
      cue: 'Define a conversion experience with one brief example.'
    },
    {
      id: 'mystical',
      label: 'Mystical Experiences',
      weight: 1.0,
      mustInclude: ['mystical'],
      accept: ['union', 'oneness'],
      cue: 'What characterises mystical experiences?'
    },
    {
      id: 'corporate-individual',
      label: 'Corporate vs Individual',
      weight: 0.9,
      mustInclude: ['corporate'],
      accept: ['group', 'collective'],
      cue: 'Contrast corporate with individual religious experience.'
    }
  ]
  ,
  verification: [
    {
      id: 'credulity',
      label: 'Swinburne’s Principle of Credulity',
      weight: 1.0,
      mustInclude: ['credulity'],
      accept: ['Swinburne'],
      cue: 'State the principle of credulity in one sentence.'
    },
    {
      id: 'testimony',
      label: 'Swinburne’s Principle of Testimony',
      weight: 1.0,
      mustInclude: ['testimony'],
      accept: ['Swinburne'],
      cue: 'Explain testimony and its role in evaluating experiences.'
    },
    {
      id: 'verification-falsification',
      label: 'Verification/Falsification Challenges',
      weight: 0.9,
      mustInclude: ['verification'],
      accept: ['falsification', 'Ayer', 'Flew', 'Hare', 'Mitchell'],
      cue: 'Give one verification/falsification issue for religious experience.'
    }
  ]
  ,
  psychology: [
    {
      id: 'freud',
      label: 'Freud: Wish-Fulfilment/Illusion',
      weight: 0.9,
      mustInclude: ['Freud'],
      accept: ['illusion', 'wish-fulfilment'],
      cue: 'Summarise Freud’s psychological account of RE.'
    },
    {
      id: 'temporal-lobe',
      label: 'Neurology: Temporal Lobe/Correlates',
      weight: 0.9,
      mustInclude: ['temporal lobe'],
      accept: ['neurology', 'correlates'],
      cue: 'Give a brief neurological explanation of RE.'
    },
    {
      id: 'suggestibility',
      label: 'Suggestibility/Placebo/Social',
      weight: 0.8,
      mustInclude: ['suggestible'],
      accept: ['placebo', 'social'],
      cue: 'How can suggestibility or social factors explain RE reports?'
    }
  ]
  ,
  // Religious Language
  via: [
    {
      id: 'via-negativa',
      label: 'Via Negativa (Apophatic)',
      weight: 1.1,
      mustInclude: ['via negativa'],
      accept: ['apophatic'],
      cue: 'Explain via negativa and why it’s used for God-talk.'
    },
    {
      id: 'analogy',
      label: 'Analogy (Aquinas: attribution/proportionality)',
      weight: 1.0,
      mustInclude: ['analogy'],
      accept: ['attribution', 'proportionality', 'Aquinas'],
      cue: 'Outline analogy of attribution/proportionality.'
    },
    {
      id: 'univocal-equivocal',
      label: 'Univocal vs Equivocal vs Analogical',
      weight: 1.0,
      mustInclude: ['univocal', 'equivocal'],
      accept: ['analogical'],
      cue: 'Define univocal/equivocal and how analogy differs.'
    }
  ]
  ,
  'religious-language:logical': [
    {
      id: 'ayer-vp',
      label: 'Ayer: Verification Principle',
      weight: 1.0,
      mustInclude: ['Ayer', 'verification'],
      accept: ['strong', 'weak'],
      cue: 'State Ayer’s verification principle (strong/weak).'
    },
    {
      id: 'flew-falsification',
      label: 'Flew: Falsification (Gardener parable)',
      weight: 1.0,
      mustInclude: ['Flew', 'falsification'],
      accept: ['parable of the gardener'],
      cue: 'Summarise Flew’s falsification challenge.'
    },
    {
      id: 'hare-bliks',
      label: 'Hare: Bliks',
      weight: 0.9,
      mustInclude: ['Hare', 'blik'],
      accept: ['non-cognitive'],
      cue: 'What is a blik and how does it answer Flew?'
    },
    {
      id: 'mitchell-qa',
      label: 'Mitchell: Qualified Assertion',
      weight: 0.9,
      mustInclude: ['Mitchell'],
      accept: ['partisan', 'faithful'],
      cue: 'Explain Mitchell’s response to falsification.'
    }
  ]
  ,
  'language-games': [
    {
      id: 'meaning-use',
      label: 'Meaning as Use',
      weight: 1.0,
      mustInclude: ['meaning as use'],
      accept: ['use', 'practice'],
      cue: 'Explain "meaning as use" in Wittgenstein.'
    },
    {
      id: 'forms-of-life',
      label: 'Forms of Life/Rules/Practice',
      weight: 1.0,
      mustInclude: ['forms of life'],
      accept: ['rules', 'practice'],
      cue: 'What are “forms of life” and why do they matter?'
    },
    {
      id: 'fideism-risk',
      label: 'Risk of Fideism/Insularity',
      weight: 0.8,
      mustInclude: ['fideism'],
      accept: ['insular', 'closed'],
      cue: 'What is a fideism worry about language games?'
    }
  ]
  ,
  symbol: [
    {
      id: 'tillich-symbol',
      label: 'Tillich: Symbols Participate',
      weight: 1.0,
      mustInclude: ['Tillich', 'symbol'],
      accept: ['participate', 'ultimate concern'],
      cue: 'Summarise Tillich’s view of symbols.'
    },
    {
      id: 'myth',
      label: 'Myth/Story as Meaning-Making',
      weight: 0.9,
      mustInclude: ['myth'],
      accept: ['story', 'narrative'],
      cue: 'How can myth function in religious language?'
    },
    {
      id: 'demythologize',
      label: 'Demythologising/Interpretation',
      weight: 0.9,
      mustInclude: ['demytholog'],
      accept: ['Bultmann'],
      cue: 'What does “demythologising” aim to do?'
    }
  ]
  ,
  // Problem of Evil
  'problem-of-evil:logical': [
    {
      id: 'inconsistent-triad',
      label: 'Inconsistent Triad (omni vs evil)',
      weight: 1.1,
      mustInclude: ['inconsistent triad'],
      accept: ['omnipotent', 'omnibenevolent', 'evil'],
      cue: 'State the inconsistent triad in one sentence.'
    },
    {
      id: 'mackie',
      label: 'Mackie: Logical Problem',
      weight: 1.0,
      mustInclude: ['Mackie'],
      accept: ['logical'],
      cue: 'Summarise Mackie’s logical problem of evil.'
    }
  ]
  ,
  evidential: [
    {
      id: 'rowe-fawn',
      label: 'Rowe: Evidential (fawn case)',
      weight: 1.0,
      mustInclude: ['Rowe'],
      accept: ['fawn', 'gratuitous evil'],
      cue: 'Explain Rowe’s evidential argument (fawn).'
    },
    {
      id: 'gratuitous-evil',
      label: 'Gratuitous Evil/Probability',
      weight: 0.9,
      mustInclude: ['gratuitous'],
      accept: ['probability'],
      cue: 'What is “gratuitous evil” and why does it matter?'
    }
  ]
  ,
  theodicies: [
    {
      id: 'augustinian',
      label: 'Augustinian (privation/fall/free will)',
      weight: 1.0,
      mustInclude: ['privation'],
      accept: ['Augustine', 'fall'],
      cue: 'Outline the Augustinian theodicy (privation & fall).'
    },
    {
      id: 'irenaean',
      label: 'Irenaean/Soul-Making (Hick)',
      weight: 1.0,
      mustInclude: ['soul-making'],
      accept: ['Irenaeus', 'Hick'],
      cue: 'Summarise soul-making and its aim.'
    }
  ]
  ,
  'free-will': [
    {
      id: 'plantinga-fwd',
      label: 'Plantinga: Free Will Defence',
      weight: 1.0,
      mustInclude: ['Plantinga', 'free will defence'],
      accept: ['FWD', 'free-will defense'],
      cue: 'State Plantinga’s core free will defence.'
    },
    {
      id: 'twd',
      label: 'Transworld Depravity',
      weight: 0.9,
      mustInclude: ['transworld depravity'],
      accept: ['possible worlds'],
      cue: 'What is transworld depravity?'
    }
  ]
  ,
  // ===== Ethics =====
  // Natural Law
  'natural-law:aquinas': [
    { id: 'primary-precepts', label: 'Primary Precepts', weight: 1.2, mustInclude: ['primary precepts'], accept: ['preserve life','reproduce','educate','society','worship'], cue: 'List the primary precepts of Natural Law.' },
    { id: 'secondary-precepts', label: 'Secondary Precepts', weight: 1.0, mustInclude: ['secondary precepts'], accept: ['derived rules'], cue: 'What are secondary precepts and how are they derived?' },
    { id: 'synderesis', label: 'Synderesis/Reason', weight: 1.0, mustInclude: ['synderesis'], accept: ['right reason','ratio'], cue: 'Define synderesis and its role in NL.' }
  ],
  'natural-law:reason': [
    { id: 'reason-telos', label: 'Reason, Telos and Nature', weight: 1.1, mustInclude: ['reason','telos'], accept: ['natural','final cause'], cue: 'Explain reason and telos in Natural Law.' },
    { id: 'eternal-natural-divine-human', label: 'Four Tiers of Law', weight: 1.0, mustInclude: ['eternal','natural','divine','human'], accept: ['four laws'], cue: 'Name Aquinas’ four tiers of law.' }
  ],
  'natural-law:double-effect': [
    { id: 'double-effect', label: 'Doctrine of Double Effect', weight: 1.2, mustInclude: ['double effect'], accept: ['intention','foresight'], cue: 'State the doctrine of double effect.' },
    { id: 'intention-foresight', label: 'Intention vs Foresight', weight: 1.0, mustInclude: ['intention','foresight'], accept: [], cue: 'Differentiate intention from foresight in DDE.' }
  ],
  'natural-law:applications': [
    { id: 'applications-core', label: 'Applications to Cases', weight: 0.9, mustInclude: ['apply','application'], accept: ['case','example'], cue: 'Apply Natural Law briefly to a case.' }
  ],

  // Situation Ethics
  'situation-ethics:agape': [
    { id: 'agape', label: 'Agape as the Only Absolute', weight: 1.2, mustInclude: ['agape'], accept: ['love','selfless'], cue: 'Define agape in Situation Ethics.' }
  ],
  'situation-ethics:principles': [
    { id: 'four-principles', label: 'Four Working Principles', weight: 1.1, mustInclude: ['pragmatism','relativism','positivism','personalism'], accept: [], cue: 'List the four working principles.' }
  ],
  'situation-ethics:strengths': [
    { id: 'se-strengths', label: 'Strengths (flexibility, person-centred)', weight: 0.9, mustInclude: ['flexible','person'], accept: ['contextual','compassion'], cue: 'Name one strength of SE and why.' }
  ],
  'situation-ethics:examples': [
    { id: 'se-application', label: 'Application to Cases', weight: 0.9, mustInclude: ['apply','application'], accept: ['case','example'], cue: 'Apply SE briefly to a case.' }
  ],

  // Kantian Ethics
  'kantian-ethics:good-will': [
    { id: 'good-will-duty', label: 'Good Will and Duty', weight: 1.2, mustInclude: ['good will','duty'], accept: ['motive','intention'], cue: 'Explain good will and duty in Kant.' }
  ],
  'kantian-ethics:categorical': [
    { id: 'categorical-imperative', label: 'Categorical Imperative: Universal Law', weight: 1.1, mustInclude: ['categorical imperative','universal law'], accept: ['maxim'], cue: 'State the universal law test.' },
    { id: 'humanity-end', label: 'Humanity as an End', weight: 1.0, mustInclude: ['humanity as an end'], accept: ['treat as ends','never merely as means'], cue: 'Explain humanity as an end.' }
  ],
  'kantian-ethics:autonomy': [
    { id: 'autonomy-rational', label: 'Autonomy and Rational Will', weight: 1.0, mustInclude: ['autonomy','rational'], accept: ['self-legislation'], cue: 'What is autonomy in Kantian ethics?' }
  ],
  'kantian-ethics:challenges': [
    { id: 'conflicts-rigidity', label: 'Challenges: Conflicts/Rigidity/Consequences', weight: 0.8, mustInclude: ['conflict','rigid'], accept: ['consequences'], cue: 'Give one Kant challenge (e.g., conflicts of duty).' }
  ],

  // Utilitarianism
  'utilitarianism:bentham-hedonic': [
    { id: 'hedonic-calculus', label: 'Bentham: Hedonic Calculus', weight: 1.2, mustInclude: ['hedonic calculus'], accept: ['intensity','duration','certainty'], cue: 'Name the hedonic calculus and one dimension.' },
    { id: 'act-util', label: 'Act Utilitarianism', weight: 1.0, mustInclude: ['act utilitarian'], accept: ['act-based'], cue: 'Define act utilitarianism.' }
  ],
  'utilitarianism:mill-rule-util': [
    { id: 'higher-lower', label: 'Mill: Higher vs Lower Pleasures', weight: 1.1, mustInclude: ['higher','lower','pleasures'], accept: ['quality'], cue: 'Distinguish higher vs lower pleasures.' },
    { id: 'rule-util', label: 'Rule Utilitarianism', weight: 1.0, mustInclude: ['rule utilitarian'], accept: ['rules'], cue: 'Define rule utilitarianism.' }
  ],
  'utilitarianism:util-objections': [
    { id: 'justice-minority', label: 'Objection: Justice/Minority Rights', weight: 0.9, mustInclude: ['justice','minority'], accept: ['rights'], cue: 'State a justice/minority objection.' },
    { id: 'demandingness', label: 'Objection: Demandingness', weight: 0.9, mustInclude: ['demanding'], accept: [], cue: 'What is the demandingness objection?' }
  ],
  'utilitarianism:util-application': [
    { id: 'util-apply', label: 'Applying Utilitarianism', weight: 0.9, mustInclude: ['apply','application'], accept: ['case','example','cost-benefit'], cue: 'Apply utilitarianism briefly to a case.' }
  ],

  // Euthanasia
  'euthanasia:types': [
    { id: 'types', label: 'Types: Voluntary/Involuntary, Active/Passive', weight: 1.1, mustInclude: ['voluntary','involuntary','active','passive'], accept: [], cue: 'Name two distinctions in euthanasia types.' }
  ],
  'euthanasia:natural': [
    { id: 'nl-euth', label: 'Natural Law on Euthanasia', weight: 1.0, mustInclude: ['natural law'], accept: ['double effect','preserve life'], cue: 'Summarise NL position on euthanasia.' }
  ],
  'euthanasia:situation': [
    { id: 'se-euth', label: 'Situation Ethics on Euthanasia', weight: 1.0, mustInclude: ['agape'], accept: ['relativism','pragmatism'], cue: 'Summarise SE position on euthanasia.' }
  ],
  'euthanasia:law': [
    { id: 'legal', label: 'Legal Context (brief)', weight: 0.8, mustInclude: ['law'], accept: ['assisted','dying'], cue: 'State one legal point about euthanasia (jurisdiction optional).' }
  ],

  // Business Ethics
  'business-ethics:csr': [
    { id: 'csr', label: 'Corporate Social Responsibility', weight: 1.0, mustInclude: ['csr','corporate social responsibility'], accept: ['stakeholder'], cue: 'Define CSR in one line.' }
  ],
  'business-ethics:kant': [
    { id: 'kant-business', label: 'Kantian Business Ethics', weight: 1.0, mustInclude: ['duty','ends'], accept: ['respect'], cue: 'How does Kant guide business practice?' }
  ],
  'business-ethics:utilitarian': [
    { id: 'util-business', label: 'Utilitarian Business Ethics', weight: 1.0, mustInclude: ['greatest good'], accept: ['cost-benefit'], cue: 'State a utilitarian approach to business.' }
  ],
  'business-ethics:case': [
    { id: 'case-be', label: 'Case/Whistleblowing/Globalisation', weight: 0.9, mustInclude: ['case'], accept: ['whistleblow','sweatshop'], cue: 'Give one business ethics case example.' }
  ],

  // Sexual Ethics
  'sexual-ethics:marriage': [
    { id: 'marriage', label: 'Marriage (views and purposes)', weight: 1.0, mustInclude: ['marriage'], accept: ['sacrament','union'], cue: 'Define marriage and its purposes (brief).' }
  ],
  'sexual-ethics:contraception': [
    { id: 'contraception', label: 'Contraception Debates', weight: 1.0, mustInclude: ['contraception'], accept: ['Humanae Vitae'], cue: 'State one contraception issue in ethics.' }
  ],
  'sexual-ethics:lgbt': [
    { id: 'lgbt', label: 'LGBT and Christian Ethics', weight: 0.9, mustInclude: ['lgbt','homosexual'], accept: ['same-sex'], cue: 'Name one key issue in LGBT discussions.' }
  ],
  'sexual-ethics:gender': [
    { id: 'gender-roles', label: 'Gender Roles/Feminist Critiques', weight: 0.9, mustInclude: ['gender'], accept: ['feminist'], cue: 'State a gender/feminist critique (brief).' }
  ]
  ,
  // ===== Christianity =====
  // Augustine
  'augustine:original': [
    { id: 'original-sin', label: 'Original Sin & Human Nature', weight: 1.2, mustInclude: ['original sin'], accept: ['fallen','concupiscence'], cue: 'Define original sin in Augustine.' }
  ],
  'augustine:grace': [
    { id: 'grace', label: 'Grace & Salvation (Gift)', weight: 1.1, mustInclude: ['grace'], accept: ['gift','unmerited'], cue: 'Explain grace as God’s gift in salvation.' }
  ],
  'augustine:freedom': [
    { id: 'will-freedom', label: 'Human Freedom & Will', weight: 1.0, mustInclude: ['free will'], accept: ['will','freedom'], cue: 'Summarise freedom of the will in Augustine.' }
  ],
  'augustine:critics': [
    { id: 'critics-aug', label: 'Criticisms of Augustine', weight: 0.9, mustInclude: ['critic'], accept: ['Pelagius'], cue: 'Name a criticism (e.g., Pelagius) of Augustine’s view.' }
  ],

  // Death & Afterlife
  'death-afterlife:judgment': [
    { id: 'judgment', label: 'Judgment & Heaven', weight: 1.1, mustInclude: ['judgment','heaven'], accept: ['judgement'], cue: 'State Christian belief about judgment and heaven.' }
  ],
  'death-afterlife:resurrection': [
    { id: 'resurrection', label: 'Resurrection vs Reincarnation', weight: 1.1, mustInclude: ['resurrection'], accept: ['body','soul'], cue: 'Explain resurrection and how it differs from reincarnation.' }
  ],
  'death-afterlife:hell': [
    { id: 'hell', label: 'Hell/Purgatory/Universalism', weight: 1.0, mustInclude: ['hell'], accept: ['purgatory','universalism'], cue: 'Briefly define one: hell, purgatory, or universalism.' }
  ],
  'death-afterlife:eschatology': [
    { id: 'eschatology', label: 'Eschatological Beliefs', weight: 1.0, mustInclude: ['eschatology'], accept: ['end times','parousia'], cue: 'What are eschatological beliefs?' }
  ],

  // Knowledge of God
  'knowledge-god:revelation': [
    { id: 'natural-revealed', label: 'Natural vs Revealed Theology', weight: 1.1, mustInclude: ['natural','revealed'], accept: ['revelation'], cue: 'Contrast natural with revealed theology.' }
  ],
  'knowledge-god:aquinas': [
    { id: 'five-ways', label: 'Aquinas (as knowledge of God)', weight: 1.0, mustInclude: ['Aquinas'], accept: ['five ways'], cue: 'Name one way Aquinas argues we know God.' }
  ],
  'knowledge-god:barth': [
    { id: 'barth', label: 'Barth & Calvin on Revelation', weight: 1.0, mustInclude: ['Barth'], accept: ['Calvin','revelation'], cue: 'Summarise Barth’s stance on revelation.' }
  ],
  'knowledge-god:criticism': [
    { id: 'kg-crit', label: 'Critiques of Knowledge Claims', weight: 0.9, mustInclude: ['critique'], accept: ['skeptic','empirical'], cue: 'State one critique of knowing God’s existence.' }
  ],

  // Jesus Christ
  'jesus-christ:divine': [
    { id: 'two-natures', label: 'Jesus as Divine & Human', weight: 1.2, mustInclude: ['divine','human'], accept: ['incarnation'], cue: 'Explain two-natures doctrine briefly.' }
  ],
  'jesus-christ:miracles': [
    { id: 'miracles', label: 'Miracles & Authority', weight: 1.0, mustInclude: ['miracle'], accept: ['authority'], cue: 'What do miracles signify about Jesus?' }
  ],
  'jesus-christ:resurrection': [
    { id: 'jc-res', label: 'Resurrection & Salvation', weight: 1.1, mustInclude: ['resurrection'], accept: ['salvation','atonement'], cue: 'Connect resurrection to salvation.' }
  ],
  'jesus-christ:liberation': [
    { id: 'liberation', label: 'Liberation Theology & Ethics', weight: 0.9, mustInclude: ['liberation'], accept: ['justice','poor'], cue: 'What is liberation theology’s emphasis?' }
  ],

  // Practices & Identity
  'practices-identity:worship': [
    { id: 'worship', label: 'Worship & Liturgy', weight: 1.0, mustInclude: ['worship'], accept: ['liturgy'], cue: 'Define worship/liturgy briefly.' }
  ],
  'practices-identity:sacraments': [
    { id: 'sacraments', label: 'Sacraments', weight: 1.0, mustInclude: ['sacrament'], accept: ['baptism','eucharist'], cue: 'Name two sacraments and significance.' }
  ],
  'practices-identity:community': [
    { id: 'community', label: 'Community & Fellowship', weight: 0.9, mustInclude: ['community'], accept: ['fellowship'], cue: 'Why is community important in Christian practice?' }
  ],

  // Pluralism
  'pluralism:exclusivism': [
    { id: 'exclusivism', label: 'Exclusivism', weight: 1.0, mustInclude: ['exclusivism'], accept: ['only','christ alone'], cue: 'Define exclusivism (brief).' }
  ],
  'pluralism:inclusivism': [
    { id: 'inclusivism', label: 'Inclusivism', weight: 1.0, mustInclude: ['inclusivism'], accept: ['anonymous christian'], cue: 'Define inclusivism (brief).' }
  ],
  'pluralism:pluralism': [
    { id: 'religious-pluralism', label: 'Pluralism', weight: 1.0, mustInclude: ['pluralism'], accept: ['many paths'], cue: 'Define religious pluralism (brief).' }
  ],
  'pluralism:truth': [
    { id: 'truth-salvation', label: 'Truth/Salvation Outside Christianity?', weight: 0.9, mustInclude: ['truth','salvation'], accept: ['outside'], cue: 'State a view on salvation outside Christianity.' }
  ],

  // Gender and Theology
  'gender:roles': [
    { id: 'biblical-roles', label: 'Biblical Gender Roles', weight: 1.0, mustInclude: ['role'], accept: ['headship','submission'], cue: 'State one claim about biblical gender roles.' }
  ],
  'gender:liberation': [
    { id: 'feminist-theology', label: 'Feminist Theology', weight: 1.0, mustInclude: ['feminist'], accept: ['liberation'], cue: 'State one feminist theological theme.' }
  ],
  'gender:ordination': [
    { id: 'ordination', label: 'Women in Church Leadership', weight: 0.9, mustInclude: ['ordination'], accept: ['priest','bishop'], cue: 'Briefly note views on women’s ordination.' }
  ],
  'gender:intersectionality': [
    { id: 'intersectionality', label: 'Intersectionality', weight: 0.9, mustInclude: ['intersectionality'], accept: ['race','class'], cue: 'Define intersectionality (brief).' }
  ],

  // Secularism
  'secularism:decline': [
    { id: 'secularisation', label: 'Secularisation Thesis', weight: 1.0, mustInclude: ['secularisation','secularization'], accept: ['decline'], cue: 'State the secularisation thesis.' }
  ],
  'secularism:response': [
    { id: 'church-response', label: 'Christian Responses to Secularism', weight: 1.0, mustInclude: ['response'], accept: ['engagement','evangelism'], cue: 'Give one Christian response to secular culture.' }
  ],
  'secularism:faith-schools': [
    { id: 'faith-schools', label: 'Faith in Public Education', weight: 0.9, mustInclude: ['faith school'], accept: ['education'], cue: 'What is a faith school debate point?' }
  ],
  'secularism:richard-dawkins': [
    { id: 'new-atheism', label: 'Critiques from New Atheism', weight: 0.9, mustInclude: ['Dawkins'], accept: ['new atheism'], cue: 'State one Dawkins critique.' }
  ]
};

// Optional: export a KU typedef for editor intellisense (JS only)
// export type KU = { id: string, label: string, weight: number, mustInclude: string[], accept?: string[], cue?: string };


