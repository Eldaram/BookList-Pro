import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Book } from "../domain/book";
import { AppError, toAppError } from "../domain/error";
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
      setBook(getCachedBook(id) ?? null);
    });
  }, [id]);

  const fetchBook = useCallback(async () => {
    if (!id) return;
    try {
      const freshBook = await booksList.getBookById(id);
      upsertCachedBook(freshBook);
      setBook(freshBook);
      setError(null);
    } catch (err) {
      setError(toAppError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void fetchBook();
    }, [fetchBook]),
  );

  const toggleFavorite = useCallback(() => {
    if (!book) return;
    toggleBookFavori(book);
  }, [book]);

  const toggleRead = useCallback(() => {
    if (!book) return;
    toggleBookLu(book);
  }, [book]);

  return {
    book,
    loading,
    error,
    refetch: fetchBook,
    toggleFavorite,
    toggleRead,
  };
}
