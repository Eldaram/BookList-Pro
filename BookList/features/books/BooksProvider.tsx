import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Book } from "../../domain/book";
import { AppError, isAppError } from "../../domain/error";
import { authService } from "../../services/auth/authService";
import { booksList } from "./booksList";

export interface BooksContextValue {
  books: Book[];
  page: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: AppError | null;
  scrollOffset: number;
  fetchNextPage: () => Promise<void>;
  refresh: () => Promise<void>;
  setScrollOffset: (offset: number) => void;
  addBookToList: (newBook: Book) => void;
  updateBookInList: (updatedBook: Book) => void;
}

const DEFAULT_LIMIT = 20;

export const BooksContext = createContext<BooksContextValue | undefined>(
  undefined,
);

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  const [scrollOffset, setScrollOffsetState] = useState<number>(0);

  // Sync state to refs for stable async callbacks
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);
  const loadingMoreRef = useRef(loadingMore);
  const refreshingRef = useRef(refreshing);

  useEffect(() => {
    pageRef.current = page;
    hasMoreRef.current = hasMore;
    loadingRef.current = loading;
    loadingMoreRef.current = loadingMore;
    refreshingRef.current = refreshing;
  }, [page, hasMore, loading, loadingMore, refreshing]);

  const setScrollOffset = useCallback((offset: number) => {
    setScrollOffsetState(offset);
  }, []);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      setError(null);
      try {
        await authService.ensureAuthenticated();
        const response = await booksList.getBooks({
          page: 1,
          limit: DEFAULT_LIMIT,
        });
        if (ignore) return;
        setBooks(response.items);
        setPage(response.page);
        setTotalPages(response.totalPages);
        setTotal(response.total);
        setHasMore(response.page < response.totalPages);
      } catch (err) {
        if (ignore) return;
        setError(
          isAppError(err)
            ? err
            : { type: "NETWORK", message: "Unexpected error", cause: err },
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    void init();
    return () => {
      ignore = true;
    };
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (
      loadingRef.current ||
      loadingMoreRef.current ||
      refreshingRef.current ||
      !hasMoreRef.current
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = pageRef.current + 1;
      const response = await booksList.getBooks({
        page: nextPage,
        limit: DEFAULT_LIMIT,
      });

      setBooks((prevBooks) => {
        const existingIds = new Set(prevBooks.map((b) => b.id));
        const newItems = response.items.filter((b) => !existingIds.has(b.id));
        return [...prevBooks, ...newItems];
      });

      setPage(response.page);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setHasMore(response.page < response.totalPages);
    } catch (err) {
      setError(
        isAppError(err)
          ? err
          : { type: "NETWORK", message: "Unexpected error", cause: err },
      );
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) {
      return;
    }
    refreshingRef.current = true;
    setRefreshing(true);
    setError(null);
    try {
      const response = await booksList.getBooks({
        page: 1,
        limit: DEFAULT_LIMIT,
      });
      setBooks(response.items);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setHasMore(response.page < response.totalPages);
    } catch (err) {
      setError(
        isAppError(err)
          ? err
          : { type: "NETWORK", message: "Unexpected error", cause: err },
      );
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, []);

  const addBookToList = useCallback((newBook: Book) => {
    setBooks((prev) => [newBook, ...prev.filter((b) => b.id !== newBook.id)]);
    setTotal((prev) => prev + 1);
  }, []);

  const updateBookInList = useCallback((updatedBook: Book) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)),
    );
  }, []);

  return (
    <BooksContext.Provider
      value={{
        books,
        page,
        totalPages,
        total,
        hasMore,
        loading,
        loadingMore,
        refreshing,
        error,
        scrollOffset,
        fetchNextPage,
        refresh,
        setScrollOffset,
        addBookToList,
        updateBookInList,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export function useBooksContext() {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error("useBooksContext must be used within a BooksProvider");
  }
  return context;
}
