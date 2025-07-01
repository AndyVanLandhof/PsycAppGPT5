import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, Filter, Search, Calendar, BookOpen, Brain, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

function EthicsDashboard({ onBack }) {
  const [allStoredContent, setAllStoredContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Ethics sub-topics
  const ethicsSubTopics = [
    'Utilitarianism',
    'Situation Ethics',
    'Natural Law',
    'Kantian Ethics',
    'Virtue Ethics',
    'Business Ethics'
  ];

  useEffect(() => {
    loadAllStoredContent();
  }, []);

  useEffect(() => {
    filterAndSortContent();
  }, [allStoredContent, selectedFilter, searchTerm, sortBy]);

  const loadAllStoredContent = () => {
    const content = [];

    // Load quizzes from all ethics sub-topics
    ethicsSubTopics.forEach(subTopic => {
      const quizData = localStorage.getItem(`quiz-stored-${subTopic.toLowerCase().replace(/\s+/g, '-')}`);
      if (quizData) {
        const quizzes = JSON.parse(quizData);
        quizzes.forEach(quiz => {
          content.push({
            ...quiz,
            type: 'quiz',
            displayType: 'Practice Quiz',
            icon: Brain,
            color: 'blue'
          });
        });
      }
    });

    // Load flashcards from all ethics sub-topics
    ethicsSubTopics.forEach(subTopic => {
      const flashcardData = localStorage.getItem(`flashcard-summaries-${subTopic.toLowerCase().replace(/\s+/g, '-')}`);
      if (flashcardData) {
        const flashcards = JSON.parse(flashcardData);
        flashcards.forEach(flashcard => {
          content.push({
            ...flashcard,
            type: 'flashcard',
            displayType: 'Flashcards',
            icon: BookOpen,
            color: 'purple'
          });
        });
      }
    });

    // Load essays from all ethics sub-topics
    ethicsSubTopics.forEach(subTopic => {
      const essayData = localStorage.getItem(`essay-stored-${subTopic.toLowerCase().replace(/\s+/g, '-')}`);
      if (essayData) {
        try {
          const essays = JSON.parse(essayData);
          essays.forEach(essay => {
            content.push({
              ...essay,
              type: 'essay',
              displayType: 'Timed Essay',
              icon: FileText,
              color: 'orange'
            });
          });
        } catch (error) {
          console.error('Error parsing essay data:', error);
        }
      }
    });

    setAllStoredContent(content);
  };

  const filterAndSortContent = () => {
    let filtered = [...allStoredContent];

    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.type === selectedFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.subTopic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.displayType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortBy === 'type') {
        return a.displayType.localeCompare(b.displayType);
      } else if (sortBy === 'subtopic') {
        return a.subTopic.localeCompare(b.subTopic);
      }
      return 0;
    });

    setFilteredContent(filtered);
  };

  const deleteItem = (item) => {
    const storageKey = `${item.type}-${item.type === 'quiz' ? 'stored' : item.type === 'flashcard' ? 'summaries' : 'stored'}-${item.subTopic.toLowerCase().replace(/\s+/g, '-')}`;
    const existingData = localStorage.getItem(storageKey);
    
    if (existingData) {
      const data = JSON.parse(existingData);
      const updatedData = data.filter(d => d.id !== item.id);
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
    }

    loadAllStoredContent(); // Reload data
  };

  const exportItem = (item) => {
    if (item.type === 'essay') {
      const doc = new jsPDF();
      let y = 10;
      doc.setFontSize(18);
      doc.text('TIMED ESSAY', 10, y); y += 8;
      doc.setFontSize(12);
      doc.text(`Topic: ${item.topic}`, 10, y); y += 7;
      doc.text(`Sub-Topic: ${item.subTopic}`, 10, y); y += 7;
      doc.text(`Date: ${new Date(item.timestamp).toLocaleDateString()}`, 10, y); y += 7;
      doc.text(`Time: ${new Date(item.timestamp).toLocaleTimeString()}`, 10, y); y += 7;
      doc.text(`Word Count: ${item.wordCount || 'N/A'}`, 10, y); y += 7;
      doc.text(`Time Spent: ${item.timeSpent || 'N/A'} minutes`, 10, y); y += 7;
      doc.text(`Score: ${item.score}/${item.maxScore} (${item.successRate}%)`, 10, y); y += 10;
      doc.text('QUESTION:', 10, y); y += 7;
      doc.text(item.question, 14, y); y += 10;
      doc.text('ESSAY:', 10, y); y += 7;
      doc.text(item.content || 'Essay content not available', 14, y); y += 10;
      if (item.feedback && typeof item.feedback === 'object') {
        doc.text('FEEDBACK:', 10, y); y += 7;
        doc.text(`AO1 (Knowledge & Understanding): ${item.feedback.aoBreakdown?.ao1?.score}/20`, 14, y); y += 7;
        doc.text(item.feedback.aoBreakdown?.ao1?.feedback || 'No AO1 feedback available', 14, y); y += 7;
        doc.text(`AO2 (Analysis & Evaluation): ${item.feedback.aoBreakdown?.ao2?.score}/20`, 14, y); y += 7;
        doc.text(item.feedback.aoBreakdown?.ao2?.feedback || 'No AO2 feedback available', 14, y); y += 7;
        if (item.feedback.strengths && Array.isArray(item.feedback.strengths)) {
          doc.text('Strengths:', 14, y); y += 7;
          item.feedback.strengths.forEach((strength, idx) => { doc.text(`${idx + 1}. ${strength}`, 18, y); y += 6; });
        }
        if (item.feedback.improvements && Array.isArray(item.feedback.improvements)) {
          doc.text('Areas for Improvement:', 14, y); y += 7;
          item.feedback.improvements.forEach((improvement, idx) => { doc.text(`${idx + 1}. ${improvement}`, 18, y); y += 6; });
        }
        if (item.feedback.detailedComments) {
          doc.text('Detailed Comments:', 14, y); y += 7;
          doc.text(item.feedback.detailedComments, 18, y); y += 10;
        }
      }
      doc.save(`essay-${item.subTopic}-${new Date(item.timestamp).toISOString().split('T')[0]}.pdf`);
      return;
    }
    let content = '';
    let filename = '';

    if (item.type === 'quiz') {
      content = `QUIZ RESULTS\n============\n\n`;
      content += `Topic: ${item.topic}\n`;
      content += `Sub-Topic: ${item.subTopic}\n`;
      content += `Date: ${new Date(item.timestamp).toLocaleDateString()}\n`;
      content += `Time: ${new Date(item.timestamp).toLocaleTimeString()}\n`;
      content += `Success Rate: ${item.successRate}%\n\n`;
      
      content += `RESULTS:\n`;
      content += `- Correct: ${item.stats.correct}\n`;
      content += `- Incorrect: ${item.stats.incorrect}\n\n`;
      
      content += `DETAILED REVIEW:\n================\n\n`;
      
      if (item.questions && Array.isArray(item.questions)) {
        item.questions.forEach((q, index) => {
          content += `Question ${index + 1}:\n`;
          content += `${q.question || 'Question not available'}\n\n`;
          content += `Options:\n`;
          if (q.options && Array.isArray(q.options)) {
            q.options.forEach((option, optIndex) => {
              content += `${optIndex + 1}. ${option}\n`;
            });
          }
          content += `\nYour Answer: ${q.userAnswer !== null && q.userAnswer !== undefined && q.options && q.options[q.userAnswer] ? q.options[q.userAnswer] : 'Not answered'}\n`;
          content += `Correct Answer: ${q.options && q.correctAnswer !== undefined && q.options[q.correctAnswer] ? q.options[q.correctAnswer] : 'Answer not available'}\n`;
          content += `Explanation: ${q.explanation || 'No explanation available'}\n`;
          content += `----------------------------------------\n\n`;
        });
      }
      
      filename = `quiz-results-${item.subTopic}-${new Date(item.timestamp).toISOString().split('T')[0]}.txt`;
    } else if (item.type === 'flashcard') {
      content = `FLASHCARD SESSION SUMMARY\n================================\n\n`;
      content += `Topic: ${item.topic}\n`;
      content += `Sub-Topic: ${item.subTopic}\n`;
      content += `Date: ${new Date(item.timestamp).toLocaleDateString()}\n`;
      content += `Time: ${new Date(item.timestamp).toLocaleTimeString()}\n`;
      content += `Success Rate: ${item.successRate}%\n\n`;
      
      content += `RESULTS:\n`;
      content += `- Correct: ${item.stats.correct}\n`;
      content += `- Partial: ${item.stats.partial}\n`;
      content += `- Incorrect: ${item.stats.incorrect}\n\n`;
      
      content += `DETAILED REVIEW:\n================\n\n`;
      
      if (item.cards && Array.isArray(item.cards)) {
        item.cards.forEach((card, index) => {
          content += `Question ${index + 1}:\n`;
          content += `${card.question}\n\n`;
          content += `Your Answer:\n${card.userAnswer || 'No answer provided'}\n\n`;
          content += `Correct Answer:\n${card.answer}\n\n`;
          content += `Assessment: ${card.assessment}\n`;
          content += `----------------------------------------\n\n`;
        });
      }
      
      filename = `flashcard-summary-${item.subTopic}-${new Date(item.timestamp).toISOString().split('T')[0]}.txt`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFilterCount = (type) => {
    return allStoredContent.filter(item => type === 'all' || item.type === type).length;
  };

  const getGrade = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    // OCR H573 grade boundaries (2023 actual data)
    if (percentage >= 79) return "A*";
    if (percentage >= 69) return "A";
    if (percentage >= 60) return "B";
    if (percentage >= 51) return "C";
    if (percentage >= 41) return "D";
    return "U";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ethics Storage Dashboard
            </h1>
            <p className="text-gray-600 mt-2">View and manage all your stored Ethics study content</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
          >
            ← Back to Home
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{getFilterCount('all')}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="bg-white border rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{getFilterCount('quiz')}</div>
            <div className="text-sm text-gray-600">Quizzes</div>
          </div>
          <div className="bg-white border rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{getFilterCount('flashcard')}</div>
            <div className="text-sm text-gray-600">Flashcards</div>
          </div>
          <div className="bg-white border rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">{getFilterCount('essay')}</div>
            <div className="text-sm text-gray-600">Essays</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types ({getFilterCount('all')})</option>
                <option value="quiz">Quizzes ({getFilterCount('quiz')})</option>
                <option value="flashcard">Flashcards ({getFilterCount('flashcard')})</option>
                <option value="essay">Essays ({getFilterCount('essay')})</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date (Newest)</option>
                <option value="type">Type</option>
                <option value="subtopic">Sub-Topic</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Search by sub-topic or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white border rounded-lg shadow-sm">
          {filteredContent.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No stored content yet</h3>
              <p className="text-gray-600 mb-6">Complete quizzes, flashcards, or essays to see your stored content here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredContent.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={`${item.type}-${item.id}`} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-${item.color}-100`}>
                          <Icon className={`w-6 h-6 text-${item.color}-600`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-800">{item.subTopic}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${item.color}-100 text-${item.color}-800`}>
                              {item.displayType}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
                          </div>
                          {item.successRate !== undefined && (
                            <div className="text-sm text-gray-600">
                              Score: {item.score}/{item.maxScore} ({item.successRate}%)
                            </div>
                          )}
                          {item.type === 'essay' && item.score !== undefined && (
                            <div className="text-sm text-gray-600">
                              Grade: {getGrade(item.score, item.maxScore)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportItem(item)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EthicsDashboard; 