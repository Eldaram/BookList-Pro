import { bookServiceImpl } from "../../services/servicesImpl/bookServiceImpl";
import { noteServiceImpl } from "../../services/servicesImpl/noteServiceImpl";
import { BookFilters, BookInput } from "../../domain/book";

export const booksList = {
  getBooks: (filters?: BookFilters, signal?: AbortSignal) =>
    bookServiceImpl.getBooks(filters, signal),
  getBookById: (id: string) => bookServiceImpl.getBookById(id),
  createBook: (input: BookInput) => bookServiceImpl.createBook(input),
  updateBook: (id: string, input: BookInput, expectedVersion?: number) =>
    bookServiceImpl.updateBook(id, input, expectedVersion),
  deleteBook: (id: string) => bookServiceImpl.deleteBook(id),
  patchBook: (id: string, patch: Partial<BookInput>) =>
    bookServiceImpl.patchBook(id, patch),
  getNotes: (bookId: string) => noteServiceImpl.getNotes(bookId),
  createNote: (bookId: string, contenu: string) =>
    noteServiceImpl.createNote(bookId, contenu),
  deleteNote: (bookId: string, noteId: string) =>
    noteServiceImpl.deleteNote(bookId, noteId),
};
