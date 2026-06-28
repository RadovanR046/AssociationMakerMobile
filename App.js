import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';

import { LEVELS } from './src/constants/levels';
import {
  EMPTY_BLITZ_STATS,
  DEFAULT_SETTINGS,
  EMPTY_MODE_STATS,
  EMPTY_STATS,
  STORAGE_KEYS,
} from './src/constants/storage';
import { getActiveTheme } from './src/constants/themes';
import { BlitzLevelsScreen } from './src/screens/BlitzLevelsScreen';
import { BlitzScreen } from './src/screens/BlitzScreen';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { HowToScreen } from './src/screens/HowToScreen';
import { LevelsScreen } from './src/screens/LevelsScreen';
import { NewGameScreen } from './src/screens/NewGameScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { ThemeProvider } from './src/theme/ThemeContext';

const ASSOCIATION_FEEDBACK_DURATION_MS = 2000;
const BLITZ_FEEDBACK_DURATION_MS = 1000;

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedLevel, setSelectedLevel] = useState(LEVELS[0]);
  const [selectedBlitzLevel, setSelectedBlitzLevel] = useState(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const theme = useMemo(() => getActiveTheme(settings), [settings]);

  useEffect(() => {
    function normalizeStatBlock(storedStats = {}) {
      return {
        ...EMPTY_MODE_STATS,
        ...storedStats,
        totalGames: storedStats.totalGames ?? storedStats.gamesPlayed ?? 0,
        completedGames: storedStats.completedGames ?? 0,
        perfectGames: storedStats.perfectGames ?? 0,
        longestStreak: storedStats.longestStreak ?? storedStats.longestCombo ?? 0,
      };
    }

    function normalizeStats(storedStats) {
      const storedBlitzStats = storedStats.blitz || {};

      return {
        ...normalizeStatBlock(storedStats),
        blitz: {
          ...EMPTY_BLITZ_STATS,
          ...normalizeStatBlock(storedBlitzStats),
          bestByDifficulty: {
            ...EMPTY_BLITZ_STATS.bestByDifficulty,
            ...(storedBlitzStats.bestByDifficulty || {}),
          },
        },
      };
    }

    async function loadStoredData() {
      const [storedStats, storedSettings] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.stats),
        AsyncStorage.getItem(STORAGE_KEYS.settings),
      ]);

      if (storedStats) {
        setStats(normalizeStats(JSON.parse(storedStats)));
      }

      if (storedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      }
    }

    loadStoredData();
  }, []);

  const goHome = () => setScreen('home');

  function startLevel(level) {
    setSelectedLevel(level);
    setScreen('game');
  }

  function startRandomLevel() {
    const randomLevel = LEVELS[Math.floor(Math.random() * LEVELS.length)];
    startLevel(randomLevel);
  }

  function startBlitz(level) {
    setSelectedBlitzLevel(level);
    setScreen('blitzGame');
  }

  async function updateStats(result) {
    const nextCurrentStreak = result.completed ? stats.currentStreak + 1 : 0;
    const nextStats = {
      ...stats,
      bestScore: result.completed ? Math.max(stats.bestScore, result.score) : stats.bestScore,
      totalGames: stats.totalGames + 1,
      completedGames: stats.completedGames + (result.completed ? 1 : 0),
      totalScore: stats.totalScore + result.score,
      perfectGames: stats.perfectGames + (result.perfect ? 1 : 0),
      totalAttempts: stats.totalAttempts + result.totalAttempts,
      successfulAttempts: stats.successfulAttempts + result.successfulAttempts,
      currentStreak: nextCurrentStreak,
      longestStreak: Math.max(stats.longestStreak, nextCurrentStreak),
    };

    setStats(nextStats);
    await AsyncStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(nextStats));
  }

  async function updateBlitzStats(result) {
    const blitzStats = stats.blitz || EMPTY_BLITZ_STATS;
    const difficultyKey = result.difficultyId || 1;
    const nextCurrentStreak = result.completed ? blitzStats.currentStreak + 1 : 0;
    const nextStats = {
      ...stats,
      blitz: {
        ...EMPTY_BLITZ_STATS,
        ...blitzStats,
        bestScore: result.completed
          ? Math.max(blitzStats.bestScore, result.score)
          : blitzStats.bestScore,
        bestByDifficulty: {
          ...EMPTY_BLITZ_STATS.bestByDifficulty,
          ...(blitzStats.bestByDifficulty || {}),
          [difficultyKey]: result.completed
            ? Math.max(blitzStats.bestByDifficulty?.[difficultyKey] || 0, result.score)
            : blitzStats.bestByDifficulty?.[difficultyKey] || 0,
        },
        totalGames: blitzStats.totalGames + 1,
        completedGames: blitzStats.completedGames + (result.completed ? 1 : 0),
        totalScore: blitzStats.totalScore + result.score,
        perfectGames: blitzStats.perfectGames + (result.perfect ? 1 : 0),
        totalAttempts: blitzStats.totalAttempts + result.totalAttempts,
        successfulAttempts: blitzStats.successfulAttempts + result.successfulAttempts,
        currentStreak: nextCurrentStreak,
        longestStreak: Math.max(blitzStats.longestStreak, nextCurrentStreak),
      },
    };

    setStats(nextStats);
    await AsyncStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(nextStats));
  }

  async function resetStats() {
    setStats(EMPTY_STATS);
    await AsyncStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(EMPTY_STATS));
  }

  const content = useMemo(() => {
    if (screen === 'levels') {
      return <LevelsScreen goHome={goHome} startLevel={startLevel} />;
    }

    if (screen === 'newGame') {
      return (
        <NewGameScreen
          chooseCategory={() => setScreen('levels')}
          difficultyId={settings.difficultyId}
          goHome={goHome}
          openSettings={() => setScreen('settings')}
          startLevel={startLevel}
        />
      );
    }

    if (screen === 'blitzLevels') {
      return <BlitzLevelsScreen goHome={goHome} startBlitz={startBlitz} />;
    }

    if (screen === 'stats') {
      return <StatsScreen goHome={goHome} stats={stats} />;
    }

    if (screen === 'how') {
      return <HowToScreen goHome={goHome} />;
    }

    if (screen === 'settings') {
      return (
        <SettingsScreen
          goHome={goHome}
          resetStats={resetStats}
          setSettings={setSettings}
          settings={settings}
          stats={stats}
        />
      );
    }

    if (screen === 'game') {
      return (
        <GameScreen
          difficultyId={settings.difficultyId}
          feedbackDurationMs={ASSOCIATION_FEEDBACK_DURATION_MS}
          goHome={goHome}
          level={selectedLevel}
          startRandomLevel={startRandomLevel}
          updateStats={updateStats}
        />
      );
    }

    if (screen === 'blitzGame') {
      return (
        <BlitzScreen
          bestScoreForDifficulty={
            stats.blitz?.bestByDifficulty?.[settings.difficultyId] || 0
          }
          difficultyId={settings.difficultyId}
          feedbackDurationMs={BLITZ_FEEDBACK_DURATION_MS}
          goHome={goHome}
          level={selectedBlitzLevel}
          updateStats={updateBlitzStats}
        />
      );
    }

    return <HomeScreen difficultyId={settings.difficultyId} setScreen={setScreen} />;
  }, [screen, selectedLevel, selectedBlitzLevel, settings, stats]);

  return (
    <ThemeProvider theme={theme}>
      <StatusBar style={theme.colorMode === 'dark' ? 'light' : 'dark'} />
      {content}
    </ThemeProvider>
  );
}
