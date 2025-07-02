import React from 'react';
import { topicData } from '../topicData';

const ocrSpec = [
  {
    component: 'Philosophy',
    topics: [
      {
        title: 'Ancient philosophical influences',
        subTopics: [
          'Plato: Forms, cave, reason',
          'Aristotle: Four causes, Prime Mover, empiricism'
        ]
      },
      {
        title: 'Soul, mind and body',
        subTopics: [
          'Dualism, materialism',
          'Plato, Aristotle, Descartes'
        ]
      },
      {
        title: 'Arguments for the existence of God',
        subTopics: [
          'Cosmological',
          'Teleological',
          'Ontological',
          'Critiques'
        ]
      },
      {
        title: 'Religious experience',
        subTopics: [
          'Types, significance',
          'Otto, James',
          'Critiques'
        ]
      },
      {
        title: 'Problem of evil',
        subTopics: [
          'Logical, evidential',
          'Theodicies',
          'Augustine, Hick'
        ]
      },
      {
        title: 'Nature/attributes of God',
        subTopics: [
          'Omnipotence, omniscience, benevolence, eternity, free will'
        ]
      },
      {
        title: 'Religious language',
        subTopics: [
          'Via negativa',
          'Analogy',
          'Symbol',
          'Verification/falsification',
          'Language games'
        ]
      }
    ]
  },
  {
    component: 'Ethics',
    topics: [
      {
        title: 'Natural Law',
        subTopics: [
          'Aquinas',
          'Precepts',
          'Reason',
          'Double effect',
          'Application'
        ]
      },
      {
        title: 'Situation Ethics',
        subTopics: [
          'Agape',
          'Six propositions',
          'Four working principles',
          'Conscience',
          'Application'
        ]
      },
      {
        title: 'Kantian Ethics',
        subTopics: [
          'Duty',
          'Categorical imperative',
          'Critiques',
          'Application'
        ]
      },
      {
        title: 'Utilitarianism',
        subTopics: [
          'Bentham',
          'Mill',
          'Singer',
          'Critiques',
          'Application'
        ]
      },
      {
        title: 'Euthanasia',
        subTopics: [
          'Application of theories',
          'Sanctity/quality of life',
          'Autonomy',
          'Law'
        ]
      },
      {
        title: 'Business Ethics',
        subTopics: [
          'CSR',
          'Whistleblowing',
          'Globalisation',
          'Application of theories'
        ]
      },
      {
        title: 'Meta-ethics',
        subTopics: [
          'Moral language',
          'Cognitivism/non-cognitivism'
        ]
      },
      {
        title: 'Conscience',
        subTopics: [
          'Aquinas',
          'Freud',
          'Nature and role'
        ]
      },
      {
        title: 'Sexual Ethics',
        subTopics: [
          'Marriage',
          'Contraception',
          'LGBTQ+',
          'Influence of religion'
        ]
      }
    ]
  },
  {
    component: 'Christianity',
    topics: [
      {
        title: 'Religious beliefs, values and teachings',
        subTopics: [
          'Key doctrines',
          'Historical/contemporary variation'
        ]
      },
      {
        title: 'Sources of religious wisdom and authority',
        subTopics: [
          'Bible',
          'Tradition',
          'Reason',
          'Experience'
        ]
      },
      {
        title: 'Practices shaping religious identity',
        subTopics: [
          'Worship',
          'Sacraments',
          'Community'
        ]
      },
      {
        title: 'Significant social/historical developments',
        subTopics: [
          'Gender',
          'Pluralism',
          'Secularism',
          'Other contemporary issues'
        ]
      },
      {
        title: 'Religion and society',
        subTopics: [
          'Science',
          'Politics',
          'Ethics',
          'Interfaith',
          'Other themes'
        ]
      }
    ]
  }
];

const getAppTopicsByComponent = (component) => {
  // Custom mapping for Philosophy to align Evil and Suffering, Nature of God, and Miracles
  if (component === 'Philosophy') {
    const appTopics = Object.values(topicData)
      .filter(t => t.component === component);
    // Custom order for Philosophy topics to match OCR spec
    const customOrder = [
      'Ancient Philosophical Influences',
      'Soul, Mind and Body',
      'Arguments for the Existence of God',
      'Religious Experience',
      'Evil and Suffering',
      'Nature or Attributes of God',
      'Religious Language',
      'Miracles'
    ];
    // Map custom order to app topics
    return customOrder.map(title => {
      const found = appTopics.find(t => t.title === title);
      return found ? {
        title: found.title,
        subTopics: found.subTopics ? found.subTopics.map(st => st.title) : []
      } : {};
    });
  }
  // Default for other components
  return Object.values(topicData)
    .filter(t => t.component === component)
    .map(t => ({
      title: t.title,
      subTopics: t.subTopics ? t.subTopics.map(st => st.title) : []
    }));
};

const OCRComparisonPage = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 px-4 py-8">
      <button className="text-blue-600 underline mb-6" onClick={onBack}>
        ← Back to Home
      </button>
      <h1 className="text-3xl font-bold mb-6 text-center">OCR Spec vs App Topics</h1>
      {ocrSpec.map(section => (
        <div key={section.component} className="mb-10">
          <h2 className="text-2xl font-semibold text-purple-700 mb-2">{section.component}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="bg-indigo-100">
                  <th className="p-3 border-b border-gray-300 text-left">OCR Spec</th>
                  <th className="p-3 border-b border-gray-300 text-left">App Topics</th>
                </tr>
              </thead>
              <tbody>
                {section.topics.map((ocrTopic, idx) => {
                  const appTopics = getAppTopicsByComponent(section.component);
                  let appTopic = appTopics[idx] || {};
                  // Special handling for Philosophy: add note for Miracles
                  let extraNote = null;
                  if (section.component === 'Philosophy' && ocrTopic.title === 'Religious experience') {
                    // If Miracles is a separate topic, suggest integration
                    const miraclesTopic = appTopics.find(t => t.title === 'Miracles');
                    if (miraclesTopic) {
                      extraNote = (
                        <div className="mt-2 text-xs text-blue-700">
                          <strong>Note:</strong> The app includes 'Miracles' as a separate topic. This could be integrated under 'Religious Experience' or 'Arguments for the Existence of God' to match the OCR spec structure.
                        </div>
                      );
                    }
                  }
                  return (
                    <tr key={ocrTopic.title} className="align-top">
                      <td className="p-3 border-b border-gray-200 w-1/2">
                        <div className="font-semibold">{ocrTopic.title}</div>
                        <ul className="list-disc ml-5 text-sm">
                          {ocrTopic.subTopics.map(st => (
                            <li key={st}>{st}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3 border-b border-gray-200 w-1/2">
                        <div className="font-semibold">{appTopic.title || <span className="italic text-gray-400">(No direct match)</span>}</div>
                        <ul className="list-disc ml-5 text-sm">
                          {(appTopic.subTopics || []).map(st => (
                            <li key={st}>{st}</li>
                          ))}
                        </ul>
                        {extraNote}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <div className="text-center text-xs text-gray-500 mt-8">This table shows how the app's topics and sub-topics align with the official OCR H573 specification.</div>
    </div>
  );
};

export default OCRComparisonPage; 