import React, { useState } from 'react';
import { topicData } from './topicData';
import TopicDetail from './components/TopicDetail';
import SettingsPanel from './components/SettingsPanel';
import PhilosophyDashboard from './components/PhilosophyDashboard';
import EthicsDashboard from './components/EthicsDashboard';
import ChristianityDashboard from './components/ChristianityDashboard';
import VaultTester from './components/VaultTester';
import ConceptMapView from './components/ConceptMapView';
import MasterConceptMapView from './components/MasterConceptMapView';
import SocraticDialogue from './components/SocraticDialogue';
import OCRComparisonPage from './components/OCRComparisonPage';
import {
  BookOpen, Brain, Heart, Cross, Globe,
  Settings, BarChart3
} from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import argumentsExistenceGodConceptMap from './data/argumentsExistenceGodConceptMap';

const allTopics = Object.values(topicData);
const getTopicsByComponent = (comp) => allTopics.filter(t => t.component === comp);

function TopicCard({ topic, onClick }) {
  const difficultyColor = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800',
  }[topic.difficulty] || 'bg-gray-100 text-gray-800';

  return (
    <div
      className="bg-white border rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-md">{topic.title}</h3>
        <span className={`text-xs px-2 py-1 rounded ${difficultyColor}`}>{topic.difficulty}</span>
      </div>
      <p className="text-sm text-gray-600 mt-2">{topic.description}</p>
    </div>
  );
}

function App() {
  const [view, setView] = useState('home');
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const selectedTopic = topicData[selectedTopicId] || null;
  const philosophy = getTopicsByComponent("Philosophy");
  const ethics = getTopicsByComponent("Ethics");
  const christianity = getTopicsByComponent("Christianity");

  // Navigation logic
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

  if (view === 'concept-map') {
    return (
      <div>
        <button 
          onClick={() => setView('home')}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          ← Back to App
        </button>
        <ConceptMapView />
      </div>
    );
  }

  if (view === 'master-concept-map') {
    return <MasterConceptMapView onBack={() => setView('home')} componentType="philosophy" />;
  }

  if (view === 'master-concept-map-ethics') {
    return <MasterConceptMapView onBack={() => setView('home')} componentType="ethics" />;
  }

  if (view === 'master-concept-map-christianity') {
    return <MasterConceptMapView onBack={() => setView('home')} componentType="christianity" />;
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
        <SettingsPanel />
      </div>
    );
  }

  if (view === 'philosophy-dashboard') {
    return <PhilosophyDashboard onBack={() => setView('home')} />;
  }
  if (view === 'ethics-dashboard') {
    return <EthicsDashboard onBack={() => setView('home')} />;
  }
  if (view === 'christianity-dashboard') {
    return <ChristianityDashboard onBack={() => setView('home')} />;
  }

  if (view === 'topic-detail' && selectedTopic) {
    return <TopicDetail topic={selectedTopic} onBack={() => setView('home')} />;
  }

  if (view === 'arguments-existence-map') {
    return (
      <div>
        <button 
          onClick={() => setView('home')}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          ← Back to App
        </button>
        <ConceptMapView conceptMapData={argumentsExistenceGodConceptMap} />
      </div>
    );
  }

  if (view === 'socratic-kantian-ethics') {
    return (
      <div>
        <button 
          onClick={() => setView('home')}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          ← Back to App
        </button>
        <SocraticDialogue topic="Situation Ethics" />
      </div>
    );
  }

  if (view === 'ocr-comparison') {
    return <OCRComparisonPage onBack={() => setView('home')} />;
  }

  // Home view
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Title & Description */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex justify-center items-center gap-3">
            <BookOpen className="w-9 h-9" />
            A-Level PRE
          </h1>
          <p className="text-lg text-gray-700 max-w-xl mx-auto font-medium">
            Master the OCR H573 curriculum with AI-enhanced revision materials powered by your own study notes.
            Upload your PDFs and get personalised content! 🚀
          </p>
        </div>
        {/* Legend + Controls */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={() => setView('settings')}
            className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
        {/* Sections */}
        <Section title="Philosophy of Religion" icon={Brain} topics={philosophy} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} setShowStorageDashboard={dashboard => setView('philosophy-dashboard')} setView={setView} />
        <div className="mt-12">
          <Section title="Ethics" icon={Heart} topics={ethics} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} setShowStorageDashboard={dashboard => setView('ethics-dashboard')} setView={setView} />
        </div>
        <div className="mt-12">
          <Section title="Christianity" icon={Cross} topics={christianity} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} setShowStorageDashboard={dashboard => setView('christianity-dashboard')} setView={setView} />
        </div>
        {/* Vault Tester Button */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <button
            onClick={() => setView('vault-tester')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors"
          >
            🧪 Test Vault Integration
          </button>
        </div>
        <div className="flex justify-center mt-12">
          <button
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-semibold shadow-lg"
            onClick={() => setView('ocr-comparison')}
          >
            See OCR Spec vs App Topics
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, topics, setTopic, setShowStorageDashboard, setView }) {
  const getConceptMapView = () => {
    switch (title) {
      case "Philosophy of Religion":
        return "master-concept-map";
      case "Ethics":
        return "master-concept-map-ethics";
      case "Christianity":
        return "master-concept-map-christianity";
      default:
        return "master-concept-map";
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="text-center flex items-center justify-center gap-2 text-purple-700 font-semibold text-2xl" style={{ fontSize: '2.1rem' }}>
          <Icon className="w-7 h-7" />
          {title}
        </div>
        {(title === "Philosophy of Religion" || title === "Ethics" || title === "Christianity") && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => setShowStorageDashboard(title === "Philosophy of Religion" ? "philosophy-dashboard" : title === "Ethics" ? "ethics-dashboard" : "christianity-dashboard")}
              className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold"
            >
              <BarChart3 className="w-4 h-4" />
              View Storage
            </button>
            <button
              onClick={() => setView(getConceptMapView())}
              className="flex items-center gap-1 text-base px-3 py-1 border border-purple-300 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 font-semibold"
            >
              <Globe className="w-4 h-4" />
              Concept Map
            </button>
          </div>
        )}
      </div>
      <p className="text-center text-base text-gray-600 max-w-2xl mx-auto">
        Explore the key topics in {title}.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} onClick={() => setTopic(topic.id)} />
        ))}
      </div>
    </div>
  );
}

export default App;
