// Concept map for Problem of Evil (sub-topic)
const nodes = [
  // Main node - Light Yellow
  {
    id: 'problem-of-evil',
    data: {
      label: 'The Problem of Evil',
      description: '• Can a good and powerful God exist alongside evil and suffering?\n• Challenges belief in an omnipotent, omniscient, and omnibenevolent God.\n• Central problem in philosophy of religion.\n• Various responses include theodicies and defenses.'
    },
    position: { x: 0, y: 0 },
    style: { backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '16px' }
  },
  // Logical Problem - Light Red
  {
    id: 'logical-problem',
    data: {
      label: 'Logical Problem of Evil',
      description: '• It is logically inconsistent for evil to exist if God is omnipotent and omnibenevolent.\n• Epicurus\' triad: God cannot be all-powerful, all-good, and allow evil.\n• Mackie\'s inconsistent triad argument.\n• Claims logical contradiction in God\'s nature.',
      scholars: [
        { name: 'Epicurus', idea: 'Epicurean triad' },
        { name: 'J.L. Mackie', idea: 'Inconsistent triad' }
      ]
    },
    position: { x: -450, y: -150 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'evidential-problem',
    data: {
      label: 'Evidential Problem of Evil',
      description: '• The scale and distribution of suffering make God\'s existence unlikely.\n• Rowe\'s argument from gratuitous suffering.\n• Natural vs moral evil distinction.\n• Questions about amount and types of evil.',
      scholars: [
        { name: 'William Rowe', idea: 'Gratuitous suffering' },
        { name: 'Paul Draper', idea: 'Hypothesis of indifference' }
      ]
    },
    position: { x: -450, y: 0 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'natural-moral-evil',
    data: {
      label: 'Natural vs Moral Evil',
      description: '• Natural evil: earthquakes, disease, natural disasters.\n• Moral evil: human actions causing suffering.\n• Different challenges for theism.\n• Natural evil harder to explain than moral evil.\n• Free will defense applies mainly to moral evil.'
    },
    position: { x: -450, y: 150 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  // Theodicies - Light Green (Writers/Rationale)
  {
    id: 'free-will-defense',
    data: {
      label: 'Free Will Defense',
      description: '• Evil is necessary for genuine free will.\n• God cannot create free beings who always choose good.\n• Plantinga\'s modal version of the defense.\n• Free will is a greater good than preventing evil.\n• Found in "God, Freedom, and Evil" (1974).',
      scholars: [
        { name: 'Alvin Plantinga', idea: 'Free Will Defense' },
        { name: 'Augustine', idea: 'Free will theodicy' }
      ]
    },
    position: { x: 450, y: -150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'soul-making',
    data: {
      label: 'Soul-Making Theodicy',
      description: '• Evil is necessary for character development.\n• Suffering builds virtues like courage and compassion.\n• Irenaean theodicy: humans created immature.\n• Hick\'s development of Irenaean ideas.\n• Found in "Evil and the God of Love" (1966).',
      scholars: [
        { name: 'John Hick', idea: 'Soul-making theodicy' },
        { name: 'Irenaeus', idea: 'Original theodicy' }
      ]
    },
    position: { x: 450, y: 0 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'process-theology',
    data: {
      label: 'Process Theology',
      description: '• God is not omnipotent in traditional sense.\n• God works with creation, not controls it completely.\n• Evil results from creaturely freedom and chance.\n• God suffers with creation.\n• Whitehead and Hartshorne\'s influence.',
      scholars: [
        { name: 'Alfred North Whitehead', idea: 'Process and Reality' },
        { name: 'Charles Hartshorne', idea: 'Process theology' }
      ]
    },
    position: { x: 450, y: 150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Key Concepts - Light Green (Writers/Rationale)
  {
    id: 'omnipotence',
    data: {
      label: 'Omnipotence',
      description: '• God\'s power and its limits.\n• Can God create a stone too heavy to lift?\n• Logical vs practical omnipotence.\n• Free will and divine power.\n• Process theology redefinition.'
    },
    position: { x: -400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'greater-good',
    data: {
      label: 'Greater Good Defense',
      description: '• Evil may be necessary for greater goods.\n• Free will, soul-making, character development.\n• Swinburne\'s knowledge defense.\n• Balance of good and evil.\n• Justification of suffering.'
    },
    position: { x: 400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Critiques of Theodicies - Light Red
  {
    id: 'logical-consistency',
    data: {
      label: 'Logical Consistency',
      description: '• Do theodicies really solve the problem?\n• Mackie\'s logical problem remains.\n• Plantinga\'s defense vs theodicy distinction.\n• Whether evil is logically necessary.\n• Philosophical challenges.'
    },
    position: { x: 0, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'moral-objections',
    data: {
      label: 'Moral Objections',
      description: '• Is it morally acceptable to allow evil?\n• Dostoevsky\'s "The Brothers Karamazov".\n• Ivan\'s rejection of harmony.\n• Personal vs abstract suffering.\n• Moral limits of theodicy.'
    },
    position: { x: 250, y: 350 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  // Links to other topics - Light Green (Writers/Rationale)
  {
    id: 'arguments-existence-link',
    data: {
      label: 'Arguments for Existence of God',
      description: '• Problem of evil vs arguments for God.\n• Balancing positive and negative evidence.\n• Cumulative case approach.\n• Different types of evidence.\n• Overall probability of God\'s existence.'
    },
    position: { x: -200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'religious-experience-link',
    data: {
      label: 'Religious Experience',
      description: '• Religious experience vs problem of evil.\n• Personal experience vs abstract arguments.\n• Different types of evidence.\n• Balancing positive and negative.\n• Role of experience in belief.'
    },
    position: { x: 200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  }
];

const edges = [
  // Main branches - direct connections to problems
  { id: 'e1', source: 'problem-of-evil', target: 'logical-problem', label: 'Problem' },
  { id: 'e2', source: 'problem-of-evil', target: 'evidential-problem', label: 'Problem' },
  { id: 'e3', source: 'problem-of-evil', target: 'natural-moral-evil', label: 'Distinction' },
  // Theodicies
  { id: 'e4', source: 'problem-of-evil', target: 'free-will-defense', label: 'Theodicy' },
  { id: 'e5', source: 'problem-of-evil', target: 'soul-making', label: 'Theodicy' },
  { id: 'e6', source: 'problem-of-evil', target: 'process-theology', label: 'Theodicy' },
  // Key concepts
  { id: 'e7', source: 'problem-of-evil', target: 'omnipotence', label: 'Key Concept' },
  { id: 'e8', source: 'problem-of-evil', target: 'greater-good', label: 'Key Concept' },
  // Critiques
  { id: 'e9', source: 'problem-of-evil', target: 'logical-consistency', label: 'Critique' },
  { id: 'e10', source: 'problem-of-evil', target: 'moral-objections', label: 'Critique' }
  // Removed edges to contrast boxes - they are now positioned above without connections
];

export { nodes, edges }; 