import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { spacing, typography } from "../theme/tokens";
import { useTheme } from "../features/theme/ThemeProvider";

type Props = {
  message: string;
  actionLabel: string;
  onPressAction: () => void;
};

export default function UndoBanner({
  message,
  actionLabel,
  onPressAction,
}: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: colors.text }]}>
      <Text style={[styles.message, { color: colors.background }]}>
        {message}
      </Text>
      <TouchableOpacity
        onPress={onPressAction}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
      >
        <Text style={[styles.action, { color: colors.primary }]}>
          {actionLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    borderRadius: 8,
    bottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    left: spacing.lg,
    padding: spacing.lg,
    position: "absolute",
    right: spacing.lg,
  },
  message: {
    fontSize: typography.body,
  },
  action: {
    fontSize: typography.body,
    fontWeight: "700",
  },
});
