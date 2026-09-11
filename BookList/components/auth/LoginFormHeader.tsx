import React from "react";
import { StyleSheet, View } from "react-native";
import { useI18n } from "../../features/i18n/I18nProvider";
import { useTheme } from "../../features/theme/ThemeProvider";
import { spacing, typography } from "../../theme/tokens";
import ThemedText from "../ui/ThemedText";

type Props = {
  error: string | null;
};

export default function LoginFormHeader({ error }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  return (
    <View>
      <ThemedText style={styles.title}>{t("auth.loginTitle")}</ThemedText>
      <ThemedText muted style={styles.subtitle}>
        {t("auth.loginSubtitle")}
      </ThemedText>

      {error ? (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: colors.danger + "22" },
          ]}
        >
          <ThemedText
            style={[styles.errorBannerText, { color: colors.danger }]}
          >
            {error}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
