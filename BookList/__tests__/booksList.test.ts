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

    expect(bookServiceImpl.updateBook).toHaveBeenCalledWith(
      "uuid-1",
      input,
      2,
    );
    expect(result).toEqual(mockBook);
  });
});
