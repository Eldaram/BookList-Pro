import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Book } from '../../domain/book';
import { AppError, isAppError } from '../../domain/error';
import { booksList } from '../../features/books/booksList';
import { colors, spacing, typography } from '../../theme/tokens';
import SaveButton from '../SaveButton';
import BookCover from './BookCover';

export type BookFormMode = 'CREATE' | 'UPDATE';

type Props = {
  mode: BookFormMode;
  book?: Book;
};

export default function BookForm({ mode, book }: Props) {
  const router = useRouter();
  const [titre, setTitre] = useState(book?.titre ?? '');
  const [auteur, setAuteur] = useState(book?.auteur ?? '');
  const [editeur, setEditeur] = useState(book?.editeur ?? '');
  const [annee, setAnnee] = useState(book ? String(book.annee) : '');
  const [couverture] = useState<string | null>(book?.couverture ?? null);
  const [error, setError] = useState<AppError | null>(null);

  // Messages de validation renvoyes par l'API (422), par champ
  const fieldError = (champ: string) =>
    error?.type === 'VALIDATION' ? error.fields[champ] : undefined;

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
        mode === 'CREATE'
          ? await booksList.createBook(input)
          : await booksList.updateBook(book!.id, input, book!.version);
      router.replace(`/books/${saved.id}`);
    } catch (err) {
      setError(
        isAppError(err)
          ? err
          : { type: 'NETWORK', message: 'Unexpected error', cause: err }
      );
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.coverWrapper}>
          <BookCover uri={couverture} />
        </View>
        <View style={styles.info}>
          <Text style={styles.heading}>
            {mode === 'CREATE' ? 'Ajouter un livre' : 'Modifier le livre'}
          </Text>
          <Text style={styles.label}>Titre</Text>
      <TextInput
        style={[styles.input, fieldError('titre') && styles.inputError]}
        value={titre}
        onChangeText={setTitre}
      />
      {fieldError('titre') && <Text style={styles.fieldError}>{fieldError('titre')}</Text>}
      <Text style={styles.label}>Auteur</Text>
      <TextInput
        style={[styles.input, fieldError('auteur') && styles.inputError]}
        value={auteur}
        onChangeText={setAuteur}
      />
      {fieldError('auteur') && <Text style={styles.fieldError}>{fieldError('auteur')}</Text>}
      <Text style={styles.label}>Éditeur</Text>
      <TextInput
        style={[styles.input, fieldError('editeur') && styles.inputError]}
        value={editeur}
        onChangeText={setEditeur}
      />
      {fieldError('editeur') && <Text style={styles.fieldError}>{fieldError('editeur')}</Text>}
      <Text style={styles.label}>Année</Text>
      <TextInput
        style={[styles.input, fieldError('annee') && styles.inputError]}
        value={annee}
        onChangeText={setAnnee}
        keyboardType="numeric"
      />
      {fieldError('annee') && <Text style={styles.fieldError}>{fieldError('annee')}</Text>}
      {error && error.type !== 'VALIDATION' && (
        <Text style={styles.error}>{error.message}</Text>
      )}
          <SaveButton onPress={submit} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  card: {
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderColor: colors.coverPlaceholder,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
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
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  input: {
    borderColor: colors.coverPlaceholder,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  fieldError: {
    color: colors.danger,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
});
