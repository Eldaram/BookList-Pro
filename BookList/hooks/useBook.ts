import { useCallback, useEffect, useState } from "react";
import { Book } from "../domain/book";
import { AppError, isAppError } from "../domain/error";
import { booksList } from "../features/books/booksList";
import {
  getCachedBook,
  patchCachedBook,
  subscribeBooksCache,
  upsertCachedBook,
} from "../features/books/booksCache";

export function useBook(id: string | undefined) {
  const [book, setBook] = useState<Book | null>(() =>
    id ? getCachedBook(id) : null,
  );
  const [loading, setLoading] = useState(() => (id ? getCachedBook(id) === null : true));
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (!id) return;

    return subscribeBooksCache(() => {
      setBook(getCachedBook(id));
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchBook = async () => {
      try {
        const freshBook = await booksList.getBookById(id);
        upsertCachedBook(freshBook);
        setError(null);
      } catch (err) {
        setError(
          isAppError(err)
            ? err
            : { type: "NETWORK", message: "Unexpected error", cause: err },
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  // Bascule optimiste : l'icone change instantanement, retour arriere si
  // l'API refuse la mutation.
  const toggleFavorite = useCallback(() => {
    if (!book) return;
    const previousFavori = book.favori;
    const nextFavori = !previousFavori;

    patchCachedBook(book.id, { favori: nextFavori });

    booksList
      .patchBook(book.id, { favori: nextFavori })
      .then((savedBook) => {
        upsertCachedBook(savedBook);
      })
      .catch(() => {
        patchCachedBook(book.id, { favori: previousFavori });
      });
  }, [book]);

  return { book, loading, error, toggleFavorite };
}
