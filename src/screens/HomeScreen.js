import { Text, View } from 'react-native';

import { Background } from '../components/Background';
import { GradientButton } from '../components/GradientButton';
import { LEVELS } from '../constants/levels';
import { useAppTheme } from '../theme/ThemeContext';

function getRandomCategory() {
  return LEVELS[Math.floor(Math.random() * LEVELS.length)];
}

export function HomeScreen({ setScreen, startLevel }) {
  const { styles } = useAppTheme();

  return (
    <Background>
      <View style={styles.homeContent}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🏆</Text>
        </View>
        <Text style={styles.logoTitle}>Asocijacije</Text>
        <Text style={styles.logoSubtitle}>Igra riječi</Text>

        <View style={styles.menuStack}>
          <GradientButton
            color="#0fbf67"
            icon="▶"
            label="Nova igra"
            onPress={() => startLevel(getRandomCategory())}
          />
          <GradientButton
            color="#2563eb"
            icon="☰"
            label="Izbor kategorije"
            onPress={() => setScreen('levels')}
          />
          <GradientButton
            color="#ef4444"
            icon="⚡"
            label="Blitz"
            onPress={() => setScreen('blitzLevels')}
          />
          <GradientButton
            color="#9333ea"
            icon="▥"
            label="Statistika"
            onPress={() => setScreen('stats')}
          />
          <GradientButton
            color="#f97316"
            icon="?"
            label="Kako igrati"
            onPress={() => setScreen('how')}
          />
          <GradientButton
            color="#64748b"
            icon="⚙"
            label="Podešavanja"
            onPress={() => setScreen('settings')}
          />
        </View>

        <Text style={styles.versionText}>Verzija 1.0 • 2026</Text>
      </View>
    </Background>
  );
}
