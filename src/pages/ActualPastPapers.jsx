import React, { useState } from 'react';
import { FileText, ExternalLink, Calendar, Clock, ChevronRight } from 'lucide-react';
import { getSelectedCurriculum } from '../config/curricula';

// Past paper links by curriculum
const PAST_PAPERS = {
  'aqa-psych': {
    examBoard: 'AQA',
    subject: 'Psychology',
    code: '7182',
    papers: [
      { year: 2023, session: 'June', paper: 'Paper 1', url: 'https://www.aqa.org.uk/subjects/psychology/as-and-a-level/psychology-7181-7182/assessment-resources' },
      { year: 2023, session: 'June', paper: 'Paper 2', url: 'https://www.aqa.org.uk/subjects/psychology/as-and-a-level/psychology-7181-7182/assessment-resources' },
      { year: 2023, session: 'June', paper: 'Paper 3', url: 'https://www.aqa.org.uk/subjects/psychology/as-and-a-level/psychology-7181-7182/assessment-resources' },
      { year: 2022, session: 'June', paper: 'Paper 1', url: 'https://www.aqa.org.uk/subjects/psychology/as-and-a-level/psychology-7181-7182/assessment-resources' },
      { year: 2022, session: 'June', paper: 'Paper 2', url: 'https://www.aqa.org.uk/subjects/psychology/as-and-a-level/psychology-7181-7182/assessment-resources' },
      { year: 2022, session: 'June', paper: 'Paper 3', url: 'https://www.aqa.org.uk/subjects/psychology/as-and-a-level/psychology-7181-7182/assessment-resources' },
    ],
    resourceLink: 'https://www.aqa.org.uk/subjects/psychology/as-and-a-level/psychology-7181-7182/assessment-resources'
  },
  'ocr-rs': {
    examBoard: 'OCR',
    subject: 'Religious Studies',
    code: 'H573',
    papers: [
      { year: 2023, session: 'June', paper: 'Philosophy of Religion', url: 'https://www.ocr.org.uk/qualifications/as-and-a-level/religious-studies-h173-h573-from-2016/assessment/' },
      { year: 2023, session: 'June', paper: 'Religion and Ethics', url: 'https://www.ocr.org.uk/qualifications/as-and-a-level/religious-studies-h173-h573-from-2016/assessment/' },
      { year: 2023, session: 'June', paper: 'Developments in Religious Thought', url: 'https://www.ocr.org.uk/qualifications/as-and-a-level/religious-studies-h173-h573-from-2016/assessment/' },
      { year: 2022, session: 'June', paper: 'Philosophy of Religion', url: 'https://www.ocr.org.uk/qualifications/as-and-a-level/religious-studies-h173-h573-from-2016/assessment/' },
      { year: 2022, session: 'June', paper: 'Religion and Ethics', url: 'https://www.ocr.org.uk/qualifications/as-and-a-level/religious-studies-h173-h573-from-2016/assessment/' },
      { year: 2022, session: 'June', paper: 'Developments in Religious Thought', url: 'https://www.ocr.org.uk/qualifications/as-and-a-level/religious-studies-h173-h573-from-2016/assessment/' },
    ],
    resourceLink: 'https://www.ocr.org.uk/qualifications/as-and-a-level/religious-studies-h173-h573-from-2016/assessment/'
  },
  'edexcel-englit': {
    examBoard: 'Edexcel',
    subject: 'English Literature',
    code: '9ET0',
    papers: [
      { year: 2023, session: 'June', paper: 'Paper 1: Drama', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/english-literature-2015.html' },
      { year: 2023, session: 'June', paper: 'Paper 2: Prose', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/english-literature-2015.html' },
      { year: 2023, session: 'June', paper: 'Paper 3: Poetry', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/english-literature-2015.html' },
      { year: 2022, session: 'June', paper: 'Paper 1: Drama', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/english-literature-2015.html' },
      { year: 2022, session: 'June', paper: 'Paper 2: Prose', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/english-literature-2015.html' },
      { year: 2022, session: 'June', paper: 'Paper 3: Poetry', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/english-literature-2015.html' },
    ],
    resourceLink: 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/english-literature-2015.html'
  }
};

function ActualPastPapers({ onBack }) {
  const curriculum = getSelectedCurriculum() || 'aqa-psych';
  const data = PAST_PAPERS[curriculum] || PAST_PAPERS['aqa-psych'];
  const [selectedYear, setSelectedYear] = useState(null);

  const years = [...new Set(data.papers.map(p => p.year))].sort((a, b) => b - a);
  const filteredPapers = selectedYear 
    ? data.papers.filter(p => p.year === selectedYear)
    : data.papers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="text-blue-600 underline mb-6">← Back to Home</button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-slate-700" />
            <h1 className="text-3xl font-bold text-slate-800">Actual Past Papers</h1>
          </div>
          <p className="text-slate-600">{data.examBoard} {data.subject} ({data.code})</p>
        </div>

        {/* Quick link to exam board */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <a 
            href={data.resourceLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between text-blue-600 hover:text-blue-800"
          >
            <span className="font-medium">📎 Go to {data.examBoard} Past Papers Portal</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

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

        {/* Papers list */}
        <div className="space-y-3">
          {filteredPapers.map((paper, idx) => (
            <a
              key={idx}
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 rounded-full p-2">
                    <Calendar className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{paper.paper}</div>
                    <div className="text-sm text-slate-500">{paper.session} {paper.year}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </a>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 mb-2">💡 Exam Practice Tips</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Time yourself under exam conditions</li>
            <li>• Use the mark scheme to self-assess after</li>
            <li>• Focus on one paper type per session</li>
            <li>• Review examiner reports for common mistakes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ActualPastPapers;

