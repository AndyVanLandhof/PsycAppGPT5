export const CURRICULA = {
  'aqa-psych': { id: 'aqa-psych', label: 'AQA Psychology 7182' },
  'ocr-rs': { id: 'ocr-rs', label: 'OCR Religious Studies H573' }
};

export function getSelectedCurriculum() {
  try {
    return localStorage.getItem('curriculum');
  } catch (_) {
    return null;
  }
}

export function setSelectedCurriculum(id) {
  try {
    localStorage.setItem('curriculum', id);
  } catch (_) {}
}

