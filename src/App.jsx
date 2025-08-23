import React, { useState } from 'react';
import psychologyTopics from './psychologyTopics';
import TopicDetail from './components/TopicDetail';
import SettingsPanel from './components/SettingsPanel';
import VaultTester from './components/VaultTester';
import BedtimeStory from './components/BedtimeStory';
import ExamPractice from './components/ExamPractice';
import ProgressDashboard from './components/ProgressDashboard';
import SRSDashboard from './components/SRSDashboard';
import { BookOpen, Settings, TrendingUp, RefreshCw } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import './utils/srsCardGenerator';
import TopicPage from './pages/TopicPage.jsx';

// Helper: group topics by component
const getTopicsByComponent = (comp) =>
  Object.values(psychologyTopics).filter(t => t.component === comp);

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

function Section({ title, topics, setTopic }) {
  return (
    <div className="space-y-4 mt-8">
      <div className="text-center flex items-center justify-center gap-2 text-purple-700 font-semibold text-2xl">
        {title}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
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

  const selectedTopic = psychologyTopics[selectedTopicId] || null;

  useEffect(() => {
    document.title = "Psyc Tutor";
  }, []);

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
        <SettingsPanel />
      </div>
    );
  }

  if (view === 'exam-practice') {
    return <ExamPractice onBack={() => setView('home')} />;
  }

  if (view === 'progress-dashboard') {
    return <ProgressDashboard onBack={() => setView('home')} />;
  }
  if (view === 'bedtime-story') {
    return <BedtimeStory onBack={() => setView('home')} />;
  }

  if (view === 'srs-dashboard') {
    return <SRSDashboard onBack={() => setView('home')} />;
  }

  if (view === 'topic-progress-demo') {
    return <TopicPage topicId="social-influence" title="Social Influence" onBack={() => setView('home')} />;
  }

  if (view === 'topic-detail' && selectedTopic) {
    return <TopicDetail topic={selectedTopic} onBack={() => setView('home')} />;
  }

  // Home view: show AQA Psychology dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-pink-100 to-pink-300">
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Title & Description */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex justify-center items-center gap-3">
            <BookOpen className="w-9 h-9" />
            AQA Psychology 7182
          </h1>
          <p className="text-lg text-gray-700 max-w-xl mx-auto font-medium">
            Master the AQA Psychology 7182 curriculum with AI-enhanced revision materials powered by your own study notes and public internet resources. Upload your PDFs and get personalised content! 🚀
          </p>
        </div>
        {/* Settings Button */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={() => setView('settings')}
            className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button
            onClick={() => setView('progress-dashboard')}
            className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold"
          >
            <TrendingUp className="w-5 h-5" />
            Progress Dashboard
          </button>
          <button
            onClick={() => setView('bedtime-story')}
            className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold"
          >
            🌙 Bedtime Story (Beta)
          </button>
          <button
            onClick={() => setView('srs-dashboard')}
            className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold"
          >
            <RefreshCw className="w-5 h-5" />
            SRS Dashboard
          </button>
          <button
            onClick={() => setView('vault-tester')}
            className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold"
          >
            🧪 Vault Tester
          </button>
          <button
            onClick={() => setView('topic-progress-demo')}
            className="flex items-center gap-1 text-base px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 font-semibold"
          >
            🧭 Topic Progress Demo
          </button>
        </div>
        {/* Sections: Compulsory and Options */}
        <Section title="Compulsory Content" topics={getTopicsByComponent('Compulsory')} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
        <Section title="Option 1" topics={getTopicsByComponent('Option 1')} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
        <Section title="Option 2" topics={getTopicsByComponent('Option 2')} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
        <Section title="Option 3" topics={getTopicsByComponent('Option 3')} setTopic={id => { setSelectedTopicId(id); setView('topic-detail'); }} />
        {/* Exam Practice Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setView('exam-practice')}
            className="px-10 py-5 text-2xl bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl shadow-lg font-bold hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
          >
            📝 Exam Practice
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
