// Master concept map for Ethics of Religion (OCR H573)
const nodes = [
  {
    id: 'normative-ethics',
    data: {
      label: 'Normative Ethical Theories',
      description: 'Examines deontological, teleological, and virtue ethics approaches. Considers Kantian ethics, Utilitarianism, and Aristotelian virtue ethics as frameworks for moral decision-making.',
      examples: [
        'Kant\'s Categorical Imperative: act only according to maxims that could be universal law.',
        'Mill\'s Greatest Happiness Principle: actions are right if they promote happiness.'
      ],
      scholars: [
        { name: 'Immanuel Kant', idea: 'Deontological ethics: duty-based morality with categorical imperatives.' },
        { name: 'John Stuart Mill', idea: 'Utilitarianism: actions are right if they maximize happiness.' }
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
    id: 'applied-ethics',
    data: {
      label: 'Applied Ethics',
      description: 'Applies ethical theories to real-world issues including medical ethics, business ethics, and environmental ethics. Considers practical applications of moral principles.',
      examples: [
        'Euthanasia debates: balancing autonomy with sanctity of life.',
        'Environmental responsibility: duties to future generations.'
      ],
      scholars: [
        { name: 'Peter Singer', idea: 'Practical ethics: applying utilitarian principles to contemporary issues.' },
        { name: 'Tom Regan', idea: 'Animal rights: animals have inherent value and rights.' }
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
    id: 'meta-ethics',
    data: {
      label: 'Meta-Ethics',
      description: 'Investigates the nature of ethical statements, moral language, and the foundations of moral knowledge. Explores cognitivism vs non-cognitivism.',
      examples: [
        'Emotivism: moral statements express emotions rather than facts.',
        'Naturalism: moral properties are natural properties.'
      ],
      scholars: [
        { name: 'A.J. Ayer', idea: 'Emotivism: moral statements are expressions of emotion.' },
        { name: 'G.E. Moore', idea: 'Non-naturalism: good is a simple, indefinable property.' }
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
    id: 'religious-ethics',
    data: {
      label: 'Religious Ethics',
      description: 'Examines how religious beliefs inform moral decision-making. Considers divine command theory, natural law, and religious approaches to ethical issues.',
      examples: [
        'Divine Command Theory: actions are right because God commands them.',
        'Natural Law: moral principles are discoverable through reason.'
      ],
      scholars: [
        { name: 'St. Thomas Aquinas', idea: 'Natural law: moral principles are discoverable through reason.' },
        { name: 'Robert Adams', idea: 'Modified divine command theory: God commands what is good.' }
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
    id: 'conscience',
    data: {
      label: 'Conscience',
      description: 'Explores the nature and role of conscience in moral decision-making. Considers psychological, religious, and philosophical accounts of conscience.',
      examples: [
        'Butler\'s view: conscience as God-given moral faculty.',
        'Freud\'s superego: conscience as internalized social norms.'
      ],
      scholars: [
        { name: 'Joseph Butler', idea: 'Conscience as God-given moral faculty that guides us to virtue.' },
        { name: 'Sigmund Freud', idea: 'Superego: conscience as internalized parental and social authority.' }
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
    id: 'free-will',
    data: {
      label: 'Free Will and Determinism',
      description: 'Examines the relationship between free will, determinism, and moral responsibility. Considers compatibilist and libertarian views.',
      examples: [
        'Hard determinism: all actions are causally determined.',
        'Libertarianism: humans have genuine free will.'
      ],
      scholars: [
        { name: 'John Locke', idea: 'Compatibilism: freedom is the ability to act according to one\'s desires.' },
        { name: 'Jean-Paul Sartre', idea: 'Radical freedom: humans are condemned to be free.' }
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
    id: 'virtue-ethics',
    data: {
      label: 'Virtue Ethics',
      description: 'Focuses on character and virtues rather than rules or consequences. Considers Aristotelian virtue ethics and contemporary developments.',
      examples: [
        'Aristotle\'s golden mean: virtues lie between extremes.',
        'MacIntyre\'s narrative approach: virtues in community context.'
      ],
      scholars: [
        { name: 'Aristotle', idea: 'Virtue ethics: focus on character and flourishing (eudaimonia).' },
        { name: 'Alasdair MacIntyre', idea: 'Virtues in the context of social practices and traditions.' }
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
  // Vertical progression
  {
    id: 'e1',
    source: 'normative-ethics',
    target: 'applied-ethics',
    label: 'applies to',
    style: { stroke: '#3b82f6', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#1e40af' },
    data: {
      rationale: 'Normative ethical theories provide the theoretical frameworks that are applied to real-world ethical issues and dilemmas.',
      examples: [
        'Kantian ethics applied to medical confidentiality.',
        'Utilitarian analysis of environmental policies.'
      ],
      scholars: [
        { name: 'Peter Singer', idea: 'Applying utilitarian principles to practical issues like poverty and animal welfare.' },
        { name: 'Onora O\'Neill', idea: 'Applying Kantian ethics to issues of trust and autonomy.' }
      ]
    }
  },
  {
    id: 'e2',
    source: 'applied-ethics',
    target: 'conscience',
    label: 'involves',
    style: { stroke: '#ef4444', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#dc2626' },
    data: {
      rationale: 'Applied ethical decisions often involve considerations of conscience, moral intuition, and personal moral reasoning.',
      examples: [
        'Medical professionals facing end-of-life decisions.',
        'Business leaders considering environmental responsibility.'
      ],
      scholars: [
        { name: 'Joseph Butler', idea: 'Conscience as a guide in complex moral situations.' },
        { name: 'John Rawls', idea: 'Reflective equilibrium in moral reasoning.' }
      ]
    }
  },
  // Horizontal connections
  {
    id: 'e3',
    source: 'normative-ethics',
    target: 'meta-ethics',
    label: 'raises questions for',
    style: { stroke: '#f59e0b', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#d97706' },
    data: {
      rationale: 'Normative ethical theories raise meta-ethical questions about the nature of moral language, properties, and knowledge that meta-ethics then investigates.',
      examples: [
        'Kantian ethics raises questions about the nature of moral truth and objectivity.',
        'Utilitarianism raises questions about the meaning of "good" and moral properties.'
      ],
      scholars: [
        { name: 'G.E. Moore', idea: 'Naturalistic fallacy: normative ethics cannot define "good" in natural terms.' },
        { name: 'A.J. Ayer', idea: 'Emotivism: normative ethical statements are expressions of emotion, not truth-apt.' }
      ]
    }
  },
  {
    id: 'e4',
    source: 'religious-ethics',
    target: 'conscience',
    label: 'informs',
    style: { stroke: '#10b981', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#059669' },
    data: {
      rationale: 'Religious ethical frameworks often provide specific accounts of conscience and moral guidance.',
      examples: [
        'Christian views of conscience as God-given.',
        'Islamic concepts of moral responsibility.'
      ],
      scholars: [
        { name: 'Joseph Butler', idea: 'Conscience as God-given moral faculty.' },
        { name: 'St. Thomas Aquinas', idea: 'Synderesis: innate knowledge of moral principles.' }
      ]
    }
  },
  {
    id: 'e5',
    source: 'free-will',
    target: 'normative-ethics',
    label: 'challenges',
    style: { stroke: '#8b5cf6', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#7c3aed' },
    data: {
      rationale: 'Questions about free will and determinism challenge assumptions about moral responsibility and the possibility of moral choice.',
      examples: [
        'Hard determinism challenges moral responsibility.',
        'Libertarianism supports traditional moral accountability.'
      ],
      scholars: [
        { name: 'John Locke', idea: 'Compatibilism: reconciling determinism with moral responsibility.' },
        { name: 'Jean-Paul Sartre', idea: 'Radical freedom as basis for moral responsibility.' }
      ]
    }
  },
  {
    id: 'e6',
    source: 'virtue-ethics',
    target: 'applied-ethics',
    label: 'offers alternative',
    style: { stroke: '#ea580c', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#c2410c' },
    data: {
      rationale: 'Virtue ethics offers an alternative approach to applied ethics, focusing on character and practical wisdom rather than rules.',
      examples: [
        'Virtue-based approach to medical ethics.',
        'Character education in business ethics.'
      ],
      scholars: [
        { name: 'Aristotle', idea: 'Practical wisdom (phronesis) in moral decision-making.' },
        { name: 'Alasdair MacIntyre', idea: 'Virtues in professional practices.' }
      ]
    }
  },
  {
    id: 'e7',
    source: 'religious-ethics',
    target: 'normative-ethics',
    label: 'provides framework',
    style: { stroke: '#0ea5e9', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#0284c7' },
    data: {
      rationale: 'Religious ethical systems provide comprehensive frameworks that often incorporate elements of various normative theories.',
      examples: [
        'Natural law theory combining deontological and teleological elements.',
        'Divine command theory as deontological framework.'
      ],
      scholars: [
        { name: 'St. Thomas Aquinas', idea: 'Natural law as comprehensive moral framework.' },
        { name: 'Robert Adams', idea: 'Modified divine command theory.' }
      ]
    }
  },
  {
    id: 'e8',
    source: 'conscience',
    target: 'free-will',
    label: 'presupposes',
    style: { stroke: '#3b82f6', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#1e40af' },
    data: {
      rationale: 'Traditional accounts of conscience presuppose some form of free will and moral agency.',
      examples: [
        'Conscience as moral decision-making faculty.',
        'Moral responsibility for following or ignoring conscience.'
      ],
      scholars: [
        { name: 'Joseph Butler', idea: 'Conscience as faculty of moral judgment requiring free will.' },
        { name: 'John Locke', idea: 'Compatibilist account of moral agency.' }
      ]
    }
  },
  {
    id: 'e9',
    source: 'meta-ethics',
    target: 'religious-ethics',
    label: 'questions',
    style: { stroke: '#ea580c', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#c2410c' },
    data: {
      rationale: 'Meta-ethical questions about the nature of moral language and properties challenge religious ethical frameworks.',
      examples: [
        'Euthyphro dilemma: is something good because God commands it?',
        'Non-cognitivist challenges to religious moral language.'
      ],
      scholars: [
        { name: 'Plato', idea: 'Euthyphro dilemma challenging divine command theory.' },
        { name: 'A.J. Ayer', idea: 'Emotivist critique of religious moral language.' }
      ]
    }
  }
];

export default { nodes, edges }; 