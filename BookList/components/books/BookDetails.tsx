import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import BookCover from "./BookCover";
import { Book } from "../../domain/book";
import { spacing, typography } from "../../theme/tokens";
import { useTheme } from "../../features/theme/ThemeProvider";
import UpdateButton from "../UpdateButton";

export default function BookDetails({ book }: { book: Book }) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
    >
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.coverPlaceholder }]}>
        <View style={styles.editButton}>
          <UpdateButton
            onPress={() =>
              router.push(`/books/form?mode=UPDATE&bookId=${book.id}`)
            }
          />
        </View>
        <View style={styles.coverWrapper}>
          <BookCover uri={book.couverture} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{book.titre}</Text>
          <Text style={[styles.author, { color: colors.textMuted }]}>{book.auteur}</Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {book.editeur} · {book.annee}
            {book.note !== null ? ` · Note : ${book.note}/5` : ""}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {book.lu ? "Lu" : "Non lu"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  card: {
    alignItems: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.lg,
  },
  coverWrapper: {
    width: 200,
  },
  editButton: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  author: {
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.body,
  },
});
