// Edexcel A level English Literature (9ET0) topic scaffold

const englishLitTopics = {
  // Component 1: Drama
  "drama": {
    id: "drama",
    title: "Drama",
    component: "Component 1",
    description: "Shakespeare plus one other drama; critical anthology (Tragedy or Comedy).",
    difficulty: "Medium",
    subTopics: [
      { id: "shakespeare", title: "Shakespeare (play + critical anthology)" },
      { id: "other-drama", title: "Drama: Tragedy or Comedy (second play)" }
    ]
  },

  // Component 2: Prose
  "prose": {
    id: "prose",
    title: "Prose",
    component: "Component 2",
    description: "Two prose texts linked by theme; at least one pre-1900.",
    difficulty: "Medium",
    subTopics: [
      { id: "childhood", title: "Thematic Pair: Childhood" },
      { id: "colonisation", title: "Thematic Pair: Colonisation and its Aftermath" },
      { id: "crime", title: "Thematic Pair: Crime and Punishment" },
      { id: "science", title: "Thematic Pair: Science and Society" },
      { id: "supernatural", title: "Thematic Pair: The Supernatural" },
      { id: "women-society", title: "Thematic Pair: Women and Society" }
    ]
  },

  // Component 3: Poetry
  "poetry": {
    id: "poetry",
    title: "Poetry",
    component: "Component 3",
    description: "Poems of the Decade + poet/period selection (e.g., Keats, Rossetti).",
    difficulty: "Medium",
    subTopics: [
      { id: "poems-of-the-decade", title: "Post-2000: Poems of the Decade" },
      { id: "named-poet", title: "Named Poet (e.g., Keats, Rossetti, Eliot, Larkin)" },
      { id: "period-selection", title: "Period Selection (e.g., Chaucer, Metaphysicals)" }
    ]
  },

  // Component 4: Non-Exam Assessment (Coursework)
  "nea-coursework": {
    id: "nea-coursework",
    title: "Coursework (NEA)",
    component: "Coursework",
    description: "Comparative essay (2,500–3,000 words) on two texts not studied elsewhere.",
    difficulty: "Hard",
    subTopics: [
      { id: "text-selection", title: "Choosing Suitable Texts" },
      { id: "comparative-methods", title: "Comparative Methods & Argument" },
      { id: "context-criticism", title: "Context and Critical Perspectives" },
      { id: "drafting-submission", title: "Drafting, Feedback, Submission" }
    ]
  }
};

export default englishLitTopics;


