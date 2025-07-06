// Concept map for Ontological Argument (sub-topic)
const nodes = [
  // Main node - Light Yellow
  {
    id: 'ontological',
    data: {
      label: 'Ontological Argument',
      description: '• God exists by definition - existence is part of God\'s essence.\n• A priori argument - based on reason alone, not observation.\n• If we can conceive of God, God must exist.\n• Key question: "Can God\'s existence be proven by definition?"'
    },
    position: { x: 0, y: 0 },
    style: { backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '16px' }
  },
  // Anselm's Version - Light Green (Writers/Rationale)
  {
    id: 'anselms-version',
    data: { 
      label: 'Anselm\'s Version', 
      description: '• God is "that than which nothing greater can be conceived".\n• If God exists only in the mind, a greater being could be conceived.\n• Therefore, God must exist in reality.\n• Found in "Proslogion" (1078).' 
    },
    position: { x: -450, y: -150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Descartes' Version - Light Green (Writers/Rationale)
  {
    id: 'descartes-version',
    data: { 
      label: 'Descartes\' Version', 
      description: '• God is a supremely perfect being.\n• Existence is a perfection.\n• Therefore, God must exist.\n• Found in "Meditations on First Philosophy" (1641).' 
    },
    position: { x: -450, y: 0 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Malcolm's Version - Light Green (Writers/Rationale)
  {
    id: 'malcolms-version',
    data: { 
      label: 'Malcolm\'s Version', 
      description: '• God is an unlimited being.\n• If God doesn\'t exist, God cannot come into existence.\n• If God exists, God cannot cease to exist.\n• Therefore, God\'s existence is necessary.\n• Found in "Anselm\'s Ontological Arguments" (1960).' 
    },
    position: { x: -450, y: 150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Plantinga - Light Green (Writers/Rationale)
  {
    id: 'plantinga',
    data: {
      label: 'Alvin Plantinga',
      description: '• Uses modal logic to reformulate the argument.\n• God is "maximally excellent" in every possible world.\n• If God is possible, God exists in every possible world.\n• Found in "The Nature of Necessity" (1974).',
      scholars: [
        { name: 'Alvin Plantinga', idea: 'Modal ontological argument' }
      ]
    },
    position: { x: 450, y: -100 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Gödel - Light Green (Writers/Rationale)
  {
    id: 'godel',
    data: {
      label: 'Kurt Gödel',
      description: '• Used mathematical logic to prove God\'s existence.\n• God is "positive" in every respect.\n• Existence is a positive property.\n• Therefore, God exists.\n• Found in "Ontological Proof" (1970).',
      scholars: [
        { name: 'Kurt Gödel', idea: 'Mathematical ontological proof' }
      ]
    },
    position: { x: 450, y: 100 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Critiques - Light Red
  {
    id: 'gaunilo',
    data: {
      label: 'Gaunilo\'s Island',
      description: '• If Anselm\'s argument works, so does: "Perfect island exists".\n• Shows the argument proves too much.\n• Found in "On Behalf of the Fool" (1078).\n• Anselm replied that islands are contingent, God is necessary.'
    },
    position: { x: 0, y: 250 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'kant',
    data: {
      label: 'Kant\'s Critique',
      description: '• "Existence is not a predicate" - it adds nothing to a concept.\n• You can\'t define something into existence.\n• Found in "Critique of Pure Reason" (1781).\n• Most famous critique of the ontological argument.'
    },
    position: { x: 250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'hume',
    data: {
      label: 'David Hume',
      description: '• No a priori proof can establish matters of fact.\n• Existence is a matter of fact, not of reason.\n• Found in "Dialogues Concerning Natural Religion" (1779).\n• Empiricist critique of rationalist approach.'
    },
    position: { x: -250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'russell-ontological',
    data: {
      label: 'Bertrand Russell',
      description: '• "The argument is invalid because it confuses existence with essence."\n• Existence is not a property of things.\n• Found in "Why I Am Not a Christian" (1927).\n• Logical analysis of the argument\'s structure.'
    },
    position: { x: 0, y: 400 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  // Key Concepts - Light Green (Writers/Rationale)
  {
    id: 'a-priori-vs-a-posteriori',
    data: {
      label: 'A Priori vs. A Posteriori',
      description: '• Ontological argument is a priori (reason alone).\n• Cosmological and teleological are a posteriori (observation).\n• Different approaches to proving God\'s existence.\n• Key distinction in philosophical methodology.'
    },
    position: { x: -400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'existence-as-predicate',
    data: {
      label: 'Existence as Predicate',
      description: '• Can existence be a property of things?\n• Kant argues existence adds nothing to a concept.\n• Central debate in ontological argument.\n• Affects validity of the entire argument.'
    },
    position: { x: 400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Links to other arguments - Light Green (Writers/Rationale)
  {
    id: 'cosmological-link',
    data: {
      label: 'Cosmological Argument',
      description: '• Contrasts a posteriori vs. a priori reasoning.\n• Cosmological uses observation and experience.\n• Ontological uses pure reason and logic.\n• Different approaches to proving God\'s existence.'
    },
    position: { x: -200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'teleological-link',
    data: {
      label: 'Teleological Argument',
      description: '• Contrasts a posteriori vs. a priori reasoning.\n• Teleological uses observation and experience.\n• Ontological uses pure reason and logic.\n• Different approaches to proving God\'s existence.'
    },
    position: { x: 200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  }
];

const edges = [
  // Main branches - direct connections to key proponents
  { id: 'e1', source: 'ontological', target: 'anselms-version', label: 'Anselm' },
  { id: 'e2', source: 'ontological', target: 'descartes-version', label: 'Descartes' },
  { id: 'e3', source: 'ontological', target: 'malcolms-version', label: 'Malcolm' },
  { id: 'e4', source: 'ontological', target: 'plantinga', label: 'Plantinga' },
  { id: 'e5', source: 'ontological', target: 'godel', label: 'Gödel' },
  // Critiques
  { id: 'e6', source: 'ontological', target: 'gaunilo', label: 'Critique' },
  { id: 'e7', source: 'ontological', target: 'kant', label: 'Critique' },
  { id: 'e8', source: 'ontological', target: 'hume', label: 'Critique' },
  { id: 'e9', source: 'ontological', target: 'russell-ontological', label: 'Critique' },
  // Key concepts
  { id: 'e10', source: 'ontological', target: 'a-priori-vs-a-posteriori', label: 'Key Concept' },
  { id: 'e11', source: 'ontological', target: 'existence-as-predicate', label: 'Key Concept' }
];

export { nodes, edges }; 