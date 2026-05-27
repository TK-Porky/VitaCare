/**
 * LanguageSettingsScreen — VitaCare Pro
 * Sélection de la langue de l'interface
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { ProTopBar } from '../../../src/components';

interface Language {
  id: string;
  label: string;
  nativeLabel: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { id: 'fr', label: 'Français', nativeLabel: 'Français', flag: '🇫🇷' },
  { id: 'en', label: 'Anglais', nativeLabel: 'English', flag: '🇬🇧' },
];

export default function LanguageSettingsScreen() {
  const [selectedLang, setSelectedLang] = useState('fr');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = async (langId: string) => {
    setSelectedLang(langId);
    setIsUpdating(true);
    try {
      // Simulate API call to update preference
      await new Promise((r) => setTimeout(r, 650));
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de modifier la langue.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProTopBar title="Langue" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Langue de l'application</Text>
          <Text style={styles.subtitle}>
            Choisissez votre langue préférée pour naviguer dans l'interface de votre espace professionnel VitaCare Pro.
          </Text>
        </View>

        <View style={styles.list}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[styles.langCard, isSelected && styles.langCardSelected]}
                onPress={() => handleSelect(lang.id)}
                activeOpacity={0.7}
                disabled={isUpdating}
              >
                <View style={styles.flagWrapper}>
                  <Text style={styles.flag}>{lang.flag}</Text>
                </View>

                <View style={styles.langInfo}>
                  <Text style={styles.langLabel}>{lang.label}</Text>
                  <Text style={styles.nativeLabel}>{lang.nativeLabel}</Text>
                </View>

                {isSelected && (
                  isUpdating ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <CheckCircle2 size={24} color={colors.primary} />
                  )
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.inkLight,
    lineHeight: 20,
  },
  list: {
    gap: 16,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 16,
  },
  langCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  flagWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  flag: {
    fontSize: 24,
  },
  langInfo: {
    flex: 1,
    gap: 2,
  },
  langLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  nativeLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },
});
