import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, spacing } from "../theme/tokens";

export default function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Ajouter un livre"
    >
      <MaterialIcons name="add" size={28} color={colors.textOnPrimary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    margin: spacing.md,
    width: 48,
  },
});
