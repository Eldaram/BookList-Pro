import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';
import { booksList } from '../../features/books/booksList';
import { Book } from '../../domain/book';
import { AppError, isAppError } from '../../domain/error';
import BookCover from './BookCover';
import BookListError from './BookListError';
import BookListLoading from './BookListLoading';

// Largeur cible d'une carte : le nombre de colonnes s'adapte a l'ecran
const CELL_TARGET_WIDTH = 160;

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const { width } = useWindowDimensions();
  const numColumns = Math.max(
    2,
    Math.floor(width / (CELL_TARGET_WIDTH + spacing.md * 2))
  );
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await booksList.getBooks();
        setBooks(response.items);
      } catch (err) {
        setError(
          isAppError(err)
            ? err
            : { type: 'NETWORK', message: 'Unexpected error', cause: err }
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading) {
    return <BookListLoading />;
  }

  if (error) {
    return <BookListError error={error} />;
  }

  if (books.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No books available.</Text>
      </View>
    );
  }

  return (
    <FlatList
      key={numColumns}
      data={books}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      style={styles.list}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => (
        <View style={[styles.cell, { flex: 1 / numColumns }]}>
          <BookCover uri={item.couverture} />
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.titre}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {item.auteur}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  grid: {
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  list: {
    alignSelf: 'stretch',
    flex: 1,
  },
  cell: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
    maxWidth: CELL_TARGET_WIDTH + spacing.md * 2,
  },
  bookTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  bookAuthor: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
});