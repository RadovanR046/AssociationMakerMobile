export const STORAGE_KEYS = {
  stats: 'association-maker.stats',
  settings: 'association-maker.settings',
};

export const EMPTY_MODE_STATS = {
  bestScore: 0,
  totalGames: 0,
  completedGames: 0,
  totalScore: 0,
  perfectGames: 0,
  totalAttempts: 0,
  successfulAttempts: 0,
  currentStreak: 0,
  longestStreak: 0,
};

export const EMPTY_BLITZ_STATS = {
  ...EMPTY_MODE_STATS,
  bestByDifficulty: {
    1: 0,
    2: 0,
    3: 0,
  },
};

export const EMPTY_STATS = {
  ...EMPTY_MODE_STATS,
  blitz: { ...EMPTY_BLITZ_STATS },
};

export const DEFAULT_SETTINGS = {
  difficultyId: 1,
  colorMode: 'dark',
  themeId: 'classic',
};
