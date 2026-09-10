import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import BookList from "../../components/books/BookList";
import { useI18n } from "../../features/i18n/I18nProvider";
import { spacing, typography } from "../../theme/tokens";

export default function BooksScreen() {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("app.title")}</Text>
        <Text style={styles.subtitle}>{t("app.subtitle")}</Text>
      </View>
      <BookList />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.md,
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
