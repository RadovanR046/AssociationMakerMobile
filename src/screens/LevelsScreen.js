import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text } from 'react-native';

import { Background } from '../components/Background';
import { Header } from '../components/Header';
import { LEVELS } from '../constants/levels';
import { useAppTheme } from '../theme/ThemeContext';

export function LevelsScreen({ goHome, startLevel }) {
  const { styles } = useAppTheme();

  return (
    <Background>
      <Header title="Izbor kategorije" onBack={goHome} />
      <ScrollView contentContainerStyle={styles.levelList}>
        {LEVELS.map((level) => (
          <LinearGradient
            colors={level.colors}
            key={level.id}
            style={styles.levelCard}
          >
            <Text style={styles.levelIcon}>{level.icon}</Text>
            <Text style={styles.levelTitle}>{level.title}</Text>
            <Pressable onPress={() => startLevel(level)} style={styles.playButton}>
              <Text style={styles.playButtonText}>▷ Igraj</Text>
            </Pressable>
          </LinearGradient>
        ))}
      </ScrollView>
    </Background>
  );
}
