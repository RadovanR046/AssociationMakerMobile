import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text } from 'react-native';

import { Background } from '../components/Background';
import { Header } from '../components/Header';
import { LEVELS } from '../constants/levels';
import { useAppTheme } from '../theme/ThemeContext';

export function BlitzLevelsScreen({ goHome, startBlitz }) {
  const { styles } = useAppTheme();

  return (
    <Background>
      <Header title="Blitz kategorija" onBack={goHome} />
      <ScrollView contentContainerStyle={styles.levelList}>
        <LinearGradient
          colors={['#ef4444', '#f97316']}
          style={[styles.levelCard, styles.levelCardWide]}
        >
          <Text style={styles.levelIcon}>🎲</Text>
          <Text style={styles.levelTitle}>Random</Text>
          <Pressable onPress={() => startBlitz(null)} style={styles.playButton}>
            <Text style={styles.playButtonText}>Igraj</Text>
          </Pressable>
        </LinearGradient>

        {LEVELS.map((level) => (
          <LinearGradient
            colors={level.colors}
            key={level.id}
            style={styles.levelCard}
          >
            <Text style={styles.levelIcon}>{level.icon}</Text>
            <Text style={styles.levelTitle}>{level.title}</Text>
            <Pressable onPress={() => startBlitz(level)} style={styles.playButton}>
              <Text style={styles.playButtonText}>Igraj</Text>
            </Pressable>
          </LinearGradient>
        ))}
      </ScrollView>
    </Background>
  );
}
