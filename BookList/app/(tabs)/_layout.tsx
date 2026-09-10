import { Tabs } from "expo-router";

import { useI18n } from "../../features/i18n/I18nProvider";

export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: t("tabs.books") }} />
      <Tabs.Screen
        name="books/[bookId]"
        options={{ href: null, title: t("books.details") }}
      />
      <Tabs.Screen
        name="books/form"
        options={{ href: null, title: t("books.form") }}
      />
    </Tabs>
  );
}
