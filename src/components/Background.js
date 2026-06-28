import { LinearGradient } from 'expo-linear-gradient';
import { Platform, SafeAreaView, StatusBar } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

export function Background({ children }) {
  const { styles, theme } = useAppTheme();

  return (
    <LinearGradient colors={theme.background} style={styles.background}>
      <SafeAreaView
        style={[
          styles.safeArea,
          Platform.OS === 'android' && {
            paddingTop: (StatusBar.currentHeight || 0) + 10,
          },
        ]}
      >
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}
