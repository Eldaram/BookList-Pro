import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import ErrorBoundary from "../components/ErrorBoundary";
import LoginForm from "../components/auth/LoginForm";
import UserMenu from "../components/auth/UserMenu";
import I18nSelector from "../components/i18n/i18n";
import ThemeToggle from "../components/ui/ThemeToggle";
import { AuthProvider, useAuth } from "../features/auth/AuthProvider";
import { BooksProvider } from "../features/books/BooksProvider";
import { I18nProvider } from "../features/i18n/I18nProvider";
import { ThemeProvider, useTheme } from "../features/theme/ThemeProvider";
import { spacing } from "../theme/tokens";

function ThemedApp() {
  const { mode, colors } = useTheme();
  const { status, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

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
        <View style={[styles.topBar, { top: insets.top + spacing.md }]}>
          {status === "authenticated" ? <UserMenu /> : null}
          <ThemeToggle />
          <I18nSelector />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : status === "authenticated" ? (
          <Stack screenOptions={{ headerShown: false }} />
        ) : (
          <LoginForm />
        )}

        <StatusBar style={mode === "dark" ? "light" : "dark"} />
      </View>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <BooksProvider>
                <ThemedApp />
              </BooksProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    position: "absolute",
    right: spacing.md,
    zIndex: 10,
  },
});
