/**
 * Core Book entity representing a catalogued publication.
 */
export type Book = {
  id: string;
  titre: string;
  auteur: string;
  editeur: string;
  annee: number;
  lu: boolean;
  favori: boolean;
  note: number | null;
  couverture: string | null;
  createdAt: string;
  updatedAt: string;
  /** Version number used for optimistic locking and conflict detection */
  version: number;
};

/**
 * Reading note associated with a specific book.
 */
export type BookNote = {
  id: string;
  livreId: string;
  contenu: string;
  createdAt: string;
};

/**
 * Paginated envelope returned by list queries.
 */
export type PaginatedBooks = {
  items: Book[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/**
 * Payload data for creating or updating a book.
 */
export type BookInput = {
  titre: string;
  auteur: string;
  editeur: string;
  annee: number;
  lu?: boolean;
  favori?: boolean;
  note?: number | null;
  couverture?: string | null;
};

/**
 * Supported sorting fields for book list queries.
 */
export const BOOK_SORT_FIELDS = [
  "titre",
  "auteur",
  "annee",
  "note",
  "updatedAt",
] as const;

export type BookSortField = (typeof BOOK_SORT_FIELDS)[number];

/**
 * Query criteria and filters for fetching books.
 */
export type BookFilters = {
  page?: number;
  limit?: number;
  q?: string;
  status?: "lu" | "nonlu";
  favori?: boolean;
  sort?: BookSortField;
  order?: "asc" | "desc";
};
