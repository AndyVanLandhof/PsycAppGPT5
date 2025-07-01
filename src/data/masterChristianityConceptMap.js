// Master concept map for Christian Thought (OCR H573)
const nodes = [
  {
    id: 'biblical-sources',
    data: {
      label: 'Biblical Sources of Wisdom and Authority',
      description: 'Examines the Bible as a source of wisdom and authority in Christianity. Considers different approaches to biblical interpretation and authority.',
      examples: [
        'Literal interpretation: Bible as direct word of God.',
        'Liberal interpretation: Bible as human response to divine revelation.'
      ],
      scholars: [
        { name: 'Karl Barth', idea: 'Bible as witness to divine revelation, not revelation itself.' },
        { name: 'Rudolf Bultmann', idea: 'Demythologization: separating myth from historical truth.' }
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
    id: 'jesus-christ',
    data: {
      label: 'Jesus Christ',
      description: 'Explores the person and work of Jesus Christ, including his divinity, humanity, and significance for salvation. Considers different Christological approaches.',
      examples: [
        'Chalcedonian definition: fully God and fully human.',
        'Liberation theology: Jesus as liberator of the oppressed.'
      ],
      scholars: [
        { name: 'St. Athanasius', idea: 'Christ as fully divine and fully human for salvation.' },
        { name: 'Gustavo Gutiérrez', idea: 'Jesus as liberator: preferential option for the poor.' }
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
    id: 'church',
    data: {
      label: 'The Church',
      description: 'Examines the nature, purpose, and structure of the Church. Considers different ecclesiological models and the Church\'s role in salvation.',
      examples: [
        'Catholic view: Church as necessary for salvation.',
        'Protestant view: Church as community of believers.'
      ],
      scholars: [
        { name: 'St. Augustine', idea: 'Church as the body of Christ and community of saints.' },
        { name: 'Martin Luther', idea: 'Priesthood of all believers: direct access to God.' }
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
    id: 'sacraments',
    data: {
      label: 'Sacraments',
      description: 'Explores the nature and significance of sacraments in Christian worship and salvation. Considers different views on sacramental theology.',
      examples: [
        'Catholic view: seven sacraments as channels of grace.',
        'Protestant view: two sacraments (baptism and eucharist).'
      ],
      scholars: [
        { name: 'St. Thomas Aquinas', idea: 'Sacraments as visible signs of invisible grace.' },
        { name: 'John Calvin', idea: 'Sacraments as seals of God\'s promises to believers.' }
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
    id: 'eschatology',
    data: {
      label: 'Eschatology',
      description: 'Examines Christian beliefs about the end times, judgment, heaven, and hell. Considers different eschatological perspectives and their implications.',
      examples: [
        'Millenarianism: literal thousand-year reign of Christ.',
        'Realized eschatology: kingdom already present in Jesus.'
      ],
      scholars: [
        { name: 'C.H. Dodd', idea: 'Realized eschatology: kingdom of God already present.' },
        { name: 'N.T. Wright', idea: 'Already/not yet: kingdom inaugurated but not consummated.' }
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
    id: 'christian-moral-principles',
    data: {
      label: 'Christian Moral Principles',
      description: 'Explores Christian approaches to moral decision-making, including natural law, divine command theory, and virtue ethics in Christian context.',
      examples: [
        'Natural law: moral principles discoverable through reason.',
        'Divine command theory: actions right because God commands them.'
      ],
      scholars: [
        { name: 'St. Thomas Aquinas', idea: 'Natural law as participation in eternal law.' },
        { name: 'Robert Adams', idea: 'Modified divine command theory: God commands what is good.' }
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
    id: 'christian-responses',
    data: {
      label: 'Christian Responses to Philosophical Issues',
      description: 'Examines how Christian thought responds to philosophical challenges including the problem of evil, religious language, and science-religion dialogue.',
      examples: [
        'Theodicy: reconciling God\'s goodness with evil.',
        'Science-religion dialogue: complementary approaches to truth.'
      ],
      scholars: [
        { name: 'John Hick', idea: 'Soul-making theodicy: evil necessary for moral development.' },
        { name: 'John Polkinghorne', idea: 'Science and theology as complementary ways of knowing.' }
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
    source: 'biblical-sources',
    target: 'jesus-christ',
    label: 'reveals',
    style: { stroke: '#3b82f6', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#1e40af' },
    data: {
      rationale: 'The Bible reveals Jesus Christ as the central figure of Christian faith and the primary source of Christian understanding.',
      examples: [
        'Gospels as primary sources for Jesus\' life and teaching.',
        'New Testament letters interpreting Jesus\' significance.'
      ],
      scholars: [
        { name: 'Karl Barth', idea: 'Bible as witness to Christ, the Word of God.' },
        { name: 'Rudolf Bultmann', idea: 'Demythologizing to reveal the kerygma of Christ.' }
      ]
    }
  },
  {
    id: 'e2',
    source: 'jesus-christ',
    target: 'eschatology',
    label: 'inaugurates',
    style: { stroke: '#ef4444', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#dc2626' },
    data: {
      rationale: 'Jesus Christ inaugurates the kingdom of God and brings about the eschatological fulfillment of God\'s purposes.',
      examples: [
        'Jesus\' proclamation: "The kingdom of God is at hand."',
        'Resurrection as first fruits of new creation.'
      ],
      scholars: [
        { name: 'C.H. Dodd', idea: 'Realized eschatology: kingdom present in Jesus\' ministry.' },
        { name: 'N.T. Wright', idea: 'Already/not yet: kingdom inaugurated in Jesus.' }
      ]
    }
  },
  // Horizontal connections
  {
    id: 'e3',
    source: 'church',
    target: 'sacraments',
    label: 'administers',
    style: { stroke: '#f59e0b', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#d97706' },
    data: {
      rationale: 'The Church administers the sacraments as means of grace and signs of God\'s presence and activity.',
      examples: [
        'Baptism as entry into the Church community.',
        'Eucharist as ongoing participation in Christ.'
      ],
      scholars: [
        { name: 'St. Thomas Aquinas', idea: 'Church as dispenser of sacramental grace.' },
        { name: 'John Calvin', idea: 'Church as community where sacraments are celebrated.' }
      ]
    }
  },
  {
    id: 'e4',
    source: 'sacraments',
    target: 'jesus-christ',
    label: 'participate in',
    style: { stroke: '#10b981', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#059669' },
    data: {
      rationale: 'Sacraments enable believers to participate in the life, death, and resurrection of Jesus Christ.',
      examples: [
        'Baptism as participation in Christ\'s death and resurrection.',
        'Eucharist as participation in Christ\'s body and blood.'
      ],
      scholars: [
        { name: 'St. Paul', idea: 'Baptism as dying and rising with Christ.' },
        { name: 'St. Augustine', idea: 'Eucharist as participation in Christ\'s sacrifice.' }
      ]
    }
  },
  {
    id: 'e5',
    source: 'christian-moral-principles',
    target: 'biblical-sources',
    label: 'derived from',
    style: { stroke: '#8b5cf6', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#7c3aed' },
    data: {
      rationale: 'Christian moral principles are derived from biblical sources, particularly the teachings of Jesus and the moral guidance of Scripture.',
      examples: [
        'Sermon on the Mount as moral teaching.',
        'Ten Commandments as moral foundation.'
      ],
      scholars: [
        { name: 'St. Thomas Aquinas', idea: 'Natural law as participation in divine law revealed in Scripture.' },
        { name: 'Dietrich Bonhoeffer', idea: 'Costly discipleship following Jesus\' example.' }
      ]
    }
  },
  {
    id: 'e6',
    source: 'christian-responses',
    target: 'jesus-christ',
    label: 'centered on',
    style: { stroke: '#ea580c', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#c2410c' },
    data: {
      rationale: 'Christian responses to philosophical issues are centered on Jesus Christ as the revelation of God and the key to understanding.',
      examples: [
        'Christ as the answer to the problem of evil.',
        'Incarnation as model for science-religion dialogue.'
      ],
      scholars: [
        { name: 'John Hick', idea: 'Christ as the one through whom God deals with evil.' },
        { name: 'John Polkinghorne', idea: 'Incarnation as model for divine action in the world.' }
      ]
    }
  },
  {
    id: 'e7',
    source: 'church',
    target: 'jesus-christ',
    label: 'body of',
    style: { stroke: '#0ea5e9', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#0284c7' },
    data: {
      rationale: 'The Church is understood as the body of Christ, continuing his mission and presence in the world.',
      examples: [
        'Church as continuation of Jesus\' ministry.',
        'Church as witness to Christ\'s resurrection.'
      ],
      scholars: [
        { name: 'St. Paul', idea: 'Church as the body of Christ, with Christ as the head.' },
        { name: 'St. Augustine', idea: 'Church as the mystical body of Christ.' }
      ]
    }
  },
  {
    id: 'e8',
    source: 'eschatology',
    target: 'christian-responses',
    label: 'informs',
    style: { stroke: '#3b82f6', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#1e40af' },
    data: {
      rationale: 'Eschatological beliefs inform Christian responses to philosophical issues, providing hope and perspective.',
      examples: [
        'Eschatological hope as response to problem of evil.',
        'New creation as framework for environmental ethics.'
      ],
      scholars: [
        { name: 'Jürgen Moltmann', idea: 'Theology of hope: eschatology as source of Christian ethics.' },
        { name: 'N.T. Wright', idea: 'New creation as framework for Christian mission.' }
      ]
    }
  },
  {
    id: 'e9',
    source: 'biblical-sources',
    target: 'church',
    label: 'guides',
    style: { stroke: '#ea580c', strokeWidth: 3, fontSize: 14, fontWeight: 'bold' },
    labelStyle: { fontSize: 14, fontWeight: 'bold', fill: '#c2410c' },
    data: {
      rationale: 'Biblical sources guide the Church\'s understanding of its nature, mission, and practices.',
      examples: [
        'Acts of the Apostles as model for Church life.',
        'Pauline letters as guidance for Church structure.'
      ],
      scholars: [
        { name: 'St. Augustine', idea: 'Scripture as authority for Church teaching and practice.' },
        { name: 'Martin Luther', idea: 'Sola scriptura: Scripture as final authority.' }
      ]
    }
  }
];

export default { nodes, edges }; 