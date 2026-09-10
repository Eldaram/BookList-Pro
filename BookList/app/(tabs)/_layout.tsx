import { Tabs } from "expo-router";

import { useI18n } from "../../features/i18n/I18nProvider";

export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Livres" }} />
      <Tabs.Screen
        name="books/[bookId]"
        options={{ href: null, title: "Détail du livre" }}
      />
      <Tabs.Screen
        name="books/form"
        options={{ href: null, title: "Formulaire livre" }}
      />
    </Tabs>
  );
}
