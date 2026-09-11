import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import BookDetails from "../../../components/books/BookDetails";
import BookListLoading from "../../../components/books/BookListLoading";
import { useI18n } from "../../../features/i18n/I18nProvider";
import { useTheme } from "../../../features/theme/ThemeProvider";
import { useBook } from "../../../hooks/useBook";
import { spacing } from "../../../theme/tokens";

export default function BookDetailsPage() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { book, loading, error, toggleFavorite, toggleRead } = useBook(bookId);
  const { t } = useI18n();
  const { colors } = useTheme();

  if (loading) return <BookListLoading />;
  if (error || !book) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.message, { color: colors.text }]}>
          {error?.message ?? t("books.notFound")}
        </Text>
      </View>
    );
  }
  return (
    <BookDetails
      key={book.id}
      book={book}
      onToggleFavorite={toggleFavorite}
      onToggleRead={toggleRead}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  message: {
    textAlign: "center",
  },
});
