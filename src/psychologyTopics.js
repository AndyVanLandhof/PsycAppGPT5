// AQA Psychology 7182 Topic Structure (object format for dashboard UI/UX)

const psychologyTopics = {
  "social-influence": {
    id: "social-influence",
    title: "Social Influence",
    component: "Compulsory",
    description: "Study conformity, obedience, and social change in psychology.",
    difficulty: "Medium",
    subTopics: [
      { id: "types-of-conformity", title: "Types of conformity" },
      { id: "explanations-for-conformity", title: "Explanations for conformity" },
      { id: "obedience", title: "Obedience" },
      { id: "resistance-to-social-influence", title: "Resistance to social influence" },
      { id: "minority-influence", title: "Minority influence" }
    ]
  },
  "memory": {
    id: "memory",
    title: "Memory",
    component: "Compulsory",
    description: "Explore models of memory, forgetting, and eyewitness testimony.",
    difficulty: "Medium",
    subTopics: [
      { id: "multi-store-model", title: "Multi-store model" },
      { id: "working-memory-model", title: "Working memory model" },
      { id: "explanations-for-forgetting", title: "Explanations for forgetting" },
      { id: "eyewitness-testimony", title: "Eyewitness testimony" }
    ]
  },
  "attachment": {
    id: "attachment",
    title: "Attachment",
    component: "Compulsory",
    description: "Understand attachment theory, animal studies, and deprivation.",
    difficulty: "Medium",
    subTopics: [
      { id: "animal-studies", title: "Animal studies" },
      { id: "explanations-of-attachment", title: "Explanations of attachment" },
      { id: "strange-situation", title: "Ainsworth’s Strange Situation" },
      { id: "cultural-variations", title: "Cultural variations" },
      { id: "maternal-deprivation", title: "Maternal deprivation" }
    ]
  },
  "approaches-in-psychology": {
    id: "approaches-in-psychology",
    title: "Approaches in Psychology",
    component: "Compulsory",
    description: "Overview of key approaches in psychology.",
    difficulty: "Medium",
    subTopics: [
      { id: "origins-of-psychology", title: "Origins of psychology (Wundt, introspection, emergence of science)" },
      { id: "learning-approaches-behaviourism", title: "Learning approaches: Behaviourist (classical & operant conditioning)" },
      { id: "learning-approaches-slt", title: "Learning approaches: Social Learning Theory (Bandura)" },
      { id: "cognitive-approach", title: "Cognitive approach (schemas, theoretical and computer models)" },
      { id: "cognitive-neuroscience", title: "Cognitive neuroscience (emergence and methods)" },
      { id: "biological-approach", title: "Biological approach (genetics, neurochemistry, genotype/phenotype)" },
      { id: "psychodynamic-approach", title: "Psychodynamic approach (unconscious, structure of personality, psychosexual stages)" },
      { id: "humanistic-approach", title: "Humanistic approach (free will, self-actualisation, conditions of worth)" },
      { id: "comparing-approaches", title: "Comparing approaches (methods, determinism/free will, nature/nurture, reductionism/holism)" }
    ]
  },
  "biopsychology": {
    id: "biopsychology",
    title: "Biopsychology",
    component: "Compulsory",
    description: "Study the biological basis of behaviour.",
    difficulty: "Medium",
    subTopics: [
      { id: "nervous-system", title: "The divisions of the nervous system" },
      { id: "neurons-synaptic-transmission", title: "Neurons and synaptic transmission" },
      { id: "endocrine-system", title: "The endocrine system" },
      { id: "fight-or-flight", title: "The fight or flight response" },
      { id: "studying-the-brain", title: "Ways of studying the brain" },
      { id: "localisation-of-function", title: "Localisation of function in the brain" },
      { id: "plasticity-functional-recovery", title: "Plasticity and functional recovery" }
    ]
  },
  "research-methods": {
    id: "research-methods",
    title: "Research Methods",
    component: "Compulsory",
    description: "Learn about research design, data analysis, and scientific methods in psychology.",
    difficulty: "Medium",
    subTopics: [
      { id: "experimental-method", title: "Experimental method" },
      { id: "observational-techniques", title: "Observational techniques" },
      { id: "self-report-techniques", title: "Self-report techniques" },
      { id: "correlations", title: "Correlations" },
      { id: "content-analysis", title: "Content analysis" },
      { id: "case-studies", title: "Case studies" },
      { id: "scientific-processes", title: "Scientific processes" },
      { id: "data-handling-analysis", title: "Data handling and analysis" },
      { id: "inferential-testing", title: "Inferential testing" }
    ]
  },
  "issues-and-debates": {
    id: "issues-and-debates",
    title: "Issues and Debates in Psychology",
    component: "Compulsory",
    description: "Explore key issues and debates in psychology.",
    difficulty: "Medium",
    subTopics: [
      { id: "gender-culture-bias", title: "Gender and culture in Psychology" },
      { id: "free-will-determinism", title: "Free will and determinism" },
      { id: "nature-nurture", title: "The nature-nurture debate" },
      { id: "holism-reductionism", title: "Holism and reductionism" },
      { id: "idiographic-nomothetic", title: "Idiographic and nomothetic approaches" },
      { id: "social-sensitivity", title: "Social sensitivity in psychological research" }
    ]
  },
  // Option 1
  "relationships": {
    id: "relationships",
    title: "Relationships",
    component: "Option 1",
    description: "Study the psychology of relationships.",
    difficulty: "Medium",
    subTopics: [
      { id: "factors-affecting-attraction", title: "Factors affecting attraction in romantic relationships" },
      { id: "theories-romantic-relationships", title: "Theories of romantic relationships" },
      { id: "online-relationships", title: "Online relationships" },
      { id: "parasocial-relationships", title: "Parasocial relationships" }
    ]
  },
  "gender": {
    id: "gender",
    title: "Gender",
    component: "Option 1",
    description: "Explore psychological theories and research on gender.",
    difficulty: "Medium",
    subTopics: [
      { id: "chromosomes-hormones", title: "The role of chromosomes and hormones" },
      { id: "gender-identities", title: "Gender identities" },
      { id: "biological-explanations", title: "Biological explanations of gender development" },
      { id: "cognitive-explanations", title: "Cognitive explanations of gender development" },
      { id: "social-learning-theory", title: "Social learning theory as applied to gender development" },
      { id: "gender-incongruence", title: "Gender incongruence" }
    ]
  },
  "cognition-and-development": {
    id: "cognition-and-development",
    title: "Cognition and Development",
    component: "Option 1",
    description: "Examine cognitive development and related theories.",
    difficulty: "Medium",
    subTopics: [
      { id: "piaget-theory", title: "Piaget's theory of cognitive development" },
      { id: "vygotsky-theory", title: "Vygotsky's theory of cognitive development" },
      { id: "baillargeon-explanation", title: "Baillargeon's explanation of early infant abilities" },
      { id: "development-social-cognition", title: "The development of social cognition" }
    ]
  },
  // Option 2
  "schizophrenia": {
    id: "schizophrenia",
    title: "Schizophrenia",
    component: "Option 2",
    description: "Understand the symptoms, causes, and treatments of schizophrenia.",
    difficulty: "Medium",
    subTopics: [
      { id: "symptoms-diagnosis", title: "Symptoms and diagnosis of schizophrenia" },
      { id: "biological-explanations", title: "Biological explanations for schizophrenia" },
      { id: "psychological-explanations", title: "Psychological explanations for schizophrenia" },
      { id: "drug-therapy", title: "Drug therapy" },
      { id: "psychological-therapies", title: "Psychological therapies" },
      { id: "interactionist-approach", title: "The interactionist approach" }
    ]
  },
  "eating-behaviour": {
    id: "eating-behaviour",
    title: "Eating Behaviour",
    component: "Option 2",
    description: "Study psychological aspects of eating behaviour.",
    difficulty: "Medium",
    subTopics: [
      { id: "food-preferences", title: "Explanations for food preferences" },
      { id: "neural-hormonal-mechanisms", title: "Neural and hormonal mechanisms in eating" },
      { id: "biological-explanations-anorexia", title: "Biological explanations for anorexia nervosa" },
      { id: "psychological-explanations-anorexia", title: "Psychological explanations for anorexia nervosa" },
      { id: "biological-explanations-obesity", title: "Biological explanations for obesity" },
      { id: "psychological-explanations-obesity", title: "Psychological explanations for obesity" }
    ]
  },
  "stress": {
    id: "stress",
    title: "Stress",
    component: "Option 2",
    description: "Explore the psychology of stress and coping mechanisms.",
    difficulty: "Medium",
    subTopics: [
      { id: "physiology-stress", title: "The physiology of stress" },
      { id: "stress-illness", title: "The role of stress in illness" },
      { id: "sources-stress", title: "Sources of stress" },
      { id: "measuring-stress", title: "Measuring stress" },
      { id: "individual-differences-stress", title: "Individual differences in stress" },
      { id: "managing-coping-stress", title: "Managing and coping with stress" }
    ]
  },
  // Option 3
  "aggression": {
    id: "aggression",
    title: "Aggression",
    component: "Option 3",
    description: "Examine theories and research on aggression.",
    difficulty: "Medium",
    subTopics: [
      { id: "neural-hormonal-mechanisms", title: "Neural and hormonal mechanisms in aggression" },
      { id: "ethological-explanation", title: "The ethological explanation of aggression" },
      { id: "social-psychological-explanations", title: "Social psychological explanations of human aggression" },
      { id: "institutional-aggression", title: "Institutional aggression in the context of prisons" },
      { id: "media-influences", title: "Media influences on aggression" }
    ]
  },
  "forensic-psychology": {
    id: "forensic-psychology",
    title: "Forensic Psychology",
    component: "Option 3",
    description: "Study the application of psychology to criminal investigation and law.",
    difficulty: "Medium",
    subTopics: [
      { id: "offender-profiling", title: "Offender profiling" },
      { id: "biological-explanations-offending", title: "Biological explanations of offending behaviour" },
      { id: "psychological-explanations-offending", title: "Psychological explanations of offending behaviour" },
      { id: "dealing-offending-behaviour", title: "Dealing with offending behaviour" }
    ]
  },
  "addiction": {
    id: "addiction",
    title: "Addiction",
    component: "Option 3",
    description: "Understand psychological perspectives on addiction.",
    difficulty: "Medium",
    subTopics: [
      { id: "describing-addiction", title: "Describing addiction" },
      { id: "risk-factors-addiction", title: "Risk factors in the development of addiction" },
      { id: "explanations-nicotine-addiction", title: "Explanations for nicotine addiction" },
      { id: "explanations-gambling-addiction", title: "Explanations for gambling addiction" },
      { id: "reducing-addiction", title: "Reducing addiction" },
      { id: "prochaska-model", title: "Prochaska's six-stage model of behaviour change" }
    ]
  }
};

export default psychologyTopics; 