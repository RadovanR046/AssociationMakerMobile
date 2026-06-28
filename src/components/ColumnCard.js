import { Pressable, Text, TextInput, View } from 'react-native';

import { LETTERS } from '../constants/levels';
import { useAppTheme } from '../theme/ThemeContext';

export function ColumnCard({
  attemptLimit,
  attemptsUsed,
  buyAnswerCost,
  canBuyAnswer,
  column,
  guess,
  index,
  isSolved,
  onBuyAnswer,
  onGuess,
  onReveal,
  onSubmit,
  possiblePoints,
  revealed,
}) {
  const { styles } = useAppTheme();
  const openedCount = isSolved ? 4 : revealed.length;
  const attemptsLeft = attemptLimit === null ? null : Math.max(attemptLimit - attemptsUsed, 0);
  const canSubmit = !isSolved && guess.trim() && (attemptsLeft === null || attemptsLeft > 0);

  return (
    <View style={[styles.columnCard, isSolved && styles.columnCardSolved]}>
      <View style={styles.columnHeader}>
        <View style={styles.columnBadge}>
          <Text style={styles.columnLetter}>{LETTERS[index]}</Text>
        </View>
        <Pressable
          disabled={!canBuyAnswer}
          onPress={() => onBuyAnswer(index)}
          style={[
            styles.columnPoints,
            !canBuyAnswer && styles.columnPointsDisabled,
          ]}
        >
          <Text style={styles.columnPointsText}>🏆 {buyAnswerCost}</Text>
        </Pressable>
      </View>
      <View style={styles.columnProgressTrack}>
        {Array.from({ length: 4 }).map((_, clueIndex) => (
          <View
            key={clueIndex}
            style={[
              styles.columnProgressSegment,
              clueIndex < openedCount && styles.columnProgressSegmentActive,
            ]}
          />
        ))}
      </View>
      {column.clues.map((clue, clueIndex) => {
        const isOpen = isSolved || revealed.includes(clueIndex);
        return (
          <Pressable
            disabled={isSolved}
            key={`${clue}-${clueIndex}`}
            onPress={() => onReveal(index, clueIndex)}
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
        <Text style={styles.attemptText}>
          {attemptsLeft === null ? 'Pokušaji: ∞' : `Pokušaji: ${attemptsLeft}`}
        </Text>
      </View>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSolved && (attemptsLeft === null || attemptsLeft > 0)}
        onChangeText={(value) => onGuess(index, value)}
        placeholder="Odgovor..."
        placeholderTextColor="#7b7280"
        style={[styles.columnInput, isSolved && styles.columnInputSolved]}
        value={guess}
      />
      <Pressable
        disabled={!canSubmit}
        onPress={() => onSubmit(index)}
        style={[styles.okButton, !canSubmit && styles.disabledButton]}
      >
        <Text style={styles.okButtonText}>{isSolved ? 'TAČNO' : 'Provjeri'}</Text>
      </Pressable>
    </View>
  );
}
