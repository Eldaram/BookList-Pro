import React, { memo } from "react";
import { StyleSheet, Text } from "react-native";
import { Book } from "../../domain/book";
import { typography } from "../../theme/tokens";
import { useTheme } from "../../features/theme/ThemeProvider";
import { useOpenLibrary } from "../../hooks/useOpenLibrary";
import BookCover from "./BookCover";
import BookCardShell from "./BookCardShell";
import FavoriteButton from "../FavoriteButton";

type Props = {
  book: Book;
  numColumns: number;
  onOpen: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

function BookCell({ book, numColumns, onOpen, onToggleFavorite }: Props) {
  const { colors } = useTheme();
  const { enrichment } = useOpenLibrary(
    book.couverture ? undefined : book.titre,
  );

  return (
    <BookCardShell
      numColumns={numColumns}
      onPress={() => onOpen(book.id)}
      accessibilityLabel={book.titre}
      cover={
        <BookCover uri={book.couverture} fallbackUri={enrichment?.coverUrl} />
      }
      action={
        <FavoriteButton
          favori={book.favori}
          onPress={() => onToggleFavorite(book.id)}
        />
      }
      title={
        <Text
          style={[styles.bookTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {book.titre}
        </Text>
      }
      subtitle={
        <Text
          style={[styles.bookAuthor, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {book.auteur}
        </Text>
      }
    />
  );
}

export default memo(BookCell);

const styles = StyleSheet.create({
  bookAuthor: {
    fontSize: typography.body,
  },
  bookTitle: {
    fontSize: typography.body,
    fontWeight: "700",
  },
});
