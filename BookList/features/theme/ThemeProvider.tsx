import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { secureStorage } from "../../services/secureStorage";
import { palettes, ThemeColors, ThemeMode } from "../../theme/tokens";

const THEME_STORAGE_KEY = "BOOKLIST_THEME_MODE";

function isThemeMode(value: string | null): value is ThemeMode {
  return value !== null && value in palettes;
}

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    void secureStorage.getSecureItem(THEME_STORAGE_KEY).then((stored) => {
      if (isThemeMode(stored)) {
        setMode(stored);
      }
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((m) => {
      const next = m === "light" ? "dark" : "light";
      void secureStorage.setSecureItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: palettes[mode],
      toggleTheme,
    }),
    [mode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme doit être utilisé dans un ThemeProvider");
  }
  return ctx;
}
