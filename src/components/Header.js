import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

export function Header({ title, icon, onBack, onHome }) {
  const { styles } = useAppTheme();

  return (
    <View style={styles.headerBar}>
      <View style={styles.headerLeft}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.headerIconButton}>
            <Text style={styles.headerIconText}>‹</Text>
          </Pressable>
        ) : null}
        <Text style={styles.headerTitle}>
          {icon ? `${icon} ` : ''}
          {title}
        </Text>
      </View>
      {onHome ? (
        <Pressable onPress={onHome} style={styles.headerIconButton}>
          <Text style={styles.headerIconText}>⌂</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
