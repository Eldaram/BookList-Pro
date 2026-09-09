import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import I18nSelector from '../components/i18n/i18n';
import { I18nProvider } from '../features/i18n/I18nProvider';
import { spacing } from '../theme/tokens';

export default function RootLayout() {
  return (
    <I18nProvider>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }} />
        <View style={styles.languageSelector}>
          <I18nSelector />
        </View>
      </View>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  languageSelector: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    zIndex: 1,
  },
});