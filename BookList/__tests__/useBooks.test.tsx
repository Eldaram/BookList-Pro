import { booksList } from "../features/books/booksList";
import { bookRepository } from "../services/repository/bookRepository";

jest.mock("../services/repository/bookRepository");

describe("Books Pagination Feature Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should pass pagination filters to repository when getBooks is called with options", async () => {
    const mockPaginated = {
      items: [
        {
          id: "b1",
          titre: "Dune",
          auteur: "Frank Herbert",
          editeur: "Chilton Books",
          annee: 1965,
          lu: false,
          favori: true,
          note: 5,
          couverture: null,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
          version: 1,
        },
      ],
      page: 2,
      limit: 10,
      total: 15,
      totalPages: 2,
    };

    (bookRepository.getBooks as jest.Mock).mockResolvedValue(mockPaginated);

    const result = await booksList.getBooks({ page: 2, limit: 10 });

    expect(bookRepository.getBooks).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
    });
    expect(result).toEqual(mockPaginated);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
  });
});
