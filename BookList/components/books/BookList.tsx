import React from 'react';
import { FlatList, Pressable, Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../theme/tokens';
import { useBooks } from '../../hooks/useBooks';
import BookCover from './BookCover';
import BookListLoading from './BookListLoading';
import AddButton from '../AddButton';

const CELL_TARGET_WIDTH = 160;

export default function BookList() {
  const router = useRouter();
  const { books, loading, error } = useBooks();
  const { width } = useWindowDimensions();
  const numColumns = Math.max(
    2,
    Math.floor(width / (CELL_TARGET_WIDTH + spacing.md * 2))
  );

  if (loading) {
    return <BookListLoading />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No books available.</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.toolbar}>
        <AddButton onPress={() => router.push('/books/form?mode=CREATE')} />
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
          <BookCover uri={item.couverture} />
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.titre}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
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
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorMessage: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
  },
  grid: {
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  toolbar: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
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