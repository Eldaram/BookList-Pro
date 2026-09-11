import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../features/theme/ThemeProvider";
import BookCardShell from "./BookCardShell";

type Props = {
  numColumns?: number;
};

export default function BookSkeleton({ numColumns = 1 }: Props) {
  const { colors } = useTheme();

  return (
    <BookCardShell
      numColumns={numColumns}
      cover={
        <View
          style={[
            styles.coverSkeleton,
            { backgroundColor: colors.coverPlaceholder + "44" },
          ]}
        />
      }
      title={
        <View
          style={[
            styles.titleSkeleton,
            { backgroundColor: colors.textMuted + "33" },
          ]}
        />
      }
      subtitle={
        <View
          style={[
            styles.subtitleSkeleton,
            { backgroundColor: colors.textMuted + "22" },
          ]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  coverSkeleton: {
    aspectRatio: 2 / 3,
    borderRadius: 4,
    width: "100%",
  },
  subtitleSkeleton: {
    borderRadius: 4,
    height: 14,
    width: "50%",
  },
  titleSkeleton: {
    borderRadius: 4,
    height: 18,
    width: "75%",
  },
});
