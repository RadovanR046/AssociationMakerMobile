import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Background } from '../components/Background';
import { Header } from '../components/Header';
import { InfoRow } from '../components/InfoRow';
import { DIFFICULTIES } from '../constants/difficulties';
import { LEVELS } from '../constants/levels';
import { STORAGE_KEYS } from '../constants/storage';
import { COLOR_MODES, THEMES } from '../constants/themes';
import { useAppTheme } from '../theme/ThemeContext';

function formatAttempts(value) {
  return value === null ? 'neograničeno' : value;
}

export function SettingsScreen({ settings, stats, setSettings, resetStats, goHome }) {
  const { styles } = useAppTheme();
  const selectedDifficulty = DIFFICULTIES[settings.difficultyId] || DIFFICULTIES[1];

  async function updateSettings(nextSettings) {
    setSettings(nextSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(nextSettings));
  }

  function selectDifficulty(difficultyId) {
    updateSettings({ ...settings, difficultyId });
  }

  function selectColorMode(colorMode) {
    updateSettings({ ...settings, colorMode });
  }

  function selectTheme(themeId) {
    updateSettings({ ...settings, themeId });
  }

  function confirmReset() {
    Alert.alert(
      'Resetuj statistiku',
      'Ovo će obrisati sve tvoje rezultate i ne može se poništiti.',
      [
        { text: 'Odustani', style: 'cancel' },
        { text: 'Resetuj', style: 'destructive', onPress: resetStats },
      ],
    );
  }

  return (
    <Background>
      <Header title="Podešavanja" onBack={goHome} />
      <ScrollView contentContainerStyle={styles.settingsList}>
        <View style={styles.settingsPanel}>
          <Text style={styles.panelTitle}>Izgled</Text>
          <View style={styles.difficultyRow}>
            {COLOR_MODES.map((mode) => {
              const isSelected = settings.colorMode === mode.id;

              return (
                <Pressable
                  key={mode.id}
                  onPress={() => selectColorMode(mode.id)}
                  style={[
                    styles.difficultyOption,
                    isSelected && styles.difficultyOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyNumber,
                      isSelected && styles.difficultyTextActive,
                    ]}
                  >
                    {mode.id === 'dark' ? '☾' : '☼'}
                  </Text>
                  <Text
                    style={[
                      styles.difficultyLabel,
                      isSelected && styles.difficultyTextActive,
                    ]}
                  >
                    {mode.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.settingsPanel}>
          <Text style={styles.panelTitle}>Tema</Text>
          <View style={styles.themeGrid}>
            {Object.values(THEMES).map((themeOption) => {
              const isSelected = settings.themeId === themeOption.id;
              const preview = themeOption.modes[settings.colorMode || 'dark'];

              return (
                <Pressable
                  key={themeOption.id}
                  onPress={() => selectTheme(themeOption.id)}
                  style={[
                    styles.themeOption,
                    isSelected && styles.themeOptionActive,
                  ]}
                >
                  <View style={styles.themeSwatches}>
                    {preview.background.map((color) => (
                      <View
                        key={color}
                        style={[styles.themeSwatch, { backgroundColor: color }]}
                      />
                    ))}
                    <View
                      style={[styles.themeSwatch, { backgroundColor: preview.accent }]}
                    />
                  </View>
                  <Text style={styles.themeOptionText}>{themeOption.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.settingsPanel}>
          <Text style={styles.panelTitle}>Težina</Text>
          <View style={styles.difficultyRow}>
            {Object.values(DIFFICULTIES).map((difficulty) => {
              const isSelected = settings.difficultyId === difficulty.id;

              return (
                <Pressable
                  key={difficulty.id}
                  onPress={() => selectDifficulty(difficulty.id)}
                  style={[
                    styles.difficultyOption,
                    isSelected && styles.difficultyOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyNumber,
                      isSelected && styles.difficultyTextActive,
                    ]}
                  >
                    {difficulty.id}
                  </Text>
                  <Text
                    style={[
                      styles.difficultyLabel,
                      isSelected && styles.difficultyTextActive,
                    ]}
                  >
                    {difficulty.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.difficultySummary}>
            <Text style={styles.infoText}>
              Konačno rješenje se otključava nakon {selectedDifficulty.finalRequiredSolvedColumns}{' '}
              pogođene kolone.
            </Text>
            <Text style={styles.infoText}>
              Pokušaji po koloni: {formatAttempts(selectedDifficulty.columnAttempts)} • konačno:{' '}
              {formatAttempts(selectedDifficulty.finalAttempts)}
            </Text>
            <Text style={styles.infoText}>
              Kupovina odgovora: {selectedDifficulty.buyAnswerCost} poena
            </Text>
          </View>
        </View>

        <View style={styles.settingsPanel}>
          <Text style={styles.panelTitle}>O aplikaciji</Text>
          <InfoRow label="Verzija" value="1.0.0" />
          <InfoRow label="Broj kategorija" value={LEVELS.length} />
          <InfoRow label="Datum izdanja" value="April 2026" />
          <InfoRow label="Odigrane partije" value={stats.totalGames} />
        </View>

        <View style={[styles.settingsPanel, styles.dangerPanel]}>
          <View style={styles.settingRow}>
            <View style={styles.trashBox}>
              <Text style={styles.settingIcon}>⌫</Text>
            </View>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Resetuj statistiku</Text>
              <Text style={styles.settingHint}>
                Briše najbolje rezultate, nizove i istoriju pokušaja.
              </Text>
            </View>
          </View>
          <Pressable onPress={confirmReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Resetuj statistiku</Text>
          </Pressable>
        </View>

        <View style={styles.settingsPanel}>
          <Text style={styles.panelTitle}>Savjeti</Text>
          <Text style={styles.infoText}>• Podaci se čuvaju lokalno na uređaju.</Text>
          <Text style={styles.infoText}>• Na težim partijama kategorija nije prikazana.</Text>
          <Text style={styles.infoText}>• Asocijacije se učitavaju iz lokalne baze u aplikaciji.</Text>
          <Text style={styles.infoText}>• Kupovina odgovora pomaže, ali kvari besprijekornu partiju.</Text>
        </View>
      </ScrollView>
    </Background>
  );
}
