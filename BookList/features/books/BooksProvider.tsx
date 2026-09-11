import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Book, BookFilters, PaginatedBooks } from "../../domain/book";
import { AppError, isAppError } from "../../domain/error";
import { authService } from "../../services/auth/authService";
import { booksList } from "./booksList";
import {
  getCachedBook,
  getCachedBooks,
  replaceCachedBooks,
  subscribeBooksCache,
  upsertCachedBook,
} from "./booksCache";
import { toggleBookFavori } from "./bookFlagToggle";

export type BookListFilters = Pick<
  BookFilters,
  "q" | "status" | "favori" | "sort" | "order"
>;

const toAppError = (err: unknown): AppError =>
  isAppError(err)
    ? err
    : { type: "NETWORK", message: "Unexpected error", cause: err };

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
  filters: BookListFilters;
  setFilters: (patch: Partial<BookListFilters>) => void;
  fetchNextPage: () => Promise<void>;
  refresh: () => Promise<void>;
  setScrollOffset: (offset: number) => void;
  addBookToList: (newBook: Book) => void;
  updateBookInList: (updatedBook: Book) => void;
  toggleFavorite: (id: string) => void;
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
  const [filters, setFiltersState] = useState<BookListFilters>({});

  const filtersRef = useRef<BookListFilters>({});
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

  const setFilters = useCallback((patch: Partial<BookListFilters>) => {
    setScrollOffsetState(0);
    setLoading(true);
    setError(null);
    setFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyPage = useCallback((response: PaginatedBooks, append: boolean) => {
    if (append) {
      setBooks((prev) => {
        const ids = new Set(prev.map((b) => b.id));
        return [...prev, ...response.items.filter((b) => !ids.has(b.id))];
      });
      response.items.forEach(upsertCachedBook);
    } else {
      replaceCachedBooks(response.items);
      setBooks(response.items);
    }
    setPage(response.page);
    setTotalPages(response.totalPages);
    setTotal(response.total);
    setHasMore(response.page < response.totalPages);
  }, []);

  useEffect(() => {
    return subscribeBooksCache(() => {
      const cached = getCachedBooks();
      if (!cached) return;
      setBooks((prev) =>
        prev.map((b) => cached.find((c) => c.id === b.id) ?? b),
      );
    });
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadBooks = async () => {
      if (authService.getStatus() !== "authenticated") {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await booksList.getBooks({
          page: 1,
          limit: DEFAULT_LIMIT,
        });
        if (ignore) return;
        applyPage(response, false);
      } catch (err) {
        if (ignore) return;
        setError(toAppError(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const unsubscribe = authService.subscribe((status) => {
      if (status === "authenticated") {
        void loadBooks();
      } else if (status === "unauthenticated") {
        setBooks([]);
        replaceCachedBooks([]);
      }
    });

    void loadBooks();

    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [applyPage]);

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
      const response = await booksList.getBooks({
        page: pageRef.current + 1,
        limit: DEFAULT_LIMIT,
        ...filtersRef.current,
      });
      applyPage(response, true);
    } catch (err) {
      setError(toAppError(err));
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [applyPage]);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    setError(null);
    try {
      const response = await booksList.getBooks({
        page: 1,
        limit: DEFAULT_LIMIT,
        ...filtersRef.current,
      });
      applyPage(response, false);
    } catch (err) {
      setError(toAppError(err));
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [applyPage]);

  const addBookToList = useCallback((newBook: Book) => {
    setBooks((prev) => [newBook, ...prev.filter((b) => b.id !== newBook.id)]);
    setTotal((prev) => prev + 1);
    upsertCachedBook(newBook);
  }, []);

  const updateBookInList = useCallback((updatedBook: Book) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)),
    );
    upsertCachedBook(updatedBook);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const current = getCachedBook(id);
    if (!current) return;
    toggleBookFavori(current);
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
        filters,
        setFilters,
        fetchNextPage,
        refresh,
        setScrollOffset,
        addBookToList,
        updateBookInList,
        toggleFavorite,
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
