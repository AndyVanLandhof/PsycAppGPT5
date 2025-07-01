// Concept map for Arguments for the Existence of God (horizontal layout)
const nodes = [
  // Main arguments (horizontal row)
  { id: "cosmological", data: { label: "Cosmological Argument", description: "A family of arguments that infer God's existence from the existence or origin of the universe. Includes Aquinas' and Kalam versions." }, position: { x: -350, y: 0 } },
  { id: "teleological", data: { label: "Teleological Argument", description: "Arguments for God's existence based on perceived design or order in the universe. Includes Paley and modern fine-tuning." }, position: { x: 0, y: 0 } },
  { id: "ontological", data: { label: "Ontological Argument", description: "A priori arguments for God's existence based on the concept of God. Includes Anselm and Descartes." }, position: { x: 350, y: 0 } },

  // Sub-arguments (below each main argument)
  { id: "aquinas", data: { label: "Aquinas' First Three Ways", description: "Aquinas' arguments from motion, causation, and contingency, foundational to the cosmological tradition." }, position: { x: -500, y: 150 } },
  { id: "kalam", data: { label: "Kalam Cosmological Argument", description: "A modern cosmological argument emphasizing the universe's beginning. Popularized by William Lane Craig." }, position: { x: -200, y: 150 } },
  { id: "paley", data: { label: "Paley's Watchmaker Analogy", description: "Classic design argument: just as a watch implies a watchmaker, so too does the universe imply a designer." }, position: { x: -150, y: 150 } },
  { id: "fine-tuning", data: { label: "Modern Design Arguments (Fine-Tuning)", description: "Contemporary arguments that the universe's physical constants are finely tuned for life, suggesting design." }, position: { x: 150, y: 150 } },
  { id: "anselm", data: { label: "Anselm's Formulation", description: "Anselm's argument that God, being that than which nothing greater can be conceived, must exist in reality." }, position: { x: 200, y: 150 } },
  { id: "descartes", data: { label: "Descartes' Formulation", description: "Descartes' rationalist version of the ontological argument, asserting existence is part of God's essence." }, position: { x: 500, y: 150 } },

  // Critiques (below main arguments)
  { id: "critiques", data: { label: "Critiques of These Arguments", description: "Philosophers who challenge the validity of the classical arguments for God's existence." }, position: { x: 0, y: 300 } },
  { id: "hume", data: { label: "Hume's Criticisms", description: "Hume's critiques, especially of the design argument, questioning analogy and causation." }, position: { x: -150, y: 450 } },
  { id: "kant", data: { label: "Kant's Criticisms", description: "Kant's critique of the ontological argument: existence is not a predicate." }, position: { x: 350, y: 450 } },
  { id: "dawkins", data: { label: "Dawkins/Modern Critiques", description: "Modern atheists (e.g., Dawkins) challenge the validity and relevance of all classical arguments." }, position: { x: 0, y: 450 } },
];

const edges = [
  // Strong connections (solid)
  { id: "e1", source: "aquinas", target: "cosmological", label: "foundational", data: { rationale: "Aquinas' arguments are foundational to the cosmological tradition." } },
  { id: "e2", source: "kalam", target: "cosmological", label: "modern version", data: { rationale: "Kalam is a modern version of the cosmological argument." } },
  { id: "e3", source: "paley", target: "teleological", label: "classic statement", data: { rationale: "Paley's analogy is a classic statement of the design argument." } },
  { id: "e4", source: "fine-tuning", target: "teleological", label: "contemporary update", data: { rationale: "Fine-tuning is a contemporary update to the design argument." } },
  { id: "e5", source: "anselm", target: "ontological", label: "originator", data: { rationale: "Anselm originated the ontological argument." } },
  { id: "e6", source: "descartes", target: "ontological", label: "rationalist version", data: { rationale: "Descartes provided a rationalist version." } },
  { id: "e7", source: "hume", target: "teleological", label: "direct critique", data: { rationale: "Hume directly critiques the design argument." } },
  { id: "e8", source: "kant", target: "ontological", label: "direct critique", data: { rationale: "Kant's 'existence is not a predicate' is a direct critique." } },
  { id: "e9", source: "dawkins", target: "cosmological", label: "modern critique", data: { rationale: "Modern atheists challenge the cosmological argument." } },
  { id: "e10", source: "dawkins", target: "teleological", label: "modern critique", data: { rationale: "Modern atheists challenge the teleological argument." } },
  { id: "e11", source: "dawkins", target: "ontological", label: "modern critique", data: { rationale: "Modern atheists challenge the ontological argument." } },
];

export default { nodes, edges }; 