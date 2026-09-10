import { booksApi } from "../services/api/booksApi";
import { httpClient } from "../services/api/httpClient";

jest.mock("../services/api/httpClient", () => ({
  httpClient: { request: jest.fn() },
}));

describe("booksApi.deleteBook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends a DELETE request to /books/:id", async () => {
    (httpClient.request as jest.Mock).mockResolvedValue(undefined);

    await booksApi.deleteBook("uuid-1");

    expect(httpClient.request).toHaveBeenCalledWith("/books/uuid-1", {
      method: "DELETE",
    });
  });

  it("propagates errors thrown by the http client", async () => {
    const error = { type: "NETWORK", message: "offline" };
    (httpClient.request as jest.Mock).mockRejectedValue(error);

    await expect(booksApi.deleteBook("uuid-1")).rejects.toEqual(error);
  });
});

describe("booksApi.getBooks — recherche et filtres côté serveur", () => {
  const emptyPage = { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };

  beforeEach(() => {
    jest.clearAllMocks();
    (httpClient.request as jest.Mock).mockResolvedValue(emptyPage);
  });

  const calledEndpoint = (): string =>
    (httpClient.request as jest.Mock).mock.calls[0][0];

  it("requests /books without query string when no filter is set", async () => {
    await booksApi.getBooks();

    expect(calledEndpoint()).toBe("/books");
  });

  it("sends the search term q to the server", async () => {
    await booksApi.getBooks({ q: "tolkien" });

    expect(calledEndpoint()).toBe("/books?q=tolkien");
  });

  it("encodes special characters in the search term", async () => {
    await booksApi.getBooks({ q: "l'été & hiver" });

    const endpoint = calledEndpoint();
    expect(endpoint).toContain("q=l%27%C3%A9t%C3%A9+%26+hiver");
  });

  it("combines pagination, status, favori, sort and order in the query", async () => {
    await booksApi.getBooks({
      page: 2,
      limit: 20,
      q: "asimov",
      status: "nonlu",
      favori: true,
      sort: "note",
      order: "desc",
    });

    const params = new URLSearchParams(calledEndpoint().split("?")[1]);
    expect(params.get("page")).toBe("2");
    expect(params.get("limit")).toBe("20");
    expect(params.get("q")).toBe("asimov");
    expect(params.get("status")).toBe("nonlu");
    expect(params.get("favori")).toBe("true");
    expect(params.get("sort")).toBe("note");
    expect(params.get("order")).toBe("desc");
  });

  it("omits undefined filters instead of sending empty params", async () => {
    await booksApi.getBooks({ page: 1, q: undefined, favori: undefined });

    expect(calledEndpoint()).toBe("/books?page=1");
  });

  it("sends favori=false explicitly when filtering non-favorites", async () => {
    await booksApi.getBooks({ favori: false });

    expect(calledEndpoint()).toBe("/books?favori=false");
  });

  it("passes the abort signal to the http client", async () => {
    const controller = new AbortController();

    await booksApi.getBooks({ q: "dune" }, controller.signal);

    const options = (httpClient.request as jest.Mock).mock.calls[0][1];
    expect(options.signal).toBe(controller.signal);
  });
});
