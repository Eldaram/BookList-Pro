import { searchByTitle } from "../../../services/api/openLibraryApi";

const globalFetch = global.fetch;

describe("Open Library enrichment", () => {
  afterAll(() => {
    global.fetch = globalFetch;
  });

  it("returns enrichment with the cover URL", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        numFound: 42,
        docs: [{ cover_i: 12345, first_publish_year: 1965 }],
      }),
    }) as unknown as typeof fetch;

    const enrichment = await searchByTitle("Dune");

    expect(enrichment).toEqual({
      editionCount: 42,
      firstPublishYear: 1965,
      coverUrl: "https://covers.openlibrary.org/b/id/12345-M.jpg",
    });
  });

  it("silently degrades to null when Open Library is unavailable", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    // Titre different du test precedent : le cache est par titre.
    const enrichment = await searchByTitle("Fondation");

    expect(enrichment).toBeNull();
  });
});
