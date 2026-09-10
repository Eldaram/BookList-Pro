import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Book } from "../../domain/book";
import { AppError, isAppError } from "../../domain/error";
import { booksList } from "../../features/books/booksList";
import { spacing, typography } from "../../theme/tokens";
import { useTheme } from "../../features/theme/ThemeProvider";
import { useI18n } from "../../features/i18n/I18nProvider";
import SaveButton from "../SaveButton";
import BookCover from "./BookCover";

export type BookFormMode = "CREATE" | "UPDATE";

type Props = {
  mode: BookFormMode;
  book?: Book;
};

export default function BookForm({ mode, book }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [titre, setTitre] = useState(book?.titre ?? "");
  const [auteur, setAuteur] = useState(book?.auteur ?? "");
  const [editeur, setEditeur] = useState(book?.editeur ?? "");
  const [annee, setAnnee] = useState(book ? String(book.annee) : "");
  const [couverture] = useState<string | null>(book?.couverture ?? null);
  const [error, setError] = useState<AppError | null>(null);

  // Messages de validation renvoyes par l'API (422), par champ
  const fieldError = (champ: string) =>
    error?.type === "VALIDATION" ? error.fields[champ] : undefined;

  const submit = async () => {
    setError(null);
    const input = {
      titre: titre.trim(),
      auteur: auteur.trim(),
      editeur: editeur.trim(),
      annee: Number(annee),
      lu: book?.lu,
      favori: book?.favori,
      couverture,
    };
    try {
      const saved =
        mode === "CREATE"
          ? await booksList.createBook(input)
          : await booksList.updateBook(book!.id, input, book!.version);
      router.replace(`/books/${saved.id}`);
    } catch (err) {
      setError(
        isAppError(err)
          ? err
          : { type: "NETWORK", message: "Unexpected error", cause: err },
      );
    }
  };

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
        <View style={styles.coverWrapper}>
          <BookCover uri={couverture} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.heading, { color: colors.text }]}>
            {mode === "CREATE" ? t("form.createTitle") : t("form.updateTitle")}
          </Text>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("form.title")}
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.coverPlaceholder, color: colors.text },
              fieldError("titre") && { borderColor: colors.danger },
            ]}
            value={titre}
            onChangeText={setTitre}
          />
          {fieldError("titre") && (
            <Text style={styles.fieldError}>{fieldError("titre")}</Text>
          )}
          <Text style={[styles.label, { color: colors.text }]}>
            {t("form.author")}
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.coverPlaceholder, color: colors.text },
              fieldError("auteur") && { borderColor: colors.danger },
            ]}
            value={auteur}
            onChangeText={setAuteur}
          />
          {fieldError("auteur") && (
            <Text style={styles.fieldError}>{fieldError("auteur")}</Text>
          )}
          <Text style={[styles.label, { color: colors.text }]}>
            {t("form.publisher")}
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.coverPlaceholder, color: colors.text },
              fieldError("editeur") && { borderColor: colors.danger },
            ]}
            value={editeur}
            onChangeText={setEditeur}
          />
          {fieldError("editeur") && (
            <Text style={styles.fieldError}>{fieldError("editeur")}</Text>
          )}
          <Text style={[styles.label, { color: colors.text }]}>
            {t("form.year")}
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.coverPlaceholder, color: colors.text },
              fieldError("annee") && { borderColor: colors.danger },
            ]}
            value={annee}
            onChangeText={setAnnee}
            keyboardType="numeric"
          />
          {fieldError("annee") && (
            <Text style={styles.fieldError}>{fieldError("annee")}</Text>
          )}
          {error && error.type !== "VALIDATION" && (
            <Text style={[styles.error, { color: colors.danger }]}>
              {error.message}
            </Text>
          )}
          <SaveButton onPress={submit} label={t("form.save")} />
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
  info: {
    flex: 1,
  },
  heading: {
    fontSize: typography.title,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: typography.body,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  error: {
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  fieldError: {
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
});
