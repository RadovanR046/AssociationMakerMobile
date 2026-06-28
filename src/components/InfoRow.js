import { Text, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

export function InfoRow({ label, value }) {
  const { styles } = useAppTheme();

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={styles.infoRowValue}>{value}</Text>
    </View>
  );
}
