import React, { useState, useEffect, useRef } from "react";
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
import { logPlannerEvent } from "../progress/plannerEvents";
import useTopicProgress from '../progress/useTopicProgress.js';
import { getAllAttemptStats, formatLastAttempt, logAttempt } from '../utils/attemptTracker';
import { DEFAULT_THRESHOLDS, computeReinforceScore } from '../progress/progressLogic.js';
// Removed status badge display under Progressive Learning
import BedtimeStory from "./BedtimeStory";
import ExamineDashboard from "../examine/ExamineDashboard.jsx";
import { getSelectedCurriculum } from '../config/curricula';
import { getEnglishParts } from '../config/englishParts';
import EnglishQuotationsView from './EnglishQuotationsView';
import EnglishSummaryView from './EnglishSummaryView';
import EnglishThemesView from './EnglishThemesView';
import EnglishCriticismView from './EnglishCriticismView';
import EnglishExamView from './EnglishExamView';
import EnglishAskView from './EnglishAskView';
import { getEnglishTextURL } from '../config/englishTextLinks';
import EnglishPastPapersView from './EnglishPastPapersView';

function TopicDetail({ topic, onBack }) {
  const [selectedSubTopic, setSelectedSubTopic] = useState(topic.subTopics[0]?.id || null);
  const [selectedPart, setSelectedPart] = useState('summary');
  const [activeView, setActiveView] = useState(null);
  const [selectedStage, setSelectedStage] = useState('Learn');
  const [selectedOption, setSelectedOption] = useState('study');
  const [showTextModal, setShowTextModal] = useState(false);

  const progressId = `${topic.id}:${selectedSubTopic || ''}`;
  const { topicState, status, actions } = useTopicProgress(progressId);
  const thresholds = DEFAULT_THRESHOLDS;
  // Bedtime story preloading disabled

  // Attempt tracking for Reinforce modes
  const [attemptStats, setAttemptStats] = useState({ flashcards: { count: 0, lastAttempt: null }, quiz: { count: 0, lastAttempt: null }, recall: { count: 0, lastAttempt: null } });
  
  useEffect(() => {
    if (topic?.id && selectedSubTopic) {
      setAttemptStats(getAllAttemptStats(topic.id, selectedSubTopic));
    }
  }, [topic?.id, selectedSubTopic]);

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
  const isEngLit = (getSelectedCurriculum && getSelectedCurriculum()) === 'edexcel-englit';
  const englishParts = isEngLit ? getEnglishParts(topic.id) : [];
  const openEnglishText = () => {
    try {
      const url = getEnglishTextURL(topic.id, selectedPart);
      if (url) {
        setShowTextModal(true);
      } else {
        alert('Full text not available for this title due to copyright. Please use your set text or school login.');
      }
    } catch(_) {}
  };
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
      // Bedtime story background preload disabled
      if (selectedOption === 'conceptMap') {
        actions.recordLearnAccess('conceptMap');
        setActiveView('timed-30');
      } else if (selectedOption === 'audioStory') {
        actions.recordLearnAccess('audioStory');
        setActiveView('timed-bedtime');
      } else if (selectedOption === 'socratic') {
        setActiveView('timed-socratic');
      } else if (selectedOption === 'study') {
        actions.recordLearnAccess('study');
        setActiveView('timed-30');
      }
      return;
    }
    if (selectedStage === 'Reinforce') {
      if (selectedOption === 'flashcards') {
        logAttempt(topic.id, selectedSubTopic, 'flashcards');
        setAttemptStats(getAllAttemptStats(topic.id, selectedSubTopic));
        setActiveView('flashcards');
      } else if (selectedOption === 'quiz') {
        logAttempt(topic.id, selectedSubTopic, 'quiz');
        setAttemptStats(getAllAttemptStats(topic.id, selectedSubTopic));
        setActiveView('quiz');
      } else if (selectedOption === 'socratic') {
        setActiveView('socratic');
      } else if (selectedOption === 'activeRecall') {
        logAttempt(topic.id, selectedSubTopic, 'recall');
        setAttemptStats(getAllAttemptStats(topic.id, selectedSubTopic));
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
  if (activeView === "timed-30") {
    return (
      <TimedLearnWrapper
        title="Learning Session"
        minutes={30}
        onBack={() => setActiveView(null)}
        onCompletePrompt={() => { try { logPlannerEvent({ phase:'learn', topicId: topic.id, subId: sub?.id, theme: sub?.title, curriculum: null }); } catch(_){}; setActiveView('reinforce-prompt'); }}
      >
        <StudyContent {...sharedProps} />
      </TimedLearnWrapper>
    );
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
  if (activeView === "eng-ask") {
    return (
      <div className={`englit-scope bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <button className="text-blue-600 underline" onClick={() => setActiveView(null)}>← Back to Study Methods</button>
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{topic.title}</h2>
            <div className="text-sm text-gray-700">{sub?.title}{isEngLit && selectedPart ? <> — <span className="text-emerald-700">{(englishParts.find(p=>p.id===selectedPart)?.label) || ''}</span></> : null}</div>
          </div>
          <EnglishAskView topicId={topic.id} topicTitle={topic.title} partId={selectedPart} partLabel={(englishParts.find(p=>p.id===selectedPart)?.label)||''} />
        </div>
      </div>
    );
  }
  if (activeView === "eng-summary") {
    return (
      <div className={`englit-scope bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <button className="text-blue-600 underline" onClick={() => setActiveView(null)}>← Back to Study Methods</button>
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{topic.title}</h2>
            <div className="text-sm text-gray-700">{sub?.title}{isEngLit && selectedPart ? <> — <span className="text-emerald-700">{(englishParts.find(p=>p.id===selectedPart)?.label) || ''}</span></> : null}</div>
          </div>
          <EnglishSummaryView topicId={topic.id} topicTitle={topic.title} partId={selectedPart} partLabel={(englishParts.find(p=>p.id===selectedPart)?.label)||''} />
        </div>
      </div>
    );
  }
  if (activeView === "eng-themes") {
    return (
      <div className={`englit-scope bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <button className="text-blue-600 underline" onClick={() => setActiveView(null)}>← Back to Study Methods</button>
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{topic.title}</h2>
            <div className="text-sm text-gray-700">{sub?.title}{isEngLit && selectedPart ? <> — <span className="text-emerald-700">{(englishParts.find(p=>p.id===selectedPart)?.label) || ''}</span></> : null}</div>
          </div>
          <EnglishThemesView topicId={topic.id} topicTitle={topic.title} partId={selectedPart} partLabel={(englishParts.find(p=>p.id===selectedPart)?.label)||''} />
        </div>
      </div>
    );
  }
  if (activeView === "eng-criticism") {
    return (
      <div className={`englit-scope bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <button className="text-blue-600 underline" onClick={() => setActiveView(null)}>← Back to Study Methods</button>
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{topic.title}</h2>
            <div className="text-sm text-gray-700">{sub?.title}{isEngLit && selectedPart ? <> — <span className="text-emerald-700">{(englishParts.find(p=>p.id===selectedPart)?.label) || ''}</span></> : null}</div>
          </div>
          <EnglishCriticismView topicId={topic.id} topicTitle={topic.title} partId={selectedPart} partLabel={(englishParts.find(p=>p.id===selectedPart)?.label)||''} />
        </div>
      </div>
    );
  }
  if (activeView === "eng-exam") {
    return (
      <div className={`englit-scope bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <button className="text-blue-600 underline" onClick={() => setActiveView(null)}>← Back to Study Methods</button>
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{topic.title}</h2>
            <div className="text-sm text-gray-700">{sub?.title}{isEngLit && selectedPart ? <> — <span className="text-emerald-700">{(englishParts.find(p=>p.id===selectedPart)?.label) || ''}</span></> : null}</div>
          </div>
          <EnglishExamView topicId={topic.id} topicTitle={topic.title} partId={selectedPart} partLabel={(englishParts.find(p=>p.id===selectedPart)?.label)||''} />
        </div>
      </div>
    );
  }
  if (activeView === "eng-past") {
    return (
      <div className={`englit-scope bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <button className="text-blue-600 underline" onClick={() => setActiveView(null)}>← Back to Study Methods</button>
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{topic.title}</h2>
            <div className="text-sm text-gray-700">{sub?.title}</div>
          </div>
          <EnglishPastPapersView topicId={topic.id} topicTitle={topic.title} />
        </div>
      </div>
    );
  }
  if (activeView === "eng-quotations") {
    return (
      <div className={`bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <button className="text-blue-600 underline" onClick={() => setActiveView(null)}>← Back to Study Methods</button>
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{topic.title}</h2>
            <div className="text-sm text-gray-700">{sub?.title}{isEngLit && selectedPart ? <> — <span className="text-emerald-700">{(englishParts.find(p=>p.id===selectedPart)?.label) || ''}</span></> : null}</div>
          </div>
          <EnglishQuotationsView
            topicId={topic.id}
            topicTitle={topic.title}
            partId={selectedPart}
            partLabel={(englishParts.find(p=>p.id===selectedPart)?.label) || ''}
          />
        </div>
      </div>
    );
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
  if (activeView === "timed-socratic") {
    return (
      <TimedLearnWrapper
        title="Socratic Method"
        minutes={10}
        onBack={() => setActiveView(null)}
        onCompletePrompt={() => { try { logPlannerEvent({ phase:'learn', topicId: topic.id, subId: sub?.id, theme: sub?.title, curriculum: null }); } catch(_){}; setActiveView('reinforce-prompt'); }}
      >
        <div className="mb-4">
          <SocraticDialogue topic={sub?.title || topic.title} duration={10} />
        </div>
      </TimedLearnWrapper>
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
  if (activeView === "timed-bedtime") {
    return (
      <TimedLearnWrapper
        title="Bedtime Story"
        minutes={6}
        onBack={() => setActiveView(null)}
        onCompletePrompt={() => { try { logPlannerEvent({ phase:'learn', topicId: topic.id, subId: sub?.id, theme: sub?.title, curriculum: null }); } catch(_){}; setActiveView('reinforce-prompt'); }}
      >
        <BedtimeStory
          onBack={() => setActiveView(null)}
          topic={{ id: topic.id, title: topic.title }}
          subTopic={{ id: sub?.id, title: sub?.title }}
        />
      </TimedLearnWrapper>
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
    <div className={`bg-gradient-to-br ${((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='ocr-rs') ? 'from-blue-50 to-blue-100' : ((window?.localStorage?.getItem('curriculum')||'aqa-psych')==='edexcel-englit' ? 'from-emerald-50 to-emerald-100' : 'from-pink-100 to-pink-200')} text-gray-800 min-h-screen`}>
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
          {/* Choose a Sub-Topic (hidden for English Lit) */}
          {!isEngLit && (
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
                    onClick={() => { setSelectedSubTopic(sub.id); }}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isEngLit && englishParts.length > 0 && (
            <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-purple-700">{topic.id === 'poems-of-the-decade' || topic.id === 'keats-selected' ? 'Select Poem' : 'Select Part'}</h2>
                <p className="text-sm text-gray-600 max-w-2xl mx-auto">{topic.id === 'poems-of-the-decade' || topic.id === 'keats-selected' ? 'Choose a poem to focus your analysis.' : 'Choose Summary or a chapter/scene before opening tools.'}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {englishParts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPart(p.id)}
                    className={`px-3 py-2 rounded border text-left text-sm font-medium ${selectedPart===p.id ? 'bg-emerald-50 border-2 border-emerald-500 ring-2 ring-emerald-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <div className="font-semibold text-gray-900">{p.label}</div>
                    {p.desc && <div className="text-xs text-gray-600">{p.desc}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Reinforce & Revise Panel */}
          <div className="bg-white border rounded-lg shadow-sm p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-purple-700">{isEngLit ? 'English Study Modes' : 'Reinforce & Revise'}</h2>
              <p className="text-sm text-gray-600 mt-1">Select a study mode and press Start</p>
            </div>

            {/* English Lit specific modes */}
            {isEngLit && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={openEnglishText} className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">📖 The Text</button>
                <button onClick={() => setActiveView('eng-summary')} className={`px-4 py-3 rounded-xl font-semibold transition ${activeView==='eng-summary' ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-gray-100 hover:bg-gray-200'}`}>📝 Summary</button>
                <button onClick={() => setActiveView('eng-themes')} className={`px-4 py-3 rounded-xl font-semibold transition ${activeView==='eng-themes' ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-gray-100 hover:bg-gray-200'}`}>🏷️ Themes</button>
                <button onClick={() => setActiveView('eng-criticism')} className={`px-4 py-3 rounded-xl font-semibold transition ${activeView==='eng-criticism' ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-gray-100 hover:bg-gray-200'}`}>📚 Critical Analysis</button>
                <button onClick={() => setActiveView('eng-ask')} className={`px-4 py-3 rounded-xl font-semibold transition ${activeView==='eng-ask' ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-gray-100 hover:bg-gray-200'}`}>💡 Ask AI</button>
                <button onClick={() => setActiveView('eng-exam')} className={`px-4 py-3 rounded-xl font-semibold transition ${activeView==='eng-exam' ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-gray-100 hover:bg-gray-200'}`}>🧪 Exam Relevance</button>
                <button onClick={() => setActiveView('eng-past')} className={`px-4 py-3 rounded-xl font-semibold transition ${activeView==='eng-past' ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-gray-100 hover:bg-gray-200'}`}>📝 Past Papers</button>
              </div>
            )}

            {/* Main Reinforce buttons - Flashcards, Quiz, Active Recall */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <button
                  onClick={() => { setSelectedStage('Reinforce'); setSelectedOption('flashcards'); }}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    selectedStage === 'Reinforce' && selectedOption === 'flashcards'
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-400'
                      : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-4xl">🔁</span>
                  <span className="text-lg font-semibold text-purple-800">Flashcards</span>
                  <span className="text-xs text-gray-600">Review key concepts</span>
                </button>
                <div className="mt-2 text-center text-xs text-gray-500 bg-gray-50 rounded-lg py-2 px-3">
                  <div>Last: <span className="font-medium">{formatLastAttempt(attemptStats.flashcards.lastAttempt)}</span></div>
                  <div>Attempts: <span className="font-medium">{attemptStats.flashcards.count}</span></div>
                </div>
              </div>

              <div className="flex flex-col">
                <button
                  onClick={() => { setSelectedStage('Reinforce'); setSelectedOption('quiz'); }}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    selectedStage === 'Reinforce' && selectedOption === 'quiz'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <span className="text-4xl">🧠</span>
                  <span className="text-lg font-semibold text-blue-800">Quiz</span>
                  <span className="text-xs text-gray-600">Test your knowledge</span>
                </button>
                <div className="mt-2 text-center text-xs text-gray-500 bg-gray-50 rounded-lg py-2 px-3">
                  <div>Last: <span className="font-medium">{formatLastAttempt(attemptStats.quiz.lastAttempt)}</span></div>
                  <div>Attempts: <span className="font-medium">{attemptStats.quiz.count}</span></div>
                </div>
              </div>

              <div className="flex flex-col">
                <button
                  onClick={() => { setSelectedStage('Reinforce'); setSelectedOption('activeRecall'); }}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    selectedStage === 'Reinforce' && selectedOption === 'activeRecall'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                      : 'border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <span className="text-4xl">🎯</span>
                  <span className="text-lg font-semibold text-emerald-800">Active Recall</span>
                  <span className="text-xs text-gray-600">AO1 → AO2 → AO3</span>
                </button>
                <div className="mt-2 text-center text-xs text-gray-500 bg-gray-50 rounded-lg py-2 px-3">
                  <div>Last: <span className="font-medium">{formatLastAttempt(attemptStats.recall.lastAttempt)}</span></div>
                  <div>Attempts: <span className="font-medium">{attemptStats.recall.count}</span></div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{Number.isFinite(currentRScore) ? `${currentRScore}%` : '0%'}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300" 
                  style={{ width: `${Number.isFinite(currentRScore) ? currentRScore : 0}%` }} 
                />
              </div>
            </div>

            {/* Start button */}
            <div className="flex justify-center">
              <button 
                className="px-8 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all" 
                onClick={startSelected}
              >
                Start
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
          {activeView === 'reinforce-prompt' && (
            <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-purple-700">Great work! Ready to Reinforce?</h2>
                <p className="text-sm text-gray-600 mt-1">Choose one to continue your learning pathway.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => setActiveView('flashcards')} className="border rounded-lg p-4 hover:bg-purple-50">🔁 Flashcards</button>
                <button onClick={() => setActiveView('quiz')} className="border rounded-lg p-4 hover:bg-blue-50">🧠 Quiz</button>
                <button onClick={() => setActiveView('study-session')} className="border rounded-lg p-4 hover:bg-emerald-50">🎯 Active Recall</button>
              </div>
            </div>
          )}
          {/* Choose Your Study Method */}
          <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-purple-700 mb-2">Choose Your Study Method</h2>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Select how you'd like to engage with <strong>{sub?.title}</strong>{isEngLit && selectedPart ? <> — <span className="text-emerald-700">{(englishParts.find(p=>p.id===selectedPart)?.label) || ''}</span></> : null}.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Study Content */}
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
              {/* Bedtime Story */}
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
              {/* Socratic Method */}
              <button
                onClick={() => setActiveView("socratic")}
                className="border border-yellow-200 rounded-lg shadow-sm p-4 hover:shadow-md transition hover:bg-yellow-50 bg-gray-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🧔‍♂️</div>
                  <div className="font-semibold text-yellow-800">Socratic Method</div>
                  <div className="text-xs text-gray-600 mt-1">Discuss this topic</div>
                </div>
              </button>
              {/* Concept Map */}
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
              {/* Quotations - English Lit only */}
              {isEngLit && (
                <button
                  onClick={() => setActiveView("eng-quotations")}
                  className="border border-emerald-200 rounded-lg shadow-sm p-4 hover:shadow-md transition hover:bg-emerald-50 bg-gray-50"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💬</div>
                    <div className="font-semibold text-emerald-800">Quotations</div>
                    <div className="text-xs text-gray-600 mt-1">Key quotes + AO usage</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showTextModal && (() => {
        const base = getEnglishTextURL(topic.id, selectedPart);
        const src = base ? (base + (base.includes('?') ? '&' : '?') + 'action=render') : '';
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="font-semibold text-gray-800">{topic.title}{isEngLit && selectedPart ? <> — <span className="text-emerald-700">{(getEnglishParts(topic.id).find(p=>p.id===selectedPart)?.label) || ''}</span></> : null}</div>
                <div className="flex items-center gap-2">
                  {base && (
                    <a href={base} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Open in new tab</a>
                  )}
                  <button onClick={()=>setShowTextModal(false)} className="px-3 py-1 rounded border text-sm">Close</button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {src ? (
                  <iframe title="Original Text" src={src} className="w-full h-full" />
                ) : (
                  <div className="p-4 text-sm text-gray-700">Full text not available.</div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default TopicDetail;

// Timed learning wrapper for Progressive Learning sessions
function TimedLearnWrapper({ title, minutes, onBack, onCompletePrompt, children }) {
  const [remaining, setRemaining] = useState(minutes * 60);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setDone(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button className="text-blue-600 underline" onClick={onBack}>← Back</button>
        <div className="mt-3 bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div className="font-semibold text-gray-800">{title}</div>
          <div className={`text-lg font-mono px-3 py-1 rounded ${done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-800'}`}>{mm}:{ss}</div>
        </div>
        <div className="mt-4">
          {children}
        </div>
        {done && (
          <div className="mt-6 bg-white rounded-lg border p-4 text-center">
            <div className="font-semibold text-gray-800">Session complete</div>
            <p className="text-sm text-gray-600 mt-1">Nice work. Continue with Reinforce to consolidate learning.</p>
            <button onClick={onCompletePrompt} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded">Go to Reinforce</button>
          </div>
        )}
      </div>
    </div>
  );
}
