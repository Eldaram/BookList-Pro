import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { spacing } from "../theme/tokens";
import { useTheme } from "../features/theme/ThemeProvider";
import { useI18n } from "../features/i18n/I18nProvider";

export default function DeleteButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.danger },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={t("books.delete.action")}
    >
      <MaterialIcons name="delete" size={24} color={colors.textOnPrimary} />
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
  disabled: {
    opacity: 0.5,
  },
});
