import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import I18nSelector from "../components/i18n/i18n";
import ThemeToggle from "../components/ui/ThemeToggle";
import { I18nProvider } from "../features/i18n/I18nProvider";
import { ThemeProvider, useTheme } from "../features/theme/ThemeProvider";
import { spacing } from "../theme/tokens";

function ThemedApp() {
  const { mode, colors } = useTheme();
  const base = mode === "dark" ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.background,
      text: colors.text,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }} />
        <View style={styles.topBar}>
          <ThemeToggle />
          <I18nSelector />
        </View>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
      </View>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ThemedApp />
      </I18nProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
    right: spacing.md,
    top: 0,
    zIndex: 1,
  },
});
