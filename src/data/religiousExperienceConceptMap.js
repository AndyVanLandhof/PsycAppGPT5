// Concept map for Religious Experience (sub-topic)
const nodes = [
  // Main node - Light Yellow
  {
    id: 'religious-experience',
    data: {
      label: 'Religious Experience',
      description: '• Personal experiences that seem to provide direct contact with the divine.\n• Can include mystical, numinous, and conversion experiences.\n• Raises questions about evidence for God\'s existence.\n• Challenges include psychological and scientific explanations.'
    },
    position: { x: 0, y: 0 },
    style: { backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '16px' }
  },
  // Types of Experience - Light Green (Writers/Rationale)
  {
    id: 'mystical-experience',
    data: {
      label: 'Mystical Experience',
      description: '• Direct union with the divine or ultimate reality.\n• Often described as ineffable and noetic.\n• Examples: St Teresa of Avila, St John of the Cross.\n• Characterized by unity, transcendence, and transformation.\n• Found across religious traditions.',
      scholars: [
        { name: 'St Teresa of Avila', idea: 'Interior Castle' },
        { name: 'St John of the Cross', idea: 'Dark Night of the Soul' },
        { name: 'William James', idea: 'Varieties of Religious Experience' }
      ]
    },
    position: { x: -450, y: -150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'numinous-experience',
    data: {
      label: 'Numinous Experience',
      description: '• Experience of the holy or sacred.\n• Feelings of awe, mystery, and fascination.\n• Otto\'s "mysterium tremendum et fascinans".\n• Sense of being in presence of something greater.\n• Can occur in nature or religious settings.',
      scholars: [
        { name: 'Rudolf Otto', idea: 'The Idea of the Holy' },
        { name: 'Friedrich Schleiermacher', idea: 'Feeling of absolute dependence' }
      ]
    },
    position: { x: -450, y: 0 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'conversion-experience',
    data: {
      label: 'Conversion Experience',
      description: '• Sudden or gradual change in religious belief.\n• Examples: St Paul on road to Damascus.\n• Can involve dramatic life transformation.\n• Often includes sense of divine calling.\n• May be individual or communal.',
      scholars: [
        { name: 'St Paul', idea: 'Damascus Road conversion' },
        { name: 'William James', idea: 'Varieties of Religious Experience' }
      ]
    },
    position: { x: -450, y: 150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Challenges - Light Red
  {
    id: 'freud-critique',
    data: {
      label: 'Freud\'s Critique',
      description: '• Religion as wish-fulfilment and illusion.\n• Religious experience as projection of unconscious desires.\n• Oedipus complex and father figure of God.\n• Religion as neurosis and psychological crutch.\n• Found in "The Future of an Illusion" (1927).'
    },
    position: { x: 450, y: -150 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'drugs-hallucinations',
    data: {
      label: 'Drugs and Hallucinations',
      description: '• Religious experiences can be induced by drugs.\n• Similar brain states in meditation and drug use.\n• Temporal lobe epilepsy and religious visions.\n• Questions about authenticity of experiences.\n• Scientific explanations for mystical states.'
    },
    position: { x: 450, y: 0 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'cultural-influence',
    data: {
      label: 'Cultural Influence',
      description: '• Experiences shaped by cultural background.\n• Christians see Jesus, Hindus see Krishna.\n• Social construction of religious experience.\n• Questions about objective reality.\n• Cultural relativism challenges.'
    },
    position: { x: 450, y: 150 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  // Defenses - Light Green (Writers/Rationale)
  {
    id: 'swinburne-principles',
    data: {
      label: 'Swinburne\'s Principles',
      description: '• Principle of Credulity: trust your experiences.\n• Principle of Testimony: trust others\' reports.\n• Religious experiences are prima facie evidence.\n• Need positive reason to disbelieve.\n• Found in "The Existence of God" (1979).',
      scholars: [
        { name: 'Richard Swinburne', idea: 'Principle of Credulity' }
      ]
    },
    position: { x: 0, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'alston-perception',
    data: {
      label: 'Alston\'s Perceptual Model',
      description: '• Religious experience as perception of God.\n• Similar to sense perception.\n• Justified belief without independent verification.\n• Found in "Perceiving God" (1991).\n• Challenges to this model.',
      scholars: [
        { name: 'William Alston', idea: 'Perceiving God' }
      ]
    },
    position: { x: 250, y: 300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Key Concepts - Light Green (Writers/Rationale)
  {
    id: 'ineffability',
    data: {
      label: 'Ineffability',
      description: '• Religious experiences cannot be fully described.\n• Beyond ordinary language and concepts.\n• Common feature of mystical experiences.\n• Challenges for communication and verification.\n• Similar to other profound experiences.'
    },
    position: { x: -400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'verification',
    data: {
      label: 'Verification',
      description: '• How to verify religious experiences.\n• Private vs public evidence.\n• Role of testimony and community.\n• Scientific investigation possibilities.\n• Philosophical challenges.'
    },
    position: { x: 400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Links to other topics - Light Green (Writers/Rationale)
  {
    id: 'arguments-existence-link',
    data: {
      label: 'Arguments for Existence of God',
      description: '• Religious experience as evidence for God.\n• Personal vs public arguments.\n• Swinburne\'s cumulative case approach.\n• Experience as foundation for belief.\n• Relationship to other arguments.'
    },
    position: { x: -200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'problem-evil-link',
    data: {
      label: 'Problem of Evil',
      description: '• Religious experience vs problem of evil.\n• Personal experience vs abstract arguments.\n• Theodicy and religious experience.\n• Different types of evidence.\n• Balancing positive and negative evidence.'
    },
    position: { x: 200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  }
];

const edges = [
  // Main branches - direct connections to types
  { id: 'e1', source: 'religious-experience', target: 'mystical-experience', label: 'Type' },
  { id: 'e2', source: 'religious-experience', target: 'numinous-experience', label: 'Type' },
  { id: 'e3', source: 'religious-experience', target: 'conversion-experience', label: 'Type' },
  // Challenges
  { id: 'e4', source: 'religious-experience', target: 'freud-critique', label: 'Challenge' },
  { id: 'e5', source: 'religious-experience', target: 'drugs-hallucinations', label: 'Challenge' },
  { id: 'e6', source: 'religious-experience', target: 'cultural-influence', label: 'Challenge' },
  // Defenses
  { id: 'e7', source: 'religious-experience', target: 'swinburne-principles', label: 'Defense' },
  { id: 'e8', source: 'religious-experience', target: 'alston-perception', label: 'Defense' },
  // Key concepts
  { id: 'e9', source: 'religious-experience', target: 'ineffability', label: 'Key Concept' },
  { id: 'e10', source: 'religious-experience', target: 'verification', label: 'Key Concept' }
  // Removed edges to contrast boxes - they are now positioned above without connections
];

export { nodes, edges }; 