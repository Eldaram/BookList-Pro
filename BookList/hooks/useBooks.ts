import { useEffect, useContext, useState } from "react";
import { Book } from "../domain/book";
import { AppError, isAppError } from "../domain/error";
import {
  BooksContext,
  BooksContextValue,
} from "../features/books/BooksProvider";
import { booksList } from "../features/books/booksList";

export function useBooks(): BooksContextValue {
  const context = useContext(BooksContext);

  // Fallback state if used outside BooksProvider (e.g. isolated legacy unit tests)
  const [localBooks, setLocalBooks] = useState<Book[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<AppError | null>(null);

  useEffect(() => {
    if (context) return;
    let isMounted = true;
    const fetchBooks = async () => {
      try {
        const response = await booksList.getBooks();
        if (isMounted) {
          setLocalBooks(response.items);
        }
      } catch (err) {
        if (isMounted) {
          setLocalError(
            isAppError(err)
              ? err
              : { type: "NETWORK", message: "Unexpected error", cause: err },
          );
        }
      } finally {
        if (isMounted) {
          setLocalLoading(false);
        }
      }
    };
    fetchBooks();
    return () => {
      isMounted = false;
    };
  }, [context]);

  if (context) {
    return context;
  }

  return {
    books: localBooks,
    page: 1,
    totalPages: 1,
    total: localBooks.length,
    hasMore: false,
    loading: localLoading,
    loadingMore: false,
    refreshing: false,
    error: localError,
    scrollOffset: 0,
    fetchNextPage: async () => {},
    refresh: async () => {},
    setScrollOffset: () => {},
    addBookToList: () => {},
    updateBookInList: () => {},
  };
}
