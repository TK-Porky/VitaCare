/**
 * HelpScreen — VitaCare Pro
 * FAQ Interactive et Aide Professionnelle
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { ProTopBar, AppButton } from '../../../src/components';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  question: string;
  answer:   string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Comment modifier mes horaires de consultation ?',
    answer: 'Vous pouvez configurer vos disponibilités et vos plages de garde dans l\'onglet Agenda de l\'application. Les modifications sont appliquées instantanément aux créneaux visibles par vos patients.',
  },
  {
    question: 'Comment éditer une prescription médicale ?',
    answer: 'Allez sur la fiche de votre patient dans l\'onglet "Mes Patients", puis cliquez sur l\'icône "+" dans la section Prescriptions. Renseignez la posologie et validez pour générer une ordonnance sécurisée.',
  },
  {
    question: 'Comment configurer mes alertes et rappels ?',
    answer: 'Rendez-vous sur votre profil dans la section "Préférences", puis cliquez sur "Notifications". Vous pourrez y activer ou désactiver les alertes pour les rendez-vous, rappels et messages.',
  },
  {
    question: 'Comment modifier mes honoraires de consultation ?',
    answer: 'Vous pouvez modifier à tout moment votre tarif de base de consultation en vous rendant dans votre profil, section "Cabinet", puis en cliquant sur "Consultation" pour saisir un nouveau montant.',
  },
  {
    question: 'Mes données de santé sont-elles sécurisées ?',
    answer: 'Absolument. VitaCare Pro est entièrement conforme aux normes de protection des données de santé (HDS). Toutes les informations confidentielles et ordonnances sont hautement cryptées de bout en bout.',
  },
];

function FAQRow({ item, isOpen, onPress }: { item: FAQItem; isOpen: boolean; onPress: () => void }) {
  return (
    <View style={[styles.faqCard, isOpen && styles.faqCardOpen]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.faqHeader}
      >
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={18}
          color={colors.ink}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
}

export default function HelpScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handlePressRow = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProTopBar title="Aide & FAQ" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Questions fréquentes</Text>
          <Text style={styles.subtitle}>
            Retrouvez les réponses aux questions les plus courantes pour vous aider à maîtriser l'ensemble des outils de votre portail médical.
          </Text>
        </View>

        <View style={styles.faqList}>
          {FAQ_ITEMS.map((item, index) => (
            <FAQRow
              key={index}
              item={item}
              isOpen={openIndex === index}
              onPress={() => handlePressRow(index)}
            />
          ))}
        </View>

        {/* Technical Support CTA Card */}
        <View style={styles.supportCard}>
          <View style={styles.supportIconWrap}>
            <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.supportTitle}>Besoin d'un accompagnement direct ?</Text>
          <Text style={styles.supportDesc}>
            Notre équipe technique est connectée en direct pour résoudre vos pannes d'agenda, erreurs de facturation ou bugs système.
          </Text>
          <AppButton
            label="Ouvrir le chat de support"
            variant="outline"
            style={styles.supportBtn}
            onPress={() => router.push('/(main)/profile/support-chat')}
          />
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
    marginBottom: 24,
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
  faqList: {
    gap: 12,
    marginBottom: 32,
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  faqCardOpen: {
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  faqQuestion: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.ink,
    flex: 1,
    lineHeight: 18,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  faqAnswer: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: 18,
  },
  supportCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  supportIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  supportTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
    marginBottom: 6,
    textAlign: 'center',
  },
  supportDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  supportBtn: {
    width: '100%',
  },
});
