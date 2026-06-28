import { ScrollView, Text, View } from 'react-native';

import { Background } from '../components/Background';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { EMPTY_BLITZ_STATS } from '../constants/storage';
import { useAppTheme } from '../theme/ThemeContext';

function getAverage(stats) {
  return stats.totalGames ? Math.round(stats.totalScore / stats.totalGames) : 0;
}

function getAccuracy(stats) {
  return stats.totalAttempts
    ? Math.round((stats.successfulAttempts / stats.totalAttempts) * 100)
    : 0;
}

export function StatsScreen({ stats, goHome }) {
  const { styles } = useAppTheme();
  const blitzStats = stats.blitz || EMPTY_BLITZ_STATS;
  const blitzBestByDifficulty = {
    ...EMPTY_BLITZ_STATS.bestByDifficulty,
    ...(blitzStats.bestByDifficulty || {}),
  };

  return (
    <Background>
      <Header title="Statistika" icon="🏆" onBack={goHome} />
      <ScrollView contentContainerStyle={styles.statsList}>
        <Text style={styles.sectionTitle}>Asocijacije</Text>
        <View style={styles.metricGrid}>
          <MetricCard
            colors={['#f59e0b', '#f97316']}
            icon="Σ"
            label="Ukupan broj poena"
            value={stats.totalScore}
          />
          <MetricCard
            colors={['#8b5cf6', '#6366f1']}
            icon="🏆"
            label="Najbolji rezultat"
            value={stats.bestScore}
          />
          <MetricCard
            colors={['#84cc16', '#22c55e']}
            icon="↗"
            label="Prosjek poena"
            value={getAverage(stats)}
          />
          <MetricCard
            colors={['#2563eb', '#06b6d4']}
            icon="○"
            label="Odigrane partije"
            value={stats.totalGames}
          />
          <MetricCard
            colors={['#10b981', '#14b8a6']}
            icon="✓"
            label="Završene partije"
            value={stats.completedGames}
          />
          <MetricCard
            colors={['#ef4444', '#f43f5e']}
            icon="◆"
            label="Najduži niz"
            value={stats.longestStreak}
          />
          <MetricCard
            colors={['#0ea5e9', '#3b82f6']}
            icon="%"
            label="Tačnost odgovora"
            value={`${getAccuracy(stats)}%`}
          />
          <MetricCard
            colors={['#ec4899', '#d946ef']}
            description="Bez pogrešnih pokušaja, kupovine odgovora, sve kolone pogođene uz minimalan broj otvorenih polja."
            icon="☆"
            label="Perfektne partije"
            value={stats.perfectGames}
          />
        </View>

        <Text style={styles.sectionTitle}>Blitz</Text>
        <View style={styles.metricGrid}>
          <MetricCard
            colors={['#ef4444', '#f97316']}
            icon="⚡"
            label="Ukupan broj poena"
            value={blitzStats.totalScore}
          />
          <MetricCard
            colors={['#8b5cf6', '#6366f1']}
            icon="⚡"
            label="Najbolji Blitz"
            value={blitzStats.bestScore}
          />
                    <MetricCard
            colors={['#22c55e', '#16a34a']}
            icon="1"
            label="Najbolji rezultat level 1"
            value={blitzBestByDifficulty[1]}
          />
          <MetricCard
            colors={['#f59e0b', '#f97316']}
            icon="2"
            label="Najbolji rezultat level 2"
            value={blitzBestByDifficulty[2]}
          />
          <MetricCard
            colors={['#ef4444', '#dc2626']}
            icon="3"
            label="Najbolji rezultat level 3"
            value={blitzBestByDifficulty[3]}
          />
          <MetricCard
            colors={['#2563eb', '#06b6d4']}
            icon="○"
            label="Odigrane partije"
            value={blitzStats.totalGames}
          />
          <MetricCard
            colors={['#10b981', '#14b8a6']}
            icon="✓"
            label="Završene partije"
            value={blitzStats.completedGames}
          />
          <MetricCard
            colors={['#0ea5e9', '#3b82f6']}
            icon="%"
            label="Tačnost odgovora"
            value={`${getAccuracy(blitzStats)}%`}
          />
        </View>
      </ScrollView>
    </Background>
  );
}
