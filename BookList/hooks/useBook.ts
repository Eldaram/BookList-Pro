import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Book } from "../domain/book";
import { AppError, isAppError } from "../domain/error";
import { booksList } from "../features/books/booksList";

export function useBook(id: string | undefined) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const fetchBook = useCallback(async () => {
    if (!id) return;
    try {
      const freshBook = await booksList.getBookById(id);
      setBook(freshBook);
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
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void fetchBook();
    }, [fetchBook]),
  );

  return { book, loading, error, refetch: fetchBook };
}

