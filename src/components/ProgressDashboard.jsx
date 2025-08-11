import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, BookOpen, CheckCircle, AlertCircle, Clock, Award } from 'lucide-react';
import psychologyTopics from '../psychologyTopics';

// Mastery Level Calculator
class MasteryCalculator {
  constructor() {
    this.examDate = new Date('2026-05-01');
  }

  // Calculate mastery level (1-5) based on multiple factors
  calculateMasteryLevel(topicId, sessions, srsCards) {
    const factors = {
      sessionCount: this.calculateSessionScore(sessions),
      successRate: this.calculateSuccessRateScore(sessions),
      srsProgress: this.calculateSRSProgressScore(srsCards),
      recentActivity: this.calculateRecentActivityScore(sessions),
      consistency: this.calculateConsistencyScore(sessions)
    };

    // Weighted average of all factors
    const weights = {
      sessionCount: 0.2,
      successRate: 0.3,
      srsProgress: 0.25,
      recentActivity: 0.15,
      consistency: 0.1
    };

    const weightedScore = Object.keys(factors).reduce((total, factor) => {
      return total + (factors[factor] * weights[factor]);
    }, 0);

    return Math.round(weightedScore * 5) / 5; // Round to nearest 0.5
  }

  // Session count score (0-1)
  calculateSessionScore(sessions) {
    if (!sessions || sessions.length === 0) return 0;
    
    const sessionCount = sessions.length;
    if (sessionCount >= 10) return 1;
    if (sessionCount >= 5) return 0.8;
    if (sessionCount >= 3) return 0.6;
    if (sessionCount >= 1) return 0.4;
    return 0;
  }

  // Success rate score (0-1)
  calculateSuccessRateScore(sessions) {
    if (!sessions || sessions.length === 0) return 0;
    
    const totalSuccessRate = sessions.reduce((sum, session) => {
      return sum + (session.successRate || 0);
    }, 0);
    
    const averageSuccessRate = totalSuccessRate / sessions.length;
    
    if (averageSuccessRate >= 90) return 1;
    if (averageSuccessRate >= 80) return 0.9;
    if (averageSuccessRate >= 70) return 0.8;
    if (averageSuccessRate >= 60) return 0.7;
    if (averageSuccessRate >= 50) return 0.6;
    if (averageSuccessRate >= 40) return 0.5;
    if (averageSuccessRate >= 30) return 0.4;
    if (averageSuccessRate >= 20) return 0.3;
    return 0.2;
  }

  // SRS progress score (0-1)
  calculateSRSProgressScore(srsCards) {
    if (!srsCards || srsCards.length === 0) return 0;
    
    const totalCards = srsCards.length;
    const matureCards = srsCards.filter(card => 
      card.repetitions >= 3 && card.interval >= 7
    ).length;
    
    const maturePercentage = (matureCards / totalCards) * 100;
    
    if (maturePercentage >= 80) return 1;
    if (maturePercentage >= 60) return 0.8;
    if (maturePercentage >= 40) return 0.6;
    if (maturePercentage >= 20) return 0.4;
    return 0.2;
  }

  // Recent activity score (0-1)
  calculateRecentActivityScore(sessions) {
    if (!sessions || sessions.length === 0) return 0;
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentSessions = sessions.filter(session => 
      new Date(session.timestamp) >= oneWeekAgo
    ).length;
    
    const monthlySessions = sessions.filter(session => 
      new Date(session.timestamp) >= oneMonthAgo
    ).length;
    
    if (recentSessions >= 3) return 1;
    if (recentSessions >= 2) return 0.8;
    if (recentSessions >= 1) return 0.6;
    if (monthlySessions >= 1) return 0.4;
    return 0.2;
  }

  // Consistency score (0-1)
  calculateConsistencyScore(sessions) {
    if (!sessions || sessions.length < 2) return 0;
    
    const sortedSessions = sessions
      .map(s => new Date(s.timestamp))
      .sort((a, b) => a - b);
    
    const intervals = [];
    for (let i = 1; i < sortedSessions.length; i++) {
      const interval = (sortedSessions[i] - sortedSessions[i-1]) / (1000 * 60 * 60 * 24);
      intervals.push(interval);
    }
    
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    if (averageInterval <= 3) return 1;
    if (averageInterval <= 7) return 0.8;
    if (averageInterval <= 14) return 0.6;
    if (averageInterval <= 30) return 0.4;
    return 0.2;
  }

  // Get mastery level description
  getMasteryDescription(level) {
    const descriptions = {
      1: { text: "Limited Understanding", color: "text-red-600", bgColor: "bg-red-100", icon: AlertCircle },
      2: { text: "Basic Understanding", color: "text-orange-600", bgColor: "bg-orange-100", icon: Clock },
      3: { text: "Developing Understanding", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: BookOpen },
      4: { text: "Good Understanding", color: "text-blue-600", bgColor: "bg-blue-100", icon: CheckCircle },
      5: { text: "Very Strong Understanding", color: "text-green-600", bgColor: "bg-green-100", icon: Award }
    };
    
    return descriptions[Math.floor(level)] || descriptions[1];
  }

