import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { OTPInput, TopBar, HelperText, PrimaryButton } from "../../src/components";
import { colors, fontFamily, fontSize } from "../../src/themes";

const OTP_LENGTH = 5;
const RESEND_DELAY = 60;

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_DELAY);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = useCallback(async (otpCode: string) => {
    if (otpCode.length !== OTP_LENGTH) return;

    setError("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace("/(main)");
    } catch {
      setError("Code incorrect. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(RESEND_DELAY);
    setCode("");
    setError("");
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
      >
        <Text style={styles.title}>Code de confirmation</Text>
        <Text style={styles.subtitle}>
          Entrez le code envoyé par SMS au{" "}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <View style={styles.otpWrapper}>
          <OTPInput
            length={OTP_LENGTH}
            value={code}
            onChange={setCode}
            onComplete={handleVerify}
            error={!!error}
          />

          <View style={styles.helperRow}>
            {error ? (
              <HelperText message={error} type="error" />
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <TouchableOpacity
              onPress={handleResend}
              disabled={countdown > 0}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.resend, countdown > 0 && styles.resendDisabled]}
              >
                {countdown > 0 ? `Renvoyer (${countdown}s)` : "Renvoyer"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <PrimaryButton
          label="Confirmer"
          fullWidth
          isLoading={isLoading}
          isDisabled={code.length !== OTP_LENGTH}
          onPress={() => handleVerify(code)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold,
    color: colors.ink,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.inkMuted,
    lineHeight: 20,
    marginTop: -12,
  },
  phone: {
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
  },
  otpWrapper: {
    gap: 12,
  },
  helperRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  resend: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.ink,
  },
  resendDisabled: {
    opacity: 0.35,
  },
});
