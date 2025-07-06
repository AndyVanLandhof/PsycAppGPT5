// Concept map for Cosmological Argument (sub-topic)
const nodes = [
  // Main node - Light Yellow
  {
    id: 'cosmological',
    data: {
      label: 'Cosmological Argument',
      description: '• The universe requires a cause, which is God.\n• Based on the principle that everything that exists has an explanation.\n• A posteriori argument - starts from observation of the world.\n• Key question: "Why is there something rather than nothing?"'
    },
    position: { x: 0, y: 0 },
    style: { backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '16px' }
  },
  // Aquinas' Three Ways - Light Green (Writers/Rationale)
  {
    id: 'motion',
    data: { 
      label: 'Aquinas\' Way 1: Motion', 
      description: '• Everything in motion is moved by something else.\n• Cannot be an infinite regress of movers.\n• Therefore, a "First Mover" (God) must exist.\n• Based on Aristotle\'s concept of potentiality and actuality.\n• Found in Summa Theologica (1265-1274).' 
    },
    position: { x: -450, y: -150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'causation',
    data: { 
      label: 'Aquinas\' Way 2: Causation', 
      description: '• Every effect has a cause.\n• No infinite regress of causes is possible.\n• Therefore, a "First Cause" (God) must exist.\n• Applies the principle of sufficient reason to causation.\n• Found in Summa Theologica (1265-1274).' 
    },
    position: { x: -450, y: 0 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'contingency',
    data: { 
      label: 'Aquinas\' Way 3: Contingency', 
      description: '• Contingent beings require a necessary being (God).\n• If everything were contingent, nothing would exist.\n• Therefore, a necessary being must exist.\n• Most sophisticated of Aquinas\' three ways.\n• Found in Summa Theologica (1265-1274).' 
    },
    position: { x: -450, y: 150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Kalam - Light Green (Writers/Rationale)
  {
    id: 'kalam',
    data: {
      label: 'Kalam Cosmological Argument',
      description: '• Whatever begins to exist has a cause.\n• The universe began to exist (Big Bang theory supports this).\n• Therefore, the universe has a cause (God).\n• Modern version popularized by William Lane Craig in "The Kalam Cosmological Argument" (1979).',
      scholars: [
        { name: 'Al-Ghazali', idea: 'Originator of Kalam' },
        { name: 'William Lane Craig', idea: 'Modern proponent' }
      ]
    },
    position: { x: 450, y: -100 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Leibniz - Light Green (Writers/Rationale)
  {
    id: 'leibniz',
    data: {
      label: "Leibniz's Sufficient Reason",
      description: '• Everything must have a reason or explanation.\n• The universe requires an explanation outside itself (God).\n• Found in "Monadology" (1714) and "Theodicy" (1710).\n• Based on the Principle of Sufficient Reason.',
      scholars: [
        { name: 'Gottfried Leibniz', idea: 'Principle of Sufficient Reason' }
      ]
    },
    position: { x: 450, y: 100 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Critiques - Light Red
  {
    id: 'hume',
    data: {
      label: 'David Hume',
      description: '• Challenges the concept of causation in "Dialogues Concerning Natural Religion" (1779).\n• Questions whether we can infer a cause for the universe.\n• Argues we have no experience of universe creation.\n• Suggests the universe might be its own explanation.'
    },
    position: { x: 0, y: 250 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'russell',
    data: {
      label: 'Bertrand Russell',
      description: '• Rejects the need for a cause in "Why I Am Not a Christian" (1927).\n• Famous quote: "The universe is just there, and that\'s all."\n• Argues the question "What caused the universe?" is meaningless.\n• Contends that the universe is a "brute fact" requiring no explanation.'
    },
    position: { x: 250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'infinite-regress',
    data: {
      label: 'Infinite Regress',
      description: '• Is an infinite chain of causes possible?\n• Aquinas argues no - there must be a first cause.\n• Modern physics suggests time began with the Big Bang.\n• Some philosophers argue infinite regress is logically possible.'
    },
    position: { x: -250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'quantum',
    data: {
      label: 'Quantum Physics',
      description: '• Some events may not have causes (quantum fluctuations).\n• Challenges the principle that everything has a cause.\n• Suggests the universe could arise from nothing.\n• Found in quantum field theory and vacuum energy concepts.'
    },
    position: { x: 0, y: 400 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  // Key Concepts - Light Green (Writers/Rationale)
  {
    id: 'contingency-vs-necessity',
    data: {
      label: 'Contingency vs. Necessity',
      description: '• Contingent beings: depend on something else for their existence.\n• Necessary being: exists by its own nature, cannot not exist.\n• Aquinas argues the universe is contingent, God is necessary.\n• Leibniz develops this distinction in "Monadology" (1714).'
    },
    position: { x: -400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'temporal-causation',
    data: {
      label: 'Temporal vs. Atemporal Causation',
      description: '• Is the cause of the universe inside or outside time?\n• Aquinas argues God is timeless (atemporal).\n• Kalam argument suggests temporal causation.\n• Modern physics suggests time began with the universe.'
    },
    position: { x: 400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Links to other arguments - Light Green (Writers/Rationale)
  {
    id: 'teleological-link',
    data: {
      label: 'Teleological Argument',
      description: '• Design argument sometimes follows from cosmological.\n• If God caused the universe, God also designed it.\n• Paley\'s "Natural Theology" (1802) builds on this connection.\n• Both are a posteriori arguments from observation.'
    },
    position: { x: -200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'ontological-link',
    data: {
      label: 'Ontological Argument',
      description: '• Contrasts a priori vs. a posteriori reasoning.\n• Anselm\'s "Proslogion" (1078) uses pure reason.\n• Cosmological uses observation and experience.\n• Different approaches to proving God\'s existence.'
    },
    position: { x: 200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  }
];

const edges = [
  // Main branches - direct connections to Aquinas' ways
  { id: 'e1', source: 'cosmological', target: 'motion', label: 'Aquinas' },
  { id: 'e2', source: 'cosmological', target: 'causation', label: 'Aquinas' },
  { id: 'e3', source: 'cosmological', target: 'contingency', label: 'Aquinas' },
  { id: 'e4', source: 'cosmological', target: 'kalam', label: 'Kalam' },
  { id: 'e5', source: 'cosmological', target: 'leibniz', label: 'Leibniz' },
  // Critiques
  { id: 'e6', source: 'cosmological', target: 'hume', label: 'Critique' },
  { id: 'e7', source: 'cosmological', target: 'russell', label: 'Critique' },
  { id: 'e8', source: 'cosmological', target: 'infinite-regress', label: 'Critique' },
  { id: 'e9', source: 'cosmological', target: 'quantum', label: 'Critique' },
  // Key concepts
  { id: 'e10', source: 'cosmological', target: 'contingency-vs-necessity', label: 'Key Concept' },
  { id: 'e11', source: 'cosmological', target: 'temporal-causation', label: 'Key Concept' }
];

export { nodes, edges }; 