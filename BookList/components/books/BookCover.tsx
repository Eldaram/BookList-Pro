import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useTheme } from "../../features/theme/ThemeProvider";

type Props = {
  uri: string | null;
};

export default function BookCover({ uri }: Props) {
  const { colors } = useTheme();
  if (!uri) {
      return <View style={[styles.placeholder, { backgroundColor: colors.coverPlaceholder }]} />;
  }
  return <Image source={{ uri }} style={styles.cover} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  cover: {
    aspectRatio: 2 / 3,
    borderRadius: 4,
    width: "100%",
  },
  placeholder: {
    aspectRatio: 2 / 3,
    borderRadius: 4,
    width: "100%",
  },
});
