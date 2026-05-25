/**
 * Landing Page — VitaCare Pro
 * Écran d'accueil du portail professionnel
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../src/components';
import { colors, fontFamily, fontSize } from '../../src/themes';

export default function LandingScreen() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Hero Gradient */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid1, colors.gradientEnd]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.hero}
      >
        <SafeAreaView style={styles.heroContent}>
          {/* Logo / Icon */}
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Ionicons name="medkit" size={40} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.brand}>VitaCare Pro</Text>
          <Text style={styles.tagline}>
            La plateforme dédiée{'\n'}aux professionnels de santé
          </Text>

          {/* Feature bullets */}
          <View style={styles.bullets}>
            {[
              { icon: 'calendar-check', label: 'Gérez votre agenda en temps réel' },
              { icon: 'people',         label: 'Suivez vos patients facilement' },
              { icon: 'document-text', label: 'Rédigez vos prescriptions' },
            ].map((item) => (
              <View key={item.label} style={styles.bullet}>
                <View style={styles.bulletIcon}>
                  <Ionicons name={item.icon as any} size={16} color={colors.primary} />
                </View>
                <Text style={styles.bulletText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Bottom Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bienvenue, Docteur</Text>
        <Text style={styles.cardSubtitle}>
          Connectez-vous à votre espace professionnel pour commencer.
        </Text>

        <AppButton
          label="Se connecter"
          onPress={() => router.push('/(auth)/login')}
          size="lg"
        />

        <Text style={styles.note}>
          Vous n'avez pas encore de compte ?{'\n'}
          Contactez l'administration VitaCare.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  // Hero
  hero: { flex: 1 },
  heroContent: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 32,
    gap:               20,
  },
  logoWrap:   { marginBottom: 8 },
  logoCircle: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.15,
    shadowRadius:    16,
    elevation:       10,
  },
  brand: {
    fontFamily: fontFamily.bold,
    fontSize:   fontSize['3xl'],
    color:      colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.base,
    color:      'rgba(255,255,255,0.85)',
    textAlign:  'center',
    lineHeight: 24,
  },
  bullets: { gap: 12, alignSelf: 'stretch', marginTop: 8 },
  bullet: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius:    12,
    padding:         12,
  },
  bulletIcon: {
    width:           32,
    height:          32,
    borderRadius:    10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  bulletText: {
    flex:       1,
    fontFamily: fontFamily.medium,
    fontSize:   fontSize.sm,
    color:      colors.white,
  },

  // Card
  card: {
    backgroundColor:   colors.white,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    padding:           28,
    gap:               16,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: -4 },
    shadowOpacity:     0.06,
    shadowRadius:      16,
    elevation:         10,
  },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize:   fontSize['2xl'],
    color:      colors.ink,
  },
  cardSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.sm,
    color:      colors.inkLight,
    lineHeight: 20,
  },
  note: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.xs,
    color:      colors.inkMuted,
    textAlign:  'center',
    lineHeight: 18,
    marginTop:  4,
  },
});
