import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

export function ScoreBox({ colors, label, value }) {
  const { styles } = useAppTheme();

  return (
    <LinearGradient colors={colors} style={styles.scoreBox}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value}</Text>
    </LinearGradient>
  );
}
