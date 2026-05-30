/**
 * Patients — VitaCare Pro
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PatientCard, HelperText, AppBottomSheet, AppBottomSheetRef, AppButton } from '../../../src/components';
import { usePatientStore } from '../../../src/store';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function PatientsScreen() {
  const { patients, isLoading, error, fetchPatients } = usePatientStore();
  const [search, setSearch] = useState('');

  // QR Code Scanning States
  const qrSheetRef = useRef<AppBottomSheetRef>(null);
  const [scanStep, setScanStep] = useState<'camera' | 'importing' | 'success'>('camera');
  const [scannedPatient, setScannedPatient] = useState<any>(null);

  // Camera permissions & refs
  const [permission, requestPermission] = useCameraPermissions();
  const [isSimulatedScan, setIsSimulatedScan] = useState(false);
  const [bypassPermission, setBypassPermission] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => { fetchPatients(); }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    fetchPatients(text || undefined);
  };

  const triggerSuccessImport = (id: string, name: string) => {
    const newPat = {
      id,
      fullName: name,
      phone: '+237 6 72 567 890',
      email: name.toLowerCase().replace(' ', '.') + '@email.cm',
      gender: 'male' as const,
      dateOfBirth: '1960-09-08',
      bloodType: 'O-',
      allergies: ['Ibuprofen'],
      medicalHistory: 'Asthme chronique, insuffisance cardiaque légère.',
      lastVisit: '2026-05-20',
      totalAppointments: 24,
    };

    // Real-time reactive Zustand insertion
    usePatientStore.setState({
      patients: [newPat, ...patients],
    });

    setScannedPatient(newPat);
    setHasScanned(true);
    setScanStep('success');
  };

  useEffect(() => {
    let t1: any;
    let t2: any;
    if (scanStep === 'camera' && isSimulatedScan && !hasScanned) {
      t1 = setTimeout(() => {
        setScanStep('importing');
        t2 = setTimeout(() => {
          triggerSuccessImport('pat-imported-' + Date.now(), 'Samuel Atangana');
        }, 1200);
      }, 2000);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [scanStep, isSimulatedScan, hasScanned]);

  const handleOpenQRScanner = async () => {
    setScanStep('camera');
    setScannedPatient(null);
    setHasScanned(false);
    qrSheetRef.current?.open();

    if (!permission || !permission.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setIsSimulatedScan(true);
      }
    } else {
      setIsSimulatedScan(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (hasScanned || scanStep !== 'camera') return;
    setHasScanned(true);
    setScanStep('importing');

    let importedName = 'Samuel Atangana';
    if (data && data.length < 30) {
      importedName = data;
    }

    setTimeout(() => {
      triggerSuccessImport('pat-qr-' + Date.now(), importedName);
    }, 1500);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Patients</Text>
        <Text style={styles.subtitle}>{patients.length} patient{patients.length !== 1 ? 's' : ''} suivi{patients.length !== 1 ? 's' : ''}</Text>

        {/* Search & Scan row */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color={colors.inkMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un patient..."
              placeholderTextColor={colors.inkMuted}
              value={search}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.scanQRBtn}
            onPress={handleOpenQRScanner}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <HelperText message={error} type="error" />
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.inkFaint} />
              <Text style={styles.emptyText}>
                {search ? 'Aucun patient trouvé' : 'Aucun patient suivi'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PatientCard
              fullName={item.fullName}
              lastVisit={item.lastVisit}
              totalAppointments={item.totalAppointments}
              gender={item.gender}
              onPress={() => router.push(`/(main)/patients/${item.id}` as any)}
            />
          )}
        />
      )}
      {/* ── QR Code Scanner Bottom Sheet ── */}
      <AppBottomSheet ref={qrSheetRef}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Liaison Dossier Patient</Text>
          <Text style={styles.sheetSubtitle}>Alignez le code QR généré sur l'application patient VitaCare</Text>
        </View>

        {scanStep === 'camera' && (
          <View style={styles.cameraContainer}>
            {(!permission || (!permission.granted && !bypassPermission)) ? (
              <View style={styles.cameraPermissionOverlay}>
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
                <Text style={styles.permissionOverlayTitle}>Caméra Requise</Text>
                <Text style={styles.permissionOverlayDesc}>
                  L'application nécessite l'autorisation caméra pour scanner les codes QR.
                </Text>
                <AppButton
                  label="Autoriser l'accès"
                  onPress={requestPermission}
                  style={styles.permissionOverlayBtn}
                />
                <TouchableOpacity
                  onPress={() => {
                    setIsSimulatedScan(true);
                    setBypassPermission(true);
                  }}
                  style={styles.permissionOverlayBypass}
                  activeOpacity={0.7}
                >
                  <Text style={styles.bypassBtnText}>Simuler le scan sans caméra</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraViewfinder}>
                {isSimulatedScan ? (
                  <View style={styles.virtualQRFeed}>
                    <Ionicons name="qr-code-outline" size={120} color="rgba(79, 110, 247, 0.4)" />
                    <Text style={styles.virtualQRText}>Scan virtuel actif...</Text>
                    <View style={styles.scannerLine} />
                  </View>
                ) : (
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={handleBarcodeScanned}
                    onMountError={() => {
                      setIsSimulatedScan(true);
                    }}
                  >
                    <View style={styles.scannerLine} />
                    <Ionicons name="scan-outline" size={160} color="rgba(255, 255, 255, 0.3)" style={styles.scannerIconOverlay} />
                  </CameraView>
                )}
              </View>
            )}
            
            {permission && permission.granted && !isSimulatedScan && (
              <Text style={styles.cameraHelperText}>Pointez la caméra vers le code QR du patient</Text>
            )}
            {isSimulatedScan && (
              <Text style={styles.cameraHelperTextSimulated}>Mode Démo Simulateur actif • Importation dans 2s...</Text>
            )}
          </View>
        )}

        {scanStep === 'importing' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Détection du code QR et import sécurisé...</Text>
          </View>
        )}

        {scanStep === 'success' && scannedPatient && (
          <View style={styles.successContainer}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Patient importé !</Text>
            <Text style={styles.successDesc}>
              Le dossier de <Text style={{ fontFamily: fontFamily.bold }}>{scannedPatient.fullName}</Text> a été synchronisé et importé avec succès.
            </Text>
            
            <View style={styles.importedDetails}>
              <Text style={styles.detailLabel}>Groupe Sanguin : <Text style={styles.detailVal}>{scannedPatient.bloodType}</Text></Text>
              <Text style={styles.detailLabel}>Allergie médicale : <Text style={styles.detailVal}>{scannedPatient.allergies.join(', ')}</Text></Text>
            </View>

            <AppButton
              label="Ouvrir le dossier patient"
              onPress={() => {
                qrSheetRef.current?.close();
                setTimeout(() => {
                  router.push(`/(main)/patients/${scannedPatient.id}` as any);
                }, 200);
              }}
              style={{ width: '100%', marginTop: 12 }}
            />
          </View>
        )}

        {scanStep !== 'importing' && (
          <AppButton
            label="Fermer"
            variant="outline"
            onPress={() => qrSheetRef.current?.close()}
            style={{ marginTop: 16 }}
          />
        )}
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    paddingHorizontal: 16,
    paddingTop:        56,
    paddingBottom:     16,
    backgroundColor:   colors.white,
    gap:               8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title:    { fontFamily: fontFamily.bold,    fontSize: fontSize['2xl'], color: colors.ink },
  subtitle: { fontFamily: fontFamily.regular, fontSize: fontSize.sm,     color: colors.inkLight },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  scanQRBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderWidth:     1,
    borderColor:     colors.border,
    borderRadius:    12,
    paddingHorizontal: 12,
    height:          44,
    flex:            1,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: {
    flex:       1,
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.md,
    color:      colors.ink,
  },
  list:  { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  empty: { paddingTop: 60, alignItems: 'center', gap: 12 },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.sm,
    color:      colors.inkLight,
  },

  // QR Bottom sheet Styles
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
  cameraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 16,
  },
  cameraViewfinder: {
    width: 240,
    height: 240,
    borderRadius: 24,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: colors.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scannerLine: {
    width: '100%',
    height: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: '30%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  scannerIconOverlay: {
    opacity: 0.6,
  },
  cameraHelperText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs + 1,
    color: colors.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 14,
  },
  loadingText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  successIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  successTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.success,
  },
  successDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  importedDetails: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 10,
  },
  detailLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs + 1,
    color: colors.inkLight,
  },
  detailVal: {
    fontFamily: fontFamily.bold,
    color: colors.ink,
  },
  cameraPermissionOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  permissionOverlayTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
    marginTop: 4,
  },
  permissionOverlayDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs + 1,
    color: colors.inkLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  permissionOverlayBtn: {
    width: '100%',
    marginTop: 8,
  },
  permissionOverlayBypass: {
    paddingVertical: 8,
  },
  bypassBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  virtualQRFeed: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  virtualQRText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  cameraHelperTextSimulated: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs + 1,
    color: colors.primaryLight,
    textAlign: 'center',
  },
});
