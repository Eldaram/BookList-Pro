import { useCallback, useEffect, useState } from "react";
import { Book } from "../domain/book";
import { AppError, isAppError } from "../domain/error";
import { booksList } from "../features/books/booksList";
import {
  getCachedBook,
  getCachedBooks,
  replaceCachedBooks,
  subscribeBooksCache,
} from "../features/books/booksCache";
import { toggleBookFavori } from "../features/books/favoriteToggle";
//Ajoute la couverture des livres dans le hook useBooks

export function useBooks() {
  const [books, setBooks] = useState<Book[]>(() => getCachedBooks() ?? []);
  const [loading, setLoading] = useState(() => getCachedBooks() === null);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    return subscribeBooksCache(() => {
      setBooks(getCachedBooks() ?? []);
    });
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await booksList.getBooks();
        replaceCachedBooks(response.items);
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
    fetchBooks();
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const current = getCachedBook(id) ?? books.find((b) => b.id === id);
      if (!current) return;
      toggleBookFavori(current);
    },
    [books],
  );

  return { books, loading, error, toggleFavorite };
}
