import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { secureStorage } from '../../services/secureStorage';
import en from './locales/en.json';
import fr from './locales/fr.json';

const translations = { en, fr } as const;
const LOCALE_STORAGE_KEY = 'BOOKLIST_LOCALE';

export type Locale = keyof typeof translations;

function isLocale(value: string | null): value is Locale {
  return value !== null && value in translations;
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');
  
  useEffect(() => {
    void secureStorage.getSecureItem(LOCALE_STORAGE_KEY).then((stored) => {
      if (isLocale(stored)) {
        setLocaleState(stored);
      }
    });
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    void secureStorage.setSecureItem(LOCALE_STORAGE_KEY, next);
  }, []);

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
    [locale, setLocale],
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
