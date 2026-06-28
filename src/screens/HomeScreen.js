import { Text, View } from 'react-native';

import { Background } from '../components/Background';
import { GradientButton } from '../components/GradientButton';
import { getDifficulty } from '../constants/difficulties';
import { useAppTheme } from '../theme/ThemeContext';

export function HomeScreen({ difficultyId, setScreen }) {
  const { styles } = useAppTheme();
  const difficulty = getDifficulty(difficultyId);

  return (
    <Background>
      <View style={styles.homeContent}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🏆</Text>
        </View>
        <Text style={styles.logoTitle}>Asocijacije</Text>
        <Text style={styles.logoSubtitle}>Igra riječi, logike i brzog zaključivanja.</Text>
        <View style={styles.homeLevelBadge}>
          <Text style={styles.homeLevelIcon}>🎚️</Text>
          <View style={styles.homeLevelCopy}>
            <Text style={styles.homeLevelLabel}>Trenutna težina</Text>
            <Text style={styles.homeLevelValue}>
              Level {difficulty.id} · {difficulty.label}
            </Text>
          </View>
        </View>

        <View style={styles.menuStack}>
          <GradientButton
            color="#0fbf67"
            icon="🎮"
            label="Nova igra"
            onPress={() => setScreen('newGame')}
          />
          <GradientButton
            color="#2563eb"
            icon="🗂️"
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
            icon="📊"
            label="Statistika"
            onPress={() => setScreen('stats')}
          />
          <GradientButton
            color="#f97316"
            icon="📖"
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

        <Text style={styles.versionText}>Verzija 1.2 • 2026</Text>
      </View>
    </Background>
  );
}
