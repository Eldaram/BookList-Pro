import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../features/theme/ThemeProvider";
import { spacing } from "../../theme/tokens";

export default function BookSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.coverSkeleton,
          { backgroundColor: colors.coverPlaceholder + "44" },
        ]}
      />
      <View style={styles.info}>
        <View
          style={[
            styles.titleSkeleton,
            { backgroundColor: colors.textMuted + "33" },
          ]}
        />
        <View
          style={[
            styles.authorSkeleton,
            { backgroundColor: colors.textMuted + "22" },
          ]}
        />
        <View
          style={[
            styles.metaSkeleton,
            { backgroundColor: colors.textMuted + "22" },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  authorSkeleton: {
    borderRadius: 4,
    height: 14,
    marginBottom: spacing.md,
    width: "50%",
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    marginVertical: 4,
    padding: spacing.md,
  },
  coverSkeleton: {
    borderRadius: 6,
    height: 90,
    width: 60,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  metaSkeleton: {
    borderRadius: 4,
    height: 12,
    width: "30%",
  },
  titleSkeleton: {
    borderRadius: 4,
    height: 18,
    marginBottom: spacing.md,
    width: "75%",
  },
});
