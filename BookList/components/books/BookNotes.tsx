import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useBookNotes } from "../../hooks/useBookNotes";
import { useTheme } from "../../features/theme/ThemeProvider";
import { useI18n } from "../../features/i18n/I18nProvider";
import { spacing, typography } from "../../theme/tokens";

const MAX_LENGTH = 1000;

const formatDate = (iso: string, locale: string) =>
  new Date(iso).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

type Props = {
  bookId: string;
};

export default function BookNotes({ bookId }: Props) {
  const { colors } = useTheme();
  const { t, locale } = useI18n();
  const { notes, loading, saving, error, addNote, removeNote } =
    useBookNotes(bookId);
  const [draft, setDraft] = useState("");

  const trimmed = draft.trim();
  const canSubmit =
    trimmed.length > 0 && trimmed.length <= MAX_LENGTH && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    const ok = await addNote(trimmed);
    if (ok) setDraft("");
  };

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.background,
          borderColor: colors.coverPlaceholder,
        },
      ]}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        {t("notes.title")}
      </Text>

      <View style={styles.formRow}>
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.coverPlaceholder, color: colors.text },
          ]}
          placeholder={t("notes.placeholder")}
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={MAX_LENGTH}
          accessibilityLabel={t("notes.placeholder")}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: colors.primary },
            !canSubmit && styles.disabled,
          ]}
          onPress={submit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel={t("notes.add")}
        >
          <MaterialIcons name="send" size={20} color={colors.textOnPrimary} />
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>
          {t("notes.error")}
        </Text>
      )}

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : notes.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          {t("notes.empty")}
        </Text>
      ) : (
        notes.map((note) => (
          <View
            key={note.id}
            style={[styles.note, { borderColor: colors.coverPlaceholder }]}
          >
            <View style={styles.noteBody}>
              <Text style={[styles.noteDate, { color: colors.textMuted }]}>
                {formatDate(note.createdAt, locale)}
              </Text>
              <Text style={[styles.noteContent, { color: colors.text }]}>
                {note.contenu}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeNote(note.id)}
              accessibilityRole="button"
              accessibilityLabel={t("notes.delete")}
            >
              <MaterialIcons name="close" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  heading: {
    fontSize: typography.body,
    fontWeight: "700",
  },
  formRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.md,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    fontSize: typography.body,
    minHeight: 44,
    padding: spacing.md,
  },
  addButton: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    fontSize: typography.body,
  },
  empty: {
    fontSize: typography.body,
    fontStyle: "italic",
  },
  note: {
    alignItems: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  noteBody: {
    flex: 1,
    gap: spacing.md / 2,
  },
  noteDate: {
    fontSize: 14,
  },
  noteContent: {
    fontSize: typography.body,
  },
});
