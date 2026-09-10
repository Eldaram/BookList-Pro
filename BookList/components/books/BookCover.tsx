import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors } from "../../theme/tokens";

type Props = {
  uri: string | null;
};

export default function BookCover({ uri }: Props) {
  if (!uri) {
    return <View style={styles.placeholder} />;
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
    backgroundColor: colors.coverPlaceholder,
    borderRadius: 4,
    width: "100%",
  },
});
