import { bookServiceImpl } from "../services/servicesImpl/bookServiceImpl";
import { booksApi } from "../services/api/booksApi";

jest.mock("../services/api/booksApi");

describe("BookServiceImpl Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delegate getBooks request to booksApi", async () => {
    const mockPaginated = {
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    };
    (booksApi.getBooks as jest.Mock).mockResolvedValue(mockPaginated);

    const result = await bookServiceImpl.getBooks({ page: 1, q: "Dune" });

    expect(booksApi.getBooks).toHaveBeenCalledWith({ page: 1, q: "Dune" });
    expect(result).toEqual(mockPaginated);
  });

  it("should delegate createBook request to booksApi", async () => {
    const mockBook = {
      id: "uuid-1",
      titre: "Le Seigneur des Anneaux",
      auteur: "J.R.R. Tolkien",
      editeur: "Bourgois",
      annee: 1954,
      lu: true,
      favori: true,
      note: 5,
      couverture: null,
      createdAt: "2026-09-09T00:00:00Z",
      updatedAt: "2026-09-09T00:00:00Z",
      version: 1,
    };

    (booksApi.createBook as jest.Mock).mockResolvedValue(mockBook);

    const input = {
      titre: "Le Seigneur des Anneaux",
      auteur: "J.R.R. Tolkien",
      editeur: "Bourgois",
      annee: 1954,
    };

    const result = await bookServiceImpl.createBook(input);

    expect(booksApi.createBook).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockBook);
  });

  it("should delegate updateBook request to booksApi with the expected version", async () => {
    const mockBook = {
      id: "uuid-1",
      titre: "Dune",
      auteur: "Frank Herbert",
      editeur: "Robert Laffont",
      annee: 1965,
      lu: false,
      favori: false,
      note: null,
      couverture: null,
      createdAt: "2026-09-09T00:00:00Z",
      updatedAt: "2026-09-10T00:00:00Z",
      version: 2,
    };
    (booksApi.updateBook as jest.Mock).mockResolvedValue(mockBook);

    const input = {
      titre: "Dune",
      auteur: "Frank Herbert",
      editeur: "Robert Laffont",
      annee: 1965,
    };

    const result = await bookServiceImpl.updateBook("uuid-1", input, 1);

    expect(booksApi.updateBook).toHaveBeenCalledWith("uuid-1", input, 1);
    expect(result).toEqual(mockBook);
  });

  it("should delegate deleteBook request to booksApi", async () => {
    (booksApi.deleteBook as jest.Mock).mockResolvedValue(undefined);

    await bookServiceImpl.deleteBook("uuid-1");

    expect(booksApi.deleteBook).toHaveBeenCalledWith("uuid-1");
  });
});
