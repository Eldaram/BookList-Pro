import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useI18n } from "../../features/i18n/I18nProvider";
import { useTheme } from "../../features/theme/ThemeProvider";
import { spacing } from "../../theme/tokens";
import BookCover from "./BookCover";

type Props = {
  coverUri: string | null;
  fallbackUri?: string | null;
  title?: string;
  coverError: string | null;
  onAddCover: () => void;
  onResetCover: () => void;
};

export default function BookFormCoverSection({
  coverUri,
  fallbackUri,
  title,
  coverError,
  onAddCover,
  onResetCover,
}: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  return (
    <View style={styles.coverWrapper}>
      <BookCover uri={coverUri} fallbackUri={fallbackUri} title={title} />
      <TouchableOpacity
        accessibilityLabel={t("form.cover.add")}
        accessibilityRole="button"
        onPress={onAddCover}
        style={[styles.coverButton, { backgroundColor: colors.primary }]}
      >
        <MaterialIcons name="add" size={22} color={colors.textOnPrimary} />
      </TouchableOpacity>

      {coverUri ? (
        <TouchableOpacity
          accessibilityLabel={t("form.cover.reset")}
          accessibilityRole="button"
          onPress={onResetCover}
          style={[
            styles.coverButton,
            styles.coverResetButton,
            { backgroundColor: colors.danger },
          ]}
        >
          <MaterialIcons name="close" size={18} color={colors.textOnPrimary} />
        </TouchableOpacity>
      ) : null}

      {coverError ? (
        <Text style={[styles.fieldError, { color: colors.danger }]}>
          {coverError}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  coverButton: {
    alignItems: "center",
    borderRadius: 20,
    bottom: spacing.md,
    height: 40,
    justifyContent: "center",
    position: "absolute",
    right: spacing.md,
    width: 40,
  },
  coverResetButton: {
    bottom: spacing.md + 48,
  },
  coverWrapper: {
    position: "relative",
    width: 200,
  },
  fieldError: {
    fontSize: 14,
    marginTop: spacing.md,
  },
});
