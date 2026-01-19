import React, { useState } from 'react';
import { HOD_PAST_PAPERS, getHoDAvailableYears, HOD_AO_TARGETS, HOD_ALL_QUESTIONS, HOD_PREDICTION_GAPS } from '../data/heartOfDarknessPastPapers';

const HeartOfDarknessPastPapers = ({ onClose }) => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showEssay, setShowEssay] = useState(false);

  // Render annotated text with AO tags color-coded
  const renderAnnotatedText = (text) => {
    if (!text) return null;
    return text.split(/(\[AO[123][^]*?\])/).map((part, i) => {
      if (part.startsWith('[AO1')) {
        return <span key={i} className="bg-blue-100 text-blue-800 px-1 rounded font-medium">{part}</span>;
      } else if (part.startsWith('[AO2')) {
        return <span key={i} className="bg-green-100 text-green-800 px-1 rounded font-medium">{part}</span>;
      } else if (part.startsWith('[AO3')) {
        return <span key={i} className="bg-orange-100 text-orange-800 px-1 rounded font-medium">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const years = getHoDAvailableYears();

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setSelectedQuestion(null);
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    setShowEssay(false);
  };

  const renderYearList = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">📚 Heart of Darkness Past Paper Analysis</h2>
      <p className="text-gray-600 mb-4">
        Paper 2: Prose (Colonisation and its Aftermath). These are <strong>comparative</strong> questions—compare Heart of Darkness with The Lonely Londoners.
      </p>
      
      {/* AO Targets Reference */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-emerald-800 mb-2">📊 Optimal AO Targets (40-mark comparative essay)</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-medium text-blue-700">AO1:</span> {HOD_AO_TARGETS.ao1.count} comparative points</div>
          <div><span className="font-medium text-green-700">AO2:</span> {HOD_AO_TARGETS.ao2.count}</div>
          <div><span className="font-medium text-orange-700">AO3 Context:</span> {HOD_AO_TARGETS.ao3Context.count}</div>
          <div><span className="font-medium text-red-700">AO3 Critics:</span> {HOD_AO_TARGETS.ao3Critics.count}</div>
        </div>
      </div>

      {/* Predictions Toggle */}
      <button
        onClick={() => setShowPredictions(!showPredictions)}
        className="w-full p-3 bg-amber-100 border border-amber-300 rounded-lg text-amber-800 font-semibold hover:bg-amber-200 transition mb-4"
      >
        {showPredictions ? '▼ Hide' : '▶ Show'} Topic Predictions & Gaps
      </button>

      {showPredictions && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-amber-800 mb-3">🔮 Never-Asked Topics (High Prediction Value)</h3>
          <div className="space-y-2">
            {HOD_PREDICTION_GAPS.map((gap, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  gap.likelihood === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {gap.likelihood}
                </span>
                <span className="font-medium">{gap.topic}</span>
                <span className="text-gray-500 text-sm">— {gap.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleYearSelect(year)}
            className="p-6 bg-white border-2 border-emerald-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
          >
            <div className="text-2xl font-bold text-emerald-800">{year}</div>
            <div className="text-sm text-gray-500 mt-1">
              {HOD_PAST_PAPERS[year]?.questions?.length || 2} questions
            </div>
          </button>
        ))}
      </div>

      {/* All Historical Questions */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">📋 All Historical Questions (2017-2024)</h3>
        <div className="space-y-3 text-sm max-h-64 overflow-y-auto">
          {Object.entries(HOD_ALL_QUESTIONS).map(([year, questions]) => (
            <div key={year}>
              <div className="font-medium text-emerald-700">{year}:</div>
              <ul className="ml-4 text-gray-600">
                {questions.map((q, i) => (
                  <li key={i}>• {q}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuestionList = () => (
    <div className="space-y-4">
      <button
        onClick={() => setSelectedYear(null)}
        className="text-emerald-600 hover:text-emerald-800 flex items-center gap-2 mb-4"
      >
        ← Back to years
      </button>
      
      <h2 className="text-2xl font-bold text-emerald-800">{selectedYear} Questions</h2>
      <p className="text-sm text-gray-500">Paper 2: Prose — Colonisation and its Aftermath (40 marks each)</p>
      
      <div className="space-y-4 mt-4">
        {HOD_PAST_PAPERS[selectedYear]?.questions?.map((question) => (
          <button
            key={question.id}
            onClick={() => handleQuestionSelect(question)}
            className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-emerald-600 mb-1">
                  Question {question.questionNumber} • {question.marks} marks • Comparative
                </div>
                <div className="text-gray-800 font-medium">
                  "{question.questionText}"
                </div>
              </div>
              {question.sampleEssay && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap">
                  A* Essay
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderQuestionDetail = () => {
    const q = selectedQuestion;
    
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedQuestion(null)}
          className="text-emerald-600 hover:text-emerald-800 flex items-center gap-2"
        >
          ← Back to {selectedYear} questions
        </button>

        {/* Question Header */}
        <div className="bg-emerald-100 rounded-xl p-6">
          <div className="text-sm font-medium text-emerald-600 mb-2">
            {selectedYear} • Question {q.questionNumber} • {q.marks} marks • Comparative
          </div>
          <h2 className="text-xl font-bold text-emerald-900">
            "{q.questionText}"
          </h2>
        </div>

        {/* Headline Plan */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-3">🎯 What is this question REALLY asking?</h3>
          <p className="text-gray-800 mb-4">{q.headlinePlan.whatTheQuestionReallyAsks}</p>
          <h4 className="font-semibold text-yellow-700 mb-2">How to approach it:</h4>
          <p className="text-gray-700">{q.headlinePlan.approachSummary}</p>
        </div>

        {/* AO1 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-1">
            AO1: Knowledge & Understanding (Comparative)
          </h3>
          <p className="text-sm text-blue-600 mb-4">Target: {q.ao1.targetCount}</p>
          
          <div className="space-y-4">
            {q.ao1.points.map((point, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="font-semibold text-blue-900 mb-2">Point {i + 1}: {point.point}</div>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                    HoD: {point.hodRef}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    TLL: {point.tllRef}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{point.detail}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <span className="text-sm font-medium text-blue-800">💡 Examiner tip: </span>
            <span className="text-sm text-blue-700">{q.ao1.examinerTip}</span>
          </div>
        </div>

        {/* AO2 */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-green-800 mb-1">
            AO2: Language, Form & Structure
          </h3>
          <p className="text-sm text-green-600 mb-4">Target: {q.ao2.targetCount}</p>
          
          <div className="space-y-4">
            {q.ao2.quotes.map((quote, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    quote.text === 'Heart of Darkness' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {quote.text}
                  </span>
                  {quote.scene && (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      {quote.scene}
                    </span>
                  )}
                </div>
                <div className="font-serif text-lg text-green-900 mb-2 italic">
                  {quote.quote}
                </div>
                <div className="flex gap-2 mb-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {quote.technique}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{quote.effect}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <span className="text-sm font-medium text-green-800">💡 Examiner tip: </span>
            <span className="text-sm text-green-700">{q.ao2.examinerTip}</span>
          </div>
        </div>

        {/* AO3 */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-orange-800 mb-1">
            AO3: Context & Critical Reading
          </h3>
          <p className="text-sm text-orange-600 mb-4">Target: {q.ao3.targetCount}</p>
          
          <h4 className="font-semibold text-orange-700 mb-3">Context Links:</h4>
          <div className="space-y-3 mb-6">
            {q.ao3.contextLinks.map((ctx, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-orange-100">
                <span className="font-semibold text-orange-900">{ctx.context}: </span>
                <span className="text-gray-700">{ctx.application}</span>
              </div>
            ))}
          </div>
          
          <h4 className="font-semibold text-orange-700 mb-3">Critics to Use:</h4>
          <div className="space-y-3">
            {q.ao3.critics.map((critic, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-orange-100">
                <div className="font-semibold text-orange-900 mb-1">{critic.critic}</div>
                <p className="text-gray-700 text-sm mb-2">"{critic.argument}"</p>
                <p className="text-orange-600 text-sm italic">How to use: {critic.howToUse}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-orange-100 rounded-lg">
            <span className="text-sm font-medium text-orange-800">💡 Examiner tip: </span>
            <span className="text-sm text-orange-700">{q.ao3.examinerTip}</span>
          </div>
        </div>

        {/* Sample Essay */}
        {q.sampleEssay ? (
          <div className="bg-white border-2 border-purple-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowEssay(!showEssay)}
              className="w-full p-4 bg-purple-100 hover:bg-purple-200 transition-colors flex justify-between items-center"
            >
              <span className="font-bold text-purple-800 text-lg">
                {showEssay ? '▼' : '▶'} A* Sample Comparative Essay
              </span>
              <span className="text-sm bg-green-500 text-white px-3 py-1 rounded-full">
                {q.sampleEssay.grade}
              </span>
            </button>
            
            {showEssay && (
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="bg-gray-100 px-3 py-1 rounded">
                    {q.sampleEssay.wordCount}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">AO1: Knowledge (comparative)</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded">AO2: Language analysis</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded">AO3: Context/critics</span>
                </div>

                <div className="prose prose-sm max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {renderAnnotatedText(q.sampleEssay.text)}
                  </div>
                </div>

                {/* Legend */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h5 className="font-semibold text-gray-700 mb-2">AO Annotation Key:</h5>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">[AO1] = Knowledge</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">[AO2] = Analysis</span>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">[AO3] = Context</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500">
            📝 Sample A* comparative essay coming soon...
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Heart of Darkness Past Paper Analysis</h1>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedYear && renderYearList()}
          {selectedYear && !selectedQuestion && renderQuestionList()}
          {selectedQuestion && renderQuestionDetail()}
        </div>
      </div>
    </div>
  );
};

export default HeartOfDarknessPastPapers;
