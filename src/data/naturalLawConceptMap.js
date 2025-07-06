// Concept map for Natural Law (sub-topic)
const nodes = [
  // Main node - Light Yellow
  {
    id: 'natural-law',
    data: {
      label: 'Natural Law',
      description: '• Aquinas\' theory of morality based on reason and human purpose.\n• Moral laws are discoverable through human reason.\n• Based on the idea that humans have a natural purpose.\n• Combines Aristotelian philosophy with Christian theology.'
    },
    position: { x: 0, y: 0 },
    style: { backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '16px' }
  },
  // Aquinas' Theory - Light Green (Writers/Rationale)
  {
    id: 'aquinas-theory',
    data: {
      label: 'Aquinas\' Natural Law Theory',
      description: '• Moral laws are written in human nature.\n• Discoverable through reason and observation.\n• Based on Aristotle\'s teleological view.\n• Humans have natural inclinations toward good.\n• Found in "Summa Theologica" (1265-1274).',
      scholars: [
        { name: 'Thomas Aquinas', idea: 'Natural Law Theory' },
        { name: 'Aristotle', idea: 'Teleological ethics' }
      ]
    },
    position: { x: -450, y: -150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'primary-precepts',
    data: {
      label: 'Primary Precepts',
      description: '• Core goals that define human flourishing.\n• Preservation of life, reproduction, education.\n• Worship God, live in society, avoid ignorance.\n• Universal and unchanging moral principles.\n• Foundation for secondary precepts.',
      scholars: [
        { name: 'Thomas Aquinas', idea: 'Primary Precepts' }
      ]
    },
    position: { x: -450, y: 0 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'secondary-precepts',
    data: {
      label: 'Secondary Precepts',
      description: '• Specific applications of primary precepts.\n• Can vary between cultures and circumstances.\n• Examples: don\'t murder, don\'t steal, don\'t lie.\n• Derived from primary precepts through reason.\n• More flexible than primary precepts.',
      scholars: [
        { name: 'Thomas Aquinas', idea: 'Secondary Precepts' }
      ]
    },
    position: { x: -450, y: 150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Double Effect - Light Green (Writers/Rationale)
  {
    id: 'double-effect',
    data: {
      label: 'Doctrine of Double Effect',
      description: '• Actions with both good and bad effects can be justified.\n• Four conditions must be met.\n• Intention must be good, bad effect not intended.\n• Good effect must outweigh bad effect.\n• Examples: palliative care, self-defense.',
      scholars: [
        { name: 'Thomas Aquinas', idea: 'Double Effect' }
      ]
    },
    position: { x: 450, y: -150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'four-conditions',
    data: {
      label: 'Four Conditions of Double Effect',
      description: '• 1. Action itself must be morally good or neutral.\n• 2. Bad effect must not be intended.\n• 3. Good effect must not be caused by bad effect.\n• 4. Good effect must be proportional to bad effect.\n• All conditions must be met for justification.',
      scholars: [
        { name: 'Thomas Aquinas', idea: 'Four Conditions' }
      ]
    },
    position: { x: 450, y: 0 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'conscience',
    data: {
      label: 'Conscience and Synderesis',
      description: '• Synderesis: natural inclination toward good.\n• Conscience: practical application of moral principles.\n• Humans have innate moral awareness.\n• Conscience can be educated and developed.\n• Important for moral decision-making.',
      scholars: [
        { name: 'Thomas Aquinas', idea: 'Synderesis' }
      ]
    },
    position: { x: 450, y: 150 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Critiques - Light Red
  {
    id: 'hume-critique',
    data: {
      label: 'Hume\'s Critique',
      description: '• Cannot derive "ought" from "is".\n• Natural facts don\'t imply moral values.\n• Teleological view is question-begging.\n• Assumes what it tries to prove.\n• Found in "Treatise of Human Nature" (1739).'
    },
    position: { x: 0, y: 250 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'cultural-relativism',
    data: {
      label: 'Cultural Relativism',
      description: '• Moral laws vary between cultures.\n• No universal moral principles.\n• Natural law assumes human nature is universal.\n• Different societies have different values.\n• Challenges to objective morality.'
    },
    position: { x: 250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  {
    id: 'teleology-critique',
    data: {
      label: 'Critique of Teleology',
      description: '• Purpose in nature is not obvious.\n• Darwinian evolution challenges teleology.\n• No evidence for natural purposes.\n• Human nature is not fixed.\n• Modern science rejects final causes.'
    },
    position: { x: -250, y: 300 },
    style: { backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '16px' }
  },
  // Key Concepts - Light Green (Writers/Rationale)
  {
    id: 'teleology',
    data: {
      label: 'Teleology',
      description: '• Purpose-directed view of nature.\n• Everything has a natural purpose.\n• Humans have natural inclinations.\n• Good is fulfilling natural purpose.\n• Aristotelian foundation.'
    },
    position: { x: -400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'reason',
    data: {
      label: 'Reason and Morality',
      description: '• Moral laws discoverable through reason.\n• Human reason can understand natural law.\n• Rational reflection on human nature.\n• Reason vs revelation in ethics.\n• Role of rationality in morality.'
    },
    position: { x: 400, y: 250 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  // Links to other topics - Light Green (Writers/Rationale)
  {
    id: 'situation-ethics-link',
    data: {
      label: 'Situation Ethics',
      description: '• Contrasts with natural law approach.\n• Natural law: universal principles.\n• Situation ethics: contextual decisions.\n• Love vs reason as moral guide.\n• Different approaches to moral decision-making.'
    },
    position: { x: -200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  },
  {
    id: 'utilitarianism-link',
    data: {
      label: 'Utilitarianism',
      description: '• Natural law: deontological approach.\n• Utilitarianism: consequentialist approach.\n• Different views of moral reasoning.\n• Universal principles vs consequences.\n• Teleology vs utility.'
    },
    position: { x: 200, y: -300 },
    style: { backgroundColor: '#dcfce7', border: '2px solid #16a34a', borderRadius: '16px' }
  }
];

const edges = [
  // Main branches - direct connections to key concepts
  { id: 'e1', source: 'natural-law', target: 'aquinas-theory', label: 'Aquinas' },
  { id: 'e2', source: 'natural-law', target: 'primary-precepts', label: 'Foundation' },
  { id: 'e3', source: 'natural-law', target: 'double-effect', label: 'Application' },
  { id: 'e4', source: 'natural-law', target: 'conscience', label: 'Aquinas' },
  // Sub-connections
  { id: 'e5', source: 'primary-precepts', target: 'secondary-precepts', label: 'Derived' },
  { id: 'e6', source: 'double-effect', target: 'four-conditions', label: 'Requirements' },
  // Critiques
  { id: 'e7', source: 'natural-law', target: 'hume-critique', label: 'Critique' },
  { id: 'e8', source: 'natural-law', target: 'cultural-relativism', label: 'Critique' },
  { id: 'e9', source: 'natural-law', target: 'teleology-critique', label: 'Critique' },
  // Key concepts
  { id: 'e10', source: 'natural-law', target: 'teleology', label: 'Key Concept' },
  { id: 'e11', source: 'natural-law', target: 'reason', label: 'Key Concept' }
  // Removed edges to contrast boxes - they are now positioned above without connections
];

export { nodes, edges }; 