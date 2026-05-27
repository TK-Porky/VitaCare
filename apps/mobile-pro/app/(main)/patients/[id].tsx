/**
 * Patient Detail — VitaCare Pro
 * Fiche détaillée patient avec design haut de gamme inspiré de Profile Professional View.png,
 * suivi d'observance par graphe SVG, onglets segmentés et Bottom Sheets interactives pour les actions.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  AppButton,
  AppInput,
  HelperText,
  AppBottomSheet,
  AppBottomSheetRef,
} from '../../../src/components';
import { usePatientStore } from '../../../src/store';
import { colors, fontFamily, fontSize } from '../../../src/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for medication intake over the last 7 days (Monday to Sunday)
const WEEKLY_OBSERVANCE = [80, 95, 55, 85, 100, 70, 95];
const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface InfoRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
}

function ContactRow({ icon, label, value, onPress }: InfoRowProps) {
  if (!value) return null;
  return (
    <TouchableOpacity
      style={styles.contactRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contactIconWrap}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue} numberOfLines={1}>{value}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward-outline" size={16} color={colors.inkMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    selectedPatient,
    isLoading,
    error,
    fetchPatientById,
    clearSelectedPatient,
    updatePatient,
    deletePatient,
  } = usePatientStore();

  const [activeTab, setActiveTab] = useState<'observance' | 'appointments' | 'documents'>('observance');

  // Bottom Sheet Refs
  const optionsSheetRef = useRef<AppBottomSheetRef>(null);
  const editSheetRef = useRef<AppBottomSheetRef>(null);
  const exportSheetRef = useRef<AppBottomSheetRef>(null);
  const deleteSheetRef = useRef<AppBottomSheetRef>(null);

  // Form states for non-sensitive patient edits
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formHistory, setFormHistory] = useState('');
  const [formAllergies, setFormAllergies] = useState('');

  // Export states
  const [exportStep, setExportStep] = useState<'select' | 'loading' | 'success'>('select');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedFilename, setExportedFilename] = useState('');

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchPatientById(id);
    return () => clearSelectedPatient();
  }, [id]);

  // Set form defaults when patient changes
  useEffect(() => {
    if (selectedPatient) {
      setFormPhone(selectedPatient.phone ?? '');
      setFormEmail(selectedPatient.email ?? '');
      setFormAddress(selectedPatient.address ?? '');
      setFormHistory(selectedPatient.medicalHistory ?? '');
      setFormAllergies(selectedPatient.allergies?.join(', ') ?? '');
    }
  }, [selectedPatient]);

  const patient = selectedPatient;

  if (isLoading && !patient) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.center}>
        <HelperText message={error ?? 'Patient introuvable'} type="error" />
        <AppButton label="Retour" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const initials = (patient.fullName || 'P')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase() || 'P';
  const avatarColor = patient.gender === 'female' ? '#F3A1C7' : patient.gender === 'male' ? '#A1C4F3' : '#C1B8F0';

  // Age calculation
  const calculateAge = (dobString?: string) => {
    if (!dobString) return '—';
    const dob = new Date(dobString);
    const age = new Date().getFullYear() - dob.getFullYear();
    return `${age} Ans`;
  };

  // SVG Chart Dimensions & Calculations
  const chartWidth = SCREEN_WIDTH - 64;
  const chartHeight = 130;
  const paddingX = 30;
  const paddingY = 20;

  const points = WEEKLY_OBSERVANCE.map((val, idx) => {
    const x = paddingX + (idx * (chartWidth - paddingX * 2)) / 6;
    const y = chartHeight - paddingY - (val * (chartHeight - paddingY * 2)) / 100;
    return { x, y };
  });

  // SVG smooth line path generator
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
  }

  const pathFillD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  // ================================================================================== //
  // Handlers
  // ================================================================================== //
  const handleOpenEdit = () => {
    optionsSheetRef.current?.close();
    setTimeout(() => {
      editSheetRef.current?.open();
    }, 300);
  };

  const handleOpenExport = () => {
    optionsSheetRef.current?.close();
    setExportStep('select');
    setExportProgress(0);
    setTimeout(() => {
      exportSheetRef.current?.open();
    }, 300);
  };

  const handleOpenDelete = () => {
    optionsSheetRef.current?.close();
    setTimeout(() => {
      deleteSheetRef.current?.open();
    }, 300);
  };

  const handleSaveEdit = () => {
    const parsedAllergies = formAllergies
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    updatePatient(patient.id, {
      phone:          formPhone,
      email:          formEmail,
      address:        formAddress,
      medicalHistory: formHistory,
      allergies:      parsedAllergies,
    });

    editSheetRef.current?.close();
  };

  const triggerExportProcess = (format: 'pdf' | 'excel') => {
    setExportStep('loading');
    setExportProgress(0);

    // Simulate progress ticks
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setExportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setExportedFilename(
          `${patient.fullName.replace(/\s+/g, '_')}_Dossier_Medical.${format === 'pdf' ? 'pdf' : 'xlsx'}`
        );
        setExportStep('success');
      }
    }, 300);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      deletePatient(patient.id);
      deleteSheetRef.current?.close();
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de supprimer ce dossier.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* ── Page Header ── */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>Dossier Médical</Text>
        <TouchableOpacity
          onPress={() => optionsSheetRef.current?.open()}
          style={styles.optionsHeaderBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* ── Patient Profile Identity Card (Matching Profile Professional View.png) ── */}
        <View style={styles.patientProfileCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.genderIconBadge}>
              <Ionicons
                name={patient.gender === 'female' ? 'woman' : patient.gender === 'male' ? 'man' : 'person'}
                size={14}
                color={colors.white}
              />
            </View>
          </View>

          <Text style={styles.patientName}>{patient.fullName}</Text>

          {/* 3-Column Doctor Info-Row Replica */}
          <View style={styles.statsThreeColumns}>
            <View style={styles.statCol}>
              <Text style={styles.colLabel}>GENRE</Text>
              <Text style={styles.colVal}>
                {patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : 'Autre'}
              </Text>
            </View>
            <View style={styles.colDivider} />
            <View style={styles.statCol}>
              <Text style={styles.colLabel}>ÂGE</Text>
              <Text style={styles.colVal}>{calculateAge(patient.dateOfBirth)}</Text>
            </View>
            <View style={styles.colDivider} />
            <View style={styles.statCol}>
              <Text style={styles.colLabel}>SANG</Text>
              <Text style={styles.colVal}>{patient.bloodType ?? 'O+'}</Text>
            </View>
          </View>

          {/* Bio / Description */}
          <Text style={styles.medicalBio}>
            {patient.medicalHistory
              ? `${patient.medicalHistory} Patient suivi régulièrement. Observance des traitements satisfaisante.`
              : "Aucun antécédent médical critique répertorié. Suivi général préventif."}
          </Text>

          {/* Active Buttons (Primary Pro Pill + Option Secondary Button) */}
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={styles.primaryPrescribeBtn}
              onPress={() => router.push(`/(main)/prescriptions/create?patientId=${patient.id}` as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={20} color={colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.primaryBtnLabel}>Créer une prescription</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionsActionBtn}
              onPress={() => optionsSheetRef.current?.open()}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={20} color={colors.ink} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section: Contact info ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coordonnées de contact</Text>
          <ContactRow icon="call-outline" label="Téléphone" value={patient.phone} />
          <View style={styles.itemDivider} />
          <ContactRow icon="mail-outline" label="Email" value={patient.email} />
          <View style={styles.itemDivider} />
          <ContactRow icon="location-outline" label="Adresse du domicile" value={patient.address} />
        </View>

        {/* ── Section: Medical History Tabs ── */}
        <View style={styles.tabsSection}>
          
          {/* Tab selector bar */}
          <View style={styles.tabsBar}>
            <TouchableOpacity
              onPress={() => setActiveTab('observance')}
              style={[styles.tabBtn, activeTab === 'observance' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabLabel, activeTab === 'observance' && styles.tabLabelActive]}>
                Observance
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('appointments')}
              style={[styles.tabBtn, activeTab === 'appointments' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabLabel, activeTab === 'appointments' && styles.tabLabelActive]}>
                Consultations
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('documents')}
              style={[styles.tabBtn, activeTab === 'documents' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabLabel, activeTab === 'documents' && styles.tabLabelActive]}>
                Documents
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content Cards */}
          <View style={styles.tabContentContainer}>

            {/* TAB 1: OBSERVANCE CHART & MEDICATIONS */}
            {activeTab === 'observance' && (
              <View style={styles.observanceTabContent}>
                
                {/* SVG Graph for variation of intake */}
                <Text style={styles.chartTitle}>Fluctuations d'observance hebdomadaire</Text>
                
                <View style={styles.svgWrapper}>
                  <Svg width={chartWidth} height={chartHeight}>
                    <Defs>
                      <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.25} />
                        <Stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
                      </LinearGradient>
                    </Defs>

                    {/* Reference Lines */}
                    <Line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke={colors.border} strokeDasharray="3 3" />
                    <Line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke={colors.border} strokeDasharray="3 3" />
                    <Line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke={colors.border} />

                    {/* Reference Labels */}
                    <SvgText x={10} y={paddingY + 4} fontSize="9" fontFamily={fontFamily.regular} fill={colors.inkMuted}>100%</SvgText>
                    <SvgText x={10} y={chartHeight / 2 + 4} fontSize="9" fontFamily={fontFamily.regular} fill={colors.inkMuted}>50%</SvgText>
                    <SvgText x={10} y={chartHeight - paddingY + 4} fontSize="9" fontFamily={fontFamily.regular} fill={colors.inkMuted}>0%</SvgText>

                    {/* Filled area under path */}
                    {points.length > 0 && <Path d={pathFillD} fill="url(#grad)" />}

                    {/* Main Curve Line */}
                    {points.length > 0 && <Path d={pathD} fill="none" stroke={colors.primary} strokeWidth={2.5} />}

                    {/* Circular points and labels */}
                    {points.map((p, i) => (
                      <React.Fragment key={i}>
                        <Circle cx={p.x} cy={p.y} r={4.5} fill={colors.white} stroke={colors.primary} strokeWidth={2} />
                        <SvgText
                          x={p.x}
                          y={chartHeight - 4}
                          fontSize="9.5"
                          fontFamily={fontFamily.medium}
                          fill={colors.inkLight}
                          textAnchor="middle"
                        >
                          {WEEK_DAYS[i]}
                        </SvgText>
                      </React.Fragment>
                    ))}
                  </Svg>
                </View>

                {/* Intake Observance Header */}
                <View style={styles.observanceHeader}>
                  <View style={styles.circleProgressWrap}>
                    <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
                    <View style={{ gap: 2 }}>
                      <Text style={styles.observanceStat}>88% Observance Générale</Text>
                      <Text style={styles.observanceSub}>Calculé sur les 30 derniers jours</Text>
                    </View>
                  </View>
                </View>

                {/* List of active meds */}
                <View style={styles.medsHeader}>
                  <Text style={styles.medsTitle}>Prises et Médicaments actifs</Text>
                </View>
                
                <View style={styles.medRow}>
                  <Ionicons name="medical-outline" size={16} color={colors.primary} />
                  <View style={styles.medDetails}>
                    <Text style={styles.medName}>Doliprane 1000mg</Text>
                    <Text style={styles.medDesc}>1 comprimé • Matin & Soir (Observé 95%)</Text>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: colors.successLight }]}>
                    <Text style={[styles.statusTagText, { color: colors.success }]}>Pris</Text>
                  </View>
                </View>

                <View style={styles.medRow}>
                  <Ionicons name="medical-outline" size={16} color={colors.primary} />
                  <View style={styles.medDetails}>
                    <Text style={styles.medName}>Amoxicilline 500mg</Text>
                    <Text style={styles.medDesc}>1 gélule • Midi (Observé 80%)</Text>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: colors.warningLight }]}>
                    <Text style={[styles.statusTagText, { color: colors.warning }]}>Attente</Text>
                  </View>
                </View>
              </View>
            )}

            {/* TAB 2: DETAILED APPOINTMENTS LIST */}
            {activeTab === 'appointments' && (
              <View style={styles.tabListContent}>
                <Text style={styles.medsTitle}>Historique des Consultations</Text>
                
                <View style={styles.appointmentItem}>
                  <View style={styles.aptHeaderRow}>
                    <Text style={styles.aptDate}>24 Mai 2026</Text>
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
                      <Text style={[styles.statusText, { color: colors.success }]}>Confirmé</Text>
                    </View>
                  </View>
                  <Text style={styles.aptDoctor}>Dr. Jean-Claude Mbarga</Text>
                  <Text style={styles.aptTime}>
                    <Ionicons name="time-outline" size={12} color={colors.inkLight} /> 09:30 - 10:00 (Consultation Générale)
                  </Text>
                </View>

                <View style={styles.appointmentItem}>
                  <View style={styles.aptHeaderRow}>
                    <Text style={styles.aptDate}>12 Mai 2026</Text>
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(79, 110, 247, 0.1)' }]}>
                      <Text style={[styles.statusText, { color: colors.primary }]}>Terminé</Text>
                    </View>
                  </View>
                  <Text style={styles.aptDoctor}>Dr. Jean-Claude Mbarga</Text>
                  <Text style={styles.aptTime}>
                    <Ionicons name="time-outline" size={12} color={colors.inkLight} /> 14:00 - 14:30 (Examen Clinique)
                  </Text>
                </View>

                <View style={styles.appointmentItem}>
                  <View style={styles.aptHeaderRow}>
                    <Text style={styles.aptDate}>28 Avril 2026</Text>
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                      <Text style={[styles.statusText, { color: colors.error }]}>Annulé</Text>
                    </View>
                  </View>
                  <Text style={styles.aptDoctor}>Dr. Jean-Claude Mbarga</Text>
                  <Text style={styles.aptTime}>
                    <Ionicons name="time-outline" size={12} color={colors.inkLight} /> 11:30 - 12:00 (Visite de contrôle)
                  </Text>
                </View>
              </View>
            )}

            {/* TAB 3: DOCUMENTS */}
            {activeTab === 'documents' && (
              <View style={styles.tabListContent}>
                <Text style={styles.medsTitle}>Bilan de santé & Examens</Text>

                <View style={styles.documentItem}>
                  <View style={styles.docIconWrap}>
                    <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.docDetails}>
                    <Text style={styles.docName} numberOfLines={1}>Bilan_Sanguin_Complet.pdf</Text>
                    <Text style={styles.docMeta}>PDF • 2.4 Mo • Ajouté le 15/05/2026</Text>
                  </View>
                  <View style={styles.docActions}>
                    <TouchableOpacity style={styles.docBtn} activeOpacity={0.7}>
                      <Feather name="eye" size={14} color={colors.inkLight} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.docBtn} activeOpacity={0.7}>
                      <Feather name="download" size={14} color={colors.inkLight} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.documentItem}>
                  <View style={styles.docIconWrap}>
                    <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.docDetails}>
                    <Text style={styles.docName} numberOfLines={1}>Rapport_IRM_Lombaire.pdf</Text>
                    <Text style={styles.docMeta}>PDF • 15.6 Mo • Ajouté le 02/05/2026</Text>
                  </View>
                  <View style={styles.docActions}>
                    <TouchableOpacity style={styles.docBtn} activeOpacity={0.7}>
                      <Feather name="eye" size={14} color={colors.inkLight} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.docBtn} activeOpacity={0.7}>
                      <Feather name="download" size={14} color={colors.inkLight} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.documentItem}>
                  <View style={styles.docIconWrap}>
                    <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.docDetails}>
                    <Text style={styles.docName} numberOfLines={1}>Certificat_Medical_Aptitude.pdf</Text>
                    <Text style={styles.docMeta}>PDF • 1.1 Mo • Ajouté le 20/04/2026</Text>
                  </View>
                  <View style={styles.docActions}>
                    <TouchableOpacity style={styles.docBtn} activeOpacity={0.7}>
                      <Feather name="eye" size={14} color={colors.inkLight} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.docBtn} activeOpacity={0.7}>
                      <Feather name="download" size={14} color={colors.inkLight} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ================================================================================== //
          BOTTOM SHEETS SECTION
          ================================================================================== */}

      {/* ── 1. Options Bottom Sheet ── */}
      <AppBottomSheet ref={optionsSheetRef}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Actions Dossier</Text>
          <Text style={styles.sheetSubtitle}>Gérer le dossier médical et coordonnées de {patient.fullName}</Text>
        </View>

        <View style={styles.sheetMenuCard}>
          <TouchableOpacity style={styles.sheetMenuItem} onPress={handleOpenEdit} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={styles.sheetMenuLabel}>Modifier les informations</Text>
            <Ionicons name="chevron-forward-outline" size={16} color={colors.inkMuted} />
          </TouchableOpacity>
          
          <View style={styles.sheetDivider} />
          
          <TouchableOpacity style={styles.sheetMenuItem} onPress={handleOpenExport} activeOpacity={0.7}>
            <Ionicons name="download-outline" size={20} color={colors.primary} />
            <Text style={styles.sheetMenuLabel}>Exporter le dossier (PDF / Excel)</Text>
            <Ionicons name="chevron-forward-outline" size={16} color={colors.inkMuted} />
          </TouchableOpacity>

          <View style={styles.sheetDivider} />

          <TouchableOpacity style={styles.sheetMenuItem} onPress={handleOpenDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={[styles.sheetMenuLabel, { color: colors.error }]}>Supprimer le dossier</Text>
            <Ionicons name="chevron-forward-outline" size={16} color={colors.inkMuted} />
          </TouchableOpacity>
        </View>

        <AppButton
          label="Fermer"
          variant="outline"
          onPress={() => optionsSheetRef.current?.close()}
          style={styles.sheetCloseBtn}
        />
      </AppBottomSheet>

      {/* ── 2. Edit Information Bottom Sheet ── */}
      <AppBottomSheet ref={editSheetRef}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Mettre à jour les informations</Text>
          <Text style={styles.sheetSubtitle}>Modifier les coordonnées non sensibles du patient</Text>
        </View>

        <View style={styles.formContainer}>
          <AppInput
            label="Téléphone"
            placeholder="Ex: +237 6 55 111 222"
            value={formPhone}
            onChangeText={setFormPhone}
            leftIcon="call-outline"
          />

          <AppInput
            label="Email"
            placeholder="Ex: patient@email.cm"
            value={formEmail}
            onChangeText={setFormEmail}
            leftIcon="mail-outline"
            autoCapitalize="none"
          />

          <AppInput
            label="Adresse de domicile"
            placeholder="Ex: Rue de la Paix, Yaoundé"
            value={formAddress}
            onChangeText={setFormAddress}
            leftIcon="home-outline"
          />

          <AppInput
            label="Allergies (séparées par une virgule)"
            placeholder="Ex: Pénicilline, Aspirine"
            value={formAllergies}
            onChangeText={setFormAllergies}
            leftIcon="warning-outline"
          />

          <AppInput
            label="Antécédents médicaux"
            placeholder="Entrez les antécédents notables..."
            value={formHistory}
            onChangeText={setFormHistory}
            leftIcon="medical-outline"
            multiline
            numberOfLines={3}
          />

          <View style={styles.editActions}>
            <AppButton
              label="Enregistrer les modifications"
              onPress={handleSaveEdit}
              style={{ flex: 1 }}
            />
            <AppButton
              label="Annuler"
              variant="outline"
              onPress={() => editSheetRef.current?.close()}
              style={{ width: 100 }}
            />
          </View>
        </View>
      </AppBottomSheet>

      {/* ── 3. Export Bottom Sheet ── */}
      <AppBottomSheet ref={exportSheetRef}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Génération du rapport médical</Text>
          <Text style={styles.sheetSubtitle}>Choisissez le format du document d'export de {patient.fullName}</Text>
        </View>

        {exportStep === 'select' && (
          <View style={styles.exportSelectOptions}>
            <TouchableOpacity
              style={styles.exportFormatCard}
              onPress={() => triggerExportProcess('pdf')}
              activeOpacity={0.7}
            >
              <View style={styles.formatIconWrap}>
                <Ionicons name="document-text" size={32} color={colors.error} />
              </View>
              <View style={styles.formatInfo}>
                <Text style={styles.formatTitle}>Document PDF (.pdf)</Text>
                <Text style={styles.formatDesc}>Idéal pour l'impression, l'envoi par email ou l'archivage formel.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportFormatCard}
              onPress={() => triggerExportProcess('excel')}
              activeOpacity={0.7}
            >
              <View style={[styles.formatIconWrap, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
                <Ionicons name="grid" size={32} color={colors.success} />
              </View>
              <View style={styles.formatInfo}>
                <Text style={styles.formatTitle}>Feuille de calcul Excel (.xlsx)</Text>
                <Text style={styles.formatDesc}>Idéal pour l'analyse statistique des traitements et des prises.</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {exportStep === 'loading' && (
          <View style={styles.exportLoadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.exportProgressText}>Génération du dossier en cours... {exportProgress}%</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${exportProgress}%` }]} />
            </View>
          </View>
        )}

        {exportStep === 'success' && (
          <View style={styles.exportSuccessContainer}>
            <View style={styles.exportSuccessIconWrap}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            </View>
            <Text style={styles.exportSuccessTitle}>Rapport généré avec succès !</Text>
            <Text style={styles.exportSuccessDesc}>
              Le fichier a été enregistré localement sous le nom :{"\n"}
              <Text style={{ fontFamily: fontFamily.bold, color: colors.ink }}>{exportedFilename}</Text>
            </Text>
            <AppButton
              label="Télécharger le document"
              onPress={() => exportSheetRef.current?.close()}
              style={{ marginTop: 12, width: '100%' }}
            />
          </View>
        )}

        {exportStep !== 'loading' && (
          <AppButton
            label="Fermer"
            variant="outline"
            onPress={() => exportSheetRef.current?.close()}
            style={{ marginTop: 20 }}
          />
        )}
      </AppBottomSheet>

      {/* ── 4. Delete Confirm Bottom Sheet ── */}
      <AppBottomSheet ref={deleteSheetRef}>
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.error }]}>Suppression critique</Text>
          <Text style={styles.sheetSubtitle}>Veuillez confirmer la suppression définitive de {patient.fullName}</Text>
        </View>

        <View style={styles.deleteWarningBox}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.warningBoxTitle}>Cette action est irréversible</Text>
            <Text style={styles.warningBoxText}>
              Le dossier médical, l'historique d'observance, les consultations passées ainsi que toutes les prescriptions associées de ce patient seront définitivement détruits.
            </Text>
          </View>
        </View>

        <View style={styles.deleteActions}>
          <AppButton
            label="Confirmer la suppression"
            variant="danger"
            isLoading={isDeleting}
            onPress={handleConfirmDelete}
            style={{ flex: 1 }}
          />
          <AppButton
            label="Annuler"
            variant="outline"
            onPress={() => deleteSheetRef.current?.close()}
            style={{ width: 100 }}
          />
        </View>
      </AppBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.ink,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },

  // Redesigned Patient Identity Card (Profile Professional View.png replica)
  patientProfileCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    color: colors.white,
  },
  genderIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.ink,
    marginBottom: 16,
  },

  // stats column grid
  statsThreeColumns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  colLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs - 1,
    color: colors.inkMuted,
    letterSpacing: 0.8,
  },
  colVal: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  colDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },

  medicalBio: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 6,
    marginBottom: 20,
  },

  // buttons group: Green + circular options
  actionButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  primaryPrescribeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary, // Pro Indigo Primary
    paddingVertical: 13,
    borderRadius: 30,
    shadowColor: 'rgba(79, 110, 247, 0.35)', // Indigo shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.white, // Crisp white contrast text
  },
  optionsActionBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },

  // Contact list Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  contactIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactContent: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },
  contactValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 50,
  },

  // Tab Menu Section
  tabsSection: {
    marginTop: 8,
    gap: 14,
  },
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: colors.white,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.inkLight,
  },
  tabLabelActive: {
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },

  // Tabs Content Cards
  tabContentContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
  },

  // Tab 1 Content: Observance Chart
  observanceTabContent: {
    gap: 12,
  },
  chartTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.ink,
    marginBottom: 6,
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  observanceHeader: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  circleProgressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  observanceStat: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  observanceSub: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },

  medsHeader: {
    marginTop: 10,
    marginBottom: 2,
  },
  medsTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  medDetails: {
    flex: 1,
    gap: 2,
  },
  medName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  medDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTagText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
  },

  // Tab 2 Content: Appointments List
  tabListContent: {
    gap: 12,
  },
  appointmentItem: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  aptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aptDate: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
  },
  aptDoctor: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs + 1,
    color: colors.primary,
  },
  aptTime: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
    marginTop: 2,
  },

  // Tab 3 Content: Documents
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  docIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docDetails: {
    flex: 1,
    gap: 2,
  },
  docName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.ink,
    maxWidth: SCREEN_WIDTH - 200,
  },
  docMeta: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },
  docActions: {
    flexDirection: 'row',
    gap: 8,
  },
  docBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ================================================================================== //
  // BOTTOM SHEET SPECIFIC STYLES
  // ================================================================================== //
  sheetHeader: {
    marginBottom: 20,
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

  sheetMenuCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sheetMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  sheetMenuLabel: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  sheetCloseBtn: {
    width: '100%',
  },

  // Form edit styles
  formContainer: {
    gap: 14,
    paddingHorizontal: 4,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },

  // Export styles
  exportSelectOptions: {
    gap: 14,
  },
  exportFormatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  formatIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatInfo: {
    flex: 1,
    gap: 2,
  },
  formatTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  formatDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
    lineHeight: 16,
  },

  exportLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  exportProgressText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  exportSuccessContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  exportSuccessIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  exportSuccessTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.success,
  },
  exportSuccessDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Delete Confirm Styles
  deleteWarningBox: {
    flexDirection: 'row',
    backgroundColor: colors.errorLight,
    padding: 16,
    borderRadius: 16,
    gap: 14,
    marginBottom: 24,
  },
  warningBoxTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.error,
  },
  warningBoxText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
    lineHeight: 16,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
