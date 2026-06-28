import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

export function RuleCard({ colors, icon, step, title, text }) {
  const { styles } = useAppTheme();

  return (
    <LinearGradient colors={colors} style={styles.ruleCard}>
      <View style={styles.ruleIconBox}>
        <Text style={styles.ruleIcon}>{icon}</Text>
      </View>
      <View style={styles.ruleCopy}>
        <Text style={styles.ruleStep}>{step}</Text>
        <Text style={styles.ruleTitle}>{title}</Text>
        <Text style={styles.ruleText}>{text}</Text>
      </View>
    </LinearGradient>
  );
}
