// app/(auth)/register.tsx
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import {
  TopBar,
  PasswordInput,
  PrimaryButton,
  HelperText,
  PhoneInput,
  NameInput,
  EmailInput,
} from "../../src/components";
import { colors, fontFamily, fontSize } from "../../src/themes";
import { isValidCMPhone } from "@vitacare/utils";

type RegisterMode = "phone" | "email";

export default function RegisterScreen() {
  const [mode, setMode] = useState<RegisterMode>("phone");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const clearError = (key: string) => setErrors((e) => ({ ...e, [key]: "" }));

  const handleModeChange = (next: RegisterMode) => {
    setMode(next);
    setPhone("");
    setEmail("");
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Le nom complet est requis.";
    }

    if (mode === "phone") {
      if (!isValidCMPhone(phone)) {
        newErrors.contact = "Numéro de téléphone invalide.";
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.contact = "Adresse email invalide.";
      }

      if (password.length < 8 || password.includes(" ")) {
        newErrors.password = "Minimum 8 caractères, sans espace.";
      }

      if (password !== confirmPassword || confirmPassword.includes(" ")) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      // TODO: appel API inscription
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/(auth)/onboarding-location");
    } catch {
      setErrors({ global: "Une erreur est survenue. Réessayez." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TopBar />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Rejoignez notre service !</Text>
          <Text style={styles.subtitle}>Créez votre profil dès maintenant</Text>
        </View>

        <View style={styles.form}>
          {/* Nom complet */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Nom complet</Text>
            <NameInput
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                clearError("fullName");
              }}
              placeholder="Ex: Jean Ateba Mbarga"
              error={!!errors.fullName}
            />
            {errors.fullName && (
              <HelperText message={errors.fullName} type="error" />
            )}
          </View>

          {/* Toggle mode */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Mode d'inscription</Text>
            <View style={styles.toggle}>
              {(["phone", "email"] as RegisterMode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.toggleBtn,
                    mode === m && styles.toggleBtnActive,
                  ]}
                  onPress={() => handleModeChange(m)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.toggleLabel,
                      mode === m && styles.toggleLabelActive,
                    ]}
                  >
                    {m === "phone" ? "Téléphone" : "Email"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Champ dynamique : téléphone ou email */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>
              {mode === "phone" ? "Numéro de téléphone" : "Adresse email"}
            </Text>
            {mode === "phone" ? (
              <View style={styles.fieldWrapper}>
                <PhoneInput
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    clearError("contact");
                  }}
                  error={!!errors.contact}
                />
                {errors.contact && (
                  <HelperText message={errors.contact} type="error" />
                )}
              </View>
            ) : (
              <>
                <View style={styles.fieldWrapper}>
                  <EmailInput
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      clearError("contact");
                    }}
                    error={!!errors.contact}
                  />
                  {errors.contact && (
                    <HelperText message={errors.contact} type="error" />
                  )}
                </View>

                {/* Mot de passe */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <PasswordInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      clearError("password");
                    }}
                    error={!!errors.password}
                  />
                  {errors.password && (
                    <HelperText message={errors.password} type="error" />
                  )}
                </View>

                {/* Confirmation */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.label}>Confirmer le mot de passe</Text>
                  <PasswordInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      clearError("confirmPassword");
                    }}
                    error={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && (
                    <HelperText message={errors.confirmPassword} type="error" />
                  )}
                </View>
              </>
            )}
          </View>

          {errors.global && <HelperText message={errors.global} type="error" />}
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label="Continuer"
            fullWidth
            isLoading={isLoading}
            onPress={handleSubmit}
          />
          <Text style={styles.terms}>
            En continuant, vous acceptez nos{" "}
            <Text style={styles.link}>conditions d'utilisation</Text> et notre{" "}
            <Text style={styles.link}>politique de confidentialité</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexGrow: 1, backgroundColor: colors.white },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 32,
  },
  header: { gap: 4 },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize["2xl"],
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.inkLight,
  },
  form: { gap: 24 },
  fieldWrapper: { gap: 6 },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  // Toggle
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  toggleLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.inkLight,
  },
  toggleLabelActive: {
    color: colors.ink,
  },
  // Footer
  footer: { gap: 16 },
  terms: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
  },
});
