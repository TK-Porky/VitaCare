import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { Drug } from '../../../src/types';
import { MARKETPLACE_DRUGS } from '../../../src/data/mockMedications';

// ─── Suggestions ─────────────────────────────────────────────────────────────

const ALL_SUGGESTIONS = [
  'Maux de gorge',
  "Maux d'estomac",
  'Maux de tête',
  'Fièvre',
  'Douleur',
  'Toux',
  'Rhume',
  'Grippe',
  'Allergie',
  'Vitamine',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SuggestionChip = ({ label, query, onPress }: { label: string; query: string; onPress: () => void }) => {
  const lower = label.toLowerCase();
  const q = query.toLowerCase();
  const idx = q.length > 0 ? lower.indexOf(q) : -1;

  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
      {idx === -1 || q.length === 0 ? (
        <Text style={styles.chipLabel}>{label}</Text>
      ) : (
        <Text style={styles.chipLabel}>
          {label.slice(0, idx)}
          <Text style={styles.chipLabelBold}>{label.slice(idx, idx + query.length)}</Text>
          {label.slice(idx + query.length)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const DrugCard = ({ item }: { item: Drug }) => (
  <TouchableOpacity style={styles.drugCard} activeOpacity={0.8}>
    <View style={styles.drugImageWrap}>
      <Image source={{ uri: item.imageUri }} style={styles.drugImage} resizeMode="contain" />
    </View>
    <View style={styles.drugBody}>
      <Text style={styles.drugCategory} numberOfLines={1}>{item.category}</Text>
      <Text style={styles.drugName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.drugPrice}>{item.price}</Text>
    </View>
    <TouchableOpacity style={styles.voirBtn} activeOpacity={0.85}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid1, colors.gradientStart]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.voirGradient}
      >
        <Text style={styles.voirLabel}>Voir</Text>
      </LinearGradient>
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MedicationsSearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');

  const suggestions = useMemo(() => {
    if (query.trim().length === 0) return ALL_SUGGESTIONS.slice(0, 6);
    return ALL_SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const results = useMemo(() => {
    if (query.trim().length === 0) return MARKETPLACE_DRUGS;
    const q = query.toLowerCase();
    return MARKETPLACE_DRUGS.filter(
      d => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
    );
  }, [query]);

  // FlatList with numColumns=2 requires items to have consistent width
  const renderItem = ({ item, index }: { item: Drug; index: number }) => (
    <View style={[styles.cardWrap, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
      <DrugCard item={item} />
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* ── Search header ── */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un médicament..."
            placeholderTextColor={colors.inkMuted}
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={2}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <>
            {/* ── Suggestions ── */}
            {suggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Termes suggérés</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsRow}
                >
                  {suggestions.map(s => (
                    <SuggestionChip
                      key={s}
                      label={s}
                      query={query}
                      onPress={() => setQuery(s)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* ── Results label ── */}
            <Text style={styles.sectionLabel}>Meilleures correspondances</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={colors.inkFaint} />
            <Text style={styles.emptyText}>Aucun résultat pour « {query} »</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_GAP = 12;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // ── Header ──
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backBtn: {
    padding: 4,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 7,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.ink,
    padding: 0,
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // ── Sections ──
  section: {
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    paddingTop: 16,
    paddingBottom: 10,
  },

  // ── Suggestion chips ──
  chipsRow: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(17, 199, 147, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(17, 199, 147, 0.3)',
  },
  chipLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.primaryDark,
  },
  chipLabelBold: {
    fontFamily: fontFamily.bold,
    color: colors.primaryDark,
  },

  // ── Drug cards ──
  cardWrap: {
    flex: 1,
  },
  cardLeft: {
    marginRight: CARD_GAP / 2,
  },
  cardRight: {
    marginLeft: CARD_GAP / 2,
  },
  drugCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  drugImageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drugImage: {
    width: '100%',
    height: '100%',
  },
  drugBody: {
    padding: 10,
    gap: 3,
  },
  drugCategory: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
  },
  drugName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
    lineHeight: 17,
  },
  drugPrice: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.primaryDark,
  },
  voirBtn: {
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  voirGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 999,
  },
  voirLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.white,
  },

  // ── Empty ──
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.inkMuted,
  },
});
