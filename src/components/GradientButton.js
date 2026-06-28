import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

export function GradientButton({ color, icon, label, onPress }) {
  const { styles } = useAppTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <View style={[styles.menuButton, { backgroundColor: color }]}>
        <View style={styles.menuIconBox}>
          <Text style={styles.menuIcon}>{icon}</Text>
        </View>
        <Text style={styles.menuButtonText}>{label}</Text>
      </View>
    </Pressable>
  );
}
