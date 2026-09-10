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
  apiKey: process.env.EXPO_PUBLIC_FREEIMAGEHOST_API_KEY,
  maxFileSizeBytes: 63 * 1024 * 1024, // 63 MB max file size limit
};
