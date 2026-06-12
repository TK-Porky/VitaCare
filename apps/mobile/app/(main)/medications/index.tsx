import React, { useState, useRef } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageBackground,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamily, fontSize } from "../../../src/themes";
import { SectionHeader } from "../../../src/components";
import { AppHeader } from "../../../src/components";
import { Category, Drug } from "../../../src/types";
import { MARKETPLACE_CATEGORIES, MARKETPLACE_DRUGS } from "../../../src/data/mockMedications";
import { DrugDetailBottomSheet, DrugDetailBottomSheetRef } from "../../../src/components/medications";

// ================================================================================== //
// Types
// ================================================================================== //
type Props = {
  onReminders?: () => void;
};

// ================================================================================== //
// Components
// ================================================================================== //

/**
 * Category card component
 * @param item - Category object
 * @returns Category card component
 */
function CategoryCard({ item }: { item: Category }) {
  return (
    <TouchableOpacity style={styles.categoryCard} activeOpacity={0.85}>
      <Image
        source={{ uri: item.imageUri }}
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <View style={styles.categoryLabelRow}>
        <Text style={styles.categoryLabel}>{item.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Drug card component
 * @param item - Drug object
 * @param onPress - Function to handle press event
 * @returns Drug card component
 */
function DrugCard({ item, onPress }: { item: Drug, onPress?: (drug: Drug) => void }) {
  return (
    <TouchableOpacity 
      style={styles.drugCard} 
      activeOpacity={0.85}
      onPress={() => onPress?.(item)}
    >
      <View style={styles.drugImageContainer}>
        <Image
          source={{ uri: item.imageUri }}
          style={styles.drugImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.drugInfo}>
        <Text style={styles.drugCategory}>{item.category}</Text>
        <Text style={styles.drugName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.drugPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ================================================================================== //
// Main
// ================================================================================== //
export default function MedecineScreen({ onReminders }: Props) {
  // ================================================================================== //
  // States & Refs
  // ================================================================================== //
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [search, setSearch] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const drugSheetRef = useRef<DrugDetailBottomSheetRef>(null);

  // ================================================================================== //
  // Functions
  // ================================================================================== //
  
  /**
   * Handle drug card press
   * @param drug - Selected drug
   */
  const handleDrugPress = (drug: Drug) => {
    setSelectedDrug(drug);
    drugSheetRef.current?.open();
  };

  // ================================================================================== //
  // Loading Render
  // ================================================================================== //
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  // ================================================================================== //
  // Render
  // ================================================================================== //
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* ── Top bar ── */}
      <AppHeader
        searchBar={true}
        searchValue={search}
        onFilter={() => {}}
        onReminders={onReminders}
        onSearchFocus={() => router.push('/(main)/medications/search' as never)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero Banner ── */}
        <TouchableOpacity activeOpacity={0.9} style={styles.heroBannerWrapper}>
          <ImageBackground
            source={{
              uri: "https://www.pharma-gdd.com/media/cache/resolve/slide_original/7508386a20565f5cbc526eee8b3c9f39edeecd576ee90cb3dbb5ce5ac3fe9566b67813d6.jpg",
            }}
            style={styles.heroBanner}
            imageStyle={styles.heroBannerImage}
          >
            {/* Gradient overlay */}
            <View style={styles.heroBannerOverlay}>
              <Text style={styles.heroTitle}>Espaces Médicaments</Text>
              <Text style={styles.heroSubtitle}>
                Découvrez nos médicaments classés par catégorie.
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── Categories ── */}
        <SectionHeader title="Catégories" onSeeAll={() => {}} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} item={cat} />
          ))}
        </ScrollView>

        {/* ── Les plus recherchés ── */}
        <SectionHeader title="Les plus recherchés" onSeeAll={() => {}} />
        <View style={styles.drugsGrid}>
          {MARKETPLACE_DRUGS.map((drug) => (
            <DrugCard 
              key={drug.id} 
              item={drug} 
              onPress={handleDrugPress}
            />
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Modals ── */}
      <DrugDetailBottomSheet
        ref={drugSheetRef}
        drug={selectedDrug}
        relatedDrugs={MARKETPLACE_DRUGS.filter(d => d.id !== selectedDrug?.id)}
        onAddToReminder={(drug) => {
          console.log("Add to reminder:", drug.name);
          drugSheetRef.current?.close();
        }}
      />
    </SafeAreaView>
  );
}

// ================================================================================== //
// Styles
// ================================================================================== //
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // ── Scroll ──
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },

  // ── Hero Banner ──
  heroBannerWrapper: {
    marginTop: 4,
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  heroBanner: {
    height: 160,
    justifyContent: "flex-end",
  },
  heroBannerImage: {
    borderRadius: 20,
  },
  heroBannerOverlay: {
    backgroundColor: "rgba(10, 30, 20, 0.5)",
    padding: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 18,
  },

  // ── Categories ──
  categoriesRow: {
    gap: 12,
    marginBottom: 24,
    marginTop: 12,
  },
  categoryCard: {
    width: 120,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryImage: {
    width: "100%",
    height: 80,
    backgroundColor: colors.surface,
  },
  categoryLabelRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  categoryLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.ink,
  },

  // ── Drugs grid ──
  drugsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
    marginTop: 12,
  },
  drugCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  drugImageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: colors.surface,
  },
  drugImage: {
    width: "100%",
    height: "100%",
  },
  drugInfo: {
    padding: 12,
  },
  drugCategory: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.inkLight,
    marginBottom: 4,
  },
  drugName: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
    marginBottom: 6,
    lineHeight: 18,
  },
  drugPrice: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },
});
