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
      questionFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71811-QP-JUN22-1_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71811-Marking Scheme-JUN22_extracted.txt',
      duration: 90, // minutes
      totalMarks: 72,
      sections: ['Social Influence', 'Memory', 'Attachment', 'Psychopathology'],
      // Optional JSON template for cleaner interactive rendering (pilot)
      jsonFile: '/exam-json/aqa-71811-jun22.json'
    },
    {
      id: 'aqa-71812-jun22',
      year: 2022,
      session: 'June',
      level: 'AS',
      paper: 'Paper 2: Psychology in Context',
      code: '7181/2',
      questionFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71812-QP-JUN22_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71812-Marking Scheme-JUN22_extracted.txt',
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
      questionFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71811-QP-JUN19_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71811-W-Marking Scheme-JUN19_extracted.txt',
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
      questionFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71812-QP-JUN19_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71812-W-Marking Scheme-JUN19_extracted.txt',
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
      questionFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71811-QP-NOV20_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71811-W-Marking Scheme-NOV20_extracted.txt',
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
      questionFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71812-QP-NOV20_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/Psychology/AQA-71812-W-Marking Scheme-NOV20_extracted.txt',
      duration: 90,
      totalMarks: 72,
      sections: ['Approaches', 'Biopsychology', 'Research Methods']
    },
    // A-level Paper 3: Issues and Options in Psychology (selected years)
    {
      id: 'aqa-71823-jun19',
      year: 2019,
      session: 'June',
      level: 'A-level',
      paper: 'Paper 3: Issues and Options in Psychology',
      code: '7182/3',
      questionFile: '/vault/ocr-rs/vault/PastPapers/Psychology/June 2019 QP - Paper 3 AQA Psychology A-level_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/Psychology/June 2019 MS - Paper 3 AQA Psychology A-level_extracted.txt',
      duration: 120,
      totalMarks: 96,
      sections: ['Issues and Debates', 'Options essays']
    },
    {
      id: 'aqa-71823-jun22',
      year: 2022,
      session: 'June',
      level: 'A-level',
      paper: 'Paper 3: Issues and Options in Psychology',
      code: '7182/3',
      questionFile: '/vault/ocr-rs/vault/PastPapers/Psychology/June 2022 QP - Paper 3 AQA Psychology A-level_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/Psychology/June 2022 MS - Paper 3 AQA Psychology A-level_extracted.txt',
      duration: 120,
      totalMarks: 96,
      sections: ['Issues and Debates', 'Options essays']
    },
  ],
  'ocr-rs': [
    // Philosophy of Religion Autumn 2021 (H573/01)
    {
      id: 'ocr-h573-phil-oct21',
      year: 2021,
      session: 'October',
      level: 'A2',
      paper: 'Paper 1: Philosophy of Religion',
      code: 'H573/01',
      questionFile: '/vault/ocr-rs/vault/PastPapers/Religious Studies/666950-question-paper-philosophy-of-religion_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/Religious Studies/666956-mark-scheme-philosophy-of-religion_extracted.txt',
      duration: 120,
      totalMarks: 120,
      questionsToAnswer: 3, // candidate answers any 3 out of 4 x 40-mark questions
      sections: ['Philosophy of Religion']
    },
    // Christianity June 2022 (now using extracted text for interactive exam)
    {
      id: 'ocr-h573-c-jun22',
      year: 2022,
      session: 'June',
      level: 'A2',
      paper: 'Paper 3: Developments in Christian Thought',
      code: 'H573/03',
      questionFile: '/vault/ocr-rs/vault/Exam Board Materials/C - June 2022 Exam Paper_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/Exam Board Materials/C - June 2022 Mark Scheme_extracted.txt',
      duration: 120,
      totalMarks: 120,
      sections: ['Augustine', 'Death and Afterlife', 'Knowledge of God', 'Christian Moral Principles']
    },
    // Christianity June 2023 (still pointing at PDFs until extracted)
    {
      id: 'ocr-h573-c-jun23',
      year: 2023,
      session: 'June',
      level: 'A2',
      paper: 'Paper 3: Developments in Christian Thought',
      code: 'H573/03',
      questionFile: '/vault/ocr-rs/vault/Exam Board Materials/C - June 2023 Exam Paper.pdf',
      markSchemeFile: '/vault/ocr-rs/vault/Exam Board Materials/C - June 2023 Mark Scheme.pdf',
      duration: 120,
      totalMarks: 120,
      sections: ['Augustine', 'Death and Afterlife', 'Knowledge of God', 'Christian Moral Principles']
    },
  ],
  'edexcel-englit': [
    // Edexcel English Literature A-level – sample of interactive papers
    {
      id: 'edexcel-9et0-p1-jun22',
      year: 2022,
      session: 'June',
      level: 'A-level',
      paper: 'Paper 1: Drama',
      code: '9ET0/01',
      questionFile: '/vault/ocr-rs/vault/PastPapers/English Literature/June 2022 QP - Paper 1 Edexcel English Literature A-level_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/English Literature/June 2022 MS - Paper 1 Edexcel English Literature A-level_extracted.txt',
      duration: 150,
      totalMarks: 60,
      sections: ['Drama']
    },
    {
      id: 'edexcel-9et0-p2-jun22',
      year: 2022,
      session: 'June',
      level: 'A-level',
      paper: 'Paper 2: Prose',
      code: '9ET0/02',
      questionFile: '/vault/ocr-rs/vault/PastPapers/English Literature/June 2022 QP - Paper 2 Edexcel English Literature A-level_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/English Literature/June 2022 MS - Paper 2 Edexcel English Literature A-level_extracted.txt',
      duration: 120,
      totalMarks: 40,
      sections: ['Prose']
    },
    {
      id: 'edexcel-9et0-p3-jun22',
      year: 2022,
      session: 'June',
      level: 'A-level',
      paper: 'Paper 3: Poetry',
      code: '9ET0/03',
      questionFile: '/vault/ocr-rs/vault/PastPapers/English Literature/June 2022 QP - Paper 3 Edexcel English Literature A-level_extracted.txt',
      markSchemeFile: '/vault/ocr-rs/vault/PastPapers/English Literature/June 2022 MS - Paper 3 Edexcel English Literature A-level_extracted.txt',
      duration: 120,
      totalMarks: 40,
      sections: ['Poetry']
    },
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

