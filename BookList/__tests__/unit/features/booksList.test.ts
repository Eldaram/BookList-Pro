import { booksList } from "../../../features/books/booksList";
import { bookServiceImpl } from "../../../services/servicesImpl/bookServiceImpl";

jest.mock("../../../services/servicesImpl/bookServiceImpl");

describe("booksList (facade)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("forwards search filters to the service unchanged", async () => {
    const response = { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
    (bookServiceImpl.getBooks as jest.Mock).mockResolvedValue(response);

    const filters = {
      page: 2,
      limit: 20,
      q: "tolkien",
      status: "lu" as const,
      favori: true,
      sort: "annee" as const,
      order: "desc" as const,
    };

    const result = await booksList.getBooks(filters);

    expect(bookServiceImpl.getBooks).toHaveBeenCalledWith(filters, undefined);
    expect(result).toEqual(response);
  });
});
