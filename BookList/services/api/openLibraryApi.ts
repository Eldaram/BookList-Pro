import { z } from "zod";
import { OPENLIBRARY_CONFIG } from "../config";
import { secureStorage } from "../secureStorage";

/**
 * Bibliographic enrichment: in-memory cache and silent fallback to null on error.
 */

const searchResponseSchema = z.object({
  numFound: z.number(),
  docs: z.array(
    z.object({
      cover_i: z.number().optional(),
      first_publish_year: z.number().optional(),
    }),
  ),
});

export type OpenLibraryEnrichment = {
  editionCount: number;
  firstPublishYear: number | null;
  coverUrl: string | null;
};

const cache = new Map<string, OpenLibraryEnrichment>();
// Echecs memorises avec TTL : ne pas marteler OpenLibrary quand il est indisponible.
const failedAt = new Map<string, number>();
const inflight = new Map<string, Promise<OpenLibraryEnrichment | null>>();

let nextRequestSlot = 0;

async function waitForRequestSlot(): Promise<void> {
  const now = Date.now();
  const wait = Math.max(0, nextRequestSlot - now);
  nextRequestSlot =
    Math.max(now, nextRequestSlot) + OPENLIBRARY_CONFIG.minRequestIntervalMs;
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}

const CACHE_STORAGE_KEY = "BOOKLIST_OPENLIBRARY_CACHE";

const storedCacheSchema = z.record(
  z.string(),
  z.object({
    editionCount: z.number(),
    firstPublishYear: z.number().nullable(),
    coverUrl: z.string().nullable(),
  }),
);

// Cache persiste : un rechargement de la page ne relance pas 500 recherches.
let cacheRestored: Promise<void> | null = null;
function restoreCache(): Promise<void> {
  cacheRestored ??= secureStorage
    .getSecureItem(CACHE_STORAGE_KEY)
    .then((raw) => {
      if (!raw) return;
      const parsed = storedCacheSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) return;
      for (const [key, value] of Object.entries(parsed.data)) {
        if (!cache.has(key)) cache.set(key, value);
      }
    })
    .catch(() => undefined);
  return cacheRestored;
}

function persistCache(): void {
  void secureStorage.setSecureItem(
    CACHE_STORAGE_KEY,
    JSON.stringify(Object.fromEntries(cache)),
  );
}

export async function searchByTitle(
  titre: string,
): Promise<OpenLibraryEnrichment | null> {
  const key = titre.trim().toLowerCase();
  if (!key) return null;

  await restoreCache();

  const cached = cache.get(key);
  if (cached) return cached;

  const failed = failedAt.get(key);
  if (failed && Date.now() - failed < OPENLIBRARY_CONFIG.failureTtlMs) {
    return null;
  }

  // Deduplication en vol : un seul appel reseau par titre a la fois.
  const pending = inflight.get(key);
  if (pending) return pending;

  const request = fetchEnrichment(key).finally(() => inflight.delete(key));
  inflight.set(key, request);
  return request;
}

async function fetchEnrichment(
  key: string,
): Promise<OpenLibraryEnrichment | null> {
  await waitForRequestSlot();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENLIBRARY_CONFIG.timeoutMs);

  try {
    const response = await fetch(
      `${OPENLIBRARY_CONFIG.searchUrl}?title=${encodeURIComponent(key)}&limit=5`,
      { signal: controller.signal },
    );
    if (!response.ok) {
      failedAt.set(key, Date.now());
      return null;
    }

    const parsed = searchResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      failedAt.set(key, Date.now());
      return null;
    }

    const { numFound, docs } = parsed.data;
    const withCover = docs.find((d) => d.cover_i !== undefined);
    const withYear = docs.find((d) => d.first_publish_year !== undefined);

    const enrichment: OpenLibraryEnrichment = {
      editionCount: numFound,
      firstPublishYear: withYear?.first_publish_year ?? null,
      coverUrl: withCover
        ? `${OPENLIBRARY_CONFIG.coverBaseUrl}/${withCover.cover_i}-M.jpg`
        : null,
    };
    cache.set(key, enrichment);
    failedAt.delete(key);
    persistCache();
    return enrichment;
  } catch {
    // Silent degradation: when OpenLibrary is unavailable, gracefully return null.
    failedAt.set(key, Date.now());
    return null;
  } finally {
    clearTimeout(timer);
  }
}
