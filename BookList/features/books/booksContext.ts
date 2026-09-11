import { createContext, useContext } from "react";
import { Book, BookFilters } from "../../domain/book";
import { AppError, isAppError } from "../../domain/error";

export type BookListFilters = Pick<
  BookFilters,
  "q" | "status" | "favori" | "sort" | "order"
>;

export const toAppError = (err: unknown): AppError =>
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

export const DEFAULT_LIMIT = 20;

export const BooksContext = createContext<BooksContextValue | undefined>(
  undefined,
);

export function useBooksContext() {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error("useBooksContext must be used within a BooksProvider");
  }
  return context;
}
