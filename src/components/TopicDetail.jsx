import React, { useState } from "react";
import FlashcardView from "./FlashcardView";
import StudyContent from "./StudyContent";
import QuizView from "./QuizView";
import SocraticDialogue from "./SocraticDialogue";
import { UserCog } from "lucide-react";
import ConceptMapView from "./ConceptMapView";
import { nodes as cosmologicalNodes, edges as cosmologicalEdges } from '../data/cosmologicalArgumentConceptMap';
import { nodes as teleologicalNodes, edges as teleologicalEdges } from '../data/teleologicalArgumentConceptMap';
import { nodes as ontologicalNodes, edges as ontologicalEdges } from '../data/ontologicalArgumentConceptMap';
import { nodes as ancientPhilosophyNodes, edges as ancientPhilosophyEdges } from '../data/ancientPhilosophyConceptMap';
import { nodes as religiousExperienceNodes, edges as religiousExperienceEdges } from '../data/religiousExperienceConceptMap';
import { nodes as problemOfEvilNodes, edges as problemOfEvilEdges } from '../data/problemOfEvilConceptMap';
import { nodes as naturalLawNodes, edges as naturalLawEdges } from '../data/naturalLawConceptMap';
import { nodes as augustineTeachingsNodes, edges as augustineTeachingsEdges } from '../data/augustineTeachingsConceptMap';
import StudySession from "./StudySession";
import useTopicProgress from '../progress/useTopicProgress.js';
import { DEFAULT_THRESHOLDS, computeReinforceScore } from '../progress/progressLogic.js';
// Removed status badge display under Progressive Learning
import BedtimeStory from "./BedtimeStory";
import ExamineDashboard from "../examine/ExamineDashboard.jsx";

