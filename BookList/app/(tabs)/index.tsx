import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import BookList from "../../components/books/BookList";

import ThemedText from "../../components/ui/ThemedText";
import { useI18n } from "../../features/i18n/I18nProvider";
import { spacing, typography } from "../../theme/tokens";

export default function BooksScreen() {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BookList Pro</Text>
      <Text style={styles.subtitle}>Catalogue des livres</Text>
      <BookList />
      <StatusBar style="auto" />
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
