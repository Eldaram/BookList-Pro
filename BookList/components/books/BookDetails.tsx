import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import BookCover from "./BookCover";
import { Book } from "../../domain/book";
import { AppError, isAppError } from "../../domain/error";
import { booksList } from "../../features/books/booksList";
import { spacing, typography } from "../../theme/tokens";
import { useTheme } from "../../features/theme/ThemeProvider";
import { useI18n } from "../../features/i18n/I18nProvider";
import ConfirmDialog from "../ConfirmDialog";
import DeleteButton from "../DeleteButton";
import UndoBanner from "../UndoBanner";
import UpdateButton from "../UpdateButton";

const UNDO_DELAY_SECONDS = 5;

export default function BookDetails({ book }: { book: Book }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [showConfirm, setShowConfirm] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<AppError | null>(null);
  const deletingRef = useRef(false);

  const confirmDelete = () => {
    setShowConfirm(false);
    setSecondsLeft(UNDO_DELAY_SECONDS);
  };

  useEffect(() => {
    if (secondsLeft === null) return;

    if (secondsLeft <= 0) {
      if (deletingRef.current) return;
      deletingRef.current = true;
      booksList
        .deleteBook(book.id)
        .then(() => router.replace("/"))
        .catch((err) => {
          deletingRef.current = false;
          setSecondsLeft(null);
          setDeleteError(
            isAppError(err)
              ? err
              : { type: "NETWORK", message: "Unexpected error", cause: err },
          );
        });
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((s) => (s ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, book.id, router]);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.background,
            borderColor: colors.coverPlaceholder,
          },
        ]}
      >
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
          <Text style={[styles.title, { color: colors.text }]}>
            {book.titre}
          </Text>
          <Text style={[styles.author, { color: colors.textMuted }]}>
            {book.auteur}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {book.editeur} · {book.annee}
            {book.note !== null ? ` · Note : ${book.note}/5` : ""}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {book.lu ? "Lu" : "Non lu"}
          </Text>
          {deleteError && (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {t("books.delete.error")}
            </Text>
          )}
        </View>
        <View style={styles.deleteButton}>
          <DeleteButton
            onPress={() => {
              setDeleteError(null);
              setShowConfirm(true);
            }}
            disabled={secondsLeft !== null}
          />
        </View>
      </View>

      <ConfirmDialog
        visible={showConfirm}
        title={t("books.delete.confirmTitle")}
        message={t("books.delete.confirmMessage")}
        confirmLabel={t("books.delete.confirm")}
        cancelLabel={t("books.delete.cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />

      {secondsLeft !== null && (
        <UndoBanner
          message={t("books.delete.pending").replace(
            "{{seconds}}",
            String(secondsLeft),
          )}
          actionLabel={t("books.delete.undo")}
          onPressAction={() => setSecondsLeft(null)}
        />
      )}
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
  deleteButton: {
    bottom: 0,
    position: "absolute",
    right: 0,
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
  errorText: {
    fontSize: typography.body,
    marginTop: spacing.md,
  },
});
