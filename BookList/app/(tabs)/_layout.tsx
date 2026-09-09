import { Tabs } from 'expo-router';

import { useI18n } from '../../features/i18n/I18nProvider';

export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: t('tabs.books') }} />
    </Tabs>
  );
}