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
