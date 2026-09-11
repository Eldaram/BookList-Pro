import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../features/theme/ThemeProvider";
import { resolveCoverUri } from "../../services/servicesImpl/coverServiceImpl";

type Props = {
  uri: string | null;
  fallbackUri?: string | null;
  title?: string;
};

export default function BookCover({ uri, fallbackUri, title }: Props) {
  const { colors } = useTheme();
  const resolved = resolveCoverUri(uri) ?? resolveCoverUri(fallbackUri);
  if (!resolved) {
    // Repli local : initiales du titre, jamais d'image cassee ni de reseau.
    const initials = (title ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("");
    return (
      <View
        style={[
          styles.placeholder,
          { backgroundColor: colors.coverPlaceholder },
        ]}
      >
        {initials ? (
          <Text style={[styles.initials, { color: colors.textMuted }]}>
            {initials}
          </Text>
        ) : null}
      </View>
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
    alignItems: "center",
    aspectRatio: 2 / 3,
    borderRadius: 4,
    justifyContent: "center",
    width: "100%",
  },
  initials: {
    fontSize: 24,
    fontWeight: "700",
  },
});
