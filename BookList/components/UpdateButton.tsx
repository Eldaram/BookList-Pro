import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { spacing } from "../theme/tokens";
import { useTheme } from "../features/theme/ThemeProvider";

export default function UpdateButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Modifier le livre"
    >
      <MaterialIcons name="edit" size={24} color={colors.textOnPrimary} />
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
