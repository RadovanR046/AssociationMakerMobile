import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

export function MetricCard({ colors, description, icon, label, value }) {
  const { styles } = useAppTheme();

  return (
    <LinearGradient colors={colors} style={styles.metricCard}>
      <View style={styles.metricIconBox}>
        <Text style={styles.metricIcon}>{icon}</Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {description ? <Text style={styles.metricDescription}>{description}</Text> : null}
    </LinearGradient>
  );
}
