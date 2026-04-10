import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
  ImageBackground,
} from 'react-native';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { SectionHeader } from '../../../src/components';
import { CATEGORIES, POPULAR_DRUGS } from '../../../src/data/mockStore';
import { AppHeader } from '../../../src/components';
import { Category, Drug } from '../../../src/types';

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function DrugCard({ item }: { item: Drug }) {
  return (
    <TouchableOpacity style={styles.drugCard} activeOpacity={0.85}>
      <View style={styles.drugImageContainer}>
        <Image
          source={{ uri: item.imageUri }}
          style={styles.drugImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.drugInfo}>
        <Text style={styles.drugCategory}>{item.category}</Text>
        <Text style={styles.drugName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.drugPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MedecineScreen() {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      {/* ── Top bar ── */}
      <AppHeader 
        searchBar={true}
        searchValue={search}
        onFilter={() => {}}
        onReminders={() => {}}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero Banner ── */}
        <TouchableOpacity activeOpacity={0.9} style={styles.heroBannerWrapper}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' }}
            style={styles.heroBanner}
            imageStyle={styles.heroBannerImage}
          >
            {/* Gradient overlay */}
            <View style={styles.heroBannerOverlay}>
              <Text style={styles.heroTitle}>Espaces Médicaments</Text>
              <Text style={styles.heroSubtitle}>
                Votre annuaire de médicaments à porter de main. Renseignez-vous gratuitement sur vos produits pharmaceutiques.
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
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} item={cat} />
          ))}
        </ScrollView>

        {/* ── Les plus recherchés ── */}
        <SectionHeader title="Les plus recherchés" onSeeAll={() => {}} />
        <View style={styles.drugsGrid}>
          {POPULAR_DRUGS.map((drug) => (
            <DrugCard key={drug.id} item={drug} />
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_WIDTH = 160;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
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
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  heroBanner: {
    height: 140,
    justifyContent: 'flex-end',
  },
  heroBannerImage: {
    borderRadius: 20,
  },
  heroBannerOverlay: {
    backgroundColor: 'rgba(10, 30, 20, 0.62)',
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 17,
  },

  // ── Categories ──
  categoriesRow: {
    gap: 12,
    marginBottom: 24,
    marginTop: 16,
  },
  categoryCard: {
    width: 130,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: 'rgba(0,0,0,0.07)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  categoryLabelRow: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  categoryLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.ink,
  },

  // ── Drugs grid ──
  drugsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 16,
  },
  drugCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.07)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  drugImageContainer: {
    width: '100%',
    height: 130,
    backgroundColor: '#F8F8F8',
  },
  drugImage: {
    width: '100%',
    height: '100%',
  },
  drugInfo: {
    padding: 10,
  },
  drugCategory: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.inkLight,
    marginBottom: 3,
  },
  drugName: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
    color: colors.ink,
    marginBottom: 4,
    lineHeight: 18,
  },
  drugPrice: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.inkLight,
  },
});