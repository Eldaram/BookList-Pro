import { z } from "zod";

// Enrichissement bibliographique (lot 3) : cache memoire + delai d'expiration.
// Toute erreur se degrade silencieusement en null : la fiche ne casse jamais.

const OPENLIBRARY_SEARCH_URL = "https://openlibrary.org/search.json";
const OPENLIBRARY_COVER_URL = "https://covers.openlibrary.org/b/id";
const TIMEOUT_MS = 5000;

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

export async function searchByTitle(
  titre: string,
): Promise<OpenLibraryEnrichment | null> {
  const key = titre.trim().toLowerCase();
  if (!key) return null;

  const cached = cache.get(key);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `${OPENLIBRARY_SEARCH_URL}?title=${encodeURIComponent(key)}&limit=5`,
      { signal: controller.signal },
    );
    if (!response.ok) return null;

    const parsed = searchResponseSchema.safeParse(await response.json());
    if (!parsed.success) return null;

    const { numFound, docs } = parsed.data;
    const withCover = docs.find((d) => d.cover_i !== undefined);
    const withYear = docs.find((d) => d.first_publish_year !== undefined);

    const enrichment: OpenLibraryEnrichment = {
      editionCount: numFound,
      firstPublishYear: withYear?.first_publish_year ?? null,
      coverUrl: withCover
        ? `${OPENLIBRARY_COVER_URL}/${withCover.cover_i}-M.jpg`
        : null,
    };
    cache.set(key, enrichment);
    return enrichment;
  } catch {
    // Degradation silencieuse exigee : OpenLibrary indisponible = pas d'enrichissement.
    return null;
  } finally {
    clearTimeout(timer);
  }
}
