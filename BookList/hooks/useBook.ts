import { useCallback, useEffect, useState } from "react";
import { Book } from "../domain/book";
import { AppError, isAppError } from "../domain/error";
import { booksList } from "../features/books/booksList";
import {
  getCachedBook,
  subscribeBooksCache,
  upsertCachedBook,
} from "../features/books/booksCache";
import {
  toggleBookFavori,
  toggleBookLu,
} from "../features/books/bookFlagToggle";

export function useBook(id: string | undefined) {
  const [book, setBook] = useState<Book | null>(() =>
    id ? getCachedBook(id) : null,
  );
  const [loading, setLoading] = useState(() =>
    id ? getCachedBook(id) === null : true,
  );
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

  const toggleFavorite = useCallback(() => {
    if (!book) return;
    toggleBookFavori(book);
  }, [book]);

  const toggleRead = useCallback(() => {
    if (!book) return;
    toggleBookLu(book);
  }, [book]);

  return { book, loading, error, toggleFavorite, toggleRead };
}
