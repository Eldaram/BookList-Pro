import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export default function SaveButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Sauvegarder"
    >
      <Text style={styles.text}>Sauvegarder</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.textOnPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
