import React from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { spacing, typography } from "../../theme/tokens";
import { useBooks } from "../../hooks/useBooks";
import { useI18n } from "../../features/i18n/I18nProvider";
import { useTheme } from "../../features/theme/ThemeProvider";
import BookCover from "./BookCover";
import BookListLoading from "./BookListLoading";
import AddButton from "../AddButton";
import FavoriteButton from "../FavoriteButton";

const CELL_TARGET_WIDTH = 160;

export default function BookList() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors } = useTheme();
  const { books, loading, error, toggleFavorite } = useBooks();
  const { width } = useWindowDimensions();
  const numColumns = Math.max(
    2,
    Math.floor(width / (CELL_TARGET_WIDTH + spacing.md * 2)),
  );

  if (loading) {
    return <BookListLoading />;
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorMessage, { color: colors.textMuted }]}>
          {error.message}
        </Text>
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{t("books.empty")}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.toolbar}>
        <AddButton onPress={() => router.push("/books/form?mode=CREATE")} />
      </View>
      <FlatList
        key={numColumns}
        data={books}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        style={styles.list}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.cell, { flex: 1 / numColumns }]}
            onPress={() => router.push(`/books/${item.id}`)}
          >
            <View style={styles.coverWrapper}>
              <BookCover uri={item.couverture} />
              <View style={styles.favoriteOverlay}>
                <FavoriteButton
                  favori={item.favori}
                  onPress={() => toggleFavorite(item.id)}
                />
              </View>
            </View>
            <Text
              style={[styles.bookTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.titre}
            </Text>
            <Text
              style={[styles.bookAuthor, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {item.auteur}
            </Text>
          </Pressable>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  errorMessage: {
    fontSize: typography.body,
    textAlign: "center",
  },
  grid: {
    padding: spacing.md,
  },
  toolbar: {
    alignItems: "flex-end",
    alignSelf: "stretch",
  },
  list: {
    alignSelf: "stretch",
    flex: 1,
  },
  cell: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
    maxWidth: CELL_TARGET_WIDTH + spacing.md * 2,
  },
  coverWrapper: {
    position: "relative",
  },
  favoriteOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  bookTitle: {
    fontSize: typography.body,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  bookAuthor: {
    fontSize: typography.body,
  },
});
