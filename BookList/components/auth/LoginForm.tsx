import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../features/auth/AuthProvider";
import {
  createLoginSchema,
  LoginFormData,
} from "../../features/auth/authFormSchema";
import { useI18n } from "../../features/i18n/I18nProvider";
import { useTheme } from "../../features/theme/ThemeProvider";
import { spacing } from "../../theme/tokens";
import ThemedText from "../ui/ThemedText";
import LoginFormHeader from "./LoginFormHeader";

export default function LoginForm() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data.email.trim(), data.password);
    } catch {
      setServerError(t("auth.invalidCredentials"));
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <LoginFormHeader error={serverError} />

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>{t("auth.emailLabel")}</ThemedText>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={onChange}
                placeholder={t("auth.emailPlaceholder")}
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    borderColor: errors.email
                      ? colors.danger
                      : colors.textMuted,
                    color: colors.text,
                  },
                ]}
                value={value}
              />
            )}
          />
          {errors.email?.message ? (
            <ThemedText style={[styles.fieldError, { color: colors.danger }]}>
              {errors.email.message}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>
            {t("auth.passwordLabel")}
          </ThemedText>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                autoCapitalize="none"
                onChangeText={onChange}
                placeholder={t("auth.passwordPlaceholder")}
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                style={[
                  styles.input,
                  {
                    borderColor: errors.password
                      ? colors.danger
                      : colors.textMuted,
                    color: colors.text,
                  },
                ]}
                value={value}
              />
            )}
          />
          {errors.password?.message ? (
            <ThemedText style={[styles.fieldError, { color: colors.danger }]}>
              {errors.password.message}
            </ThemedText>
          ) : null}
        </View>

        <Pressable
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: isSubmitting || pressed ? 0.7 : 1,
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <ThemedText
              style={[styles.submitButtonText, { color: colors.textOnPrimary }]}
            >
              {t("auth.submit")}
            </ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    maxWidth: 420,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: "100%",
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.md,
  },
  fieldError: {
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  submitButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
