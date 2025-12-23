import React, { useState } from 'react';
import { FileText, ExternalLink, Calendar, Clock, ChevronRight, Play, BookOpen } from 'lucide-react';
import { getSelectedCurriculum } from '../config/curricula';
import { getAvailablePapers, getPapersByYear } from '../config/pastPaperIndex';
import InteractiveExam from './InteractiveExam';

// External links for papers not in vault
const EXTERNAL_LINKS = {
  'aqa-psych': 'https://www.aqa.org.uk/subjects/psychology/as-and-a-level/psychology-7181-7182/assessment-resources',
  'ocr-rs': 'https://www.ocr.org.uk/qualifications/as-and-a-level/religious-studies-h173-h573-from-2016/assessment/',
  'edexcel-englit': 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/english-literature-2015.html'
};

const EXAM_BOARD_NAMES = {
  'aqa-psych': { board: 'AQA', subject: 'Psychology', code: '7182' },
  'ocr-rs': { board: 'OCR', subject: 'Religious Studies', code: 'H573' },
  'edexcel-englit': { board: 'Edexcel', subject: 'English Literature', code: '9ET0' }
};

function ActualPastPapers({ onBack }) {
  const curriculum = getSelectedCurriculum() || 'aqa-psych';
  const availablePapers = getAvailablePapers(curriculum);
  const papersByYear = getPapersByYear(curriculum);
  const examInfo = EXAM_BOARD_NAMES[curriculum] || EXAM_BOARD_NAMES['aqa-psych'];
  
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  
  const years = Object.keys(papersByYear).sort((a, b) => b.localeCompare(a));
  
  // If a paper is selected, show the interactive exam
  if (selectedPaperId) {
    return (
      <InteractiveExam 
        paperId={selectedPaperId} 
        onBack={() => setSelectedPaperId(null)} 
      />
    );
  }
  
  // Defensive: ensure we always have an array to map over
  const displayPapersRaw = selectedYear ? papersByYear[selectedYear] : availablePapers;
  const displayPapers = Array.isArray(displayPapersRaw) ? displayPapersRaw : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="text-blue-600 underline mb-6">← Back to Home</button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-slate-700" />
            <h1 className="text-3xl font-bold text-slate-800">Actual Past Papers</h1>
          </div>
          <p className="text-slate-600">{examInfo.board} {examInfo.subject} ({examInfo.code})</p>
        </div>

        {/* Quick link to exam board */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <a 
            href={EXTERNAL_LINKS[curriculum]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between text-blue-600 hover:text-blue-800"
          >
            <span className="font-medium">📎 Go to {examInfo.board} Past Papers Portal (for more papers)</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        {availablePapers.length > 0 ? (
          <>
            {/* Year filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setSelectedYear(null)}
                className={`px-4 py-2 rounded-lg font-medium ${!selectedYear ? 'bg-slate-700 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
              >
                All Years
              </button>
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-lg font-medium ${selectedYear === year ? 'bg-slate-700 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Info banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <BookOpen className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800">Interactive Exams Available!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    These papers are loaded from your vault. You can take them as timed exams and get AI-powered marking using the official mark schemes.
                  </p>
                </div>
              </div>
            </div>

            {/* Papers list */}
            <div className="space-y-3">
              {displayPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 rounded-full p-2">
                        <Calendar className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{paper.paper}</div>
                        <div className="text-sm text-slate-500">{paper.session} {paper.year} • {paper.code}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" /> {paper.duration} min
                          <span>•</span>
                          {paper.totalMarks} marks
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPaperId(paper.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      <Play className="w-4 h-4" /> Take Exam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <p className="text-amber-800 mb-4">No past papers found in vault for this curriculum.</p>
            <a 
              href={EXTERNAL_LINKS[curriculum]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              View on {examInfo.board} Website <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Exam Practice Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Time yourself under exam conditions</li>
            <li>• The AI will mark your answers using the official mark scheme</li>
            <li>• Review the feedback carefully to identify areas for improvement</li>
            <li>• Practice one paper type per session for focused revision</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ActualPastPapers;
