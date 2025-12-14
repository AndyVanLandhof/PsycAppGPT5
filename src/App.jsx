import React, { useState } from 'react';
import psychologyTopics from './psychologyTopics';
import englishLitTopics from './englishLitTopics';
import TopicDetail from './components/TopicDetail';
import SettingsPanel from './components/SettingsPanel';
import TaughtContent from './pages/TaughtContent.jsx';
import VaultTester from './components/VaultTester';
import ExamPractice from './components/ExamPractice';
import ProgressDashboard from './components/ProgressDashboard';
import SRSDashboard from './components/SRSDashboard';
import { BookOpen, Settings, TrendingUp, RefreshCw, Brain, FlaskConical, Users, Heart, Layers, Scale, Landmark, ScrollText, Microscope, Flame, Fingerprint, GraduationCap, Activity, Sun, Globe, Feather, Pill, Briefcase, Crown, Eye, Infinity, PieChart, Building, Sparkles, Quote, Leaf, Moon } from 'lucide-react';
import { resetAllProgressStorage } from './progress/progressLogic.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import './utils/srsCardGenerator';
import TopicPage from './pages/TopicPage.jsx';
import ExaminePage from './pages/ExaminePage.jsx';
import BankGenerator from './pages/BankGenerator.jsx';
import QuizLab from './pages/QuizLab.jsx';
import QuizBankReview from './pages/QuizBankReview.jsx';
import VaultDirectory from './pages/VaultDirectory.jsx';
import Planner from './pages/Planner.jsx';
import ActualPastPapers from './pages/ActualPastPapers.jsx';
import SyntheticPastPapers from './pages/SyntheticPastPapers.jsx';
import { CURRICULA, getSelectedCurriculum, setSelectedCurriculum } from './config/curricula.js';
import { topicData as rsTopicsAll } from './topicData.js';
import { KUsBySubTopic } from './data/knowledgeMaps';

// Helper: group topics by component
const getTopicsByComponent = (comp, topicsSrc) =>
  Object.values(topicsSrc).filter(t => t.component === comp);

