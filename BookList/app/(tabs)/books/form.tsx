import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import BookForm, { BookFormMode } from "../../../components/books/BookForm";
import BookListLoading from "../../../components/books/BookListLoading";
import { useI18n } from "../../../features/i18n/I18nProvider";
import { useTheme } from "../../../features/theme/ThemeProvider";
import { useBook } from "../../../hooks/useBook";
import { spacing } from "../../../theme/tokens";

export default function BookFormPage() {
  const { mode, bookId } = useLocalSearchParams<{
    mode: BookFormMode;
    bookId?: string;
  }>();
  const isUpdate = mode === "UPDATE";
  const { book, loading, error } = useBook(isUpdate ? bookId : undefined);
  const { t } = useI18n();
  const { colors } = useTheme();

  if (!isUpdate) return <BookForm key="create" mode="CREATE" />;
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
  return <BookForm key={book.id} mode="UPDATE" book={book} />;
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
