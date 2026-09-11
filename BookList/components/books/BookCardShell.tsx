import React, { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { spacing } from "../../theme/tokens";

export const CELL_TARGET_WIDTH = 160;

export type BookCardShellProps = {
  numColumns?: number;
  cover: ReactNode;
  action?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export default function BookCardShell({
  numColumns = 1,
  cover,
  action,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
}: BookCardShellProps) {
  const content = (
    <>
      <View style={styles.coverWrapper}>{cover}</View>
      <View style={styles.titleContainer}>{title}</View>
      <View style={styles.subtitleContainer}>{subtitle}</View>
    </>
  );

  return (
    <View style={[styles.cell, { flex: 1 / numColumns }]}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
      {action ? <View style={styles.actionOverlay}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  cell: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
    maxWidth: CELL_TARGET_WIDTH + spacing.md * 2,
  },
  coverWrapper: {
    position: "relative",
  },
  subtitleContainer: {
    marginTop: 2,
  },
  titleContainer: {
    marginTop: spacing.md,
  },
});
