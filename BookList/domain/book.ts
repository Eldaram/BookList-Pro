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
  version: number;
};

export type PaginatedBooks = {
  items: Book[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

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

export type BookFilters = {
  page?: number;
  limit?: number;
  q?: string;
  status?: "lu" | "nonlu";
  favori?: boolean;
  sort?: "titre" | "auteur" | "annee" | "note" | "updatedAt";
  order?: "asc" | "desc";
};
