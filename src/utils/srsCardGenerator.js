// SRS Card Generator Utility
// This helps create initial SRS cards for testing the dashboard
import psychologyTopics from '../psychologyTopics';

export const generateSampleSrsCards = (subTopicId, count = 5) => {
  // Create topic-specific sample cards based on the subtopic ID
  const sampleCards = getTopicSpecificCards(subTopicId);
  return sampleCards.slice(0, count);
};

const getTopicSpecificCards = (subTopicId) => {
  // Map of subtopic IDs to their specific sample cards
  const topicCards = {
    // Social Influence
    "types-of-conformity": [
      {
        id: `card-${subTopicId}-1`,
        question: "What is the definition of conformity?",
        answer: "Conformity is a type of social influence involving a change in belief or behavior in order to fit in with a group.",
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1,
        nextReview: new Date().toISOString(),
        lastReviewed: null
      },
      {
        id: `card-${subTopicId}-2`,
        question: "What are the three types of conformity identified by Kelman?",
        answer: "The three types are: 1) Compliance - publicly conforming but privately disagreeing, 2) Identification - conforming to be like someone admired, 3) Internalisation - genuinely accepting the group's beliefs.",
        repetitions: 1,
        easeFactor: 2.3,
        interval: 6,
        nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    
    // Memory
    "multi-store-model": [
      {
        id: `card-${subTopicId}-1`,
        question: "What are the three stores in Atkinson and Shiffrin's Multi-Store Model?",
        answer: "The three stores are: 1) Sensory register - holds sensory information briefly, 2) Short-term memory - limited capacity store, 3) Long-term memory - unlimited capacity permanent store.",
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1,
        nextReview: new Date().toISOString(),
        lastReviewed: null
      },
      {
        id: `card-${subTopicId}-2`,
        question: "What is the capacity and duration of short-term memory?",
        answer: "Short-term memory has a capacity of 7±2 items (Miller) and duration of 18-30 seconds without rehearsal.",
        repetitions: 1,
        easeFactor: 2.3,
        interval: 6,
        nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    
    // Attachment
    "strange-situation": [
      {
        id: `card-${subTopicId}-1`,
        question: "What are the three attachment types identified by Ainsworth?",
        answer: "The three types are: 1) Secure attachment (Type B) - 60-65% of infants, 2) Insecure-avoidant (Type A) - 20-25%, 3) Insecure-resistant (Type C) - 10-15%.",
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1,
        nextReview: new Date().toISOString(),
        lastReviewed: null
      },
      {
        id: `card-${subTopicId}-2`,
        question: "What behaviors indicate secure attachment in the Strange Situation?",
        answer: "Secure infants show moderate stranger anxiety, moderate separation anxiety, seek comfort from caregiver on reunion, and use caregiver as a secure base for exploration.",
        repetitions: 1,
        easeFactor: 2.3,
        interval: 6,
        nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    
    // Approaches in Psychology
    "origins-of-psychology": [
      {
        id: `card-${subTopicId}-1`,
        question: "Which psychologist is credited with establishing the first psychology laboratory in 1879 and what method did he use to study the mind?",
        answer: "Wilhelm Wundt; he used systematic introspection to analyse conscious mental processes, marking psychology's emergence as a science.",
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1,
        nextReview: new Date().toISOString(),
        lastReviewed: null
      },
      {
        id: `card-${subTopicId}-2`,
        question: "What was Wundt's contribution to psychology?",
        answer: "Wundt established psychology as an experimental science by opening the first psychology laboratory in Leipzig in 1879 and developing systematic introspection as a research method.",
        repetitions: 1,
        easeFactor: 2.3,
        interval: 6,
        nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `card-${subTopicId}-3`,
        question: "What is introspection and why was it important?",
        answer: "Introspection is the systematic analysis of one's own conscious mental processes. It was important as the first systematic method for studying mental processes, though later criticized for being subjective.",
        repetitions: 2,
        easeFactor: 2.1,
        interval: 12,
        nextReview: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        lastReviewed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    
    "learning-approaches-behaviourism": [
      {
        id: `card-${subTopicId}-1`,
        question: "What is classical conditioning?",
        answer: "Classical conditioning is learning through association, where a neutral stimulus becomes associated with an unconditioned stimulus to produce a conditioned response.",
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1,
        nextReview: new Date().toISOString(),
        lastReviewed: null
      },
      {
        id: `card-${subTopicId}-2`,
        question: "What is operant conditioning?",
        answer: "Operant conditioning is learning through consequences, where behavior is strengthened by reinforcement or weakened by punishment.",
        repetitions: 1,
        easeFactor: 2.3,
        interval: 6,
        nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    
    // Biopsychology
    "nervous-system": [
      {
        id: `card-${subTopicId}-1`,
        question: "What are the two main divisions of the nervous system?",
        answer: "The two main divisions are: 1) Central Nervous System (CNS) - brain and spinal cord, 2) Peripheral Nervous System (PNS) - all nerves outside CNS.",
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1,
        nextReview: new Date().toISOString(),
        lastReviewed: null
      },
      {
        id: `card-${subTopicId}-2`,
        question: "What are the subdivisions of the peripheral nervous system?",
        answer: "The PNS has two subdivisions: 1) Somatic nervous system - controls voluntary muscle movements, 2) Autonomic nervous system - controls involuntary functions.",
        repetitions: 1,
        easeFactor: 2.3,
        interval: 6,
        nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    
    // Research Methods
    "experimental-method": [
      {
        id: `card-${subTopicId}-1`,
        question: "What are the three types of experimental design?",
        answer: "The three types are: 1) Independent measures - different participants in each condition, 2) Repeated measures - same participants in all conditions, 3) Matched pairs - different but matched participants.",
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1,
        nextReview: new Date().toISOString(),
        lastReviewed: null
      },
      {
        id: `card-${subTopicId}-2`,
        question: "What is the difference between independent and dependent variables?",
        answer: "Independent variable (IV) is what the researcher manipulates, while dependent variable (DV) is what is measured to see the effect of the IV.",
        repetitions: 1,
        easeFactor: 2.3,
        interval: 6,
        nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };

  // Return topic-specific cards if available, otherwise return generic psychology cards
  return topicCards[subTopicId] || [
    {
      id: `card-${subTopicId}-1`,
      question: `What is a key concept in ${subTopicId.replace(/-/g, ' ')}?`,
      answer: "This is a sample answer for the psychology topic. Replace with actual content specific to this subtopic.",
      repetitions: 0,
      easeFactor: 2.5,
      interval: 1,
      nextReview: new Date().toISOString(),
      lastReviewed: null
    },
    {
      id: `card-${subTopicId}-2`,
      question: `What are the main theories related to ${subTopicId.replace(/-/g, ' ')}?`,
      answer: "This is a sample answer for the psychology topic. Replace with actual content specific to this subtopic.",
      repetitions: 1,
      easeFactor: 2.3,
      interval: 6,
      nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

export const addSampleCardsToTopic = (topicId, subTopicId) => {
  const cards = generateSampleSrsCards(subTopicId);
  localStorage.setItem(`srs-cards-${subTopicId}`, JSON.stringify(cards));
  console.log(`Added ${cards.length} sample SRS cards to ${subTopicId}`);
  return cards;
};

export const addSampleCardsToAllTopics = () => {
  Object.keys(psychologyTopics).forEach(topicId => {
    const topic = psychologyTopics[topicId];
    topic.subTopics.forEach(subTopic => {
      addSampleCardsToTopic(topicId, subTopic.id);
    });
  });
  
  console.log('Added sample SRS cards to all topics');
};

// Function to call from browser console for testing
window.addSampleSrsCards = () => {
  addSampleCardsToAllTopics();
  window.location.reload();
}; 