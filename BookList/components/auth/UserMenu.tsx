import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ROLES } from "../../domain/auth";
import { useAuth } from "../../features/auth/AuthProvider";
import { useI18n } from "../../features/i18n/I18nProvider";
import { useTheme } from "../../features/theme/ThemeProvider";
import { spacing } from "../../theme/tokens";
import ThemedText from "../ui/ThemedText";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const { colors } = useTheme();

  if (!user) return null;

  const isEditor = user.role === ROLES.EDITOR;

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <ThemedText style={styles.userEmail} numberOfLines={1}>
          {user.email}
        </ThemedText>
        <View
          style={[
            styles.roleBadge,
            {
              backgroundColor: isEditor
                ? colors.primary + "33"
                : colors.textMuted + "33",
            },
          ]}
        >
          <ThemedText
            style={[
              styles.roleText,
              {
                color: isEditor ? colors.primary : colors.textMuted,
              },
            ]}
          >
            {user.role}
          </ThemedText>
        </View>
      </View>
      <Pressable
        onPress={() => void logout()}
        style={({ pressed }) => [
          styles.logoutButton,
          {
            borderColor: colors.danger,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <ThemedText style={[styles.logoutText, { color: colors.danger }]}>
          {t("auth.logout")}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  logoutButton: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: "600",
  },
  roleBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  userEmail: {
    fontSize: 13,
    fontWeight: "600",
    maxWidth: 140,
  },
  userInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
});
