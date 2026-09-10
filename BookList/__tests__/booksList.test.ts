import { booksList } from "../features/books/booksList";
import { bookServiceImpl } from "../services/servicesImpl/bookServiceImpl";

jest.mock("../services/servicesImpl/bookServiceImpl");

describe("booksList Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delegate deleteBook to bookServiceImpl", async () => {
    (bookServiceImpl.deleteBook as jest.Mock).mockResolvedValue(undefined);

    await booksList.deleteBook("uuid-1");

    expect(bookServiceImpl.deleteBook).toHaveBeenCalledWith("uuid-1");
  });

  it("should delegate updateBook to bookServiceImpl with the expected version", async () => {
    const mockBook = { id: "uuid-1", version: 3 };
    (bookServiceImpl.updateBook as jest.Mock).mockResolvedValue(mockBook);

    const input = {
      titre: "Fondation",
      auteur: "Isaac Asimov",
      editeur: "Denoël",
      annee: 1951,
    };

    const result = await booksList.updateBook("uuid-1", input, 2);

    expect(bookServiceImpl.updateBook).toHaveBeenCalledWith("uuid-1", input, 2);
    expect(result).toEqual(mockBook);
  });

  it("should delegate getBooks with search and filter params untouched", async () => {
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

  it("should forward the abort signal used to cancel the previous search", async () => {
    (bookServiceImpl.getBooks as jest.Mock).mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });

    const controller = new AbortController();
    await booksList.getBooks({ q: "dune" }, controller.signal);

    expect(bookServiceImpl.getBooks).toHaveBeenCalledWith(
      { q: "dune" },
      controller.signal,
    );
  });
});
