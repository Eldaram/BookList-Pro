import * as SecureStore from "expo-secure-store";

const inMemoryStore = new Map<string, string>();

const isWeb =
  typeof window !== "undefined" && typeof window.document !== "undefined";

/**
 * Executes a SecureStore action if native storage is available,
 * falling back gracefully to web localStorage or in-memory storage.
 */
async function executeWithFallback<T>(
  secureAction: () => Promise<T>,
  fallbackAction: () => T | Promise<T>,
): Promise<T> {
  if (!isWeb) {
    try {
      if (await SecureStore.isAvailableAsync()) {
        return await secureAction();
      }
    } catch {
      // SecureStore not available, continue to fallback
    }
  }

  try {
    return await fallbackAction();
  } catch {
    return null as T;
  }
}

function getItemFallback(key: string): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return inMemoryStore.get(key) ?? null;
}

function setItemFallback(key: string, value: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(key, value);
  } else {
    inMemoryStore.set(key, value);
  }
}

function removeItemFallback(key: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(key);
  } else {
    inMemoryStore.delete(key);
  }
}

export const secureStorage = {
  async getSecureItem(key: string): Promise<string | null> {
    return executeWithFallback(
      () => SecureStore.getItemAsync(key),
      () => getItemFallback(key),
    );
  },

  async setSecureItem(key: string, value: string): Promise<void> {
    await executeWithFallback(
      () => SecureStore.setItemAsync(key, value),
      () => setItemFallback(key, value),
    );
  },

  async removeSecureItem(key: string): Promise<void> {
    await executeWithFallback(
      () => SecureStore.deleteItemAsync(key),
      () => removeItemFallback(key),
    );
  },
};
