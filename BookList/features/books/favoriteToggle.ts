import { Book } from "../../domain/book";
import { booksList } from "./booksList";
import { patchCachedBook, upsertCachedBook } from "./booksCache";

// Bascule optimiste : le cache change instantanement (liste et fiche via les
// abonnes), puis PATCH partiel vers l'API ; retour arriere si elle refuse.
export async function toggleBookFavori(book: Book): Promise<void> {
  const previousFavori = book.favori;
  const nextFavori = !previousFavori;

  patchCachedBook(book.id, { favori: nextFavori });

  try {
    const savedBook = await booksList.patchBook(book.id, {
      favori: nextFavori,
    });
    upsertCachedBook(savedBook);
  } catch {
    patchCachedBook(book.id, { favori: previousFavori });
  }
}
