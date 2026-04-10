import { ScrollView, StatusBar, SafeAreaView, StyleSheet } from "react-native";
import { AppHeader, ClinicCard } from "../../../src/components";
import { colors } from "../../../src/themes";
import { CLINICS } from "../../../src/data/mockClinic";

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <AppHeader onSearch={() => {}} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {CLINICS.map((clinic) => (
          <ClinicCard
            key={clinic.id}
            data={clinic}
            onReserve={() => console.log("Réserver", clinic.id)}
            onMore={() => console.log("Plus d'options", clinic.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 14,
  },
});