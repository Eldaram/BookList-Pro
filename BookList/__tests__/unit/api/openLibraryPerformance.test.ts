/**
 * Performance tests for the OpenLibrary cover pipeline: the list can request
 * ~20 covers at once, so the API layer must space, dedupe and cache calls to
 * avoid OpenLibrary's per-IP rate limiting (observed as CORS-less blocks).
 */

const MIN_INTERVAL_MS = 700;
const CACHE_KEY = "BOOKLIST_OPENLIBRARY_CACHE";

const globalFetch = global.fetch;

const okResponse = (coverId: number) => ({
  ok: true,
  json: async () => ({
    numFound: 3,
    docs: [{ cover_i: coverId, first_publish_year: 1970 }],
  }),
});

// Module state (throttle slot, caches) is reset between tests via resetModules.
async function loadApi() {
  return import("../../../services/api/openLibraryApi");
}
async function loadStorage() {
  return import("../../../services/secureStorage");
}

describe("OpenLibrary covers performance", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    global.fetch = globalFetch;
  });

  it("spaces two network calls by at least 700 ms (no burst)", async () => {
    const fetchMock = jest.fn().mockResolvedValue(okResponse(1));
    global.fetch = fetchMock as unknown as typeof fetch;
    const { searchByTitle } = await loadApi();

    const first = searchByTitle("titre un");
    const second = searchByTitle("titre deux");

    await jest.advanceTimersByTimeAsync(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // 1 ms before the slot opens, the second request must still be queued.
    await jest.advanceTimersByTimeAsync(MIN_INTERVAL_MS - 1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await Promise.all([first, second]);
  });

  it("dedupes concurrent requests for the same title into one call", async () => {
    const fetchMock = jest.fn().mockResolvedValue(okResponse(2));
    global.fetch = fetchMock as unknown as typeof fetch;
    const { searchByTitle } = await loadApi();

    const results = Promise.all([
      searchByTitle("Dune"),
      searchByTitle("  dune "),
      searchByTitle("DUNE"),
    ]);
    await jest.advanceTimersByTimeAsync(0);

    const [a, b, c] = await results;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);
    expect(b).toEqual(c);
  });

  it("serves a resolved title from cache with zero network call", async () => {
    const fetchMock = jest.fn().mockResolvedValue(okResponse(3));
    global.fetch = fetchMock as unknown as typeof fetch;
    const { searchByTitle } = await loadApi();

    const first = searchByTitle("Fondation");
    await jest.advanceTimersByTimeAsync(0);
    await first;

    const again = await searchByTitle("Fondation");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(again?.coverUrl).toContain("3-M.jpg");
  });

  it("restores the persisted cache: a reload issues zero request", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    // Simulates the state left by a previous session in storage.
    const { secureStorage } = await loadStorage();
    await secureStorage.setSecureItem(
      CACHE_KEY,
      JSON.stringify({
        hyperion: {
          editionCount: 12,
          firstPublishYear: 1989,
          coverUrl: "https://covers.openlibrary.org/b/id/99-M.jpg",
        },
      }),
    );

    const { searchByTitle } = await loadApi();
    const result = searchByTitle("Hyperion");
    await jest.advanceTimersByTimeAsync(0);

    expect(await result).toEqual({
      editionCount: 12,
      firstPublishYear: 1989,
      coverUrl: "https://covers.openlibrary.org/b/id/99-M.jpg",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not retry a failed title during the failure TTL", async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error("network down"));
    global.fetch = fetchMock as unknown as typeof fetch;
    const { searchByTitle } = await loadApi();

    const first = searchByTitle("Solaris");
    await jest.advanceTimersByTimeAsync(0);
    expect(await first).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Immediate retry (list cell remount): silently served from failure cache.
    const second = searchByTitle("Solaris");
    await jest.advanceTimersByTimeAsync(0);
    expect(await second).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
