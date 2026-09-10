import { StyleSheet, View } from "react-native";

import ThemedText from "../../components/ui/ThemedText";
import { useI18n } from "../../features/i18n/I18nProvider";
import { spacing, typography } from "../../theme/tokens";

export default function BooksScreen() {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{t("app.title")}</ThemedText>
      <ThemedText muted style={styles.subtitle}>
        {t("app.subtitle")}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  subtitle: {
    fontSize: typography.body,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
});
