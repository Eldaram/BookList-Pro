import React, { useContext, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import { Book, BookInput } from "../../domain/book";
import { AppError, isAppError } from "../../domain/error";
import { booksList } from "../../features/books/booksList";
import { BooksContext } from "../../features/books/BooksProvider";
import { useI18n } from "../../features/i18n/I18nProvider";
import { useTheme } from "../../features/theme/ThemeProvider";
import { pickCoverImage } from "../../services/servicesImpl/coverServiceImpl";
import { spacing, typography } from "../../theme/tokens";
import SaveButton from "../SaveButton";
import BookFormCoverSection from "./BookFormCoverSection";

export type BookFormMode = "CREATE" | "UPDATE";

type Props = {
  mode: BookFormMode;
  book?: Book;
};

type FormData = {
  titre: string;
  auteur: string;
  editeur: string;
  annee: string;
};

export default function BookForm({ mode, book }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const booksContext = useContext(BooksContext);

  const [couverture, setCouverture] = useState<string | null>(
    book?.couverture ?? null,
  );
  const [error, setError] = useState<AppError | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      titre: book?.titre ?? "",
      auteur: book?.auteur ?? "",
      editeur: book?.editeur ?? "",
      annee: book ? String(book.annee) : "",
    },
  });

  const addCover = async () => {
    setCoverError(null);
    try {
      const uri = await pickCoverImage();
      if (uri) setCouverture(uri);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : t("form.cover.error"));
    }
  };

  const resetCover = () => {
    setCoverError(null);
    setCouverture(null);
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    const input: BookInput = {
      titre: data.titre.trim(),
      auteur: data.auteur.trim(),
      editeur: data.editeur.trim(),
      annee: Number(data.annee),
      lu: book?.lu,
      favori: book?.favori,
      couverture,
    };

    try {
      const saved =
        mode === "CREATE"
          ? await booksList.createBook(input)
          : await booksList.updateBook(book!.id, input, book!.version);

      if (mode === "CREATE") {
        booksContext?.addBookToList(saved);
      } else {
        booksContext?.updateBookInList(saved);
      }
      router.replace(`/books/${saved.id}`);
    } catch (err) {
      if (isAppError(err) && err.type === "VALIDATION" && err.fields) {
        Object.entries(err.fields).forEach(([field, message]) => {
          if (
            field === "titre" ||
            field === "auteur" ||
            field === "editeur" ||
            field === "annee"
          ) {
            setFieldError(field as keyof FormData, { message });
          }
        });
      }
      setError(
        isAppError(err)
          ? err
          : { type: "NETWORK", message: "Unexpected error", cause: err },
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={[styles.scroll, { backgroundColor: colors.background }]}
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
        <BookFormCoverSection
          coverError={coverError}
          coverUri={couverture}
          onAddCover={() => void addCover()}
          onResetCover={resetCover}
        />

        <View style={styles.info}>
          <Text style={[styles.heading, { color: colors.text }]}>
            {mode === "CREATE" ? t("form.createTitle") : t("form.updateTitle")}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>
            {t("form.title")}
          </Text>
          <Controller
            control={control}
            name="titre"
            render={({ field: { onChange, value } }) => (
              <TextInput
                onChangeText={onChange}
                style={[
                  styles.input,
                  { borderColor: colors.coverPlaceholder, color: colors.text },
                  errors.titre && { borderColor: colors.danger },
                ]}
                value={value}
              />
            )}
          />
          {errors.titre?.message ? (
            <Text style={[styles.fieldError, { color: colors.danger }]}>
              {errors.titre.message}
            </Text>
          ) : null}

          <Text style={[styles.label, { color: colors.text }]}>
            {t("form.author")}
          </Text>
          <Controller
            control={control}
            name="auteur"
            render={({ field: { onChange, value } }) => (
              <TextInput
                onChangeText={onChange}
                style={[
                  styles.input,
                  { borderColor: colors.coverPlaceholder, color: colors.text },
                  errors.auteur && { borderColor: colors.danger },
                ]}
                value={value}
              />
            )}
          />
          {errors.auteur?.message ? (
            <Text style={[styles.fieldError, { color: colors.danger }]}>
              {errors.auteur.message}
            </Text>
          ) : null}

          <Text style={[styles.label, { color: colors.text }]}>
            {t("form.publisher")}
          </Text>
          <Controller
            control={control}
            name="editeur"
            render={({ field: { onChange, value } }) => (
              <TextInput
                onChangeText={onChange}
                style={[
                  styles.input,
                  { borderColor: colors.coverPlaceholder, color: colors.text },
                  errors.editeur && { borderColor: colors.danger },
                ]}
                value={value}
              />
            )}
          />
          {errors.editeur?.message ? (
            <Text style={[styles.fieldError, { color: colors.danger }]}>
              {errors.editeur.message}
            </Text>
          ) : null}

          <Text style={[styles.label, { color: colors.text }]}>
            {t("form.year")}
          </Text>
          <Controller
            control={control}
            name="annee"
            render={({ field: { onChange, value } }) => (
              <TextInput
                keyboardType="numeric"
                onChangeText={onChange}
                style={[
                  styles.input,
                  { borderColor: colors.coverPlaceholder, color: colors.text },
                  errors.annee && { borderColor: colors.danger },
                ]}
                value={value}
              />
            )}
          />
          {errors.annee?.message ? (
            <Text style={[styles.fieldError, { color: colors.danger }]}>
              {errors.annee.message}
            </Text>
          ) : null}

          {error && error.type !== "VALIDATION" ? (
            <Text style={[styles.error, { color: colors.danger }]}>
              {error.message}
            </Text>
          ) : null}

          <SaveButton
            disabled={isSubmitting}
            label={t("form.save")}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.lg,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  error: {
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  fieldError: {
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: typography.title,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  info: {
    flex: 1,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: typography.body,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  label: {
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  scroll: {
    flex: 1,
  },
});
