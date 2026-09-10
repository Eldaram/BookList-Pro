import {
  toggleBookFavori,
  toggleBookLu,
} from "../features/books/bookFlagToggle";
import {
  getCachedBook,
  replaceCachedBooks,
  subscribeBooksCache,
} from "../features/books/booksCache";
import { booksApi } from "../services/api/booksApi";
import { Book } from "../domain/book";

jest.mock("../services/api/booksApi");

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
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("Favorite feature Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    replaceCachedBooks([makeBook()]);
  });

  it("should call the API with a partial PATCH { favori } as required by the API contract", async () => {
    const book = makeBook();
    (booksApi.patchBook as jest.Mock).mockResolvedValue({
      ...book,
      favori: true,
      version: 2,
    });

    await toggleBookFavori(book);

    expect(booksApi.patchBook).toHaveBeenCalledTimes(1);
    expect(booksApi.patchBook).toHaveBeenCalledWith("uuid-1", {
      favori: true,
    });
  });

  it("should optimistically toggle favori in the cache before the API responds", async () => {
    const book = makeBook();
    const pending = deferred<Book>();
    (booksApi.patchBook as jest.Mock).mockReturnValue(pending.promise);

    const toggling = toggleBookFavori(book);

    // L'icone doit changer instantanement : le cache est deja a jour.
    expect(getCachedBook("uuid-1")?.favori).toBe(true);

    pending.resolve({ ...book, favori: true, version: 2 });
    await toggling;
  });

  it("should keep the server response in the cache after a successful toggle", async () => {
    const book = makeBook();
    const savedBook: Book = {
      ...book,
      favori: true,
      version: 2,
      updatedAt: "2026-09-10T00:00:00Z",
    };
    (booksApi.patchBook as jest.Mock).mockResolvedValue(savedBook);

    await toggleBookFavori(book);

    expect(getCachedBook("uuid-1")).toEqual(savedBook);
  });

  it("should roll back the cache when the API rejects the mutation", async () => {
    const book = makeBook();
    (booksApi.patchBook as jest.Mock).mockRejectedValue({
      type: "NETWORK",
      message: "API indisponible",
    });

    await toggleBookFavori(book);

    expect(getCachedBook("uuid-1")?.favori).toBe(false);
  });

  it("should toggle back from favori=true to favori=false", async () => {
    const book = makeBook({ favori: true });
    replaceCachedBooks([book]);
    (booksApi.patchBook as jest.Mock).mockResolvedValue({
      ...book,
      favori: false,
      version: 2,
    });

    await toggleBookFavori(book);

    expect(booksApi.patchBook).toHaveBeenCalledWith("uuid-1", {
      favori: false,
    });
    expect(getCachedBook("uuid-1")?.favori).toBe(false);
  });

  it("should notify cache subscribers so list and detail screens stay in sync", async () => {
    const book = makeBook();
    (booksApi.patchBook as jest.Mock).mockResolvedValue({
      ...book,
      favori: true,
      version: 2,
    });

    const listener = jest.fn();
    const unsubscribe = subscribeBooksCache(listener);

    await toggleBookFavori(book);

    // 1 notification optimiste + 1 notification a la confirmation serveur.
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("should not touch other books in the cache", async () => {
    const book = makeBook();
    const otherBook = makeBook({ id: "uuid-2", titre: "Fondation" });
    replaceCachedBooks([book, otherBook]);
    (booksApi.patchBook as jest.Mock).mockResolvedValue({
      ...book,
      favori: true,
      version: 2,
    });

    await toggleBookFavori(book);

    expect(getCachedBook("uuid-2")).toEqual(otherBook);
  });
});

describe("Read status feature Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    replaceCachedBooks([makeBook()]);
  });

  it("should call the API with a partial PATCH { lu } as required by the API contract", async () => {
    const book = makeBook();
    (booksApi.patchBook as jest.Mock).mockResolvedValue({
      ...book,
      lu: true,
      version: 2,
    });

    await toggleBookLu(book);

    expect(booksApi.patchBook).toHaveBeenCalledTimes(1);
    expect(booksApi.patchBook).toHaveBeenCalledWith("uuid-1", { lu: true });
  });

  it("should optimistically toggle lu in the cache before the API responds", async () => {
    const book = makeBook();
    const pending = deferred<Book>();
    (booksApi.patchBook as jest.Mock).mockReturnValue(pending.promise);

    const toggling = toggleBookLu(book);

    // Le chip doit changer instantanement : le cache est deja a jour.
    expect(getCachedBook("uuid-1")?.lu).toBe(true);

    pending.resolve({ ...book, lu: true, version: 2 });
    await toggling;
  });

  it("should roll back the cache when the API rejects the mutation", async () => {
    const book = makeBook();
    (booksApi.patchBook as jest.Mock).mockRejectedValue({
      type: "NETWORK",
      message: "API indisponible",
    });

    await toggleBookLu(book);

    expect(getCachedBook("uuid-1")?.lu).toBe(false);
  });

  it("should toggle back from lu=true to lu=false", async () => {
    const book = makeBook({ lu: true });
    replaceCachedBooks([book]);
    (booksApi.patchBook as jest.Mock).mockResolvedValue({
      ...book,
      lu: false,
      version: 2,
    });

    await toggleBookLu(book);

    expect(booksApi.patchBook).toHaveBeenCalledWith("uuid-1", { lu: false });
    expect(getCachedBook("uuid-1")?.lu).toBe(false);
  });

  it("should not touch the favori flag when toggling lu", async () => {
    const book = makeBook({ favori: true });
    replaceCachedBooks([book]);
    (booksApi.patchBook as jest.Mock).mockResolvedValue({
      ...book,
      lu: true,
      version: 2,
    });

    await toggleBookLu(book);

    expect(booksApi.patchBook).toHaveBeenCalledWith("uuid-1", { lu: true });
    expect(getCachedBook("uuid-1")?.favori).toBe(true);
  });
});
