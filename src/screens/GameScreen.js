import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
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
import { ColumnCard } from '../components/ColumnCard';
import { Header } from '../components/Header';
import { ScoreBox } from '../components/ScoreBox';
import { getColumnPoints, getDifficulty } from '../constants/difficulties';
import { EMPTY_STATS, STORAGE_KEYS } from '../constants/storage';
import { createPuzzle, normalize } from '../services/words';
import { useAppTheme } from '../theme/ThemeContext';

const LEVEL_3_TIME_LIMIT_SECONDS = 240;
const WRONG_COLUMN_MESSAGES = [
  'Nije to rješenje ove kolone. Probaj još jedno polje ili drugi odgovor.',
  'Blizu ili daleko, tabla još ćuti. Otvori novo polje pa probaj ponovo.',
  'Ova kolona traži drugi odgovor.',
];
const WRONG_FINAL_MESSAGES = [
  'Nije konačno rješenje. Pogledaj odgovore i pokušaj ponovo.',
  'Konačno rješenje još nije pogođeno.',
  'Dobar pokušaj, ali ova asocijacija vodi ka drugoj riječi.',
];

function emptyRevealedState() {
  return { 0: [], 1: [], 2: [], 3: [] };
}

function emptyAttemptsState() {
  return [0, 0, 0, 0];
}