function TopicCard({ topic, onClick }) {
  const iconEl = (() => {
    const curr = getSelectedCurriculum() || 'aqa-psych';
    const baseSize = 'w-6 h-6 md:w-7 md:h-7';
    const colorWrap = curr === 'ocr-rs' ? 'bg-yellow-100' : 'bg-indigo-50';
    const colorIcon = curr === 'ocr-rs' ? 'text-yellow-700' : 'text-indigo-600';
    const cls = `${baseSize} ${colorIcon}`;
    if (curr === 'ocr-rs') {
      switch (topic.id) {
        // Philosophy
        case 'ancient-philosophical-influences': return <div className={`p-1 rounded-full ${colorWrap}`}><ScrollText className={cls}/></div>;
        case 'soul-mind-body': return <div className={`p-1 rounded-full ${colorWrap}`}><Brain className={cls}/></div>;
        case 'nature-attributes-god': return <div className={`p-1 rounded-full ${colorWrap}`}><Sun className={cls}/></div>;
        case 'arguments-existence-god': return <div className={`p-1 rounded-full ${colorWrap}`}><Infinity className={cls}/></div>;
        case 'problem-of-evil': return <div className={`p-1 rounded-full ${colorWrap}`}><Flame className={cls}/></div>;
        case 'religious-experience': return <div className={`p-1 rounded-full ${colorWrap}`}><Eye className={cls}/></div>;
        case 'religious-language': return <div className={`p-1 rounded-full ${colorWrap}`}><Quote className={cls}/></div>;
        case 'miracles': return <div className={`p-1 rounded-full ${colorWrap}`}><Sparkles className={cls}/></div>;

        // Ethics
        case 'natural-law': return <div className={`p-1 rounded-full ${colorWrap}`}><Leaf className={cls}/></div>;
        case 'situation-ethics': return <div className={`p-1 rounded-full ${colorWrap}`}><Heart className={cls}/></div>;
        case 'kantian-ethics': return <div className={`p-1 rounded-full ${colorWrap}`}><Scale className={cls}/></div>;
        case 'utilitarianism': return <div className={`p-1 rounded-full ${colorWrap}`}><PieChart className={cls}/></div>;
        case 'euthanasia': return <div className={`p-1 rounded-full ${colorWrap}`}><Pill className={cls}/></div>;
        case 'business-ethics': return <div className={`p-1 rounded-full ${colorWrap}`}><Briefcase className={cls}/></div>;
        case 'sexual-ethics': return <div className={`p-1 rounded-full ${colorWrap}`}><Heart className={cls}/></div>;

        // Christianity
        case 'augustine': return <div className={`p-1 rounded-full ${colorWrap}`}><Feather className={cls}/></div>;
        case 'death-afterlife': return <div className={`p-1 rounded-full ${colorWrap}`}><Moon className={cls}/></div>;
        case 'knowledge-god': return <div className={`p-1 rounded-full ${colorWrap}`}><Eye className={cls}/></div>;
        case 'jesus-christ': return <div className={`p-1 rounded-full ${colorWrap}`}><Crown className={cls}/></div>;
        case 'practices-identity': return <div className={`p-1 rounded-full ${colorWrap}`}><Landmark className={cls}/></div>;
        case 'pluralism': return <div className={`p-1 rounded-full ${colorWrap}`}><Globe className={cls}/></div>;
        case 'gender': return <div className={`p-1 rounded-full ${colorWrap}`}><Users className={cls}/></div>;
        case 'secularism': return <div className={`p-1 rounded-full ${colorWrap}`}><Building className={cls}/></div>;

        default: return <div className={`p-1 rounded-full ${colorWrap}`}><BookOpen className={cls}/></div>;
      }
    }
    switch (topic.id) {
      case 'biopsychology': return <div className={`p-1 rounded-full ${colorWrap}`}><Brain className={cls}/></div>;
      case 'research-methods': return <div className={`p-1 rounded-full ${colorWrap}`}><Microscope className={cls}/></div>;
      case 'social-influence': return <div className={`p-1 rounded-full ${colorWrap}`}><Users className={cls}/></div>;
      case 'attachment': return <div className={`p-1 rounded-full ${colorWrap}`}><Heart className={cls}/></div>;
      case 'approaches-in-psychology': return <div className={`p-1 rounded-full ${colorWrap}`}><Layers className={cls}/></div>;
      case 'memory': return <div className={`p-1 rounded-full ${colorWrap}`}><GraduationCap className={cls}/></div>;
      case 'psychopathology': return <div className={`p-1 rounded-full ${colorWrap}`}><Activity className={cls}/></div>;
      case 'issues-and-debates': return <div className={`p-1 rounded-full ${colorWrap}`}><Scale className={cls}/></div>;
      case 'forensic-psychology': return <div className={`p-1 rounded-full ${colorWrap}`}><Fingerprint className={cls}/></div>;
      case 'aggression': return <div className={`p-1 rounded-full ${colorWrap}`}><Flame className={cls}/></div>;
      default: return <div className={`p-1 rounded-full ${colorWrap}`}><BookOpen className={cls}/></div>;
    }
  })();
  return (
    <div
      className="bg-white border rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition h-full relative"
      onClick={onClick}
    >
      <div className="absolute top-2 right-2">{iconEl}</div>
      <div className="flex items-start min-h-[3.5rem]">
        <h3 className="font-semibold text-lg md:text-xl clamp-2">{topic.title}</h3>
      </div>
      <p className="text-base text-gray-700 mt-2 clamp-2 min-h-[3rem]">{topic.description}</p>
    </div>
  );
}

