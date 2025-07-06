// Concept map for Teleological Argument (sub-topic)
const nodes = [
  // Main node - Light Yellow
  {
    id: 'teleological',
    data: {
      label: 'Teleological Argument',
      description: '• The universe shows evidence of design, which points to a Designer (God).\n• Based on the apparent order, purpose, and complexity in nature.\n• A posteriori argument - starts from observation of the world.\n• Key question: "Does the universe show evidence of intelligent design?"'
    },
    position: { x: 0, y: 0 },
    style: { backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '16px' }
  },
  // Aquinas' Fifth Way - Light Green (Writers/Rationale)
  {
    id: 'aquinas-fifth-way',
    data: { 
      label: 'Aquinas\' Fifth Way', 
      description: '• Natural bodies act for an end (purpose) without knowledge.\n• They must be directed by an intelligent being (God).\n• Found in Summa Theologica (1265-1274).\n• Builds on Aristotle\'s concept of final cause.' 
    },
    position: { x: -450, y: -150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Paley's Watch - Light Green (Writers/Rationale)
  {
    id: 'paleys-watch',
    data: { 
      label: 'Paley\'s Watch Analogy', 
      description: '• If you found a watch, you\'d infer a watchmaker.\n• The universe is more complex than a watch.\n• Therefore, the universe has a Designer (God).\n• Found in "Natural Theology" (1802).' 
    },
    position: { x: -450, y: 0 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Fine-Tuning - Light Green (Writers/Rationale)
  {
    id: 'fine-tuning',
    data: { 
      label: 'Fine-Tuning Argument', 
      description: '• The universe\'s constants are precisely set for life.\n• Probability of this happening by chance is extremely low.\n• Therefore, the universe was designed for life.\n• Modern version of the teleological argument.' 
    },
    position: { x: -450, y: 150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Swinburne - Light Green (Writers/Rationale)
  {
    id: 'swinburne',
    data: {
      label: 'Richard Swinburne',
      description: '• Argues for the probability of God\'s existence.\n• The universe\'s order makes God\'s existence more probable.\n• Found in "The Existence of God" (1979).\n• Uses Bayesian probability theory.',
      scholars: [
        { name: 'Richard Swinburne', idea: 'Probabilistic approach to design' }
      ]
    },
    position: { x: 450, y: -100 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Tennant - Light Green (Writers/Rationale)
  {
    id: 'tennant',
    data: {
      label: 'F.R. Tennant',
      description: '• Developed the aesthetic argument for design.\n• Beauty in nature suggests a Designer with aesthetic sense.\n• Found in "Philosophical Theology" (1928-1930).\n• Argues for the "sixfold" evidence of design.',
      scholars: [
        { name: 'F.R. Tennant', idea: 'Aesthetic teleological argument' }
      ]
    },
    position: { x: 450, y: 100 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Critiques - Light Red
  {
    id: 'hume-critique',
    data: {
      label: 'David Hume',
      description: '• Challenges the analogy in "Dialogues Concerning Natural Religion" (1779).\n• Questions whether we can infer design from order.\n• Suggests the universe might be more like a vegetable than a machine.\n• Argues we have no experience of universe creation.'
    },
    position: { x: 0, y: 250 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'darwin-evolution',
    data: {
      label: 'Darwin\'s Evolution',
      description: '• Natural selection explains apparent design without a designer.\n• Complex structures evolve through random variation and selection.\n• Found in "On the Origin of Species" (1859).\n• Challenges the need for a supernatural designer.'
    },
    position: { x: 250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'multiverse',
    data: {
      label: 'Multiverse Theory',
      description: '• Multiple universes exist with different constants.\n• We observe this universe because it supports life.\n• No need for a designer - just chance and selection.\n• Found in modern cosmology and string theory.'
    },
    position: { x: -250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'dawkins',
    data: {
      label: 'Richard Dawkins',
      description: '• "The Blind Watchmaker" (1986) argues against design.\n• Natural selection is the "blind watchmaker".\n• Complexity can arise from simple processes.\n• No need for a supernatural designer.'
    },
    position: { x: 0, y: 400 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  // Key Concepts - Light Green (Writers/Rationale)
  {
    id: 'analogy-vs-induction',
    data: {
      label: 'Analogy vs. Induction',
      description: '• Paley uses analogy (watch : watchmaker :: universe : God).\n• Hume questions the strength of this analogy.\n• Modern versions use inductive reasoning.\n• Different approaches to inferring design.'
    },
    position: { x: -400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'order-vs-chaos',
    data: {
      label: 'Order vs. Chaos',
      description: '• The universe shows remarkable order and regularity.\n• This order suggests intelligent design.\n• But natural processes can create order.\n• Key debate: natural vs. supernatural explanation.'
    },
    position: { x: 400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Links to other arguments - Light Green (Writers/Rationale)
  {
    id: 'cosmological-link',
    data: {
      label: 'Cosmological Argument',
      description: '• Both are a posteriori arguments from observation.\n• If God designed the universe, God also caused it.\n• Teleological builds on cosmological foundation.\n• Both seek to explain the universe\'s existence and nature.'
    },
    position: { x: -200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'ontological-link',
    data: {
      label: 'Ontological Argument',
      description: '• Contrasts a priori vs. a posteriori reasoning.\n• Anselm\'s "Proslogion" (1078) uses pure reason.\n• Teleological uses observation and experience.\n• Different approaches to proving God\'s existence.'
    },
    position: { x: 200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  }
];

const edges = [
  // Main branches - direct connections to key proponents
  { id: 'e1', source: 'teleological', target: 'paleys-watch', label: 'Paley' },
  { id: 'e2', source: 'teleological', target: 'aquinas-fifth-way', label: 'Aquinas' },
  { id: 'e3', source: 'teleological', target: 'swinburne', label: 'Swinburne' },
  { id: 'e4', source: 'teleological', target: 'fine-tuning', label: 'Modern' },
  { id: 'e5', source: 'teleological', target: 'tennant', label: 'Tennant' },
  // Critiques
  { id: 'e6', source: 'teleological', target: 'hume-critique', label: 'Critique' },
  { id: 'e7', source: 'teleological', target: 'darwin-evolution', label: 'Critique' },
  { id: 'e8', source: 'teleological', target: 'multiverse', label: 'Critique' },
  { id: 'e9', source: 'teleological', target: 'dawkins', label: 'Critique' },
  // Key concepts
  { id: 'e10', source: 'teleological', target: 'analogy-vs-induction', label: 'Key Concept' },
  { id: 'e11', source: 'teleological', target: 'order-vs-chaos', label: 'Key Concept' }
  // Removed edges to contrast boxes - they are now positioned above without connections
];

export { nodes, edges }; 