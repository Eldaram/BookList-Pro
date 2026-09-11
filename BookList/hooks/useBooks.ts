import { useCallback, useContext, useEffect, useState } from "react";
import { Book } from "../domain/book";
import { AppError, toAppError } from "../domain/error";
import {
  BooksContext,
  BooksContextValue,
} from "../features/books/BooksProvider";
import { booksList } from "../features/books/booksList";
import {
  getCachedBook,
  getCachedBooks,
  replaceCachedBooks,
  subscribeBooksCache,
} from "../features/books/booksCache";
import { toggleBookFavori } from "../features/books/bookFlagToggle";

export function useBooks(): BooksContextValue {
  const context = useContext(BooksContext);

  // Fallback state if used outside BooksProvider (e.g. isolated legacy unit tests)
  const [localBooks, setLocalBooks] = useState<Book[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<AppError | null>(null);

  // Fallback syncs with the cache so optimistic toggles propagate
  useEffect(() => {
    if (context) return;
    return subscribeBooksCache(() => {
      setLocalBooks(getCachedBooks() ?? []);
    });
  }, [context]);

  useEffect(() => {
    if (context) return;
    let isMounted = true;
    const fetchBooks = async () => {
      try {
        const response = await booksList.getBooks();
        replaceCachedBooks(response.items);
        if (isMounted) {
          setLocalBooks(response.items);
        }
      } catch (err) {
        if (isMounted) {
          setLocalError(toAppError(err));
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

  const toggleFavorite = useCallback(
    (id: string) => {
      const current = getCachedBook(id) ?? localBooks.find((b) => b.id === id);
      if (!current) return;
      toggleBookFavori(current);
    },
    [localBooks],
  );

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
    filters: {},
    setFilters: () => {},
    fetchNextPage: async () => {},
    refresh: async () => {},
    setScrollOffset: () => {},
    addBookToList: () => {},
    updateBookInList: () => {},
    toggleFavorite,
  };
}
