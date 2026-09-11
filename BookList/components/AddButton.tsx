import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { spacing } from "../theme/tokens";
import { useTheme } from "../features/theme/ThemeProvider";
import { useI18n } from "../features/i18n/I18nProvider";

export default function AddButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("form.createTitle")}
    >
      <MaterialIcons name="add" size={28} color={colors.textOnPrimary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    margin: spacing.md,
    width: 48,
  },
});
