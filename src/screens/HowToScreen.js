import { ScrollView, Text, View } from 'react-native';

import { Background } from '../components/Background';
import { Header } from '../components/Header';
import { RuleCard } from '../components/RuleCard';
import { DIFFICULTIES } from '../constants/difficulties';
import { useAppTheme } from '../theme/ThemeContext';

function formatAttempts(value) {
  return value === null ? 'neograničeno' : value;
}

function formatColumnPoints(difficulty) {
  if (difficulty.id === 1) {
    return `1 otvoreno ${difficulty.columnPoints[1]}, 2 otvorena ${difficulty.columnPoints[2]}, 3 otvorena ${difficulty.columnPoints[3]}, 4 otvorena ${difficulty.columnPoints[4]}`;
  }

  return `0 otvorenih ${difficulty.zeroOpenColumnPoints}, 1 otvoreno ${difficulty.columnPoints[1]}, 2 otvorena ${difficulty.columnPoints[2]}, 3 otvorena ${difficulty.columnPoints[3]}, 4 otvorena ${difficulty.columnPoints[4]}`;
}

function getDifficultyNote(difficulty) {
  if (difficulty.id === 1) {
    return 'Na lakom levelu se automatski otvara po jedno polje u svakoj koloni i kategorija je prikazana.';
  }

  if (difficulty.id === 2) {
    return 'Na srednjem levelu se automatski otvara po jedno polje u dvije nasumične kolone.';
  }

  return 'Na teškom levelu nema početno otvorenih polja, kategorija nije prikazana i partija traje 4 minuta.';
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
          icon="👆"
          step="Korak 1"
          title="Otvori asocijacije"
          text="Dodirni skrivena polja u kolonama A, B, C i D. Što manje polja otvoriš prije tačnog odgovora, više poena dobijaš za tu kolonu."
        />
        <RuleCard
          colors={['#0bc66b', '#00a870']}
          icon="✅"
          step="Korak 2"
          title="Pogodi kolone"
          text="Svaka kolona ima svoje rješenje. Težina određuje početno otvorena polja, broj pokušaja, cijenu kupovine odgovora i pravila za konačno rješenje."
        />
        <RuleCard
          colors={['#f8b500', '#ff5a12']}
          icon="🏆"
          step="Korak 3"
          title="Konačno rješenje"
          text="Konačno rješenje se otključava nakon određenog broja pogođenih kolona. Kada ga pogodiš, otvaraju se i boduju preostale kolone, a zatim se dodaje bonus."
        />
        <RuleCard
          colors={['#7c3aed', '#db2777']}
          icon="⏱️"
          step="Level 3"
          title="Vremenski izazov"
          text="Na teškom levelu standardne asocijacije imaš 4 minuta. Ako vrijeme istekne, partija se računa kao izgubljena i sva rješenja se otvaraju bez dodatnih bodova."
        />

        <Text style={styles.sectionTitle}>Blitz</Text>
        <RuleCard
          colors={['#ef4444', '#f97316']}
          icon="⚡"
          step=""
          title="Trka sa vremenom"
          text="Blitz prikazuje jednu mini-asocijaciju: nekoliko skrivenih polja i jedno rješenje. Riješi što više zagonetki prije isteka vremena ili preskoči onu koja te zaustavi."
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
            • Bodovi zavise od težine i broja otvorenih polja: lako 50/40/30/20/10, srednje 50/40/30/20, teško 60/50/40.
          </Text>
          <Text style={styles.infoText}>
            • Kod izbora kategorije možeš izabrati konkretnu kategoriju ili Random za nasumične mini-asocijacije.
          </Text>
          <Text style={styles.infoText}>
            • Preskočena asocijacija prikazuje rješenje i odmah se učitava sljedeća.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Težine</Text>
        {Object.values(DIFFICULTIES).map((difficulty) => (
          <View key={difficulty.id} style={styles.infoPanel}>
            <Text style={styles.infoTitle}>
              {difficulty.id}. {difficulty.label}
            </Text>
            <Text style={styles.infoText}>• {getDifficultyNote(difficulty)}</Text>
            <Text style={styles.infoText}>• Poeni kolone: {formatColumnPoints(difficulty)}</Text>
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
