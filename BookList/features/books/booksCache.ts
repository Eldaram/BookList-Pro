import { Book } from "../../domain/book";

type Listener = () => void;

let cachedBooks: Book[] | null = null;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function subscribeBooksCache(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCachedBooks(): Book[] | null {
  return cachedBooks;
}

export function getCachedBook(id: string): Book | null {
  return cachedBooks?.find((book) => book.id === id) ?? null;
}

export function replaceCachedBooks(books: Book[]) {
  cachedBooks = books;
  notifyListeners();
}

export function upsertCachedBook(book: Book) {
  if (!cachedBooks) {
    cachedBooks = [book];
    notifyListeners();
    return;
  }

  const index = cachedBooks.findIndex((current) => current.id === book.id);
  if (index === -1) {
    cachedBooks = [...cachedBooks, book];
  } else {
    cachedBooks = cachedBooks.map((current) =>
      current.id === book.id ? book : current,
    );
  }
  notifyListeners();
}

export function patchCachedBook(id: string, patch: Partial<Book>): Book | null {
  if (!cachedBooks) return null;

  let previousBook: Book | null = null;
  cachedBooks = cachedBooks.map((book) => {
    if (book.id !== id) return book;
    previousBook = book;
    return { ...book, ...patch };
  });

  if (previousBook) {
    notifyListeners();
  }

  return previousBook;
}