import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { spacing, typography } from "../theme/tokens";
import { useTheme } from "../features/theme/ThemeProvider";

export default function SaveButton({
  onPress,
  disabled,
  label = "Sauvegarder",
}: {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const { colors } = useTheme();
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
      accessibilityLabel={label}
    >
      <Text style={[styles.text, { color: colors.textOnPrimary }]}>
        {label}
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
