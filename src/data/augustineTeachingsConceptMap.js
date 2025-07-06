// Concept map for Augustine's Teachings (sub-topic)
const nodes = [
  // Main node - Light Yellow
  {
    id: 'augustine-teachings',
    data: {
      label: 'Augustine\'s Teachings',
      description: '• Augustine\'s views on human nature, original sin, and grace.\n• Influential in Western Christianity and theology.\n• Addresses questions of human will and divine grace.\n• Response to Pelagian controversy.'
    },
    position: { x: 0, y: 0 },
    style: { backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '16px' }
  },
  // Original Sin - Light Green (Writers/Rationale)
  {
    id: 'original-sin',
    data: {
      label: 'Original Sin',
      description: '• Humans inherit sin from Adam and Eve.\n• All humans are born with sinful nature.\n• Concupiscence: disordered desires.\n• Humans cannot achieve salvation on their own.\n• Found in "City of God" and "Confessions".',
      scholars: [
        { name: 'Augustine', idea: 'Original Sin' },
        { name: 'Paul', idea: 'Romans 5:12' }
      ]
    },
    position: { x: -450, y: -150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'adam-eve',
    data: {
      label: 'Adam and Eve\'s Fall',
      description: '• First humans disobeyed God\'s command.\n• Pride and desire for autonomy.\n• Consequences affect all humanity.\n• Loss of original righteousness.\n• Transmission of sin to all descendants.',
      scholars: [
        { name: 'Augustine', idea: 'Fall narrative' }
      ]
    },
    position: { x: -450, y: 0 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'concupiscence',
    data: {
      label: 'Concupiscence',
      description: '• Disordered desires and appetites.\n• Result of original sin.\n• Humans cannot control their desires.\n• Sexual desire as example of disorder.\n• Ongoing struggle with sinful nature.',
      scholars: [
        { name: 'Augustine', idea: 'Concupiscence' }
      ]
    },
    position: { x: -450, y: 150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Grace - Light Green (Writers/Rationale)
  {
    id: 'grace',
    data: {
      label: 'The Role of Grace',
      description: '• Salvation depends on God\'s grace alone.\n• Humans cannot earn salvation.\n• Grace is irresistible and efficacious.\n• Predestination: God chooses who to save.\n• Found in "On Grace and Free Will".',
      scholars: [
        { name: 'Augustine', idea: 'Grace theology' }
      ]
    },
    position: { x: 450, y: -150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'predestination',
    data: {
      label: 'Predestination',
      description: '• God predestines some to salvation.\n• Double predestination: some to damnation.\n• Based on God\'s sovereign choice.\n• Not based on human merit.\n• Controversial aspect of Augustine\'s theology.',
      scholars: [
        { name: 'Augustine', idea: 'Predestination' }
      ]
    },
    position: { x: 450, y: 0 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'free-will',
    data: {
      label: 'Human Will',
      description: '• Humans have free will but it is corrupted.\n• Will is enslaved to sin.\n• Cannot choose good without grace.\n• Compatibilist view of freedom.\n• Found in "On Free Choice of the Will".',
      scholars: [
        { name: 'Augustine', idea: 'Free will' }
      ]
    },
    position: { x: 450, y: 150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Pelagian Controversy - Light Green (Writers/Rationale)
  {
    id: 'pelagian-controversy',
    data: {
      label: 'Pelagian Controversy',
      description: '• Pelagius argued humans can achieve salvation.\n• Augustine defended need for grace.\n• Council of Carthage condemned Pelagianism.\n• Established doctrine of original sin.\n• Key theological debate of early church.',
      scholars: [
        { name: 'Pelagius', idea: 'Human ability' },
        { name: 'Augustine', idea: 'Grace necessary' }
      ]
    },
    position: { x: 0, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Critiques - Light Red
  {
    id: 'pelagian-critique',
    data: {
      label: 'Pelagian Critique',
      description: '• Humans have natural ability to choose good.\n• Original sin doesn\'t destroy human nature.\n• Grace assists but doesn\'t replace human effort.\n• Humans can cooperate with grace.\n• More optimistic view of human nature.'
    },
    position: { x: -250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'modern-critique',
    data: {
      label: 'Modern Critiques',
      description: '• Original sin as literal doctrine problematic.\n• Evolutionary biology challenges fall narrative.\n• Predestination seems unjust.\n• Overly pessimistic view of human nature.\n• Psychological and scientific challenges.'
    },
    position: { x: 250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  // Key Concepts - Light Green (Writers/Rationale)
  {
    id: 'human-nature',
    data: {
      label: 'Human Nature',
      description: '• Humans created good but corrupted by sin.\n• Image of God remains but damaged.\n• Need for redemption and restoration.\n• Tension between creation and fall.\n• Theological anthropology.'
    },
    position: { x: -400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'salvation',
    data: {
      label: 'Salvation',
      description: '• Salvation by grace alone.\n• Human effort cannot achieve salvation.\n• God\'s initiative in redemption.\n• Role of faith and works.\n• Soteriological implications.'
    },
    position: { x: 400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Links to other topics - Light Green (Writers/Rationale)
  {
    id: 'knowledge-god-link',
    data: {
      label: 'Knowledge of God',
      description: '• Augustine\'s view of knowledge and grace.\n• Natural vs revealed knowledge.\n• Role of grace in understanding.\n• Faith seeking understanding.\n• Theological epistemology.'
    },
    position: { x: -200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'person-jesus-link',
    data: {
      label: 'Person of Jesus',
      description: '• Jesus as source of grace.\n• Incarnation and salvation.\n• Christological implications.\n• Grace through Christ alone.\n• Soteriological role of Jesus.'
    },
    position: { x: 200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  }
];

const edges = [
  // Main branches - direct connections to key concepts
  { id: 'e1', source: 'augustine-teachings', target: 'original-sin', label: 'Augustine' },
  { id: 'e2', source: 'augustine-teachings', target: 'grace', label: 'Augustine' },
  { id: 'e3', source: 'augustine-teachings', target: 'pelagian-controversy', label: 'Controversy' },
  // Sub-connections
  { id: 'e4', source: 'original-sin', target: 'adam-eve', label: 'Origin' },
  { id: 'e5', source: 'original-sin', target: 'concupiscence', label: 'Result' },
  { id: 'e6', source: 'grace', target: 'predestination', label: 'Implies' },
  { id: 'e7', source: 'grace', target: 'free-will', label: 'Affects' },
  // Critiques
  { id: 'e8', source: 'augustine-teachings', target: 'pelagian-critique', label: 'Critique' },
  { id: 'e9', source: 'augustine-teachings', target: 'modern-critique', label: 'Critique' },
  // Key concepts
  { id: 'e10', source: 'augustine-teachings', target: 'human-nature', label: 'Key Concept' },
  { id: 'e11', source: 'augustine-teachings', target: 'salvation', label: 'Key Concept' }
  // Removed edges to contrast boxes - they are now positioned above without connections
];

export { nodes, edges }; 