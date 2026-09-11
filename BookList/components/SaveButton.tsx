import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { spacing, typography } from "../theme/tokens";
import { useTheme } from "../features/theme/ThemeProvider";
import { useI18n } from "../features/i18n/I18nProvider";

export default function SaveButton({
  onPress,
  disabled,
  label,
}: {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const buttonLabel = label ?? t("form.save");

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.primary },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={buttonLabel}
    >
      <Text style={[styles.text, { color: colors.textOnPrimary }]}>
        {buttonLabel}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: spacing.md,
    padding: spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: typography.body,
    fontWeight: "700",
  },
});
