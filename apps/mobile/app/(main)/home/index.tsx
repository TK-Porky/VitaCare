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
import { DASHBOARD_DATA } from "../../../src/data/mockDashboard";

type BoardProps = {
  onMap: () => void;
};

export default function DashboardScreen({ onMap }: BoardProps) {
  const data = DASHBOARD_DATA;
  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor={colors.primary}
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
            Bienvenue <Text style={styles.greetingName}>{data.currentUser}</Text> !
          </Text>
          <Text style={styles.greetingDate}>Aujourd'hui, {data.currentDate}</Text>
        </View>

        {/* Observance */}
        <ObservanceCard
          remainingDoses={data.stats.pending}
          totalDoses={data.stats.total}
          appointments={data.appointments.length}
          observancePercent={data.stats.observance}
        />

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon={<Flame size={20} color={colors.inkLight} />}
            value={data.streak}
            label={"Jours\nConsécutifs"}
          />
          <StatCard
            icon={<Pill size={20} color={colors.inkLight} />}
            value={data.activeMedications}
            label={"Médicaments\nactifs"}
          />
          <StatCard
            icon={<TrendingUp size={20} color={colors.inkLight} />}
            value={`${data.monthlyProgress}%`}
            label="Ce mois-ci"
          />
        </View>

        {/* Prises du jour */}
        <View style={styles.section}>
          <SectionHeader title="Prises du jour" onSeeAll={() => {}} />
          {data.medications.length === 0 ? (
            <Text style={styles.emptyText}>Aucune prise programmée</Text>
          ):(
            <>
              {data.medications.map((medication, index) => (
                <MedicationItem
                key={index}
                name={medication.name}
                dose={medication.dosage}
                status={medication.status}
                time={medication.time}
              />
              ))}
            </>
          )}
        </View>

        {/* Rendez-vous */}
        <View style={styles.section}>
          <SectionHeader title="Vos Rendez-vous" onSeeAll={() => {}} />
          {data.appointments.length === 0 ? (
            <Text style={styles.emptyText}>Aucun rendez-vous prévu</Text>
          ):(
            <>
              {data.appointments.map((appointment, index) => (
                <AppointmentItem
                key={index}
                doctorName={appointment.doctorName}
                date={appointment.date}
                time={appointment.time}
                status={appointment.status}
              />
              ))}
            </>
          )}
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
    paddingBottom: 24,
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
  emptyText: {
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
