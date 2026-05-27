/**
 * TermsScreen — VitaCare Pro
 * Termes, conditions d'utilisation et politique de confidentialité professionnelle
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { ProTopBar } from '../../../src/components';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ProTopBar title="Mentions légales" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Conditions Générales d'Utilisation</Text>
          <Text style={styles.subtitle}>
            Dernière mise à jour : Mai 2026
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>1. Objet de la Plateforme</Text>
          <Text style={styles.paragraph}>
            VitaCare Pro est une application mobile d'accompagnement destinée exclusivement aux professionnels de santé agréés et inscrits au Conseil de l'Ordre National des Médecins. Elle permet la consultation de l'agenda médical, le suivi des patients, la gestion des rendez-vous et la rédaction d'ordonnances dématérialisées de manière hautement sécurisée.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>2. Responsabilité du Praticien</Text>
          <Text style={styles.paragraph}>
            Le praticien est seul responsable des informations, prescriptions, diagnostics et traitements saisis sur l'application. VitaCare assure un outil technique d'archivage et de simplification mais ne saurait être tenu pour responsable d'erreurs médicales, d'omissions de posologies ou d'usurpations de titres d'exercice professionnel.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>3. Confidentialité & Protection des Données (HDS)</Text>
          <Text style={styles.paragraph}>
            Conformément aux réglementations relatives à la protection des données personnelles de santé, toutes les communications, fiches médicales et données d'ordonnance sont chiffrées de bout en bout. Les serveurs de VitaCare disposent de la certification Hébergeur de Données de Santé (HDS). Le médecin s'engage à ne jamais divulguer ses identifiants de connexion.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>4. Résiliation et Suspension</Text>
          <Text style={styles.paragraph}>
            La clinique d'affiliation ou le support VitaCare se réserve le droit de suspendre ou supprimer définitivement le compte de tout utilisateur en cas de manquement grave aux présentes conditions, de non-respect de l'éthique déontologique médicale, ou d'arrêt d'exercice agréé.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>5. Propriété Intellectuelle</Text>
          <Text style={styles.paragraph}>
            L'ensemble des designs, chartes graphiques, codes sources, logos et marques "VitaCare" et "VitaCare Pro" appartiennent exclusivement à VitaCare Inc. Toute reproduction, copie ou décompilation est strictement interdite sous peine de poursuites judiciaires.
          </Text>
        </View>

        <Text style={styles.footerText}>VitaCare Inc. © 2026. Tous droits réservés.</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.ink,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: 20,
    textAlign: 'justify',
  },
  footerText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 32,
  },
});
