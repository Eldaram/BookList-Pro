import React, { Component, ErrorInfo, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { palettes, spacing, typography } from "../theme/tokens";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Une erreur inattendue est survenue</Text>
            <Text style={styles.message}>
              {this.state.error?.message ||
                "Une erreur système s'est produite."}
            </Text>
            <Pressable onPress={this.handleReset} style={styles.button}>
              <Text style={styles.buttonText}>Réessayer</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: palettes.light.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: palettes.light.textOnPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    alignItems: "center",
    backgroundColor: palettes.light.background,
    borderColor: palettes.light.coverPlaceholder,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 400,
    padding: spacing.lg,
    width: "100%",
  },
  container: {
    alignItems: "center",
    backgroundColor: palettes.light.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  message: {
    color: palettes.light.textMuted,
    fontSize: typography.body,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  title: {
    color: palettes.light.text,
    fontSize: typography.title,
    fontWeight: "700",
    marginBottom: spacing.md,
    textAlign: "center",
  },
});
