export const DIFFICULTIES = {
  1: {
    id: 1,
    label: 'Lako',
    columnPoints: { 1: 40, 2: 30, 3: 20, 4: 10 },
    zeroOpenColumnPoints: 50,
    finalBonus: 60,
    buyAnswerCost: 20,
    columnAttempts: null,
    finalAttempts: null,
    finalRequiredSolvedColumns: 1,
    initialRevealMode: 'one_per_column',
  },
  2: {
    id: 2,
    label: 'Srednje',
    columnPoints: { 1: 40, 2: 30, 3: 20, 4: 10 },
    zeroOpenColumnPoints: 50,
    finalBonus: 80,
    buyAnswerCost: 30,
    columnAttempts: 5,
    finalAttempts: null,
    finalRequiredSolvedColumns: 2,
    initialRevealMode: 'two_random_columns',
  },
  3: {
    id: 3,
    label: 'Teško',
    columnPoints: { 1: 50, 2: 40, 3: 30, 4: 20 },
    zeroOpenColumnPoints: 60,
    finalBonus: 100,
    buyAnswerCost: 40,
    columnAttempts: 3,
    finalAttempts: 5,
    finalRequiredSolvedColumns: 3,
    initialRevealMode: 'none',
  },
};

export const DEFAULT_DIFFICULTY_ID = 1;

export function getDifficulty(difficultyId) {
  return DIFFICULTIES[difficultyId] || DIFFICULTIES[DEFAULT_DIFFICULTY_ID];
}

export function getColumnPoints(revealedCount, difficulty) {
  if (revealedCount === 0) {
    return difficulty.zeroOpenColumnPoints;
  }

  return difficulty.columnPoints[Math.min(revealedCount, 4)];
}
