import React, { useState } from 'react';
import { HAMLET_PAST_PAPERS, getAvailableYears, AO_TARGETS } from '../data/hamletPastPapers';

const HamletPastPapers = ({ onClose }) => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showEssay, setShowEssay] = useState(false);

  const years = getAvailableYears();

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setSelectedQuestion(null);
    setShowEssay(false);
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    setShowEssay(false);
  };

  const renderYearList = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">📚 Hamlet Past Paper Analysis</h2>
      <p className="text-gray-600 mb-6">
        Select a year to see detailed question analysis, essay planning frameworks, and A* sample answers with AO annotations.
      </p>
      
      {/* AO Targets Reference */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-purple-800 mb-2">📊 Optimal AO Targets per Essay</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-medium text-blue-700">AO1:</span> {AO_TARGETS.ao1.count} points</div>
          <div><span className="font-medium text-green-700">AO2:</span> {AO_TARGETS.ao2.count} close-reads</div>
          <div><span className="font-medium text-orange-700">AO3 Context:</span> {AO_TARGETS.ao3Context.count} links</div>
          <div><span className="font-medium text-red-700">AO3 Critics:</span> {AO_TARGETS.ao3Critics.count} named</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleYearSelect(year)}
            className="p-6 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
          >
            <div className="text-2xl font-bold text-purple-800">{year}</div>
            <div className="text-sm text-gray-500 mt-1">
              {HAMLET_PAST_PAPERS[year].questions.length} questions
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {HAMLET_PAST_PAPERS[year].questions.map(q => `Q${q.questionNumber}`).join(', ')}
            </div>
          </button>
        ))}
      </div>
      
      <p className="text-sm text-gray-400 mt-4 italic">
        More years coming soon (2017-2022)...
      </p>
    </div>
  );

  const renderQuestionList = () => (
    <div className="space-y-4">
      <button
        onClick={() => setSelectedYear(null)}
        className="text-purple-600 hover:text-purple-800 flex items-center gap-2 mb-4"
      >
        ← Back to years
      </button>
      
      <h2 className="text-2xl font-bold text-purple-800">{selectedYear} Questions</h2>
      
      <div className="space-y-4 mt-4">
        {HAMLET_PAST_PAPERS[selectedYear].questions.map((question) => (
          <button
            key={question.id}
            onClick={() => handleQuestionSelect(question)}
            className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm font-medium text-purple-600 mb-1">
                  Question {question.questionNumber} • {question.marks} marks
                </div>
                <div className="text-gray-800 font-medium">
                  "{question.questionText}"
                </div>
              </div>
              {question.sampleEssay && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
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
          className="text-purple-600 hover:text-purple-800 flex items-center gap-2"
        >
          ← Back to {selectedYear} questions
        </button>

        {/* Question Header */}
        <div className="bg-purple-100 rounded-xl p-6">
          <div className="text-sm font-medium text-purple-600 mb-2">
            {selectedYear} • Question {q.questionNumber} • {q.marks} marks
          </div>
          <h2 className="text-xl font-bold text-purple-900">
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
            AO1: Knowledge & Understanding
          </h3>
          <p className="text-sm text-blue-600 mb-4">Target: {q.ao1.targetCount} distinct points</p>
          
          <div className="space-y-4">
            {q.ao1.points.map((point, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-blue-900">Point {i + 1}: {point.point}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {point.scene}
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
          <p className="text-sm text-green-600 mb-4">Target: {q.ao2.targetCount} close-read quotes</p>
          
          <div className="space-y-4">
            {q.ao2.quotes.map((quote, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-serif text-lg text-green-900 italic flex-1">
                    {quote.quote}
                  </div>
                  {quote.scene && (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded ml-2 whitespace-nowrap">
                      {quote.scene}
                    </span>
                  )}
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

        {/* Sample Essay Toggle */}
        {q.sampleEssay ? (
          <div className="bg-white border-2 border-purple-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowEssay(!showEssay)}
              className="w-full p-4 bg-purple-100 hover:bg-purple-200 transition-colors flex justify-between items-center"
            >
              <span className="font-bold text-purple-800">
                📝 {showEssay ? 'Hide' : 'Show'} A* Sample Essay
              </span>
              <span className="text-sm bg-green-500 text-white px-3 py-1 rounded-full">
                {q.sampleEssay.grade}
              </span>
            </button>
            
            {showEssay && (
              <div className="p-6 space-y-6">
                {/* Word count and AO breakdown */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="bg-gray-100 px-3 py-1 rounded">
                    ~{q.sampleEssay.wordCount} words
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                    {q.sampleEssay.aoBreakdown.ao1}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                    {q.sampleEssay.aoBreakdown.ao2}
                  </span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded">
                    {q.sampleEssay.aoBreakdown.ao3}
                  </span>
                </div>

                {/* Introduction */}
                <div>
                  <h4 className="font-bold text-purple-800 mb-2">Introduction</h4>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {renderAnnotatedText(q.sampleEssay.introduction)}
                  </p>
                </div>

                {/* Body Paragraphs */}
                {q.sampleEssay.paragraphs.map((para, i) => (
                  <div key={i}>
                    <h4 className="font-bold text-purple-800 mb-2">
                      Paragraph {i + 1}: {para.topic}
                    </h4>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {renderAnnotatedText(para.content)}
                    </p>
                  </div>
                ))}

                {/* Conclusion */}
                <div>
                  <h4 className="font-bold text-purple-800 mb-2">Conclusion</h4>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {renderAnnotatedText(q.sampleEssay.conclusion)}
                  </p>
                </div>

                {/* Legend */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h5 className="font-semibold text-gray-700 mb-2">AO Annotation Key:</h5>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">[AO1: ...]</span>
                    <span className="text-gray-600">= Knowledge point</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">[AO2: ...]</span>
                    <span className="text-gray-600">= Language analysis</span>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">[AO3: ...]</span>
                    <span className="text-gray-600">= Context/critic</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500">
            📝 Sample A* essay coming soon...
          </div>
        )}
      </div>
    );
  };

  // Helper to render AO annotations with colored highlights
  const renderAnnotatedText = (text) => {
    if (!text) return null;
    
    // Split by AO annotations and render with colors
    const parts = text.split(/(\[AO[123][^:]*:[^\]]+\])/g);
    
    return parts.map((part, i) => {
      if (part.match(/^\[AO1/)) {
        return (
          <span key={i} className="bg-blue-100 text-blue-800 px-1 rounded text-sm font-medium">
            {part}
          </span>
        );
      } else if (part.match(/^\[AO2/)) {
        return (
          <span key={i} className="bg-green-100 text-green-800 px-1 rounded text-sm font-medium">
            {part}
          </span>
        );
      } else if (part.match(/^\[AO3/)) {
        return (
          <span key={i} className="bg-orange-100 text-orange-800 px-1 rounded text-sm font-medium">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-purple-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Hamlet Past Paper Analysis</h1>
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

export default HamletPastPapers;
