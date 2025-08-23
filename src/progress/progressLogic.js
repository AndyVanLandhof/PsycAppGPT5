// Core progress logic for Learn → Reinforce → Exam → Complete

export const DEFAULT_THRESHOLDS = {
  reinforceReady: 0,      // after Learn accessed at least once
  examReady: 80,          // % needed across Reinforce to suggest Exam
  topicComplete: 70,      // % needed in Exam to mark complete
  lowReinforce: 60,       // <60 => "Keep learning"
  midReinforce: 80,       // 60–79 => "Do more reinforcement"
  lowExam: 50             // <50 => "Go back to Learn"
};

// Derive a single reinforcement score in [0..100]
export function computeReinforceScore({ flashAvgPct = null, quizAvgPct = null } = {}) {
  const scores = [flashAvgPct, quizAvgPct].filter((s) => s !== null && !isNaN(s));
  if (!scores.length) return null;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg);
}

// Decide the status label + next action
export function getProgressStatus(topicState = {}, thresholds = DEFAULT_THRESHOLDS) {
  const {
    learn = { study: false, conceptMap: false, audioStory: false },
    reinforce = { flashAvgPct: null, quizAvgPct: null },
    exam = { timedEssayPct: null, pastPaperPct: null, completed: false }
  } = topicState;

  const hasLearned = !!(learn.study || learn.conceptMap || learn.audioStory);
  const rScore = computeReinforceScore(reinforce || {});
  const eScores = [exam?.pastPaperPct ?? null, exam?.timedEssayPct ?? null].filter((x) => x !== null && !isNaN(x));
  const examScore = eScores.length ? Math.round(eScores.reduce((a, b) => a + b, 0) / eScores.length) : null;

  // Priority: Completed
  if (exam?.completed || (examScore !== null && examScore >= thresholds.topicComplete)) {
    return { phase: "Complete", message: "🎉 Topic complete", color: "green", rScore, examScore };
  }

  // Not reached Reinforce yet
  if (!hasLearned) {
    return { phase: "Learn", message: "", color: "blue", rScore, examScore };
  }

  // Learned but no Reinforce scores yet
  if (rScore === null) {
    return { phase: "Reinforce", message: "Reinforce next (flashcards/quiz)", color: "blue", rScore, examScore };
  }

  // Reinforce branch
  if (rScore < thresholds.lowReinforce) {
    return { phase: "Reinforce", message: "❗ Keep learning", color: "red", rScore, examScore };
  }

  if (rScore < thresholds.midReinforce) {
    return { phase: "Reinforce", message: "🔁 Do more reinforcement", color: "amber", rScore, examScore };
  }

  if (rScore >= thresholds.examReady && examScore === null) {
    return { phase: "Exam", message: "➡️ Time for your exam", color: "indigo", rScore, examScore };
  }

  // If exam score present
  if (examScore !== null) {
    if (examScore < thresholds.lowExam) {
      return { phase: "Learn", message: "❗ Go back to Learn", color: "red", rScore, examScore };
    }
    if (examScore < thresholds.topicComplete) {
      return { phase: "Reinforce", message: "🔁 More Reinforcement needed", color: "amber", rScore, examScore };
    }
    return { phase: "Complete", message: "🎉 Topic complete", color: "green", rScore, examScore };
  }

  // Default fallback
  return { phase: "Reinforce", message: "Reinforce next (flashcards/quiz)", color: "blue", rScore, examScore };
}


