import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { AppBottomSheet, AppBottomSheetRef } from '../generics';
import { PrimaryButton } from '../buttons';
import { GrayButton } from '../buttons/GrayButton';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { Drug } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DrugDetailBottomSheetRef = {
  open: () => void;
  close: () => void;
};

type Props = {
  drug?: Drug | null;
  onAddToCart?: (drug: Drug) => void;
  onClose?: () => void;
};

// ─── Main component ───────────────────────────────────────────────────────────

export const DrugDetailBottomSheet = forwardRef<DrugDetailBottomSheetRef, Props>(
  ({ drug, onAddToCart, onClose }, ref) => {
    const sheetRef = useRef<AppBottomSheetRef>(null);

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.open(),
      close: () => sheetRef.current?.close(),
    }));

    if (!drug) return null;

    return (
      <AppBottomSheet
        ref={sheetRef}
        snapPoints={['55%', '85%']}
        onClose={onClose}
        scrollable
        containerStyle={styles.sheet}
      >
        <View style={styles.content}>
          {/* ── Drug Image ── */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: drug.imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* ── Header Info ── */}
          <View style={styles.headerInfo}>
            <Text style={styles.category}>{drug.category}</Text>
            <Text style={styles.name}>{drug.name}</Text>
            <Text style={styles.price}>{drug.price}</Text>
          </View>

          {/* ── Description ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              Ce médicament est utilisé pour traiter les symptômes de la douleur et de la fièvre. 
              Veuillez lire attentivement la notice avant utilisation. Si les symptômes persistent, 
              consultez votre médecin ou votre pharmacien.
            </Text>
          </View>

          {/* ── Indications ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Indications</Text>
            <View style={styles.indicationRow}>
              <View style={styles.dot} />
              <Text style={styles.indicationText}>Douleurs légères à modérées</Text>
            </View>
            <View style={styles.indicationRow}>
              <View style={styles.dot} />
              <Text style={styles.indicationText}>États fébriles</Text>
            </View>
          </View>

          {/* ── Actions ── */}
          <View style={styles.actions}>
            <PrimaryButton
              label="Ajouter au panier"
              fullWidth
              onPress={() => drug && onAddToCart?.(drug)}
            />
            <GrayButton
              label="Fermer"
              onPress={() => sheetRef.current?.close()}
              style={[styles.closeBtn, { width: '100%' }] as any}
            />
          </View>
        </View>
      </AppBottomSheet>
    );
  }
);

DrugDetailBottomSheet.displayName = 'DrugDetailBottomSheet';

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 24,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    marginBottom: 24,
  },
  category: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    marginBottom: 4,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: colors.ink,
    marginBottom: 8,
  },
  price: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
    marginBottom: 8,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    lineHeight: 22,
  },
  indicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  indicationText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  closeBtn: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
});