function randomIndex(max) {
  return Math.floor(Math.random() * max);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getInitialRevealedState(difficulty) {
  const revealed = emptyRevealedState();

  if (difficulty.initialRevealMode === 'one_per_column') {
    return {
      0: [randomIndex(4)],
      1: [randomIndex(4)],
      2: [randomIndex(4)],
      3: [randomIndex(4)],
    };
  }

  if (difficulty.initialRevealMode === 'two_random_columns') {
    const columns = [0, 1, 2, 3].sort(() => Math.random() - 0.5).slice(0, 2);
    columns.forEach((columnIndex) => {
      revealed[columnIndex] = [randomIndex(4)];
    });
  }

  return revealed;
}

export function GameScreen({
  difficultyId,
  feedbackDurationMs,
  level,
  goHome,
  startRandomLevel,
  updateStats,
}) {
  const { styles } = useAppTheme();
  const scrollRef = useRef(null);
  const difficulty = getDifficulty(difficultyId);
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);
  const [revealed, setRevealed] = useState(emptyRevealedState);
  const [guesses, setGuesses] = useState(['', '', '', '']);
  const [solved, setSolved] = useState([false, false, false, false]);
  const [columnAttempts, setColumnAttempts] = useState(emptyAttemptsState);
  const [columnSolvedOpenCounts, setColumnSolvedOpenCounts] = useState([
    null,
    null,
    null,
    null,
  ]);
  const [boughtAnswers, setBoughtAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [successfulAttempts, setSuccessfulAttempts] = useState(0);
  const [finalAttempts, setFinalAttempts] = useState(0);
  const [finalGuess, setFinalGuess] = useState('');
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(
    difficulty.id === 3 ? LEVEL_3_TIME_LIMIT_SECONDS : null,
  );
  const [gameSeed, setGameSeed] = useState(0);
  const feedbackIdRef = useRef(0);
  const timeoutHandledRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function loadGame() {
      setLoading(true);
      setScore(0);
      setRevealed(getInitialRevealedState(difficulty));
      setGuesses(['', '', '', '']);
      setSolved([false, false, false, false]);
      setColumnAttempts(emptyAttemptsState());
      setColumnSolvedOpenCounts([null, null, null, null]);
      setBoughtAnswers(0);
      setTotalAttempts(0);
      setSuccessfulAttempts(0);
      setFinalAttempts(0);
      setFinalGuess('');
      setFinished(false);
      setFeedback(null);
      setRoundResult(null);
      setTimeLeft(difficulty.id === 3 ? LEVEL_3_TIME_LIMIT_SECONDS : null);
      timeoutHandledRef.current = false;

      const nextPuzzle = await createPuzzle(level);
      const savedStats = await AsyncStorage.getItem(STORAGE_KEYS.stats);
      const parsedStats = savedStats ? JSON.parse(savedStats) : EMPTY_STATS;

      if (mounted) {
        setPuzzle(nextPuzzle);
        setRecord(parsedStats.bestScore || 0);
        setLoading(false);
      }
    }

    loadGame();

    return () => {
      mounted = false;
    };
  }, [level, difficultyId, gameSeed]);

  const progress = solved.filter(Boolean).length;
  const finalAttemptsLeft =
    difficulty.finalAttempts === null
      ? null
      : Math.max(difficulty.finalAttempts - finalAttempts, 0);
  const hasEnoughSolvedForFinal = progress >= difficulty.finalRequiredSolvedColumns;
  const canFinal =
    !finished &&
    hasEnoughSolvedForFinal &&
    (finalAttemptsLeft === null || finalAttemptsLeft > 0);
  const hasTimeLimit = difficulty.id === 3;

  function columnHasAttemptsLeft(columnIndex, attemptsState = columnAttempts) {
    return (
      difficulty.columnAttempts === null ||
      attemptsState[columnIndex] < difficulty.columnAttempts
    );
  }

  function columnCanStillHelp(
    columnIndex,
    solvedState = solved,
    attemptsState = columnAttempts,
    availableScore = score,
  ) {
    return (
      solvedState[columnIndex] ||
      columnHasAttemptsLeft(columnIndex, attemptsState) ||
      availableScore >= difficulty.buyAnswerCost
    );
  }

  function countReachableSolvedColumns(
    solvedState = solved,
    attemptsState = columnAttempts,
    availableScore = score,
  ) {
    return [0, 1, 2, 3].filter((columnIndex) =>
      columnCanStillHelp(columnIndex, solvedState, attemptsState, availableScore),
    ).length;
  }

  function cannotContinueRound(
    solvedState = solved,
    attemptsState = columnAttempts,
    availableScore = score,
    finalAttemptsState = finalAttempts,
  ) {
    const reachableSolvedColumns = countReachableSolvedColumns(
      solvedState,
      attemptsState,
      availableScore,
    );

    if (reachableSolvedColumns < difficulty.finalRequiredSolvedColumns) {
      return true;
    }

    return (
      difficulty.finalAttempts !== null &&
      finalAttemptsState >= difficulty.finalAttempts
    );
  }

  async function finishFailedRound({
    message,
    nextScore = score,
    nextTotalAttempts = totalAttempts,
    nextSuccessfulAttempts = successfulAttempts,
    status = 'lost',
    title = 'Runda je prekinuta',
  }) {
    setFinished(true);
    if (puzzle) {
      revealFullPuzzle();
    }
    setRoundResult({
      detail: message,
      status,
      title,
    });
    setFeedback({
      answer: message,
      title,
      type: 'wrong',
    });
    setTimeout(() => {
      scrollRef.current?.scrollTo({ animated: true, y: 0 });
    }, 50);
    await updateStats({
      completed: false,
      perfect: false,
      score: nextScore,
      successfulAttempts: nextSuccessfulAttempts,
      totalAttempts: nextTotalAttempts,
    });
  }

  function revealFullPuzzle() {
    setSolved([true, true, true, true]);
    setRevealed({
      0: [0, 1, 2, 3],
      1: [0, 1, 2, 3],
      2: [0, 1, 2, 3],
      3: [0, 1, 2, 3],
    });
    setGuesses(puzzle.columns.map((column) => column.answer));
    setFinalGuess(puzzle.finalAnswer);
  }

  async function finishTimedOutRound() {
    if (finished || !puzzle || timeoutHandledRef.current) {
      return;
    }

    timeoutHandledRef.current = true;
    revealFullPuzzle();
    await finishFailedRound({
      message: 'Vrijeme je isteklo. Rješenja su otvorena bez dodatnih bodova.',
      status: 'timeout',
      title: 'Vrijeme je isteklo',
    });
  }

  useEffect(() => {
    if (!hasTimeLimit || loading || finished) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current === null) {
          return null;
        }

        return Math.max(current - 1, 0);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finished, hasTimeLimit, loading]);

  useEffect(() => {
    if (timeLeft !== 0 || !hasTimeLimit || loading || finished || !puzzle) {
      return;
    }

    finishTimedOutRound();
  }, [finished, hasTimeLimit, loading, puzzle, timeLeft]);

  function showTemporaryFeedback(nextFeedback, durationMs = feedbackDurationMs) {
    const feedbackId = feedbackIdRef.current + 1;
    feedbackIdRef.current = feedbackId;
    setFeedback(nextFeedback);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ animated: true, y: 0 });
    }, 50);

    setTimeout(() => {
      if (feedbackIdRef.current === feedbackId) {
        setFeedback(null);
      }
    }, durationMs);
  }

  async function confirmSurrenderGame() {
    if (finished) {
      return;
    }

    Alert.alert(
      'Predaj partiju',
      'Sigurno želiš da predaš partiju? Rješenja će se otvoriti i partija se računa kao izgubljena.',
      [
        { text: 'Odustani', style: 'cancel' },
        { text: 'Predaj', style: 'destructive', onPress: surrenderGame },
      ],
    );
  }

  async function surrenderGame() {
    revealFullPuzzle();
    await finishFailedRound({
      message: 'Partija je predata. Rješenja su otvorena bez dodatnih bodova.',
      nextScore: 0,
      status: 'surrendered',
      title: 'Partija je predata',
    });
  }

  function revealClue(columnIndex, clueIndex) {
    if (finished || solved[columnIndex] || revealed[columnIndex]?.includes(clueIndex)) {
      return;
    }

    setRevealed((current) => ({
      ...current,
      [columnIndex]: [...(current[columnIndex] || []), clueIndex],
    }));
  }

  async function buyColumnAnswer(columnIndex) {
    if (finished || solved[columnIndex]) {
      return;
    }

    if (score < difficulty.buyAnswerCost) {
      showTemporaryFeedback({
        answer: `Za kupovinu odgovora treba ${difficulty.buyAnswerCost} poena.`,
        title: 'Nema dovoljno poena',
        type: 'wrong',
      });
      return;
    }

    const column = puzzle.columns[columnIndex];
    const nextScore = score - difficulty.buyAnswerCost;
    const nextSolved = [...solved];
    nextSolved[columnIndex] = true;

    setBoughtAnswers((current) => current + 1);
    setScore(nextScore);
    setSolved(nextSolved);
    setRevealed((current) => ({
      ...current,
      [columnIndex]: [0, 1, 2, 3],
    }));
    setGuesses((current) => {
      const next = [...current];
      next[columnIndex] = column.answer;
      return next;
    });
    showTemporaryFeedback({
      answer: column.answer,
      title: 'Odgovor kupljen',
      type: 'skipped',
    });

    if (cannotContinueRound(nextSolved, columnAttempts, nextScore, finalAttempts)) {
      await finishFailedRound({
        message: 'Žao mi je, ne možete nastaviti sa ovom rundom.',
        nextScore,
      });
    }
  }

  function setGuess(columnIndex, value) {
    setGuesses((current) => {
      const next = [...current];
      next[columnIndex] = value;
      return next;
    });
  }

  function keepFinalInputVisible() {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }

  function restartGame() {
    setGameSeed((current) => current + 1);
    scrollRef.current?.scrollTo({ animated: true, y: 0 });
  }

  async function submitColumn(columnIndex) {
    const column = puzzle.columns[columnIndex];
    const attemptLimit = difficulty.columnAttempts;

    if (attemptLimit !== null && columnAttempts[columnIndex] >= attemptLimit) {
      showTemporaryFeedback({
        answer: 'Potrošio si sve pokušaje za ovu kolonu.',
        title: 'Nema pokušaja',
        type: 'wrong',
      });
      return;
    }

    const openedCount = revealed[columnIndex]?.length || 0;
    const nextTotalAttempts = totalAttempts + 1;
    const nextColumnAttempts = [...columnAttempts];
    nextColumnAttempts[columnIndex] += 1;

    setTotalAttempts(nextTotalAttempts);
    setColumnAttempts(nextColumnAttempts);

    if (normalize(guesses[columnIndex]) !== normalize(column.answer)) {
      if (cannotContinueRound(solved, nextColumnAttempts, score, finalAttempts)) {
        await finishFailedRound({
          message: 'Žao mi je, ne možete nastaviti sa ovom rundom.',
          nextTotalAttempts,
        });
        return;
      }

      setGuesses((current) => {
        const next = [...current];
        next[columnIndex] = '';
        return next;
      });
      showTemporaryFeedback({
        answer: randomItem(WRONG_COLUMN_MESSAGES),
        title: 'Nije tačno',
        type: 'wrong',
      });
      return;
    }

    const points = getColumnPoints(openedCount, difficulty);
    const nextSolved = [...solved];
    nextSolved[columnIndex] = true;
    const nextSuccessfulAttempts = successfulAttempts + 1;

    setSuccessfulAttempts(nextSuccessfulAttempts);
    setSolved(nextSolved);
    setColumnSolvedOpenCounts((current) => {
      const next = [...current];
      next[columnIndex] = openedCount;
      return next;
    });
    setRevealed((current) => ({
      ...current,
      [columnIndex]: [0, 1, 2, 3],
    }));
    setScore((current) => current + points);
    setGuesses((current) => {
      const next = [...current];
      next[columnIndex] = column.answer;
      return next;
    });
    showTemporaryFeedback({
      answer: column.answer,
      title: `Tačno +${points}`,
      type: 'correct',
    });
  }

  async function submitFinal() {
    if (!hasEnoughSolvedForFinal) {
      showTemporaryFeedback({
        answer: `Konačno rješenje možeš pogađati nakon ${difficulty.finalRequiredSolvedColumns} pogođene kolone.`,
        title: 'Zaključano',
        type: 'wrong',
      });
      return;
    }

    if (difficulty.finalAttempts !== null && finalAttempts >= difficulty.finalAttempts) {
      await finishFailedRound({
        message: 'Žao mi je, ne možete nastaviti sa ovom rundom.',
        status: 'lost',
        title: 'Nema više poteza',
      });
      return;
    }

    const nextTotalAttempts = totalAttempts + 1;

    if (normalize(finalGuess) !== normalize(puzzle.finalAnswer)) {
      const nextFinalAttempts = finalAttempts + 1;
      setTotalAttempts(nextTotalAttempts);
      setFinalAttempts(nextFinalAttempts);

      if (difficulty.finalAttempts !== null && nextFinalAttempts >= difficulty.finalAttempts) {
        await finishFailedRound({
          message: 'Žao mi je, ne možete nastaviti sa ovom rundom.',
          nextTotalAttempts,
          status: 'lost',
          title: 'Nema više pokušaja',
        });
        return;
      }

      setFinalGuess('');
      showTemporaryFeedback({
        answer: randomItem(WRONG_FINAL_MESSAGES),
        title: 'Nije konačno rješenje',
        type: 'wrong',
      });
      return;
    }

    const remainingColumnPoints = puzzle.columns.reduce((total, _column, index) => {
      if (solved[index]) {
        return total;
      }

      return total + getColumnPoints(revealed[index]?.length || 0, difficulty);
    }, 0);
    const finalScore = score + remainingColumnPoints + difficulty.finalBonus;
    const nextSuccessfulAttempts = successfulAttempts + 1;
    const isPerfect =
      boughtAnswers === 0 &&
      nextTotalAttempts === nextSuccessfulAttempts &&
      columnSolvedOpenCounts.every((count) => count !== null && count <= 2);

    setScore(finalScore);
    setTotalAttempts(nextTotalAttempts);
    setSuccessfulAttempts(nextSuccessfulAttempts);
    setSolved([true, true, true, true]);
    setRevealed({
      0: [0, 1, 2, 3],
      1: [0, 1, 2, 3],
      2: [0, 1, 2, 3],
      3: [0, 1, 2, 3],
    });
    setGuesses(puzzle.columns.map((column) => column.answer));
    setFinished(true);
    setRoundResult({
      detail: 'Konačno rješenje je pogođeno, preostale kolone su otvorene i bodovane.',
      status: 'won',
      title: 'Pobjeda',
    });
    setRecord((current) => Math.max(current, finalScore));
    await updateStats({
      completed: true,
      perfect: isPerfect,
      score: finalScore,
      successfulAttempts: nextSuccessfulAttempts,
      totalAttempts: nextTotalAttempts,
    });
    setFeedback({
      answer: puzzle.finalAnswer,
      title: `Bravo +${finalScore - score}`,
      type: 'correct',
    });
    setTimeout(() => {
      scrollRef.current?.scrollTo({ animated: true, y: 0 });
    }, 50);
  }

  if (loading || !puzzle) {
    return (
      <Background>
        <Header title="Asocijacije" icon="🏆" onBack={goHome} />
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#ffffff" size="large" />
          <Text style={styles.loadingText}>Učitavanje asocijacije...</Text>
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        style={styles.gameShell}
      >
        <Header title="Asocijacije" icon="🏆" onHome={goHome} />
        <ScrollView
          contentContainerStyle={styles.gameContent}
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
        >
          <View style={styles.scorePanel}>
            <View style={styles.scoreGrid}>
              <ScoreBox label="Poeni" value={score} colors={['#5d95ef', '#797fe5']} />
              <ScoreBox label="Težina" value={difficulty.id} colors={['#9d62dd', '#b859e0']} />
              <ScoreBox label="Rekord" value={record} colors={['#b8717b', '#b98565']} />
              {hasTimeLimit ? (
                <ScoreBox
                  label="Vrijeme"
                  value={formatTime(timeLeft || 0)}
                  colors={['#e25656', '#f59e0b']}
                />
              ) : null}
            </View>
            <View style={styles.progressTrack}>
              {Array.from({ length: 4 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressSegment,
                    index < progress && styles.progressSegmentActive,
                  ]}
                />
              ))}
            </View>
            <View style={styles.sourceRow}>
              <Pressable
                disabled={finished}
                onPress={confirmSurrenderGame}
                style={[styles.surrenderButton, finished && styles.disabledButton]}
              >
                <Text style={styles.surrenderButtonText}>Predaj partiju</Text>
              </Pressable>
              {difficulty.id === 1 ? (
                <Text style={styles.sourceText}>Kategorija: {level.title}</Text>
              ) : null}
            </View>
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

          <View style={styles.columnsGrid}>
            {puzzle.columns.map((column, columnIndex) => (
              <ColumnCard
                attemptLimit={difficulty.columnAttempts}
                attemptsUsed={columnAttempts[columnIndex]}
                buyAnswerCost={difficulty.buyAnswerCost}
                canBuyAnswer={
                  !finished &&
                  !solved[columnIndex] &&
                  score >= difficulty.buyAnswerCost
                }
                column={column}
                guess={guesses[columnIndex]}
                index={columnIndex}
                isSolved={solved[columnIndex]}
                key={`${column.answer}-${columnIndex}`}
                onBuyAnswer={buyColumnAnswer}
                onGuess={setGuess}
                onReveal={revealClue}
                onSubmit={submitColumn}
                possiblePoints={getColumnPoints(revealed[columnIndex]?.length || 0, difficulty)}
                revealed={revealed[columnIndex] || []}
              />
            ))}
          </View>

          <View style={styles.finalPanel}>
            <Text style={styles.finalTitle}>🏆 Konačno rješenje</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!finished && canFinal}
              onChangeText={setFinalGuess}
              onFocus={keepFinalInputVisible}
              onSubmitEditing={submitFinal}
              placeholder={
                canFinal
                  ? 'Konačno rješenje...'
                  : `Potrebno kolona: ${difficulty.finalRequiredSolvedColumns}`
              }
              placeholderTextColor="#806b86"
              returnKeyType="done"
              style={styles.finalInput}
              value={finalGuess}
            />
            <View style={styles.finalMetaRow}>
              <Text style={styles.finalMetaText}>Bonus: {difficulty.finalBonus}</Text>
              <Text style={styles.finalMetaText}>
                Pokušaji: {finalAttemptsLeft === null ? '∞' : finalAttemptsLeft}
              </Text>
            </View>
            <Pressable
              disabled={!canFinal || !finalGuess.trim()}
              onPress={submitFinal}
              style={[
                styles.finalButton,
                (!canFinal || !finalGuess.trim()) && styles.disabledButton,
              ]}
            >
              <Text style={styles.finalButtonText}>Provjeri</Text>
            </Pressable>
            {finished ? (
              <View style={styles.blitzResultStats}>
                <Text style={styles.infoTitle}>
                  {roundResult?.status === 'won'
                    ? '✅ Partija završena'
                    : roundResult?.status === 'timeout'
                      ? '⏱️ Vrijeme je isteklo'
                      : roundResult?.status === 'surrendered'
                        ? '🏳️ Partija predata'
                        : '❌ Partija izgubljena'}
                </Text>
                <Text style={styles.infoText}>{roundResult?.detail}</Text>
                <Text style={styles.infoText}>Konačno rješenje: {puzzle.finalAnswer}</Text>
                <Text style={styles.infoText}>Poeni: {score}</Text>
                <Text style={styles.infoText}>Tačni odgovori: {successfulAttempts}</Text>
                <Text style={styles.infoText}>Ukupno pokušaja: {totalAttempts}</Text>
                <Pressable onPress={restartGame} style={styles.finalButton}>
                  <Text style={styles.finalButtonText}>Igraj istu kategoriju</Text>
                </Pressable>
                <Pressable onPress={startRandomLevel} style={styles.finalButton}>
                  <Text style={styles.finalButtonText}>Nova random partija</Text>
                </Pressable>
                <Pressable onPress={goHome} style={styles.homeButton}>
                  <Text style={styles.homeButtonText}>Nazad na glavni meni</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}
