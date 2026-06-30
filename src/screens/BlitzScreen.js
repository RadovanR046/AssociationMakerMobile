import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
  2: [50, 40, 30, 20],
  3: [60, 50, 40],
};
const WRONG_BLITZ_MESSAGE = 'Probaj drugi odgovor.';

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
  bestScoreForDifficulty = 0,
  difficultyId,
  feedbackDurationMs,
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
  const [feedback, setFeedback] = useState(null);
  const scoreRef = useRef(0);
  const totalAttemptsRef = useRef(0);
  const successfulAttemptsRef = useRef(0);
  const finishedRef = useRef(false);
  const seenAnswersRef = useRef([]);

  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    const activeLevel = level || randomLevel();
    const nextPuzzle = await createBlitzPuzzle(
      activeLevel,
      clueCount,
      seenAnswersRef.current,
    );
    seenAnswersRef.current = [...seenAnswersRef.current, nextPuzzle.answer];

    setPuzzle(nextPuzzle);
    setRevealed([]);
    setGuess('');
    setSolved(false);
    setFeedback(null);
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
    setFeedback(null);
    setFinished(false);
    scoreRef.current = 0;
    totalAttemptsRef.current = 0;
    successfulAttemptsRef.current = 0;
    finishedRef.current = false;
    seenAnswersRef.current = [];
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

  function showTemporaryFeedback(nextFeedback, durationMs = feedbackDurationMs) {
    setFeedback(nextFeedback);
    setTimeout(() => {
      if (!finishedRef.current) {
        setFeedback(null);
      }
    }, durationMs);
  }

  function skipPuzzle() {
    if (finished || loading || solved) {
      return;
    }

    addMissedPuzzle('Preskočeno');
    setSolved(true);
    setRevealed(puzzle.clues.map((_clue, index) => index));
    setGuess(puzzle.answer);
    setFeedback({
      answer: puzzle.answer,
      title: 'Rješenje',
      type: 'skipped',
    });
    setTimeout(() => {
      if (!finishedRef.current) {
        loadPuzzle();
      }
    }, Math.round(feedbackDurationMs * 1.5));
  }

  async function submitGuess() {
    if (finished || solved || !guess.trim()) {
      return;
    }

    const nextTotalAttempts = totalAttempts + 1;
    totalAttemptsRef.current = nextTotalAttempts;
    setTotalAttempts(nextTotalAttempts);

    if (normalize(guess) !== normalize(puzzle.answer)) {
      setGuess('');
      showTemporaryFeedback({
        answer: WRONG_BLITZ_MESSAGE,
        title: 'Nije tačno',
        type: 'wrong',
      });
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
    setFeedback({
      answer: puzzle.answer,
      points,
      title: `Tačno +${points}`,
      type: 'correct',
    });
    setRevealed(puzzle.clues.map((_clue, index) => index));
    setGuess(puzzle.answer);
    setTimeout(() => {
      if (!finishedRef.current) {
        loadPuzzle();
      }
    }, feedbackDurationMs);
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
    setFeedback(null);
    scoreRef.current = 0;
    totalAttemptsRef.current = 0;
    successfulAttemptsRef.current = 0;
    finishedRef.current = false;
    seenAnswersRef.current = [];
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
  const skippedCount = missedPuzzles.filter(
    (missedPuzzle) => missedPuzzle.reason === 'Preskočeno',
  ).length;
  const averagePoints = successfulAttempts ? Math.round(score / successfulAttempts) : 0;
  const displayedBestScore = Math.max(bestScoreForDifficulty, score);

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
                <Text style={styles.columnLetter}>⚡</Text>
              </View>
              <View style={styles.blitzHeaderActions}>
                <Pressable
                  disabled={finished || loading || solved}
                  onPress={skipPuzzle}
                  style={[
                    styles.blitzSkipButton,
                    (finished || loading || solved) && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.blitzSkipButtonText}>Preskoči</Text>
                </Pressable>
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
              <Text style={styles.possiblePointsValue}>{possiblePoints}</Text>
              <Text style={styles.attemptText}>Pogodjeno: {successfulAttempts}</Text>
            </View>
            {feedback ? (
              <View
                style={[
                  styles.blitzFeedbackBox,
                  feedback.type === 'skipped' && styles.blitzSkippedBox,
                  feedback.type === 'wrong' && styles.blitzWrongBox,
                ]}
              >
                <Text
                  style={[
                    styles.blitzFeedbackTitle,
                    feedback.type === 'skipped' && styles.blitzSkippedTitle,
                    feedback.type === 'wrong' && styles.blitzWrongTitle,
                  ]}
                >
                  {feedback.title}
                </Text>
                <Text style={styles.blitzFeedbackAnswer}>
                  {feedback.type === 'correct' || feedback.type === 'skipped'
                    ? feedback.answer.toUpperCase()
                    : feedback.answer}
                </Text>
              </View>
            ) : null}
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
            <Pressable
              disabled={finished || solved || !guess.trim()}
              onPress={submitGuess}
              style={[
                styles.okButton,
                (finished || solved || !guess.trim()) && styles.disabledButton,
              ]}
            >
              <Text style={styles.okButtonText}>{solved ? 'TAČNO' : 'Provjeri'}</Text>
            </Pressable>
          </View>

          {finished ? (
            <View style={styles.finalPanel}>
              <Text style={styles.finalTitle}>Blitz rezultat</Text>
              <View style={styles.blitzResultStats}>
                <Text style={styles.infoText}>Poeni: {score}</Text>
                <Text style={styles.infoText}>Pogođeno: {successfulAttempts}</Text>
                <Text style={styles.infoText}>Pokušaji: {totalAttempts}</Text>
                <Text style={styles.infoText}>Preskočeno: {skippedCount}</Text>
                <Text style={styles.infoText}>Propušteno ukupno: {missedPuzzles.length}</Text>
                <Text style={styles.infoText}>Prosjek po pogođenoj: {averagePoints}</Text>
                <Text style={styles.infoText}>Najbolji rezultat levela: {displayedBestScore}</Text>
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
                <Text style={styles.finalButtonText}>
                  {level ? 'Igraj istu kategoriju' : 'Igraj Random opet'}
                </Text>
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
