import { bookServiceImpl } from "../../../services/servicesImpl/bookServiceImpl";
import { booksApi } from "../../../services/api/booksApi";

jest.mock("../../../services/api/booksApi");

describe("BookServiceImpl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("délègue getBooks à booksApi", async () => {
    const mockPaginated = {
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    };
    (booksApi.getBooks as jest.Mock).mockResolvedValue(mockPaginated);

    const result = await bookServiceImpl.getBooks({ page: 1, q: "Dune" });

    expect(booksApi.getBooks).toHaveBeenCalledWith(
      { page: 1, q: "Dune" },
      undefined,
    );
    expect(result).toEqual(mockPaginated);
  });
});
