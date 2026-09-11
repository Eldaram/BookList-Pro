import { booksApi } from "../../../services/api/booksApi";
import { httpClient } from "../../../services/api/httpClient";

jest.mock("../../../services/api/httpClient", () => ({
  httpClient: { request: jest.fn() },
}));

describe("booksApi", () => {
  const emptyPage = { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };

  beforeEach(() => {
    jest.clearAllMocks();
    (httpClient.request as jest.Mock).mockResolvedValue(emptyPage);
  });

  it("sends search, filters, sort and pagination in the query string", async () => {
    await booksApi.getBooks({
      page: 2,
      limit: 20,
      q: "asimov",
      status: "nonlu",
      favori: true,
      sort: "note",
      order: "desc",
    });

    const endpoint = (httpClient.request as jest.Mock).mock.calls[0][0];
    const params = new URLSearchParams(endpoint.split("?")[1]);
    expect(params.get("page")).toBe("2");
    expect(params.get("limit")).toBe("20");
    expect(params.get("q")).toBe("asimov");
    expect(params.get("status")).toBe("nonlu");
    expect(params.get("favori")).toBe("true");
    expect(params.get("sort")).toBe("note");
    expect(params.get("order")).toBe("desc");
  });
});
