import { booksApi } from "../services/api/booksApi";
import { httpClient } from "../services/api/httpClient";

jest.mock("../services/api/httpClient", () => ({
  httpClient: { request: jest.fn() },
}));

describe("booksApi", () => {
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

  it("sanitizes null couverture to undefined on createBook", async () => {
    (httpClient.request as jest.Mock).mockResolvedValue({ id: "1" });

    const input = {
      titre: "Test",
      auteur: "Author",
      editeur: "Pub",
      annee: 2026,
      couverture: null,
    };

    await booksApi.createBook(input);

    expect(httpClient.request).toHaveBeenCalledWith("/books", {
      method: "POST",
      body: {
        titre: "Test",
        auteur: "Author",
        editeur: "Pub",
        annee: 2026,
        couverture: undefined,
      },
      schema: expect.anything(),
    });
  });

  it("sanitizes null couverture to empty string on updateBook", async () => {
    (httpClient.request as jest.Mock).mockResolvedValue({ id: "1" });

    const input = {
      titre: "Test",
      auteur: "Author",
      editeur: "Pub",
      annee: 2026,
      couverture: null,
    };

    await booksApi.updateBook("1", input, 1);

    expect(httpClient.request).toHaveBeenCalledWith("/books/1", {
      method: "PUT",
      headers: { "If-Match": "1" },
      body: {
        titre: "Test",
        auteur: "Author",
        editeur: "Pub",
        annee: 2026,
        couverture: "",
      },
      schema: expect.anything(),
    });
  });
});
