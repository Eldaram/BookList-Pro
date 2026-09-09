interface StorageEngine {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

/**
 * Abstraction for key-value storage.
 * Dynamically selects window.localStorage when running in browser,
 * falling back gracefully to an in-memory Map for Node/tests.
 */
class SecureStorage {
  private inMemoryStore = new Map<string, string>();

  private get engine(): StorageEngine {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return {
      getItem: (key) => this.inMemoryStore.get(key) ?? null,
      setItem: (key, val) => {
        this.inMemoryStore.set(key, val);
      },
      removeItem: (key) => {
        this.inMemoryStore.delete(key);
      },
    };
  }

  async getSecureItem(key: string): Promise<string | null> {
    try {
      return await this.engine.getItem(key);
    } catch {
      return this.inMemoryStore.get(key) ?? null;
    }
  }

  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      await this.engine.setItem(key, value);
    } catch {
      this.inMemoryStore.set(key, value);
    }
  }

  async removeSecureItem(key: string): Promise<void> {
    try {
      await this.engine.removeItem(key);
    } catch {
      this.inMemoryStore.delete(key);
    }
  }
}

export const secureStorage = new SecureStorage();
