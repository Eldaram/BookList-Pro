import {
  toggleBookFavori,
  toggleBookLu,
} from "../../../features/books/bookFlagToggle";
import {
  getCachedBook,
  replaceCachedBooks,
} from "../../../features/books/booksCache";
import { booksApi } from "../../../services/api/booksApi";
import { Book } from "../../../domain/book";

jest.mock("../../../services/api/booksApi");

const makeBook = (overrides: Partial<Book> = {}): Book => ({
  id: "uuid-1",
  titre: "Dune",
  auteur: "Frank Herbert",
  editeur: "Laffont",
  annee: 1965,
  lu: false,
  favori: false,
  note: null,
  couverture: null,
  createdAt: "2026-09-09T00:00:00Z",
  updatedAt: "2026-09-09T00:00:00Z",
  version: 1,
  ...overrides,
});

// Renvoie une promesse controlable pour observer l'etat optimiste
// avant la reponse de l'API.
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("Favorite / read toggles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    replaceCachedBooks([makeBook()]);
  });

  it("favorite: partial PATCH + optimistic cache update", async () => {
    const book = makeBook();
    const pending = deferred<Book>();
    (booksApi.patchBook as jest.Mock).mockReturnValue(pending.promise);

    const toggling = toggleBookFavori(book);

    // L'icone doit changer instantanement : le cache est deja a jour.
    expect(getCachedBook("uuid-1")?.favori).toBe(true);

    pending.resolve({ ...book, favori: true, version: 2 });
    await toggling;

    expect(booksApi.patchBook).toHaveBeenCalledWith("uuid-1", {
      favori: true,
    });
  });

  it("read: rolls back the optimistic update when the API rejects", async () => {
    const book = makeBook();
    (booksApi.patchBook as jest.Mock).mockRejectedValue({
      type: "NETWORK",
      message: "API indisponible",
    });

    await toggleBookLu(book);

    expect(getCachedBook("uuid-1")?.lu).toBe(false);
  });
});
