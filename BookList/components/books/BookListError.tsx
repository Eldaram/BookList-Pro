import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppError } from '../../domain/error';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = {
  error: AppError;
};

const MESSAGES: Record<AppError['type'], string> = {
  NETWORK: 'Connexion impossible. Vérifiez votre réseau.',
  AUTH: 'Session invalide. Veuillez vous reconnecter.',
  VALIDATION: 'Réponse du serveur invalide.',
  CONFLICT: 'Conflit de données. Réessayez.',
  SERVER: 'Erreur serveur. Réessayez plus tard.',
};

export default function BookListError({ error }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{MESSAGES[error.type]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
  },
});
