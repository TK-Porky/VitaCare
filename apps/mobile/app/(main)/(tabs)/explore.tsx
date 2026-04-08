import { View, ScrollView, StatusBar, SafeAreaView, StyleSheet } from "react-native";
import { AppHeader } from "../../../src/components";
import { ClinicCard, ClinicCardData } from "../../../src/components";
import { colors } from "../../../src/themes";

const CLINICS: ClinicCardData[] = [
  {
    id: "1",
    doctorName: "Dr. Igriss Kakmo",
    specialty: "Génycologue",
    price: "A partir de 5,000 XCFA",
    clinicName: "Clinique Wellstar",
    description:
      "Votre médecin traitant spécialisé en gynécologie et en santé de vos organes reproducteurs",
    hours: "De 7:00 à 19:00",
    days: "Lundi à Vendredi",
    location: "Bastos, Yaoundé",
    imageFallbackColor: "#C8B8A2",
  },
  {
    id: "2",
    doctorName: "Dr. Igriss Kakmo",
    specialty: "Génycologue",
    price: "A partir de 5,000 XCFA",
    clinicName: "Clinique Wellstar",
    description:
      "Votre médecin traitant spécialisé en gynécologie et en santé de vos organes reproducteurs",
    hours: "De 7:00 à 19:00",
    days: "Lundi à Vendredi",
    location: "Bastos, Yaoundé",
    imageFallbackColor: "#BFB0A0",
  },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
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