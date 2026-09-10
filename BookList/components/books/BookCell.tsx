import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Book } from "../../domain/book";
import { spacing, typography } from "../../theme/tokens";
import { useTheme } from "../../features/theme/ThemeProvider";
import BookCover from "./BookCover";
import FavoriteButton from "../FavoriteButton";

const CELL_TARGET_WIDTH = 160;

type Props = {
  book: Book;
  numColumns: number;
  onOpen: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

// Memoise pour que la frappe dans la recherche ou un toggle sur une autre
// cellule ne re-rende pas toute la grille (exigence "aucun rendu superflu").
function BookCell({ book, numColumns, onOpen, onToggleFavorite }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.cell, { flex: 1 / numColumns }]}
      onPress={() => onOpen(book.id)}
      accessibilityRole="button"
      accessibilityLabel={book.titre}
    >
      <View style={styles.coverWrapper}>
        <BookCover uri={book.couverture} />
        <View style={styles.favoriteOverlay}>
          <FavoriteButton
            favori={book.favori}
            onPress={() => onToggleFavorite(book.id)}
          />
        </View>
      </View>
      <Text
        style={[styles.bookTitle, { color: colors.text }]}
        numberOfLines={2}
      >
        {book.titre}
      </Text>
      <Text
        style={[styles.bookAuthor, { color: colors.textMuted }]}
        numberOfLines={1}
      >
        {book.auteur}
      </Text>
    </Pressable>
  );
}

export default memo(BookCell);

const styles = StyleSheet.create({
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
