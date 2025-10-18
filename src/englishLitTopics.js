// Edexcel A level English Literature (9ET0) topics by Component

const englishLitTopics = {
  // Component 1: Drama (two boxes)
  "hamlet": {
    id: "hamlet",
    title: "Hamlet (Shakespeare)",
    component: "Component 1",
    description: "Tragedy: study with critical anthology (Tragedy/Comedy).",
    difficulty: "Medium",
    subTopics: [
      { id: "overview", title: "Overview" },
      { id: "themes", title: "Themes & Motifs" },
      { id: "context-critics", title: "Context & Critical Anthology" }
    ]
  },
  "waiting-for-godot": {
    id: "waiting-for-godot",
    title: "Waiting for Godot (Beckett)",
    component: "Component 1",
    description: "Drama study (Tragedy/Comedy) alongside Shakespeare play.",
    difficulty: "Medium",
    subTopics: [
      { id: "overview", title: "Overview" },
      { id: "themes", title: "Themes & Motifs" },
      { id: "performance", title: "Performance & Staging" }
    ]
  },

  // Component 2: Prose (two boxes)
  "heart-of-darkness": {
    id: "heart-of-darkness",
    title: "Heart of Darkness (Conrad)",
    component: "Component 2",
    description: "Paired prose text (themes may include Colonisation/Empire).",
    difficulty: "Medium",
    subTopics: [
      { id: "overview", title: "Overview" },
      { id: "context", title: "Context & Form" },
      { id: "comparative", title: "Comparative Links" }
    ]
  },
  "lonely-londoners": {
    id: "lonely-londoners",
    title: "The Lonely Londoners (Selvon)",
    component: "Component 2",
    description: "Paired prose text (migration, identity, post-war London).",
    difficulty: "Medium",
    subTopics: [
      { id: "overview", title: "Overview" },
      { id: "context", title: "Context & Form" },
      { id: "comparative", title: "Comparative Links" }
    ]
  },

  // Component 3: Poetry (two boxes)
  "poems-of-the-decade": {
    id: "poems-of-the-decade",
    title: "Poems of the Decade (Anthology)",
    component: "Component 3",
    description: "Single anthology box (e.g., Agbabi, Armitage, Barber, Burnside, Copus, Doshi, Duhig, Dunmore, Fanthorpe, Feaver, Flynn, Ford, Heaney, Jenkins, Morrissey, Motion, Nagra, O’Driscoll, Thorpe, Turnbull).",
    difficulty: "Medium",
    subTopics: [
      { id: "overview", title: "Overview" },
      { id: "comparison", title: "Comparison Skills" }
    ]
  },
  "keats-selected": {
    id: "keats-selected",
    title: "Keats — Selected Poems",
    component: "Component 3",
    description: "Named poet selection (core odes and key poems).",
    difficulty: "Medium",
    subTopics: [
      { id: "overview", title: "Overview" },
      { id: "odes", title: "Major Odes" },
      { id: "comparison", title: "Comparison Skills" }
    ]
  },

  // Coursework (kept as a separate section)
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


