/**
 * OCRScannerScreen — VitaCare Pro
 * Interface caméra intelligente de numérisation d'ordonnances manuscrites papier
 * avec traitement OCR, extraction IA simulée, édition virtuelle et partage social épuré.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { AppButton, AppBottomSheet, AppBottomSheetRef } from '../../../src/components';
import { usePatientStore } from '../../../src/store';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExtractedMed {
  id:        string;
  name:      string;
  dosage:    string;
  frequency: string;
  duration:  string;
}

export default function OCRScannerScreen() {
  const { patients } = usePatientStore();
  
  // Camera hardware permissions & ref
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);

  const [step, setStep] = useState<'camera' | 'scanning' | 'result'>('camera');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStepLabel, setOcrStepLabel] = useState('');

  // Simulated photo captured check
  const [photoCaptured, setPhotoCaptured] = useState(false);

  // Extracted drugs data
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? 'pat-001');
  const [extractedMeds, setExtractedMeds] = useState<ExtractedMed[]>([
    { id: '1', name: 'Paracétamol Biogaran', dosage: '1000 mg', frequency: '3 fois par jour (Matin, Midi, Soir)', duration: '5 jours' },
    { id: '2', name: 'Spasfon Lyoc', dosage: '80 mg', frequency: '2 fois par jour en cas de crise', duration: '3 jours' },
  ]);

  const shareSheetRef = useRef<AppBottomSheetRef>(null);
  
  // Animation value for scanner laser line
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step === 'scanning') {
      // Start infinite loop for laser scanning line
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(laserAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();

      // Simulate OCR step label ticks
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setOcrProgress(progress);

        if (progress === 20) setOcrStepLabel('1. Détection des blocs de texte manuscrit...');
        if (progress === 50) setOcrStepLabel('2. Analyse sémantique et reconnaissance des molécules...');
        if (progress === 80) setOcrStepLabel('3. Structuration de la posologie et de la durée...');

        if (progress >= 100) {
          clearInterval(interval);
          setStep('result');
        }
      }, 400);

      return () => clearInterval(interval);
    }
  }, [step]);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: true,
        });
        if (photo && photo.uri) {
          setCapturedPhotoUri(photo.uri);
          setPhotoCaptured(true);
          setStep('scanning');
        } else {
          setStep('scanning');
        }
      } catch (err) {
        console.warn('Failed to take picture:', err);
        setStep('scanning');
      }
    } else {
      setStep('scanning');
    }
  };

  const handleCreatePrescription = () => {
    Alert.alert(
      'Ordonnance créée !',
      "L'ordonnance extraite a été enregistrée officiellement sous forme dématérialisée dans le dossier du patient.",
      [
        {
          text: 'Super !',
          onPress: () => router.push(`/(main)/patients/${selectedPatientId}` as any),
        },
      ]
    );
  };

  const handleShareOption = (platform: string) => {
    shareSheetRef.current?.close();
    setTimeout(() => {
      Alert.alert(
        'Partage réussi !',
        `L'ordonnance au visuel épuré a été envoyée avec succès via ${platform}.`,
        [{ text: 'Fermer', style: 'default' }]
      );
    }, 300);
  };

  const translateLaserY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });

  if (!permission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.cameraRoot}>
          {/* Header */}
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.camClose}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.camTitle}>Autorisation</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.permissionContainer}>
            <View style={styles.permissionIconBg}>
              <Ionicons name="camera-outline" size={38} color={colors.primary} />
            </View>
            <Text style={styles.permissionTitle}>Caméra Requise</Text>
            <Text style={styles.permissionDesc}>
              Pour numériser des ordonnances manuscrites papier et en faire des prescriptions virtuelles, l'application nécessite l'autorisation d'accéder à l'appareil photo.
            </Text>
            <AppButton
              label="Autoriser l'accès à la caméra"
              onPress={requestPermission}
              style={styles.permissionBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── CAMERA STEP ── */}
      {step === 'camera' && (
        <View style={styles.cameraRoot}>
          {/* Header */}
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.camClose}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.camTitle}>Scanner d'ordonnance</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Viewfinder Overlay with Expo Camera View */}
          <View style={styles.viewfinderContainer}>
            <View style={styles.viewfinderFrame}>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="back"
              />
              
              {/* Custom Corners Markers on top of video feed */}
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
              
              <View style={styles.viewfinderOverlay}>
                <Ionicons name="scan-outline" size={40} color="rgba(255, 255, 255, 0.4)" />
                <Text style={styles.viewfinderHelper}>Cadrez l'ordonnance papier</Text>
              </View>
            </View>
          </View>

          {/* Controller footer */}
          <View style={styles.cameraFooter}>
            <Text style={styles.camTip}>
              Veillez à ce que l'écriture manuscrite et les posologies soient bien éclairées et lisibles.
            </Text>
            <TouchableOpacity onPress={handleCapture} style={styles.captureBtn} activeOpacity={0.85}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── SCANNING STEP (OCR BALAYAGE LASER) ── */}
      {step === 'scanning' && (
        <View style={styles.cameraRoot}>
          <View style={styles.cameraHeader}>
            <View style={{ width: 40 }} />
            <Text style={styles.camTitle}>Numérisation par IA</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.viewfinderContainer}>
            <View style={[styles.viewfinderFrame, styles.scanningFrame]}>
              {/* Actual Captured Photo Render */}
              {capturedPhotoUri ? (
                <Image source={{ uri: capturedPhotoUri }} style={styles.capturedPhoto} />
              ) : (
                <Ionicons name="document-text" size={140} color="rgba(79, 110, 247, 0.3)" />
              )}
              
              {/* Horizontal Moving Laser Line */}
              <Animated.View
                style={[
                  styles.laserLine,
                  { transform: [{ translateY: translateLaserY }] },
                ]}
              />
            </View>
          </View>

          <View style={styles.scanningProgressWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.scanningProgressTitle}>Analyse OCR en cours... {ocrProgress}%</Text>
            <Text style={styles.scanningProgressStep}>{ocrStepLabel || 'Initialisation du numériseur...'}</Text>
          </View>
        </View>
      )}

      {/* ── RESULT STEP (EDITABLE VIRTUAL PRESCRIPTION) ── */}
      {step === 'result' && (
        <View style={styles.resultRoot}>
          {/* Header */}
          <View style={styles.resultHeader}>
            <TouchableOpacity onPress={() => setStep('camera')} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color={colors.ink} />
            </TouchableOpacity>
            <Text style={styles.resultTitle}>Ordonnance Numérisée</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
            {/* Success Box */}
            <View style={styles.successIntroBox}>
              <Ionicons name="sparkles" size={18} color={colors.primary} />
              <Text style={styles.successIntroText}>
                L'IA a retranscrit et structuré les médicaments identifiés avec succès.
              </Text>
            </View>

            {/* Target Patient Picker Card */}
            <View style={styles.resultCard}>
              <Text style={styles.cardSectionTitle}>Associer au patient</Text>
              <View style={styles.patientSelectorRow}>
                <View style={styles.patientAvatarPlaceholder}>
                  <Ionicons name="person-outline" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectorLabel}>Dossier patient</Text>
                  <Text style={styles.selectorName}>
                    {patients.find((p) => p.id === selectedPatientId)?.fullName ?? 'Pierre Kamto'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.selectorChangeBtn}
                  onPress={() => {
                    // Quick toggler for demo
                    const idx = patients.findIndex((p) => p.id === selectedPatientId);
                    const nextIdx = (idx + 1) % patients.length;
                    setSelectedPatientId(patients[nextIdx]?.id ?? 'pat-001');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.changeBtnText}>Changer</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Extracted Drugs Card */}
            <View style={styles.resultCard}>
              <Text style={styles.cardSectionTitle}>Médicaments Extraits</Text>
              
              {extractedMeds.map((med, idx) => (
                <View key={med.id} style={styles.extractedMedItem}>
                  <View style={styles.medIndexWrap}>
                    <Text style={styles.medIndexText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.medTitleText}>{med.name}</Text>
                    <Text style={styles.medPosologyText}>
                      Posologie : <Text style={{ color: colors.ink }}>{med.dosage} • {med.frequency}</Text>
                    </Text>
                    <Text style={styles.medDurationText}>
                      Durée : <Text style={{ color: colors.ink }}>{med.duration}</Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      // Delete item quick filter
                      setExtractedMeds((prev) => prev.filter((m) => m.id !== med.id));
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addMedBtn}
                onPress={() => {
                  const newM = {
                    id:       `med-${Date.now()}`,
                    name:     'Médicament additionnel',
                    dosage:   '500 mg',
                    frequency: '1 comprimé au besoin',
                    duration:  '3 jours',
                  };
                  setExtractedMeds((prev) => [...prev, newM]);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addMedBtnText}>Ajouter une ligne de prescription</Text>
              </TouchableOpacity>
            </View>

            {/* Main Action Buttons */}
            <View style={styles.resultFooterActions}>
              <AppButton
                label="Créer la prescription officielle"
                onPress={handleCreatePrescription}
                style={{ marginBottom: 12 }}
              />
              <AppButton
                label="Partager l'ordonnance épurée"
                variant="outline"
                onPress={() => shareSheetRef.current?.open()}
              />
            </View>
          </ScrollView>
        </View>
      )}

      {/* ── 4. Immersive Virtual Social Share Bottom Sheet ── */}
      <AppBottomSheet ref={shareSheetRef}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Partager l'ordonnance épurée</Text>
          <Text style={styles.sheetSubtitle}>Envoyez un visuel propre et minimaliste de la prescription médicale</Text>
        </View>

        {/* Crisp Virtual Sharing Card Preview */}
        <View style={styles.previewSharingCard}>
          <View style={styles.cardPreviewHeader}>
            <View style={styles.logoWrap}>
              <Ionicons name="pulse" size={16} color={colors.white} />
            </View>
            <Text style={styles.cardPreviewBrand}>VitaCare Ordonnance Virtuelle</Text>
          </View>
          
          <Text style={styles.previewDoctor}>Prescrit par : Dr. Jean-Claude Mbarga</Text>
          <Text style={styles.previewPatient}>Patient : {patients.find((p) => p.id === selectedPatientId)?.fullName ?? 'Pierre Kamto'}</Text>
          <View style={styles.previewDivider} />

          <View style={styles.previewMedsList}>
            {extractedMeds.map((med, idx) => (
              <View key={med.id} style={styles.previewMedRow}>
                <Text style={styles.previewMedName}>{idx + 1}. {med.name} ({med.dosage})</Text>
                <Text style={styles.previewMedSub}>{med.frequency} • pendant {med.duration}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.previewDivider} />
          <Text style={styles.previewFooterText}>Ordonnance sécurisée conforme HDS • Code : VC-2026-9874</Text>
        </View>

        {/* Social Platforms Row */}
        <Text style={styles.socialTitle}>Partager via :</Text>
        <View style={styles.socialGrid}>
          <TouchableOpacity style={styles.socialItem} onPress={() => handleShareOption('WhatsApp')} activeOpacity={0.8}>
            <View style={[styles.socialIconBg, { backgroundColor: '#25D366' }]}>
              <Ionicons name="logo-whatsapp" size={24} color={colors.white} />
            </View>
            <Text style={styles.socialLabel}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialItem} onPress={() => handleShareOption('Messages')} activeOpacity={0.8}>
            <View style={[styles.socialIconBg, { backgroundColor: '#007AFF' }]}>
              <Ionicons name="chatbubble-ellipses" size={24} color={colors.white} />
            </View>
            <Text style={styles.socialLabel}>SMS / Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialItem} onPress={() => handleShareOption('Email')} activeOpacity={0.8}>
            <View style={[styles.socialIconBg, { backgroundColor: '#E14B4B' }]}>
              <Ionicons name="mail" size={24} color={colors.white} />
            </View>
            <Text style={styles.socialLabel}>Email</Text>
          </TouchableOpacity>
        </View>

        <AppButton
          label="Annuler"
          variant="ghost"
          onPress={() => shareSheetRef.current?.close()}
          style={{ marginTop: 12 }}
        />
      </AppBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Camera Viewfinder Styles
  cameraRoot: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
    height: 64,
  },
  camClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.white,
  },
  viewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  viewfinderFrame: {
    width: SCREEN_WIDTH - 64,
    height: 280,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    overflow: 'hidden', // Required to crop CameraView inside the rounded frame
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 16,
  },
  scanningFrame: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(79, 110, 247, 0.05)',
  },
  cornerTL: { width: 24, height: 24, borderTopWidth: 4, borderLeftWidth: 4, borderColor: colors.white, position: 'absolute', top: -2, left: -2, borderTopLeftRadius: 16 },
  cornerTR: { width: 24, height: 24, borderTopWidth: 4, borderRightWidth: 4, borderColor: colors.white, position: 'absolute', top: -2, right: -2, borderTopRightRadius: 16 },
  cornerBL: { width: 24, height: 24, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: colors.white, position: 'absolute', bottom: -2, left: -2, borderBottomLeftRadius: 16 },
  cornerBR: { width: 24, height: 24, borderBottomWidth: 4, borderRightWidth: 4, borderColor: colors.white, position: 'absolute', bottom: -2, right: -2, borderBottomRightRadius: 16 },
  
  viewfinderHelper: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cameraFooter: {
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
    gap: 20,
  },
  camTip: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs + 1,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 16,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
  },

  // Laser styles
  laserLine: {
    width: '100%',
    height: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 20,
    left: 0,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  scanningProgressWrap: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
    gap: 8,
  },
  scanningProgressTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.white,
    marginTop: 6,
  },
  scanningProgressStep: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs + 1,
    color: colors.primaryLight,
  },

  // Result View Styles
  resultRoot: {
    flex: 1,
    backgroundColor: colors.white,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  resultContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  successIntroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  successIntroText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs + 1,
    color: colors.primary,
    flex: 1,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  
  // Patient Selector Row
  patientSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  patientAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },
  selectorName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  selectorChangeBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  changeBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.primary,
  },

  // Extracted drug items
  extractedMedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    marginBottom: 10,
  },
  medIndexWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  medIndexText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
  },
  medTitleText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm + 1,
    color: colors.primary,
  },
  medPosologyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs + 1,
    color: colors.inkLight,
  },
  medDurationText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs + 1,
    color: colors.inkLight,
  },
  addMedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: 6,
    marginTop: 6,
  },
  addMedBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs + 1,
    color: colors.primary,
  },
  resultFooterActions: {
    marginTop: 8,
  },

  // ================================================================================== //
  // SHARING BOTTOM SHEET STYLES
  // ================================================================================== //
  sheetHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.ink,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: 18,
  },
  previewSharingCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 20,
    gap: 8,
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  logoWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPreviewBrand: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs + 1,
    color: colors.primary,
  },
  previewDoctor: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  previewPatient: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs + 1,
    color: colors.inkLight,
  },
  previewDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  previewMedsList: {
    gap: 8,
  },
  previewMedRow: {
    gap: 2,
  },
  previewMedName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs + 1,
    color: colors.ink,
  },
  previewMedSub: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },
  previewFooterText: {
    fontFamily: fontFamily.regular,
    fontSize: 9,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  socialTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  socialItem: {
    alignItems: 'center',
    gap: 6,
  },
  socialIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },

  // Real Camera Specific Styles
  viewfinderOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  capturedPhoto: {
    width: '100%',
    height: '100%',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  permissionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg + 1,
    color: colors.white,
  },
  permissionDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm + 1,
    color: 'rgba(255, 255, 255, 0.60)',
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionBtn: {
    width: '100%',
    marginTop: 12,
  },
});
