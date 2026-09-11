import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { spacing } from "../../theme/tokens";
import { useTheme } from "../../features/theme/ThemeProvider";
import { CELL_TARGET_WIDTH } from "./BookCardShell";
import BookSkeleton from "./BookSkeleton";

export default function BookListLoading() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const numColumns = Math.max(
    2,
    Math.floor(width / (CELL_TARGET_WIDTH + spacing.md * 2)),
  );

  const skeletonCount = numColumns * 3;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.grid}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <BookSkeleton key={index} numColumns={numColumns} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: spacing.md,
  },
});
