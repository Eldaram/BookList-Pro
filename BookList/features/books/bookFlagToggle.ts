import { Book } from "../../domain/book";
import { booksList } from "./booksList";
import { patchCachedBook, upsertCachedBook } from "./booksCache";

/**
 * Performs an optimistic toggle of a book flag ('favori' or 'lu').
 * Updates the in-memory cache immediately for a responsive UI,
 * sends a partial PATCH to the API, and rolls back if rejected.
 */
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