  // Calculate days until exam
  getDaysUntilExam() {
    const today = new Date();
    const timeDiff = this.examDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Check if a card is due for review
  isCardDue(card) {
    if (!card.nextReview) return true;
    const today = new Date();
    const nextReview = new Date(card.nextReview);
    return today >= nextReview;
  }

  // Get overall progress score
  calculateOverallProgress(allTopicsData) {
    const topicScores = Object.values(allTopicsData).map(topic => topic.masteryLevel);
    const averageScore = topicScores.reduce((sum, score) => sum + score, 0) / topicScores.length;
    
    return Math.round(averageScore * 10) / 10;
  }
}

function ProgressDashboard({ onBack }) {
  const [allTopicsData, setAllTopicsData] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [daysUntilExam, setDaysUntilExam] = useState(0);

  const calculator = new MasteryCalculator();

  useEffect(() => {
    loadAllTopicsData();
    setDaysUntilExam(calculator.getDaysUntilExam());
  }, []);

  useEffect(() => {
    if (Object.keys(allTopicsData).length > 0) {
      const overall = calculator.calculateOverallProgress(allTopicsData);
      setOverallProgress(overall);
    }
  }, [allTopicsData]);

  const loadAllTopicsData = () => {
    const topicsData = {};
    
    Object.keys(psychologyTopics).forEach(topicId => {
      const topic = psychologyTopics[topicId];
      
      const allSessions = [];
      const allSrsCards = [];
      
      topic.subTopics.forEach(subTopic => {
        const sessions = JSON.parse(localStorage.getItem(`flashcard-history-${subTopic.id}`) || '[]');
        const srsCards = JSON.parse(localStorage.getItem(`srs-cards-${subTopic.id}`) || '[]');
        
        allSessions.push(...sessions);
        allSrsCards.push(...srsCards);
      });
      
      const masteryLevel = calculator.calculateMasteryLevel(topicId, allSessions, allSrsCards);
      const masteryInfo = calculator.getMasteryDescription(masteryLevel);
      
      topicsData[topicId] = {
        ...topic,
        masteryLevel,
        masteryInfo,
        totalSessions: allSessions.length,
        totalSrsCards: allSrsCards.length,
        averageSuccessRate: allSessions.length > 0 
          ? Math.round(allSessions.reduce((sum, s) => sum + (s.successRate || 0), 0) / allSessions.length)
          : 0,
        lastStudied: allSessions.length > 0 
          ? new Date(Math.max(...allSessions.map(s => new Date(s.timestamp))))
          : null,
        dueToday: allSrsCards.filter(card => calculator.isCardDue(card)).length
      };
    });
    
    setAllTopicsData(topicsData);
  };

  const getProgressColor = (level) => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-blue-600';
    if (level >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (level) => {
    if (level >= 4) return 'bg-green-500';
    if (level >= 3) return 'bg-blue-500';
    if (level >= 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatLastStudied = (date) => {
    if (!date) return 'Never studied';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learning Progress Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Track your mastery across all AQA Psychology topics
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Overall Progress Summary */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Overall Progress
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getProgressColor(overallProgress)}`}>
                {overallProgress.toFixed(1)}/5.0
              </div>
              <div className="text-sm text-gray-600">Mastery Level</div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressBarColor(overallProgress)}`}
                    style={{ width: `${(overallProgress / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">
                {daysUntilExam}
              </div>
              <div className="text-sm text-gray-600">Days Until Exam</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {Object.values(allTopicsData).filter(topic => topic.masteryLevel >= 3).length}
              </div>
              <div className="text-sm text-gray-600">Topics at Good Level (3+)</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">
                {Object.values(allTopicsData).filter(topic => topic.masteryLevel < 3).length}
              </div>
                              <div className="text-sm text-gray-600">Topics Need Work (&lt;3)</div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(allTopicsData).map(([topicId, topic]) => {
            const IconComponent = topic.masteryInfo.icon;
            
            return (
              <div 
                key={topicId}
                className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{topic.title}</h3>
                    <p className="text-sm text-gray-600">{topic.component}</p>
                  </div>
                  <IconComponent className={`w-6 h-6 ${topic.masteryInfo.color}`} />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mastery Level:</span>
                    <span className={`font-semibold ${topic.masteryInfo.color}`}>
                      {topic.masteryLevel.toFixed(1)}/5.0
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressBarColor(topic.masteryLevel)}`}
                      style={{ width: `${(topic.masteryLevel / 5) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {topic.masteryInfo.text}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Sessions:</span>
                      <span className="font-semibold ml-1">{topic.totalSessions}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-semibold ml-1">{topic.averageSuccessRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">SRS Cards:</span>
                      <span className="font-semibold ml-1">{topic.totalSrsCards}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Due Today:</span>
                      <span className="font-semibold ml-1">{topic.dueToday}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Last studied: {formatLastStudied(topic.lastStudied)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Study Recommendations */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-600" />
            Study Recommendations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Priority Topics (Mastery &lt; 3)</h3>
              <div className="space-y-2">
                {Object.entries(allTopicsData)
                  .filter(([, topic]) => topic.masteryLevel < 3)
                  .sort((a, b) => a[1].masteryLevel - b[1].masteryLevel)
                  .slice(0, 5)
                  .map(([topicId, topic]) => (
                    <div key={topicId} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm">{topic.title}</span>
                      <span className="text-sm font-semibold text-red-600">
                        {topic.masteryLevel.toFixed(1)}/5.0
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Topics Due for Review</h3>
              <div className="space-y-2">
                {Object.entries(allTopicsData)
                  .filter(([, topic]) => topic.dueToday > 0)
                  .sort((a, b) => b[1].dueToday - a[1].dueToday)
                  .slice(0, 5)
                  .map(([topicId, topic]) => (
                    <div key={topicId} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="text-sm">{topic.title}</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {topic.dueToday} cards due
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressDashboard; 