function Section({ title, topics, setTopic }) {
  return (
    <div className="space-y-4 mt-8">
      <div className="text-center flex items-center justify-center gap-2 text-purple-700 font-semibold text-3xl md:text-4xl">
        {title}
      </div>
      <div className={`grid grid-cols-1 ${topics.length===2 ? 'md:grid-cols-2 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 mt-4 items-stretch ${topics.length===2 ? 'max-w-3xl mx-auto' : ''}`}>
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} onClick={() => setTopic(topic.id)} />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState('home');
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [curriculum, setCurriculum] = useState(() => getSelectedCurriculum() || null);

  // Determine topics source
  const psychTopicsAll = psychologyTopics;
  const topicsSrc = curriculum === 'ocr-rs' ? rsTopicsAll : (curriculum === 'edexcel-englit' ? englishLitTopics : psychTopicsAll);

  const selectedTopic = topicsSrc[selectedTopicId] || null;

  useEffect(() => {
    document.title = "Psyc Tutor";
  }, []);

  // Dev helper: warn when a sub-topic has no KU map
  useEffect(() => {
    try {
      const missing = [];
      Object.values(topicsSrc).forEach(t => {
        (t.subTopics || []).forEach(st => {
          const composite = `${t.id}:${st.id}`;
          const hasKU = Array.isArray(KUsBySubTopic[composite]) || Array.isArray(KUsBySubTopic[st.id]);
          if (!hasKU) missing.push(`${t.id}/${st.id}`);
        });
      });
      if (missing.length > 0) {
        // eslint-disable-next-line no-console
        console.warn('[KU] Missing knowledge maps for:', missing);
      }
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculum]);

  const chooseCurriculum = (id) => {
    setCurriculum(id);
    setSelectedCurriculum(id);
  };

  if (!curriculum) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${curriculum==='ocr-rs' ? 'from-blue-100 via-blue-50 to-blue-200' : 'from-pink-200 via-pink-100 to-pink-300'} flex items-center justify-center p-6`}>
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-xl space-y-6 text-center">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Choose your subject</h1>
          <p className="text-gray-600">Pick a curriculum to continue. You can change this later in Settings.</p>
          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => chooseCurriculum('aqa-psych')} className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">AQA Psychology 7182</button>
            <button onClick={() => chooseCurriculum('ocr-rs')} className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">OCR Religious Studies H573</button>
            <button onClick={() => chooseCurriculum('edexcel-englit')} className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold">Edexcel English Literature 9ET0</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'vault-tester') {
    return (
      <div>
        <button 
          onClick={() => setView('home')}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          ← Back to App
        </button>
        <VaultTester />
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button
          className="text-blue-600 underline mb-4"
          onClick={() => setView('home')}
        >
          ← Back to Home
        </button>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Curriculum</label>
          <div className="flex gap-2">
            <button onClick={() => chooseCurriculum('aqa-psych')} className={`px-3 py-1 rounded border ${curriculum==='aqa-psych'?'bg-blue-600 text-white border-blue-600':'bg-white'}`}>AQA Psychology</button>
            <button onClick={() => chooseCurriculum('ocr-rs')} className={`px-3 py-1 rounded border ${curriculum==='ocr-rs'?'bg-purple-600 text-white border-purple-600':'bg-white'}`}>OCR RS</button>
            <button onClick={() => chooseCurriculum('edexcel-englit')} className={`px-3 py-1 rounded border ${curriculum==='edexcel-englit'?'bg-emerald-600 text-white border-emerald-600':'bg-white'}`}>Edexcel Eng Lit</button>
          </div>
        </div>
        <SettingsPanel onOpenTaught={() => setView('taught-content')} />
      </div>
    );
  }

  if (view === 'taught-content') {
    return <TaughtContent onBack={() => setView('settings')} />;
  }

  if (view === 'exam-practice') {
    return <ExamPractice onBack={() => setView('home')} />;
  }

  if (view === 'progress-dashboard') {
    return <ProgressDashboard onBack={() => setView('home')} />;
  }

  if (view === 'srs-dashboard') {
    return <SRSDashboard onBack={() => setView('home')} />;
  }

  if (view === 'topic-progress-demo') {
    return <TopicPage topicId="social-influence" title="Social Influence" onBack={() => setView('home')} />;
  }

  if (view === 'examine-demo') {
    return <ExaminePage topicId="biopsychology" title="Biopsychology" onBack={() => setView('home')} />;
  }

  if (view === 'bank-generator') {
    return <BankGenerator onBack={() => setView('home')} />;
  }

  if (view === 'quiz-lab') {
    return <QuizLab onBack={() => setView('home')} />;
  }
  if (view === 'quiz-review') {
    return <QuizBankReview onBack={() => setView('home')} />;
  }
  if (view === 'vault-directory') {
    return <VaultDirectory onBack={() => setView('home')} />;
  }

  if (view === 'planner') {
    return <Planner onBack={() => setView('home')} />;
  }

  if (view === 'actual-past-papers') {
    return <ActualPastPapers onBack={() => setView('home')} />;
  }

  if (view === 'synthetic-past-papers') {
    return <SyntheticPastPapers onBack={() => setView('home')} />;
  }

  if (view === 'topic-detail' && selectedTopic) {
    return <TopicDetail topic={selectedTopic} onBack={() => setView('home')} />;
  }

  // Home view: show dashboard for selected curriculum
  return (
    <div className={`min-h-screen bg-gradient-to-br ${curriculum==='ocr-rs' ? 'from-blue-100 via-blue-50 to-blue-200' : (curriculum==='edexcel-englit' ? 'from-emerald-200 via-emerald-100 to-emerald-300' : 'from-pink-200 via-pink-100 to-pink-300')}`}>
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Title & Description */}
        <div className="text-center space-y-5">
          <div className="flex justify-center items-center gap-3">
            <BookOpen className="w-10 h-10" />
            <h1 className="inline-block text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-[1.2] pb-1">
              {curriculum === 'ocr-rs' ? 'OCR Religious Studies H573' : (curriculum === 'edexcel-englit' ? 'Edexcel English Literature 9ET0' : 'AQA Psychology 7182')}
            </h1>
          </div>
          <p className="text-lg text-gray-700 max-w-xl mx-auto font-medium">You got this Phoebs!</p>
        </div>
        {/* Top-left quick switch */}
        <div className="flex justify-start items-center">
          <button
            onClick={() => { setSelectedCurriculum(null); setCurriculum(null); setView('home'); }}
            className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold"
          >
            ↩︎ Switch Subject
          </button>
        </div>
        {/* Sections: Compulsory and Options */}
        {curriculum === 'ocr-rs' ? (
          <>
            <Section title="Philosophy" topics={getTopicsByComponent('Philosophy', topicsSrc)} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
            <Section title="Ethics" topics={getTopicsByComponent('Ethics', topicsSrc)} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
            <Section title="Christianity" topics={getTopicsByComponent('Christianity', topicsSrc)} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
          </>
        ) : curriculum === 'edexcel-englit' ? (
          <>
            <Section title="Component 1: Drama" topics={getTopicsByComponent('Component 1', topicsSrc)} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
            <Section title="Component 2: Prose" topics={getTopicsByComponent('Component 2', topicsSrc)} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
            <Section title="Component 3: Poetry" topics={getTopicsByComponent('Component 3', topicsSrc)} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
          </>
        ) : (
          <>
            <Section title="Compulsory Content" topics={getTopicsByComponent('Compulsory', topicsSrc)} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
            <Section title="Option 1" topics={getTopicsByComponent('Option 1', topicsSrc)} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
            <Section title="Option 2" topics={getTopicsByComponent('Option 2', topicsSrc)} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
            <Section title="Option 3" topics={getTopicsByComponent('Option 3', topicsSrc)} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
          </>
        )}
        {/* Practice Exams */}
        <div className="mt-12">
          <div className="text-center text-indigo-700 font-semibold text-2xl mb-3">📝 Practice Exams</div>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={() => setView('actual-past-papers')}
              className="flex items-center gap-2 text-lg px-6 py-3 border-2 border-slate-400 bg-white rounded-lg hover:bg-slate-50 font-semibold shadow-sm hover:shadow transition-all"
            >
              📄 Actual Past Papers
            </button>
            <button
              onClick={() => setView('synthetic-past-papers')}
              className="flex items-center gap-2 text-lg px-6 py-3 border-2 border-purple-400 bg-white rounded-lg hover:bg-purple-50 font-semibold shadow-sm hover:shadow transition-all"
            >
              ✨ Synthetic Past Papers
            </button>
          </div>
        </div>

        {/* Tools & Setup */}
        <div className="mt-12">
          <div className="text-center text-purple-700 font-semibold text-2xl mb-3">Tools & Setup</div>
          <div className="flex flex-wrap justify-center items-center gap-3">
            <button
              onClick={() => setView('settings')}
              className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
            {curriculum !== 'ocr-rs' ? (
              <button onClick={() => setView('progress-dashboard')} className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold">
                <TrendingUp className="w-5 h-5" /> Progress Dashboard
              </button>
            ) : (
              <button disabled title="Coming soon for OCR RS" className="flex items-center gap-1 text-base px-3 py-1 border border-gray-200 bg-gray-100 rounded font-semibold text-gray-400 cursor-not-allowed">
                <TrendingUp className="w-5 h-5" /> Progress Dashboard (soon)
              </button>
            )}
            {curriculum !== 'ocr-rs' ? (
              <button onClick={() => setView('srs-dashboard')} className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold">
                <RefreshCw className="w-5 h-5" /> SRS Dashboard
              </button>
            ) : (
              <button disabled title="Coming soon for OCR RS" className="flex items-center gap-1 text-base px-3 py-1 border border-gray-200 bg-gray-100 rounded font-semibold text-gray-400 cursor-not-allowed">
                <RefreshCw className="w-5 h-5" /> SRS Dashboard (soon)
              </button>
            )}
            {curriculum !== 'ocr-rs' ? (
              <button onClick={() => setView('topic-progress-demo')} className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold">🧭 Topic Progress Demo</button>
            ) : (
              <button disabled title="Coming soon for OCR RS" className="flex items-center gap-1 text-base px-3 py-1 border border-gray-200 bg-gray-100 rounded font-semibold text-gray-400 cursor-not-allowed">🧭 Topic Progress Demo (soon)</button>
            )}
            <button onClick={() => setView('examine-demo')} className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold">🧪 Examine Demo</button>
            <button onClick={() => setView('planner')} className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold">🗓️ Planner</button>
            <button onClick={() => setView('vault-tester')} className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold">🧪 Vault Tester</button>
            <button onClick={() => setView('bank-generator')} className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold">🧰 Bank Generator</button>
            <button onClick={() => setView('quiz-lab')} className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold">🧪 Quiz Lab</button>
            <button onClick={() => setView('quiz-review')} className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold">📋 Quiz Bank Review</button>
            <button onClick={() => setView('vault-directory')} className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold">📂 Vault Directory</button>
            <button
              onClick={() => { if (confirm('Reset ALL progress for all topics? This cannot be undone.')) { resetAllProgressStorage(); } }}
              className="flex items-center gap-1 text-base px-3 py-1 border border-red-300 bg-white rounded hover:bg-red-50 font-semibold text-red-700"
              title="Clears all progressive tracking data"
            >
              ♻️ Reset All Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
