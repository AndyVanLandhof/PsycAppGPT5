// Concept map for Ancient Philosophical Influences (sub-topic)
const nodes = [
  // Main node - Light Yellow
  {
    id: 'ancient-philosophy',
    data: {
      label: 'Ancient Philosophical Influences',
      description: '• Foundational thought of Plato and Aristotle that shaped theology.\n• Their ideas continue to influence religious philosophy today.\n• Both sought to understand the nature of reality and knowledge.\n• Their work provides frameworks for understanding God and existence.'
    },
    position: { x: 0, y: 0 },
    style: { backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '16px' }
  },
  // Plato's Theory of Forms - Light Green (Writers/Rationale)
  {
    id: 'plato-forms',
    data: {
      label: 'Plato\'s Theory of Forms',
      description: '• Perfect, unchanging Forms exist in a higher realm.\n• Material world contains imperfect copies of these Forms.\n• The Form of the Good is the highest Form.\n• Knowledge comes from remembering the Forms (anamnesis).\n• Found in "Republic" and "Phaedo" (c. 380-360 BCE).',
      scholars: [
        { name: 'Plato', idea: 'Theory of Forms' },
        { name: 'Socrates', idea: 'Mentor and influence' }
      ]
    },
    position: { x: -450, y: -150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'analogy-cave',
    data: {
      label: 'Analogy of the Cave',
      description: '• Prisoners see only shadows of reality on cave wall.\n• One prisoner escapes and sees the real world.\n• Represents journey from ignorance to knowledge.\n• The sun represents the Form of the Good.\n• Found in "Republic" Book VII.',
      scholars: [
        { name: 'Plato', idea: 'Analogy of the Cave' }
      ]
    },
    position: { x: -450, y: 0 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'form-of-good',
    data: {
      label: 'Form of the Good',
      description: '• Highest and most important Form.\n• Source of all other Forms and knowledge.\n• Like the sun, it illuminates everything else.\n• Ultimate object of philosophical inquiry.\n• Represents perfect goodness and truth.',
      scholars: [
        { name: 'Plato', idea: 'Form of the Good' }
      ]
    },
    position: { x: -450, y: 150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Aristotle's Four Causes - Light Green (Writers/Rationale)
  {
    id: 'aristotle-causes',
    data: {
      label: 'Aristotle\'s Four Causes',
      description: '• Material cause: what something is made of.\n• Formal cause: the form or pattern of something.\n• Efficient cause: what brings something into being.\n• Final cause: the purpose or goal of something.\n• Found in "Physics" and "Metaphysics" (c. 350 BCE).',
      scholars: [
        { name: 'Aristotle', idea: 'Four Causes' }
      ]
    },
    position: { x: 450, y: -150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'prime-mover',
    data: {
      label: 'Prime Mover',
      description: '• Unmoved mover that causes all motion.\n• Pure actuality with no potentiality.\n• Final cause of the universe.\n• God as the ultimate explanation.\n• Found in "Metaphysics" Book XII.',
      scholars: [
        { name: 'Aristotle', idea: 'Prime Mover' }
      ]
    },
    position: { x: 450, y: 0 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'actuality-potentiality',
    data: {
      label: 'Actuality vs. Potentiality',
      description: '• Everything has both actual and potential states.\n• Change is movement from potential to actual.\n• Prime Mover is pure actuality.\n• Explains how things can change.\n• Key to understanding causation.',
      scholars: [
        { name: 'Aristotle', idea: 'Actuality vs. Potentiality' }
      ]
    },
    position: { x: 450, y: 150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Critiques - Light Red
  {
    id: 'aristotle-critique-forms',
    data: {
      label: 'Aristotle\'s Critique of Forms',
      description: '• Forms don\'t explain change in material world.\n• Third Man Argument: infinite regress problem.\n• Forms are unnecessary for explanation.\n• Material world is real, not just copies.\n• Found in "Metaphysics" Book I.'
    },
    position: { x: 0, y: 250 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'empiricism-critique',
    data: {
      label: 'Empiricist Critique',
      description: '• No evidence for Forms beyond reason.\n• Knowledge comes from experience, not recollection.\n• Forms are metaphysical speculation.\n• Occam\'s Razor: unnecessary entities.\n• Modern science doesn\'t need Forms.'
    },
    position: { x: 250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'teleology-critique',
    data: {
      label: 'Critique of Teleology',
      description: '• Purpose in nature is not obvious.\n• Darwinian evolution explains apparent design.\n• Final causes are human projections.\n• Nature operates by efficient causes only.\n• Modern science rejects final causes.'
    },
    position: { x: -250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  // Key Concepts - Light Green (Writers/Rationale)
  {
    id: 'dualism',
    data: {
      label: 'Dualism',
      description: '• Plato: Two worlds (Forms and material).\n• Aristotle: Form and matter in one world.\n• Different approaches to reality.\n• Influences later religious thought.\n• Mind-body dualism implications.'
    },
    position: { x: -400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'causation',
    data: {
      label: 'Causation',
      description: '• Different types of explanation.\n• Aristotle\'s four causes comprehensive.\n• Modern science uses efficient causes.\n• Teleology in religious thought.\n• Purpose and meaning in universe.'
    },
    position: { x: 400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Links to other topics - Light Green (Writers/Rationale)
  {
    id: 'arguments-existence-link',
    data: {
      label: 'Arguments for Existence of God',
      description: '• Aristotle\'s Prime Mover influences cosmological argument.\n• Plato\'s Forms influence ontological argument.\n• Both provide frameworks for understanding God.\n• Ancient philosophy foundation for later arguments.'
    },
    position: { x: -200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'religious-experience-link',
    data: {
      label: 'Religious Experience',
      description: '• Plato\'s cave analogy relates to mystical experience.\n• Journey from ignorance to enlightenment.\n• Forms as objects of religious knowledge.\n• Ancient philosophy and spiritual insight.'
    },
    position: { x: 200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  }
];

const edges = [
  // Main branches - direct connections to key theories
  { id: 'e1', source: 'ancient-philosophy', target: 'plato-forms', label: 'Plato' },
  { id: 'e2', source: 'ancient-philosophy', target: 'aristotle-causes', label: 'Aristotle' },
  { id: 'e3', source: 'ancient-philosophy', target: 'analogy-cave', label: 'Plato' },
  { id: 'e4', source: 'ancient-philosophy', target: 'prime-mover', label: 'Aristotle' },
  // Sub-connections
  { id: 'e5', source: 'plato-forms', target: 'form-of-good', label: 'Highest Form' },
  { id: 'e6', source: 'analogy-cave', target: 'form-of-good', label: 'Represents' },
  { id: 'e7', source: 'aristotle-causes', target: 'actuality-potentiality', label: 'Key Concept' },
  { id: 'e8', source: 'prime-mover', target: 'actuality-potentiality', label: 'Pure Actuality' },
  // Critiques
  { id: 'e9', source: 'ancient-philosophy', target: 'aristotle-critique-forms', label: 'Critique' },
  { id: 'e10', source: 'ancient-philosophy', target: 'empiricism-critique', label: 'Critique' },
  { id: 'e11', source: 'ancient-philosophy', target: 'teleology-critique', label: 'Critique' },
  // Key concepts
  { id: 'e12', source: 'ancient-philosophy', target: 'dualism', label: 'Key Concept' },
  { id: 'e13', source: 'ancient-philosophy', target: 'causation', label: 'Key Concept' }
  // Removed edges to contrast boxes - they are now positioned above without connections
];

export { nodes, edges }; 