import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useTheme } from "../../features/theme/ThemeProvider";
import { resolveCoverUri } from "../../services/repository/coverRepository";

type Props = {
  uri: string | null;
};

export default function BookCover({ uri }: Props) {
  const { colors } = useTheme();
  const resolved = resolveCoverUri(uri);
  if (!resolved) {
    return (
      <View
        style={[
          styles.placeholder,
          { backgroundColor: colors.coverPlaceholder },
        ]}
      />
    );
  }
  return (
    <Image source={{ uri: resolved }} style={styles.cover} resizeMode="cover" />
  );
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
