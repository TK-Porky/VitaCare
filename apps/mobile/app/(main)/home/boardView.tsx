import { ScrollView, View, Text, StyleSheet, StatusBar } from "react-native";
import { Flame, Pill, TrendingUp } from "lucide-react-native";
import {
  AppHeader,
  ObservanceCard,
  StatCard,
  SectionHeader,
  MedicationItem,
  AppointmentItem,
} from "../../../src/components";
import { colors, fontFamily, fontSize } from "../../../src/themes";

type BoardProps = {
  onMap: () => void;
};

export function BoardTabView({ onMap }: BoardProps) {
  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <AppHeader onSearch={() => {}} onMap={onMap} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Bienvenue <Text style={styles.greetingName}>utilisateur</Text> !
          </Text>
          <Text style={styles.greetingDate}>Aujourd'hui, 25 Mars 2026</Text>
        </View>

        {/* Observance */}
        <ObservanceCard
          remainingDoses={3}
          totalDoses={3}
          appointments={1}
          observancePercent={50}
        />

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon={<Flame size={20} color={colors.inkLight} />}
            value={0}
            label={"Jours\nConsécutifs"}
          />
          <StatCard
            icon={<Pill size={20} color={colors.inkLight} />}
            value={3}
            label={"Médicaments\nactifs"}
          />
          <StatCard
            icon={<TrendingUp size={20} color={colors.inkLight} />}
            value="44%"
            label="Ce mois-ci"
          />
        </View>

        {/* Prises du jour */}
        <View style={styles.section}>
          <SectionHeader title="Prises du jour" onSeeAll={() => {}} />
          <MedicationItem
            name="Amoxicilline"
            dose="2 Comprimés • Pris"
            status="missed"
            time="08:00"
          />
        </View>

        {/* Rendez-vous */}
        <View style={styles.section}>
          <SectionHeader title="Vos Rendez-vous" onSeeAll={() => {}} />
          <AppointmentItem
            doctorName="Dr. Idriss Kakmo"
            date="26 Mars 2026"
            time="14:00"
            status="confirmed"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 20,
  },
  greeting: {
    gap: 4,
  },
  greetingText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize["2xl"],
    color: colors.ink,
  },
  greetingName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize["2xl"],
    color: colors.primary,
  },
  greetingDate: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  section: {
    gap: 12,
  },
});
