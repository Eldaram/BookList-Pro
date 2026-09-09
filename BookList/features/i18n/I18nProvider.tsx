import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import en from './locales/en.json';
import fr from './locales/fr.json';

const translations = { en, fr } as const;

export type Locale = keyof typeof translations;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr');

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => {
        const result = key
          .split('.')
          .reduce<unknown>(
            (obj, part) => (obj as Record<string, unknown> | undefined)?.[part],
            translations[locale],
          );
        return typeof result === 'string' ? result : key;
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n doit être utilisé dans un I18nProvider');
  }
  return ctx;
}
