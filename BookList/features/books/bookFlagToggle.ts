import { Book } from "../../domain/book";
import { booksList } from "./booksList";
import { patchCachedBook, upsertCachedBook } from "./booksCache";

// Bascule optimiste : le cache change instantanement (liste et fiche via les
// abonnes), puis PATCH partiel vers l'API ; retour arriere si elle refuse.
async function toggleBookFlag(
  book: Book,
  field: "favori" | "lu",
): Promise<void> {
  const previous = book[field];
  const next = !previous;

  patchCachedBook(book.id, { [field]: next });

  try {
    const savedBook = await booksList.patchBook(book.id, { [field]: next });
    upsertCachedBook(savedBook);
  } catch {
    patchCachedBook(book.id, { [field]: previous });
  }
}

export const toggleBookFavori = (book: Book): Promise<void> =>
  toggleBookFlag(book, "favori");

export const toggleBookLu = (book: Book): Promise<void> =>
  toggleBookFlag(book, "lu");
