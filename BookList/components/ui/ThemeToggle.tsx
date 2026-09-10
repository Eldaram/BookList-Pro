import { Pressable, StyleSheet, Text } from "react-native";

import { useI18n } from "../../features/i18n/I18nProvider";
import { useTheme } from "../../features/theme/ThemeProvider";

export default function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <Pressable
      accessibilityLabel={t("theme.toggle")}
      accessibilityRole="button"
      style={styles.button}
      onPress={toggleTheme}
    >
      <Text style={styles.icon}>{mode === "light" ? "🌙" : "☀️"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  icon: {
    fontSize: 20,
  },
});
