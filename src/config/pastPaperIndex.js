/**
 * Index of available past papers in the vault
 * Each paper has: id, year, session, paper name, question file path, mark scheme path
 */

export const PAST_PAPER_INDEX = {
  'aqa-psych': [
    // June 2022 AS Papers
    {
      id: 'aqa-71811-jun22',
      year: 2022,
      session: 'June',
      level: 'AS',
      paper: 'Paper 1: Introductory Topics',
      code: '7181/1',
      questionFile: '/vault/PastPapers/AQA-71811-QP-JUN22-1_extracted.txt',
      markSchemeFile: '/vault/PastPapers/AQA-71811-Marking Scheme-JUN22_extracted.txt',
      duration: 90, // minutes
      totalMarks: 72,
      sections: ['Social Influence', 'Memory', 'Attachment', 'Psychopathology']
    },
    {
      id: 'aqa-71812-jun22',
      year: 2022,
      session: 'June',
      level: 'AS',
      paper: 'Paper 2: Psychology in Context',
      code: '7181/2',
      questionFile: '/vault/PastPapers/AQA-71812-QP-JUN22_extracted.txt',
      markSchemeFile: '/vault/PastPapers/AQA-71812-Marking Scheme-JUN22_extracted.txt',
      duration: 90,
      totalMarks: 72,
      sections: ['Approaches', 'Biopsychology', 'Research Methods']
    },
    // June 2019 AS Papers
    {
      id: 'aqa-71811-jun19',
      year: 2019,
      session: 'June',
      level: 'AS',
      paper: 'Paper 1: Introductory Topics',
      code: '7181/1',
      questionFile: '/vault/PastPapers/AQA-71811-QP-JUN19_extracted.txt',
      markSchemeFile: '/vault/PastPapers/AQA-71811-W-Marking Scheme-JUN19_extracted.txt',
      duration: 90,
      totalMarks: 72,
      sections: ['Social Influence', 'Memory', 'Attachment', 'Psychopathology']
    },
    {
      id: 'aqa-71812-jun19',
      year: 2019,
      session: 'June',
      level: 'AS',
      paper: 'Paper 2: Psychology in Context',
      code: '7181/2',
      questionFile: '/vault/PastPapers/AQA-71812-QP-JUN19_extracted.txt',
      markSchemeFile: '/vault/PastPapers/AQA-71812-W-Marking Scheme-JUN19_extracted.txt',
      duration: 90,
      totalMarks: 72,
      sections: ['Approaches', 'Biopsychology', 'Research Methods']
    },
    // November 2020 AS Papers
    {
      id: 'aqa-71811-nov20',
      year: 2020,
      session: 'November',
      level: 'AS',
      paper: 'Paper 1: Introductory Topics',
      code: '7181/1',
      questionFile: '/vault/PastPapers/AQA-71811-QP-NOV20_extracted.txt',
      markSchemeFile: '/vault/PastPapers/AQA-71811-W-Marking Scheme-NOV20_extracted.txt',
      duration: 90,
      totalMarks: 72,
      sections: ['Social Influence', 'Memory', 'Attachment', 'Psychopathology']
    },
    {
      id: 'aqa-71812-nov20',
      year: 2020,
      session: 'November',
      level: 'AS',
      paper: 'Paper 2: Psychology in Context',
      code: '7181/2',
      questionFile: '/vault/PastPapers/AQA-71812-QP-NOV20_extracted.txt',
      markSchemeFile: '/vault/PastPapers/AQA-71812-W-Marking Scheme-NOV20_extracted.txt',
      duration: 90,
      totalMarks: 72,
      sections: ['Approaches', 'Biopsychology', 'Research Methods']
    },
  ],
  'ocr-rs': [
    // NOTE: OCR papers currently point to PDFs - interactive exams require extracted .txt files
    // To enable these papers, extract the PDFs using the vault extraction process
    // Christianity June 2022
    {
      id: 'ocr-h573-c-jun22',
      year: 2022,
      session: 'June',
      level: 'A2',
      paper: 'Paper 3: Developments in Christian Thought',
      code: 'H573/03',
      questionFile: '/vault/ocr-rs/vault/Exam Board Materials/C - June 2022 Exam Paper.pdf', // TODO: Extract to .txt
      markSchemeFile: '/vault/ocr-rs/vault/Exam Board Materials/C - June 2022 Mark Scheme.pdf', // TODO: Extract to .txt
      duration: 120,
      totalMarks: 120,
      sections: ['Augustine', 'Death and Afterlife', 'Knowledge of God', 'Christian Moral Principles']
    },
    // Christianity June 2023
    {
      id: 'ocr-h573-c-jun23',
      year: 2023,
      session: 'June',
      level: 'A2',
      paper: 'Paper 3: Developments in Christian Thought',
      code: 'H573/03',
      questionFile: '/vault/ocr-rs/vault/Exam Board Materials/C - June 2023 Exam Paper.pdf', // TODO: Extract to .txt
      markSchemeFile: '/vault/ocr-rs/vault/Exam Board Materials/C - June 2023 Mark Scheme.pdf', // TODO: Extract to .txt
      duration: 120,
      totalMarks: 120,
      sections: ['Augustine', 'Death and Afterlife', 'Knowledge of God', 'Christian Moral Principles']
    },
  ],
  'edexcel-englit': [
    // No past papers in vault yet - placeholder
    // When adding papers, ensure questionFile and markSchemeFile point to .txt extracted files, not PDFs
  ]
};

/**
 * Get available papers for a curriculum
 */
export function getAvailablePapers(curriculum) {
  return PAST_PAPER_INDEX[curriculum] || [];
}

/**
 * Get a specific paper by ID
 */
export function getPaperById(curriculum, paperId) {
  const papers = PAST_PAPER_INDEX[curriculum] || [];
  return papers.find(p => p.id === paperId);
}

/**
 * Group papers by year
 */
export function getPapersByYear(curriculum) {
  const papers = PAST_PAPER_INDEX[curriculum] || [];
  const grouped = {};
  papers.forEach(p => {
    const key = `${p.year} ${p.session}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });
  return grouped;
}

