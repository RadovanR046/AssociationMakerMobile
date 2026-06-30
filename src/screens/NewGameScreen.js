import { ScrollView, Text, View } from 'react-native';

import { Background } from '../components/Background';
import { GradientButton } from '../components/GradientButton';
import { Header } from '../components/Header';
import { getDifficulty } from '../constants/difficulties';
import { LEVELS } from '../constants/levels';
import { useAppTheme } from '../theme/ThemeContext';

function getRandomCategory() {
  return LEVELS[Math.floor(Math.random() * LEVELS.length)];
}

function getDifficultyHint(difficulty) {
  if (difficulty.id === 1) {
    return 'Kategorija je prikazana, a svaka kolona počinje sa jednim otvorenim poljem.';
  }

  if (difficulty.id === 2) {
    return 'Dvije kolone dobijaju početnu pomoć, ali pokušaje treba čuvati pažljivije.';
  }

  return 'Bez početne pomoći, bez prikazane kategorije i sa nasumično izabranom kategorijom. Imaš 4 minuta za rješavanje.';
}

export function NewGameScreen({
  chooseCategory,
  difficultyId,
  goHome,
  openSettings,
  startLevel,
}) {
  const { styles } = useAppTheme();
  const difficulty = getDifficulty(difficultyId);

  return (
    <Background>
      <Header title="Nova igra" onBack={goHome} />
      <ScrollView contentContainerStyle={styles.settingsList}>
        <View style={styles.settingsPanel}>
          <Text style={styles.panelTitle}>Trenutna težina</Text>
          <Text style={styles.infoTitle}>
            Level {difficulty.id}: {difficulty.label}
          </Text>
          <Text style={styles.infoText}>{getDifficultyHint(difficulty)}</Text>
        </View>

        <View style={styles.menuStack}>
          <GradientButton
            color="#0fbf67"
            icon="🎲"
            label="Random kategorija"
            onPress={() => startLevel(getRandomCategory())}
          />
          {difficulty.id !== 3 ? (
            <GradientButton
              color="#2563eb"
              icon="🗂️"
              label="Izaberi kategoriju"
              onPress={chooseCategory}
            />
          ) : null}
          <GradientButton
            color="#64748b"
            icon="⚙"
            label="Promijeni težinu"
            onPress={openSettings}
          />
        </View>
      </ScrollView>
    </Background>
  );
}
