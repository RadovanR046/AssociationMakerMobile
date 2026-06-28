import { ScrollView, Text, View } from 'react-native';

import { Background } from '../components/Background';
import { Header } from '../components/Header';
import { RuleCard } from '../components/RuleCard';
import { DIFFICULTIES } from '../constants/difficulties';
import { useAppTheme } from '../theme/ThemeContext';

function formatAttempts(value) {
  return value === null ? 'neograničeno' : value;
}

export function HowToScreen({ goHome }) {
  const { styles } = useAppTheme();

  return (
    <Background>
      <Header title="Kako igrati" onBack={goHome} />
      <ScrollView contentContainerStyle={styles.howContent}>
        <Text style={styles.sectionTitle}>Osnovna pravila</Text>
        <RuleCard
          colors={['#2f80ff', '#00b8d9']}
          icon="⊙"
          step="Korak 1"
          title="Otvori asocijacije"
          text="Dodirni skrivena polja u kolonama A, B, C i D. Što manje polja otvoriš, više poena možeš osvojiti."
        />
        <RuleCard
          colors={['#0bc66b', '#00a870']}
          icon="◉"
          step="Korak 2"
          title="Pogodi kolone"
          text="Svaka kolona ima svoje rješenje. Težina određuje broj pokušaja, početno otvorena polja i cijenu kupovine odgovora."
        />
        <RuleCard
          colors={['#f8b500', '#ff5a12']}
          icon="🏆"
          step="Korak 3"
          title="Konačno rješenje"
          text="Konačno rješenje se otključava nakon određenog broja pogođenih kolona. Kada ga pogodiš, otvaraju se i boduju preostale kolone."
        />

        <Text style={styles.sectionTitle}>Blitz</Text>
        <RuleCard
          colors={['#ef4444', '#f97316']}
          icon="⚡"
          step=""
          title="Trka sa vremenom"
          text="Blitz prikazuje jednu mini-asocijaciju: nekoliko skrivenih polja i jedno rješenje. Riješi što više zagonetki za maksimalan broj poena."
        />
        <View style={styles.infoPanel}>
          <Text style={styles.infoTitle}>Pravila za Blitz</Text>
          <Text style={styles.infoText}>
            • Vrijeme zavisi od težine: lako 150 sekundi, srednje 120 sekundi, teško 90 sekundi.
          </Text>
          <Text style={styles.infoText}>
            • Broj polja zavisi od težine: lako 5, srednje 4, teško 3 polja.
          </Text>
          <Text style={styles.infoText}>
            • Bodovi zavise od težine i broja otvorenih polja: lako 50/40/30/20/10, srednje 40/30/20/10, teško 30/20/10.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Težine</Text>
        {Object.values(DIFFICULTIES).map((difficulty) => (
          <View key={difficulty.id} style={styles.infoPanel}>
            <Text style={styles.infoTitle}>
              {difficulty.id}. {difficulty.label}
            </Text>
            <Text style={styles.infoText}>
              • Poeni kolone: 0 otvorenih {difficulty.zeroOpenColumnPoints}, 1 otvoreno{' '}
              {difficulty.columnPoints[1]}, 2 otvorena {difficulty.columnPoints[2]}, 3 otvorena{' '}
              {difficulty.columnPoints[3]}, 4 otvorena {difficulty.columnPoints[4]}
            </Text>
            <Text style={styles.infoText}>
              • Pokušaji po koloni: {formatAttempts(difficulty.columnAttempts)}
            </Text>
            <Text style={styles.infoText}>
              • Pokušaji konačnog rješenja: {formatAttempts(difficulty.finalAttempts)}
            </Text>
            <Text style={styles.infoText}>
              • Kupovina odgovora kolone: {difficulty.buyAnswerCost} poena
            </Text>
            <Text style={styles.infoText}>
              • Konačno rješenje: {difficulty.finalBonus} poena, dostupno nakon{' '}
              {difficulty.finalRequiredSolvedColumns} pogođene kolone
            </Text>
          </View>
        ))}
      </ScrollView>
    </Background>
  );
}
