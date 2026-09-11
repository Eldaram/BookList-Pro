const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL;

if (!rawBaseUrl || rawBaseUrl.trim() === "") {
  throw new Error(
    "[CONFIG ERROR] EXPO_PUBLIC_API_URL environment variable is missing. " +
      "Please define EXPO_PUBLIC_API_URL in your .env file before launching the application.",
  );
}

/**
 * Global API configuration module.
 * Requires EXPO_PUBLIC_API_URL to be defined in .env.
 */
export const API_CONFIG = {
  baseUrl: rawBaseUrl,
  defaultTimeoutMs: 10000,
  maxRetries503: 3,
};

export const FREEIMAGEHOST_CONFIG = {
  uploadUrl: "https://freeimage.host/api/1/upload",
  apiKey:
    process.env.EXPO_PUBLIC_FREEIMAGEHOST_API_KEY ||
    "6d207e02198a847aa98d0a2a901485a5",
  maxFileSizeBytes: 63 * 1024 * 1024, // 63 MB max file size limit
};

export const OPENLIBRARY_CONFIG = {
  searchUrl: "https://openlibrary.org/search.json",
  coverBaseUrl: "https://covers.openlibrary.org/b/id",
  timeoutMs: 5000,
  // Espacement minimal entre deux appels : OpenLibrary bloque les rafales par IP.
  minRequestIntervalMs: 700,
  // Duree de memorisation d'un echec avant nouvelle tentative.
  failureTtlMs: 60_000,
};
