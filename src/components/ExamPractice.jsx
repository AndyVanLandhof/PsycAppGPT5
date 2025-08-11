import React, { useState } from 'react';
import { Clock, Trophy, Award, Play } from 'lucide-react';

const paperOptions = [
  { key: 'paper1', label: 'Paper 1: Introductory Topics' },
  { key: 'paper2', label: 'Paper 2: Psychology in Context' },
  { key: 'paper3', label: 'Paper 3: Issues and Options' },
];

const paperTypes = [
  { key: 'actual', label: 'Actual Past Paper' },
  { key: 'synthetic', label: 'Synthetic Past Paper' },
];

function ExamPractice({ onBack }) {
  const [phase, setPhase] = useState('landing');
  const [selectedPaper, setSelectedPaper] = useState('paper1');
  const [selectedType, setSelectedType] = useState('actual');

  if (phase === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8 space-y-8">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
            Psychology Exam Practice
          </h1>

          {/* Info Rectangles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center flex flex-col items-center">
              <Clock className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-800">120 Minutes</h3>
              <p className="text-sm text-blue-600">Exam Conditions</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 text-center flex flex-col items-center">
              <Trophy className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-purple-800">96 Marks</h3>
              <p className="text-sm text-purple-600">Full Paper</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center flex flex-col items-center">
              <Award className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-green-800">AI Marking</h3>
              <p className="text-sm text-green-600">Self/AI Review</p>
            </div>
          </div>

          {/* Paper Selection */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-4">
            {paperOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelectedPaper(opt.key)}
                className={`px-6 py-3 rounded-lg font-semibold border transition-colors ${selectedPaper === opt.key ? 'bg-orange-600 text-white border-orange-700' : 'bg-white text-orange-700 border-orange-300 hover:bg-orange-50'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Paper Type Toggle */}
          <div className="flex gap-4 justify-center mb-6">
            {paperTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`px-6 py-2 rounded-lg font-semibold border transition-colors ${selectedType === type.key ? 'bg-green-600 text-white border-green-700' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Start Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setPhase('paper')}
              className="px-8 py-3 text-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <Play className="w-5 h-5 mr-2 inline" />
              Start My Paper
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'paper') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8 space-y-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Exam Paper Placeholder</h2>
          <p className="text-gray-600">This is where the actual or synthetic paper will be shown, with questions and answer boxes.</p>
          <button
            onClick={() => setPhase('landing')}
            className="mt-8 px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
          >
            Back to Exam Practice Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default ExamPractice; 