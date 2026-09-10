import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { spacing } from "../../theme/tokens";
import { useTheme } from "../../features/theme/ThemeProvider";

export default function BookListLoading() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
});