function TopicDetail({ topic, onBack }) {
  const [selectedSubTopic, setSelectedSubTopic] = useState(topic.subTopics[0]?.id || null);
  const [activeView, setActiveView] = useState(null);
  const [selectedStage, setSelectedStage] = useState('Learn');
  const [selectedOption, setSelectedOption] = useState('study');

  const progressId = `${topic.id}:${selectedSubTopic || ''}`;
  const { topicState, status, actions } = useTopicProgress(progressId);
  const thresholds = DEFAULT_THRESHOLDS;

  // Guidance message for current subtopic
  const hasLearned = !!(topicState?.learn?.study || topicState?.learn?.audioStory || topicState?.learn?.conceptMap);
  const currentRScore = computeReinforceScore(topicState?.reinforce || {});
  let guidance = { text: '', colorCls: 'bg-gray-100 text-gray-700 border-gray-200' };
  if (!hasLearned || currentRScore === null || currentRScore < thresholds.lowReinforce) {
    guidance = { text: 'Keep Learning', colorCls: 'bg-red-100 text-red-800 border-red-200' };
  } else if (currentRScore < thresholds.midReinforce) {
    guidance = { text: 'Keep Reinforcing', colorCls: 'bg-amber-100 text-amber-800 border-amber-200' };
  } else {
    guidance = { text: 'Ready for Exams in this Sub-Topic', colorCls: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
  }

  // Determine if ALL subtopics of this topic are exam-ready
  const allSubtopicsReady = (() => {
    try {
      const raw = localStorage.getItem('jaimie-progress-v1');
      const store = raw ? JSON.parse(raw) : {};
      return (topic.subTopics || []).every((st) => {
        const key = `${topic.id}:${st.id}`;
        const t = store[key];
        const rs = computeReinforceScore(t?.reinforce || {});
        return typeof rs === 'number' && rs >= thresholds.examReady;
      });
    } catch (_) {
      return false;
    }
  })();

  const sub = topic.subTopics.find((s) => s.id === selectedSubTopic);
  const sharedProps = {
    topic: {
      ...topic,
      subTopic: {
        id: sub?.id,
        title: sub?.title
      }
    },
    onBack: () => {
      setActiveView(null);
    }
  };

  const startSelected = () => {
    if (!selectedSubTopic) return;
    if (selectedStage === 'Learn') {
      if (selectedOption === 'study') {
        actions.recordLearnAccess('study');
        setActiveView('study');
      } else if (selectedOption === 'conceptMap') {
        actions.recordLearnAccess('conceptMap');
        setActiveView('conceptmap');
      } else if (selectedOption === 'audioStory') {
        actions.recordLearnAccess('audioStory');
        setActiveView('bedtime-story');
      } else if (selectedOption === 'socratic') {
        setActiveView('socratic');
      }
      return;
    }
    if (selectedStage === 'Reinforce') {
      if (selectedOption === 'flashcards') {
        setActiveView('flashcards');
      } else if (selectedOption === 'quiz') {
        setActiveView('quiz');
      } else if (selectedOption === 'socratic') {
        setActiveView('socratic');
      } else if (selectedOption === 'activeRecall') {
        setActiveView('study-session');
      }
      return;
    }
    if (selectedStage === 'Exam') {
      if (selectedOption === 'essay') {
        setActiveView('essay');
      } else if (selectedOption === 'pastPaper') {
        alert('Past Paper practice is available from the home page (Exam Practice).');
      }
    }
  };

  if (activeView === "study") {
    return <StudyContent {...sharedProps} />;
  }
  if (activeView === "study-session") {
    return <StudySession {...sharedProps} />;
  }
  if (activeView === "flashcards") {
    return <FlashcardView {...sharedProps} />;
  }
  if (activeView === "quiz") {
    return <QuizView {...sharedProps} />;
  }
  // Removed Timed Essay for AQA Psychology
  if (activeView === "socratic") {
    return (
      <div>
        <button
          className="text-blue-600 underline mb-4"
          onClick={() => setActiveView(null)}
        >
          ← Back to Study Methods
        </button>
        <SocraticDialogue topic={sub?.title || topic.title} duration={10} />
      </div>
    );
  }
  if (activeView === "bedtime-story") {
    return (
      <BedtimeStory
        onBack={() => setActiveView(null)}
        topic={{ id: topic.id, title: topic.title }}
        subTopic={{ id: sub?.id, title: sub?.title }}
      />
    );
  }
  if (activeView === "conceptmap") {
    // Philosophy concept maps
    if (sub?.id === 'cosmological') {
      return (
        <ConceptMapView 
          conceptMapData={{ nodes: cosmologicalNodes, edges: cosmologicalEdges }} 
          onBack={() => setActiveView(null)}
          topic={topic.title}
          subTopic={sub.title}
        />
      );
    }
    if (sub?.id === 'teleological') {
      return (
        <ConceptMapView 
          conceptMapData={{ nodes: teleologicalNodes, edges: teleologicalEdges }} 
          onBack={() => setActiveView(null)}
          topic={topic.title}
          subTopic={sub.title}
        />
      );
    }
    if (sub?.id === 'ontological') {
      return (
        <ConceptMapView 
          conceptMapData={{ nodes: ontologicalNodes, edges: ontologicalEdges }} 
          onBack={() => setActiveView(null)}
          topic={topic.title}
          subTopic={sub.title}
        />
      );
    }
    if (sub?.id === 'ancient-philosophical-influences') {
      return (
        <ConceptMapView 
          conceptMapData={{ nodes: ancientPhilosophyNodes, edges: ancientPhilosophyEdges }} 
          onBack={() => setActiveView(null)}
          topic={topic.title}
          subTopic={sub.title}
        />
      );
    }
    if (sub?.id === 'religious-experience') {
      return (
        <ConceptMapView 
          conceptMapData={{ nodes: religiousExperienceNodes, edges: religiousExperienceEdges }} 
          onBack={() => setActiveView(null)}
          topic={topic.title}
          subTopic={sub.title}
        />
      );
    }
    if (sub?.id === 'problem-of-evil') {
      return (
        <ConceptMapView 
          conceptMapData={{ nodes: problemOfEvilNodes, edges: problemOfEvilEdges }} 
          onBack={() => setActiveView(null)}
          topic={topic.title}
          subTopic={sub.title}
        />
      );
    }
    // Ethics concept maps
    if (sub?.id === 'natural-law') {
      return (
        <ConceptMapView 
          conceptMapData={{ nodes: naturalLawNodes, edges: naturalLawEdges }} 
          onBack={() => setActiveView(null)}
          topic={topic.title}
          subTopic={sub.title}
        />
      );
    }
    // Christianity concept maps
    if (sub?.id === 'augustines-teachings') {
      return (
        <ConceptMapView 
          conceptMapData={{ nodes: augustineTeachingsNodes, edges: augustineTeachingsEdges }} 
          onBack={() => setActiveView(null)}
          topic={topic.title}
          subTopic={sub.title}
        />
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <button className="text-blue-600 underline mb-4" onClick={() => setActiveView(null)}>
          ← Back to Study Methods
        </button>
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8 text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <div className="font-semibold text-gray-800">Concept Map Coming Soon</div>
          <div className="text-sm text-gray-600 mt-2">No concept map available for {sub?.title || 'this sub-topic'} yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-pink-100 to-pink-200 text-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <button className="text-blue-600 underline mb-4" onClick={onBack}>
          ← Back to Topics
        </button>
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {topic.title}
          </h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            {topic.description}
          </p>
        </div>
        <div className="flex flex-col gap-8">
          {/* Choose a Sub-Topic */}
          <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-purple-700 mb-2">Choose a Sub-Topic</h2>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Select a specific area to focus your study and revision.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topic.subTopics.map((sub) => (
                <button
                  key={sub.id}
                  className={`border rounded-lg shadow-sm p-4 font-semibold transition-all text-left ${
                    selectedSubTopic === sub.id
                      ? "ring-2 ring-blue-400 bg-blue-50 text-blue-900"
                      : "bg-gray-50 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedSubTopic(sub.id)}
                >
                  {sub.title}
                </button>
              ))}
            </div>
          </div>
          {/* Progressive Learning Panel */}
          <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-purple-700">Progressive Learning</h2>
              <div className={`mt-2 inline-block text-xs px-2 py-1 rounded-full border ${guidance.colorCls}`}>{guidance.text}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Learn Column */}
              <div className={`border rounded-lg p-4 h-full ${selectedStage === 'Learn' ? 'ring-2 ring-blue-400' : ''}`}>
                <div className="font-semibold mb-2">Learn</div>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between gap-2 p-2 rounded cursor-pointer ${selectedStage==='Learn' && selectedOption==='study' ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-gray-50'}`}> 
                    <span className="flex items-center gap-2">
                      <input type="radio" name="learn-option" checked={selectedStage==='Learn' && selectedOption==='study'} onChange={() => { setSelectedStage('Learn'); setSelectedOption('study'); }} />
                      <span>Study Content</span>
                    </span>
                    <span className="flex items-center gap-1">{topicState?.learn?.study ? <span title="Completed">✅</span> : null}<span>📘</span></span>
                  </label>
                  <label className={`flex items-center justify-between gap-2 p-2 rounded cursor-pointer ${selectedStage==='Learn' && selectedOption==='audioStory' ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-gray-50'}`}> 
                    <span className="flex items-center gap-2">
                      <input type="radio" name="learn-option" checked={selectedStage==='Learn' && selectedOption==='audioStory'} onChange={() => { setSelectedStage('Learn'); setSelectedOption('audioStory'); }} />
                      <span>Bedtime Story</span>
                    </span>
                    <span className="flex items-center gap-1">{topicState?.learn?.audioStory ? <span title="Completed">✅</span> : null}<span>🌙</span></span>
                  </label>
                  <label className={`flex items-center justify-between gap-2 p-2 rounded cursor-pointer ${selectedStage==='Learn' && selectedOption==='socratic' ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-gray-50'}`}> 
                    <span className="flex items-center gap-2">
                      <input type="radio" name="learn-option" checked={selectedStage==='Learn' && selectedOption==='socratic'} onChange={() => { setSelectedStage('Learn'); setSelectedOption('socratic'); }} />
                      <span>Socratic Method</span>
                    </span>
                    <span>🧔‍♂️</span>
                  </label>
                </div>
              </div>
              {/* Reinforce Column */}
              <div className={`border rounded-lg p-4 h-full ${selectedStage === 'Reinforce' ? 'ring-2 ring-blue-400' : ''}`}>
                <div className="font-semibold mb-2">Reinforce</div>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between gap-2 p-2 rounded cursor-pointer ${selectedStage==='Reinforce' && selectedOption==='flashcards' ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-gray-50'}`}> 
                    <span className="flex items-center gap-2">
                      <input type="radio" name="reinforce-option" checked={selectedStage==='Reinforce' && selectedOption==='flashcards'} onChange={() => { setSelectedStage('Reinforce'); setSelectedOption('flashcards'); }} />
                      <span>Flashcards</span>
                    </span>
                    <span>🔁</span>
                  </label>
                  <label className={`flex items-center justify-between gap-2 p-2 rounded cursor-pointer ${selectedStage==='Reinforce' && selectedOption==='quiz' ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-gray-50'}`}> 
                    <span className="flex items-center gap-2">
                      <input type="radio" name="reinforce-option" checked={selectedStage==='Reinforce' && selectedOption==='quiz'} onChange={() => { setSelectedStage('Reinforce'); setSelectedOption('quiz'); }} />
                      <span>Quiz</span>
                    </span>
                    <span>🧠</span>
                  </label>
                  <label className={`flex items-center justify-between gap-2 p-2 rounded cursor-pointer ${selectedStage==='Reinforce' && selectedOption==='activeRecall' ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-gray-50'}`}> 
                    <span className="flex items-center gap-2">
                      <input type="radio" name="reinforce-option" checked={selectedStage==='Reinforce' && selectedOption==='activeRecall'} onChange={() => { setSelectedStage('Reinforce'); setSelectedOption('activeRecall'); }} />
                      <span>Active Recall</span>
                    </span>
                    <span>🎯</span>
                  </label>
                  {/* Reinforce progress information moved below the Reinforce options */}
                  <div className="mt-2 space-y-2">
                    <div className="text-xs font-medium text-gray-700">Reinforce Progress</div>
                    <div className="flex items-center text-xs">
                      <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
                        <div className={`${Number.isFinite(currentRScore) ? 'bg-blue-600' : 'bg-gray-300'}`} style={{ width: `${Number.isFinite(currentRScore) ? currentRScore : 0}%`, height: '100%' }} />
                      </div>
                      <div className="ml-2 text-gray-600">{Number.isFinite(currentRScore) ? `${currentRScore}%` : '—'}</div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Flashcards: {Number.isFinite(topicState?.reinforce?.flashAvgPct) ? `${topicState.reinforce.flashAvgPct}%` : '—'} • Quiz: {Number.isFinite(topicState?.reinforce?.quizAvgPct) ? `${topicState.reinforce.quizAvgPct}%` : '—'}
                    </div>
                    <div className="text-xs text-gray-600">
                      Sessions: Flashcards ×{topicState?.reinforce?.flashAttempts || 0} • Quiz ×{topicState?.reinforce?.quizAttempts || 0}
                    </div>
                  </div>
                </div>
              </div>
              {/* Exam Column removed; exams will be in a separate page */}
            </div>
            <div className="flex items-center justify-between">
              <button className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800" onClick={startSelected}>Start</button>
              <button
                disabled={!allSubtopicsReady}
                onClick={() => setActiveView('examine')}
                className={`px-4 py-2 rounded-lg font-semibold ${allSubtopicsReady ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                title={allSubtopicsReady ? 'Begin exam practice for this topic' : 'Make all sub-topics exam-ready to unlock'}
              >
                Start Examining
              </button>
            </div>
          </div>

          {/* Examine Section */}
          {activeView === 'examine' && (
            <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-purple-700">Examine</h2>
              </div>
              <ExamineDashboard topicId={topic.id} topicTitle={topic.title} />
            </div>
          )}
          {/* Choose Your Study Method */}
          <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-purple-700 mb-2">Choose Your Study Method</h2>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Select how you'd like to engage with <strong>{sub?.title}</strong>.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveView("study")}
                className="border border-green-200 rounded-lg shadow-sm p-4 hover:shadow-md transition hover:bg-green-50 bg-gray-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📘</div>
                  <div className="font-semibold text-green-800">Study Content</div>
                  <div className="text-xs text-gray-600 mt-1">AI-powered explanations</div>
                </div>
              </button>
              <button
                onClick={() => setActiveView("study-session")}
                className="border border-emerald-200 rounded-lg shadow-sm p-4 hover:shadow-md transition hover:bg-emerald-50 bg-gray-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-semibold text-emerald-800">Active Recall Session</div>
                  <div className="text-xs text-gray-600 mt-1">AO1 → AO3 → Scenario</div>
                </div>
              </button>
              <button
                onClick={() => { actions.recordLearnAccess('audioStory'); setActiveView("bedtime-story"); }}
                className="border border-indigo-200 rounded-lg shadow-sm p-4 hover:shadow-md transition hover:bg-indigo-50 bg-gray-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🌙</div>
                  <div className="font-semibold text-indigo-800">Bedtime Story</div>
                  <div className="text-xs text-gray-600 mt-1">5–6 min narrated lesson</div>
                </div>
              </button>
              <button
                onClick={() => setActiveView("quiz")}
                className="border border-blue-200 rounded-lg shadow-sm p-4 hover:shadow-md transition hover:bg-blue-50 bg-gray-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🧠</div>
                  <div className="font-semibold text-blue-800">Practice Quiz</div>
                  <div className="text-xs text-gray-600 mt-1">Test your knowledge</div>
                </div>
              </button>
              <button
                onClick={() => setActiveView("flashcards")}
                className="border border-purple-200 rounded-lg shadow-sm p-4 hover:shadow-md transition hover:bg-purple-50 bg-gray-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🔁</div>
                  <div className="font-semibold text-purple-800">Flashcards</div>
                  <div className="text-xs text-gray-600 mt-1">Review key concepts</div>
                </div>
              </button>
              {/* Socratic Method Pane */}
              <button
                onClick={() => setActiveView("socratic")}
                className="border border-gray-300 rounded-lg shadow-sm p-4 hover:shadow-md transition hover:bg-yellow-50 bg-gray-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🧔‍♂️</div>
                  <div className="font-semibold text-yellow-800">Socratic Method</div>
                  <div className="text-xs text-gray-600 mt-1">Discuss this topic</div>
                </div>
              </button>
              {/* Concept Map Pane */}
              <button
                onClick={() => setActiveView("conceptmap")}
                className="border border-pink-200 rounded-lg shadow-sm p-4 hover:shadow-md transition hover:bg-pink-50 bg-gray-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🗺️</div>
                  <div className="font-semibold text-pink-800">Concept Map</div>
                  <div className="text-xs text-gray-600 mt-1">Visualise this sub-topic</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicDetail;
