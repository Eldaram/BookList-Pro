import React from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "../../theme/tokens";
import { useTheme } from "../../features/theme/ThemeProvider";
import BookSkeleton from "./BookSkeleton";

export default function BookListLoading() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BookSkeleton />
      <BookSkeleton />
      <BookSkeleton />
      <BookSkeleton />
      <BookSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});
