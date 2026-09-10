import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { spacing, typography } from "../theme/tokens";
import { useTheme } from "../features/theme/ThemeProvider";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Props) {
  const { colors } = useTheme();
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>
            {message}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.button}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.danger }]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              <Text
                style={[styles.buttonText, { color: colors.textOnPrimary }]}
              >
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialog: {
    borderRadius: 8,
    maxWidth: 360,
    padding: spacing.lg,
    width: "100%",
  },
  title: {
    fontSize: typography.body,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.body,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "flex-end",
  },
  button: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonText: {
    fontSize: typography.body,
    fontWeight: "600",
  },
});
