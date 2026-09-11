import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../features/auth/AuthProvider";
import { loginSchema } from "../../features/auth/authFormSchema";
import { useI18n } from "../../features/i18n/I18nProvider";
import { useTheme } from "../../features/theme/ThemeProvider";
import { spacing, typography } from "../../theme/tokens";
import ThemedText from "../ui/ThemedText";

export default function LoginForm() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setFormError(null);
    setFieldErrors({});

    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const formattedErrors: { email?: string; password?: string } = {};
      for (const issue of validationResult.error.issues) {
        if (issue.path[0] === "email" && !formattedErrors.email) {
          formattedErrors.email = issue.message;
        }
        if (issue.path[0] === "password" && !formattedErrors.password) {
          formattedErrors.password = issue.message;
        }
      }
      setFieldErrors(formattedErrors);
      return;
    }

    setSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "type" in err &&
        (err as { type: string }).type === "AUTH"
      ) {
        setFormError(t("auth.invalidCredentials"));
      } else if (
        err instanceof Error &&
        err.message.includes("identifiants_invalides")
      ) {
        setFormError(t("auth.invalidCredentials"));
      } else {
        setFormError(
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : t("auth.invalidCredentials"),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <ThemedText style={styles.title}>{t("auth.loginTitle")}</ThemedText>
        <ThemedText muted style={styles.subtitle}>
          {t("auth.loginSubtitle")}
        </ThemedText>

        {formError ? (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: colors.danger + "22" },
            ]}
          >
            <ThemedText
              style={[styles.errorBannerText, { color: colors.danger }]}
            >
              {formError}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>{t("auth.emailLabel")}</ThemedText>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={(val) => {
              setEmail(val);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder={t("auth.emailPlaceholder")}
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: fieldErrors.email
                  ? colors.danger
                  : colors.textMuted,
                color: colors.text,
              },
            ]}
            value={email}
          />
          {fieldErrors.email ? (
            <ThemedText style={[styles.fieldError, { color: colors.danger }]}>
              {fieldErrors.email}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>
            {t("auth.passwordLabel")}
          </ThemedText>
          <TextInput
            autoCapitalize="none"
            onChangeText={(val) => {
              setPassword(val);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            placeholder={t("auth.passwordPlaceholder")}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={[
              styles.input,
              {
                borderColor: fieldErrors.password
                  ? colors.danger
                  : colors.textMuted,
                color: colors.text,
              },
            ]}
            value={password}
          />
          {fieldErrors.password ? (
            <ThemedText style={[styles.fieldError, { color: colors.danger }]}>
              {fieldErrors.password}
            </ThemedText>
          ) : null}
        </View>

        <Pressable
          disabled={submitting}
          onPress={() => void handleSubmit()}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: submitting || pressed ? 0.7 : 1,
            },
          ]}
        >
          {submitting ? (
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
  errorBanner: {
    borderRadius: 8,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorBannerText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
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
  subtitle: {
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    marginBottom: 4,
  },
});
