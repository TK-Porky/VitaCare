import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, User, MapPin } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { TopBar, CustomInput, PrimaryButton, EmailInput, PhoneInput, HelperText } from '../../../src/components';
import { router } from 'expo-router';
import { useProfile } from '../../../src/hooks';
import { useAuthStore } from '../../../src/store';
import { updateProfileSchema, UpdateProfileInput } from '../../../src/schemas';

export default function EditProfileScreen() {
  const user = useAuthStore(s => s.user);
  const { updateProfile, isUpdatingProfile, uploadAvatar, isUploadingAvatar, error, clearState, success } = useProfile();
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: '', // Initial value if not in user profile
    }
  });

  useEffect(() => {
    if (success) {
      Alert.alert("Succès", "Votre profil a été mis à jour.");
      clearState();
      router.back();
    }
  }, [success]);

  const handleAvatarPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Autorisez l\'accès à votre galerie dans les réglages pour changer votre photo.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset    = result.assets[0];
    const fileName = asset.fileName ?? `avatar-${Date.now()}.jpg`;
    const fileType = asset.mimeType ?? 'image/jpeg';

    setLocalAvatarUri(asset.uri);
    try {
      await uploadAvatar({ fileUri: asset.uri, fileName, fileType });
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer la photo.');
      setLocalAvatarUri(null);
    }
  };

  const onSave = async (data: UpdateProfileInput) => {
    await updateProfile(data);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <TopBar title="Modifier le profil" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Avatar Section ── */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={handleAvatarPress}
              activeOpacity={0.8}
              disabled={isUploadingAvatar}
            >
              <Image
                source={{ uri: localAvatarUri ?? user?.avatarUrl ?? 'https://randomuser.me/api/portraits/men/75.jpg' }}
                style={styles.avatar}
              />
              <View style={styles.cameraBtn}>
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Camera size={18} color={colors.white} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>
              {isUploadingAvatar ? 'Envoi en cours…' : 'Appuyez pour changer la photo'}
            </Text>
          </View>

          {/* ── Form Section ── */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    placeholder="Votre nom"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.fullName ? errors.fullName.message : undefined}
                    leftIcon={<User size={18} color={colors.inkLight} />}
                  />
                )}
              />
              {errors.fullName && <HelperText message={errors.fullName.message || ""} type="error" />}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EmailInput
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.email}
                  />
                )}
              />
              {errors.email && <HelperText message={errors.email.message || ""} type="error" />}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PhoneInput
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.phone}
                  />
                )}
              />
              {errors.phone && <HelperText message={errors.phone.message || ""} type="error" />}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Localisation</Text>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    placeholder="Ville, Quartier"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.location ? errors.location.message : undefined}
                    leftIcon={<MapPin size={18} color={colors.inkLight} />}
                  />
                )}
              />
              {errors.location && <HelperText message={errors.location.message || ""} type="error" />}
            </View>

            {error && <HelperText message={error as string} type="error" />}
          </View>

          {/* ── Action Section ── */}
          <View style={styles.footer}>
            <PrimaryButton
              label="Enregistrer les modifications"
              fullWidth
              isLoading={isUpdatingProfile}
              onPress={handleSubmit(onSave)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarHint: {
    marginTop: 12,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
    marginLeft: 4,
  },
  footer: {
    marginTop: 40,
  },
});
