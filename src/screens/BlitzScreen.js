import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Background } from '../components/Background';
import { Header } from '../components/Header';
import { ScoreBox } from '../components/ScoreBox';
import { getDifficulty } from '../constants/difficulties';
import { LEVELS } from '../constants/levels';
import { createBlitzPuzzle, normalize } from '../services/words';
import { useAppTheme } from '../theme/ThemeContext';

const BLITZ_DURATIONS = {
  1: 150,
  2: 120,
  3: 90,
};

const BLITZ_CLUE_COUNTS = {
  1: 5,
  2: 4,
  3: 3,
};

const BLITZ_POINTS = {
  1: [50, 40, 30, 20, 10],
  2: [40, 30, 20, 10],
  3: [30, 20, 10],
};

function randomLevel() {
  return LEVELS[Math.floor(Math.random() * LEVELS.length)];
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getBlitzPoints(openedCount, difficultyId) {
  const points = BLITZ_POINTS[difficultyId] || BLITZ_POINTS[1];
  const countedOpenFields = Math.max(openedCount, 1);
  return points[Math.min(countedOpenFields, points.length) - 1];
}

export function BlitzScreen({
  difficultyId,
  goHome,
  level,
  updateStats,
}) {
  const { styles } = useAppTheme();
  const difficulty = getDifficulty(difficultyId);
  const duration = BLITZ_DURATIONS[difficulty.id] || BLITZ_DURATIONS[1];
  const clueCount = BLITZ_CLUE_COUNTS[difficulty.id] || BLITZ_CLUE_COUNTS[1];
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [revealed, setRevealed] = useState([]);
  const [guess, setGuess] = useState('');
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [successfulAttempts, setSuccessfulAttempts] = useState(0);
  const [missedPuzzles, setMissedPuzzles] = useState([]);
  const [correctFeedback, setCorrectFeedback] = useState(null);
  const scoreRef = useRef(0);
  const totalAttemptsRef = useRef(0);
  const successfulAttemptsRef = useRef(0);
  const finishedRef = useRef(false);

  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    const activeLevel = level || randomLevel();
    const nextPuzzle = await createBlitzPuzzle(activeLevel, clueCount);

    setPuzzle(nextPuzzle);
    setRevealed([]);
    setGuess('');
    setSolved(false);
    setCorrectFeedback(null);
    setLoading(false);
  }, [clueCount, level]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    totalAttemptsRef.current = totalAttempts;
  }, [totalAttempts]);

  useEffect(() => {
    successfulAttemptsRef.current = successfulAttempts;
  }, [successfulAttempts]);

  useEffect(() => {
    finishedRef.current = finished;
  }, [finished]);

  useEffect(() => {
    setScore(0);
    setTimeLeft(duration);
    setTotalAttempts(0);
    setSuccessfulAttempts(0);
    setMissedPuzzles([]);
    setCorrectFeedback(null);
    setFinished(false);
    scoreRef.current = 0;
    totalAttemptsRef.current = 0;
    successfulAttemptsRef.current = 0;
    finishedRef.current = false;
    loadPuzzle();
  }, [duration, loadPuzzle]);

  function addMissedPuzzle(reason) {
    if (!puzzle || solved) {
      return;
    }

    setMissedPuzzles((current) => [
      ...current,
      {
        answer: puzzle.answer,
        categoryTitle: puzzle.categoryTitle,
        reason,
      },
    ]);
  }

  const finishBlitz = useCallback(async (completed) => {
    if (finishedRef.current) {
      return;
    }

    finishedRef.current = true;
    setFinished(true);
    await updateStats({
      completed,
      difficultyId: difficulty.id,
      perfect: false,
      score: scoreRef.current,
      successfulAttempts: successfulAttemptsRef.current,
      totalAttempts: totalAttemptsRef.current,
    });
  }, [difficulty.id, updateStats]);

  useEffect(() => {
    if (finished) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    if (timeLeft === 0 && !finishedRef.current) {
      addMissedPuzzle('Vrijeme isteklo');
      finishBlitz(true);
    }
  }, [finishBlitz, timeLeft]);

  function revealClue(clueIndex) {
    if (finished || solved || revealed.includes(clueIndex)) {
      return;
    }

    setRevealed((current) => [...current, clueIndex]);
  }

  function skipPuzzle() {
    if (finished || loading) {
      return;
    }

    Alert.alert(
      'Preskočena asocijacija',
      `Rješenje je: ${puzzle.answer.toUpperCase()}`,
      [
        {
          text: 'Sljedeća',
          onPress: () => {
            if (!finishedRef.current) {
              addMissedPuzzle('Preskočeno');
              loadPuzzle();
            }
          },
        },
      ],
    );
  }

  async function submitGuess() {
    if (finished || solved || !guess.trim()) {
      return;
    }

    const nextTotalAttempts = totalAttempts + 1;
    totalAttemptsRef.current = nextTotalAttempts;
    setTotalAttempts(nextTotalAttempts);

    if (normalize(guess) !== normalize(puzzle.answer)) {
      Alert.alert('Nije tacno', 'Probaj jos jedno polje ili drugi odgovor.');
      return;
    }

    const points = getBlitzPoints(revealed.length, difficulty.id);
    const nextScore = score + points;
    const nextSuccessfulAttempts = successfulAttempts + 1;

    scoreRef.current = nextScore;
    successfulAttemptsRef.current = nextSuccessfulAttempts;
    setScore(nextScore);
    setSuccessfulAttempts(nextSuccessfulAttempts);
    setSolved(true);
    setCorrectFeedback({
      answer: puzzle.answer,
      points,
    });
    setRevealed(puzzle.clues.map((_clue, index) => index));
    setGuess(puzzle.answer);
    setTimeout(() => {
      if (!finishedRef.current) {
        loadPuzzle();
      }
    }, 900);
  }

  async function leaveBlitz() {
    if (!finishedRef.current) {
      await finishBlitz(false);
    }

    goHome();
  }

  function restartBlitz() {
    setScore(0);
    setTimeLeft(duration);
    setRevealed([]);
    setGuess('');
    setSolved(false);
    setFinished(false);
    setTotalAttempts(0);
    setSuccessfulAttempts(0);
    setMissedPuzzles([]);
    setCorrectFeedback(null);
    scoreRef.current = 0;
    totalAttemptsRef.current = 0;
    successfulAttemptsRef.current = 0;
    finishedRef.current = false;
    loadPuzzle();
  }

  if (loading || !puzzle) {
    return (
      <Background>
        <Header title="Blitz" onBack={leaveBlitz} />
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#ffffff" size="large" />
          <Text style={styles.loadingText}>Ucitavanje Blitz asocijacije...</Text>
        </View>
      </Background>
    );
  }

  const possiblePoints = getBlitzPoints(revealed.length, difficulty.id);

  return (
    <Background>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        style={styles.gameShell}
      >
        <Header title="Blitz" onHome={leaveBlitz} />
        <ScrollView
          contentContainerStyle={styles.gameContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.scorePanel}>
            <View style={styles.scoreGrid}>
              <ScoreBox label="Vrijeme" value={formatTime(timeLeft)} colors={['#ef4444', '#f97316']} />
              <ScoreBox label="Tezina" value={difficulty.id} colors={['#9d62dd', '#b859e0']} />
              <ScoreBox label="Poeni" value={score} colors={['#5d95ef', '#797fe5']} />
            </View>
            {difficulty.id === 1 ? (
              <View style={styles.sourceRow}>
                <Text style={styles.sourceText}>Kategorija: {puzzle.categoryTitle}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.blitzCard}>
            <View style={styles.columnHeader}>
              <View style={styles.columnBadge}>
                <Text style={styles.columnLetter}>B</Text>
              </View>
              <View style={styles.columnPoints}>
                <Text style={styles.columnPointsText}>{possiblePoints}</Text>
              </View>
            </View>
            <View style={styles.columnProgressTrack}>
              {Array.from({ length: puzzle.clues.length }).map((_, clueIndex) => (
                <View
                  key={clueIndex}
                  style={[
                    styles.columnProgressSegment,
                    clueIndex < revealed.length && styles.columnProgressSegmentActive,
                  ]}
                />
              ))}
            </View>
            {puzzle.clues.map((clue, clueIndex) => {
              const isOpen = solved || revealed.includes(clueIndex);

              return (
                <Pressable
                  disabled={finished || solved}
                  key={`${clue}-${clueIndex}`}
                  onPress={() => revealClue(clueIndex)}
                  style={({ pressed }) => [
                    styles.clueCell,
                    isOpen && styles.clueCellOpen,
                    pressed && !isOpen && styles.pressed,
                  ]}
                >
                  <Text style={[styles.clueText, !isOpen && styles.clueTextHidden]}>
                    {isOpen ? clue : '?'}
                  </Text>
                </Pressable>
              );
            })}
            <View style={styles.columnMetaRow}>
              <Text style={styles.possiblePoints}>
                U igri: <Text style={styles.possiblePointsValue}>{possiblePoints}</Text>
              </Text>
              <Text style={styles.attemptText}>Pogodjeno: {successfulAttempts}</Text>
            </View>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!finished && !solved}
              onChangeText={setGuess}
              onSubmitEditing={submitGuess}
              placeholder="Odgovor..."
              placeholderTextColor="#7b7280"
              returnKeyType="done"
              style={[styles.columnInput, solved && styles.columnInputSolved]}
              value={guess}
            />
            <View style={styles.blitzActions}>
              <Pressable
                disabled={finished || solved || !guess.trim()}
                onPress={submitGuess}
                style={[
                  styles.okButton,
                  styles.blitzActionButton,
                  (finished || solved || !guess.trim()) && styles.disabledButton,
                ]}
              >
                <Text style={styles.okButtonText}>{solved ? 'TACNO' : 'Provjeri'}</Text>
              </Pressable>
              <Pressable
                disabled={finished || loading}
                onPress={skipPuzzle}
                style={[
                  styles.skipButton,
                  styles.blitzActionButton,
                  (finished || loading) && styles.disabledButton,
                ]}
              >
                <Text style={styles.skipButtonText}>Sljedeca</Text>
              </Pressable>
            </View>
          </View>

          {finished ? (
            <View style={styles.finalPanel}>
              <Text style={styles.finalTitle}>Blitz rezultat</Text>
              <View style={styles.blitzResultStats}>
                <Text style={styles.infoText}>Poeni: {score}</Text>
                <Text style={styles.infoText}>Pogođeno: {successfulAttempts}</Text>
                <Text style={styles.infoText}>Pokušaji: {totalAttempts}</Text>
                <Text style={styles.infoText}>Preskočeno/propušteno: {missedPuzzles.length}</Text>
              </View>

              <Text style={styles.finalHint}>Propuštena rješenja</Text>
              <View style={styles.blitzMissedList}>
                {missedPuzzles.length ? (
                  missedPuzzles.map((missedPuzzle, index) => (
                    <View
                      key={`${missedPuzzle.answer}-${index}`}
                      style={styles.blitzMissedItem}
                    >
                      <Text style={styles.blitzMissedAnswer}>
                        {missedPuzzle.answer.toUpperCase()}
                      </Text>
                      <Text style={styles.blitzMissedMeta}>
                        {missedPuzzle.reason} • {missedPuzzle.categoryTitle}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoText}>Nema propuštenih rješenja.</Text>
                )}
              </View>

              <Pressable onPress={restartBlitz} style={styles.finalButton}>
                <Text style={styles.finalButtonText}>Igraj ponovo</Text>
              </Pressable>
              <Pressable onPress={goHome} style={styles.homeButton}>
                <Text style={styles.homeButtonText}>Nazad na glavni meni</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}
