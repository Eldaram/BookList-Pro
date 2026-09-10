import React from "react";
import { GestureResponderEvent, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../features/theme/ThemeProvider";
import { useI18n } from "../features/i18n/I18nProvider";

export default function FavoriteButton({
  favori,
  onPress,
}: {
  favori: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const label = favori ? t("books.favorite.remove") : t("books.favorite.add");

  const handlePress = (event: GestureResponderEvent) => {
    // Empeche la bascule de declencher la navigation de la carte parente.
    event.stopPropagation();
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: favori }}
    >
      <MaterialIcons
        name={favori ? "favorite" : "favorite-border"}
        size={24}
        color={favori ? colors.danger : colors.textMuted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
});
