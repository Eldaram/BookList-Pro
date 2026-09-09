import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../theme/tokens';

export default function BooksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BookList Pro</Text>
      <Text style={styles.subtitle}>Catalogue des livres</Text>
      <StatusBar style="auto" />
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
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});