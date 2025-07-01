// Master concept map for Philosophy of Religion (OCR H573)
const nodes = [
  {
    id: 'ancient',
    data: {
      label: 'Ancient Philosophical Influences',
      description: 'Covers Pre-Socratics, Socrates, Plato, and Aristotle. Explores the origins of Western philosophy and foundational debates about reality, knowledge, and ethics.',
      examples: [
        'Plato\'s Allegory of the Cave illustrates the difference between appearance and reality.',
        'Aristotle\'s Four Causes explain why things exist or change.'
      ],
      scholars: [
        { name: 'Plato', idea: 'Theory of Forms: non-physical Forms represent true reality.' },
        { name: 'Aristotle', idea: 'Empiricism and the Four Causes: knowledge comes from experience.' }
      ]
    },
    position: { x: 900, y: 0 },
    style: {
      background: '#f8fafc',
      border: '3px solid #3b82f6',
      borderRadius: '12px',
      padding: '20px',
      width: 280,
      height: 120,
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  },
  {
    id: 'arguments',
    data: {
      label: 'Arguments for the Existence of God',
      description: 'Examines the Cosmological, Teleological, and Ontological arguments. Considers classical and modern formulations, as well as key criticisms.',
      examples: [
        'Aquinas\' First Way (Cosmological Argument): everything that moves is moved by something else.',
        'Paley\'s Watchmaker Analogy (Teleological Argument): design implies a designer.'
      ],
      scholars: [
        { name: 'St. Thomas Aquinas', idea: 'Five Ways: rational proofs for God\'s existence.' },
        { name: 'William Paley', idea: 'Teleological argument: analogy of the watch and the watchmaker.' }
      ]
    },
    position: { x: 900, y: 200 },
    style: {
      background: '#f0f9ff',
      border: '3px solid #0ea5e9',
      borderRadius: '12px',
      padding: '20px',
      width: 280,
      height: 120,
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  },
  {
    id: 'soul',
    data: {
      label: 'Soul, Body and Mind',
      description: 'Explores dualism, materialism, and monism. Considers Plato, Aristotle, Descartes, and contemporary views on the mind-body problem.',
      examples: [
        'Descartes\' "I think, therefore I am" (mind-body dualism).',
        'Aristotle\'s view: the soul is the "form" of the body.'
      ],
      scholars: [
        { name: 'René Descartes', idea: 'Substance dualism: mind and body are distinct substances.' },
        { name: 'Gilbert Ryle', idea: 'Critique of dualism: "the ghost in the machine".' }
      ]
    },
    position: { x: 450, y: 400 },
    style: {
      background: '#fef3c7',
      border: '3px solid #f59e0b',
      borderRadius: '12px',
      padding: '20px',
      width: 280,
      height: 120,
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  },
  {
    id: 'religious-experience',
    data: {
      label: 'Religious Experience',
      description: 'Analyzes different types of religious experience and their evidential value. Includes William James, corporate/mystical experiences, and challenges from psychology.',
      examples: [
        'St. Teresa of Avila\'s mystical visions.',
        'Toronto Blessing: example of corporate religious experience.'
      ],
      scholars: [
        { name: 'William James', idea: 'Religious experience is primary and can be a basis for belief.' },
        { name: 'Sigmund Freud', idea: 'Religious experiences are psychological projections.' }
      ]
    },
    position: { x: 1350, y: 400 },
    style: {
      background: '#ecfdf5',
      border: '3px solid #10b981',
      borderRadius: '12px',
      padding: '20px',
      width: 280,
      height: 120,
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  },
  {
    id: 'problem-evil',
    data: {
      label: 'The Problem of Evil',
      description: 'Addresses the logical and evidential problems of evil. Reviews theodicies (Augustinian, Irenaean) and challenges to belief in God.',
      examples: [
        'The Holocaust as an example of the evidential problem of evil.',
        'Augustine\'s theodicy: evil as a privation of good.'
      ],
      scholars: [
        { name: 'John Hick', idea: 'Soul-making theodicy: evil is necessary for moral development.' },
        { name: 'Epicurus', idea: 'Logical problem: the inconsistent triad.' }
      ]
    },
    position: { x: 900, y: 600 },
    style: {
      background: '#fef2f2',
      border: '3px solid #ef4444',
      borderRadius: '12px',
      padding: '20px',
      width: 280,
      height: 120,
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  },
  {
    id: 'religious-language',
    data: {
      label: 'Religious Language',
      description: 'Debates about the meaningfulness of religious statements. Covers verification, falsification, analogy, symbol, and language games.',
      examples: [
        'A.J. Ayer\'s Verification Principle: statements must be empirically verifiable.',
        'Wittgenstein\'s language games: meaning is use in context.'
      ],
      scholars: [
        { name: 'A.J. Ayer', idea: 'Logical positivism: religious language is meaningless.' },
        { name: 'Ludwig Wittgenstein', idea: 'Language games: religious language is meaningful within its own context.' }
      ]
    },
    position: { x: 450, y: 800 },
    style: {
      background: '#f3e8ff',
      border: '3px solid #8b5cf6',
      borderRadius: '12px',
      padding: '20px',
      width: 280,
      height: 120,
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  },
  {
    id: 'death-afterlife',
    data: {
      label: 'Death and the Afterlife',
      description: 'Considers different views on life after death, resurrection, reincarnation, and immortality of the soul. Explores philosophical and theological implications.',
      examples: [
        'Christian belief in bodily resurrection.',
        'Hindu concept of reincarnation.'
      ],
      scholars: [
        { name: 'Richard Swinburne', idea: 'Dualism and the possibility of personal survival after death.' },
        { name: 'Plato', idea: 'Immortality of the soul: the soul pre-exists and survives the body.' }
      ]
    },
    position: { x: 1350, y: 800 },
    style: {
      background: '#fff7ed',
      border: '3px solid #ea580c',
      borderRadius: '12px',
      padding: '20px',
      width: 280,
      height: 120,
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  }
];

const edges = [
  {
    id: 'e1',
    source: 'ancient',
    target: 'arguments',
    label: 'influenced',
    style: { stroke: '#3b82f6', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#1e40af' },
    data: {
      rationale: "Ancient philosophers like Plato and Aristotle laid the groundwork for later arguments about God. Their metaphysical ideas shaped the Cosmological and Teleological arguments.",
      examples: [
        "Plato's concept of the Form of the Good influenced later ideas of God's nature.",
        "Aristotle's Prime Mover is a precursor to the Cosmological Argument."
      ],
      scholars: [
        { name: 'Plato', idea: 'Form of the Good as a model for divine perfection.' },
        { name: 'Aristotle', idea: 'Prime Mover as an uncaused cause.' }
      ]
    }
  },
  {
    id: 'e2',
    source: 'ancient',
    target: 'soul',
    label: 'influenced',
    style: { stroke: '#3b82f6', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#1e40af' },
    data: {
      rationale: "Ancient debates about the soul, body, and mind set the stage for later philosophical and theological discussions.",
      examples: [
        "Plato's tripartite soul.",
        "Aristotle's hylomorphism."
      ],
      scholars: [
        { name: 'Plato', idea: 'Tripartite soul: reason, spirit, appetite.' },
        { name: 'Aristotle', idea: 'Soul as the form of the body.' }
      ]
    }
  },
  {
    id: 'e3',
    source: 'ancient',
    target: 'religious-experience',
    label: 'inspired',
    style: { stroke: '#10b981', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#059669' },
    data: {
      rationale: "Ancient philosophical ideas about reality and the divine influenced later understandings of religious experience.",
      examples: [
        "Plato's theory of Forms inspired mystical interpretations of religious experience.",
        "Aristotle's emphasis on empirical observation influenced later approaches to evaluating religious experiences."
      ],
      scholars: [
        { name: 'Plato', idea: 'Mystical ascent to the Form of the Good as a kind of religious experience.' },
        { name: 'Aristotle', idea: 'Empirical approach to understanding phenomena, including religious experiences.' }
      ]
    }
  },
  {
    id: 'e4',
    source: 'arguments',
    target: 'problem-evil',
    label: 'challenged by',
    style: { stroke: '#ef4444', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#dc2626' },
    data: {
      rationale: "Arguments for God are directly challenged by the problem of evil, which questions the compatibility of God's existence with suffering.",
      examples: [
        "The evidential problem: natural disasters and innocent suffering.",
        "Epicurus' inconsistent triad."
      ],
      scholars: [
        { name: 'David Hume', idea: 'Critique of the design argument using the problem of evil.' },
        { name: 'J.L. Mackie', idea: 'Logical problem of evil: God cannot be omnipotent, omnibenevolent, and evil exist.' }
      ]
    }
  },
  {
    id: 'e5',
    source: 'problem-evil',
    target: 'death-afterlife',
    label: 'raises questions for',
    style: { stroke: '#ea580c', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#c2410c' },
    data: {
      rationale: "The problem of evil raises questions about the nature of the afterlife, justice, and the purpose of suffering.",
      examples: [
        "Theodicies that appeal to life after death for ultimate justice.",
        "Debates about hell and universal salvation."
      ],
      scholars: [
        { name: 'John Hick', idea: 'Soul-making and the afterlife as a solution to evil.' },
        { name: 'Augustine', idea: 'Evil as a privation, with afterlife as restoration.' }
      ]
    }
  },
  {
    id: 'e6',
    source: 'religious-language',
    target: 'religious-experience',
    label: 'analyzes',
    style: { stroke: '#0ea5e9', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#0284c7' },
    data: {
      rationale: "Philosophers analyze whether religious experiences can be meaningfully described or verified using language.",
      examples: [
        "Ineffability of mystical experiences.",
        "Use of analogy and symbol in describing God."
      ],
      scholars: [
        { name: 'Paul Tillich', idea: 'Religious language as symbolic.' },
        { name: 'Wittgenstein', idea: 'Meaning is use: language games.' }
      ]
    }
  },
  {
    id: 'e7',
    source: 'death-afterlife',
    target: 'soul',
    label: 'relates to',
    style: { stroke: '#ea580c', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#c2410c' },
    data: {
      rationale: "Beliefs about the afterlife are closely tied to views on the soul, resurrection, and personal identity.",
      examples: [
        "Christian resurrection of the body.",
        "Hindu reincarnation."
      ],
      scholars: [
        { name: 'Plato', idea: 'Immortality of the soul.' },
        { name: 'Richard Swinburne', idea: 'Personal identity and survival after death.' }
      ]
    }
  }
];

export default { nodes, edges }; 