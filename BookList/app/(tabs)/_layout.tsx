import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Livres' }} />
      <Tabs.Screen
        name="books/[bookId]"
        options={{ href: null, title: 'Détail du livre' }}
      />
      <Tabs.Screen
        name="books/form"
        options={{ href: null, title: 'Formulaire livre' }}
      />
    </Tabs>
  );
}