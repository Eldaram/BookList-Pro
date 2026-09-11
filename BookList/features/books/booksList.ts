import { bookServiceImpl } from "../../services/servicesImpl/bookServiceImpl";
import { noteServiceImpl } from "../../services/servicesImpl/noteServiceImpl";
import { BookFilters, BookInput } from "../../domain/book";

export const booksList = {
  getBooks: async (filters?: BookFilters, signal?: AbortSignal) => {
    return await bookServiceImpl.getBooks(filters, signal);
  },
  getBookById: async (id: string) => {
    return await bookServiceImpl.getBookById(id);
  },
  createBook: async (input: BookInput) => {
    return await bookServiceImpl.createBook(input);
  },
  updateBook: async (
    id: string,
    input: BookInput,
    expectedVersion?: number,
  ) => {
    return await bookServiceImpl.updateBook(id, input, expectedVersion);
  },
  deleteBook: async (id: string) => {
    return await bookServiceImpl.deleteBook(id);
  },
  patchBook: async (id: string, patch: Partial<BookInput>) => {
    return await bookServiceImpl.patchBook(id, patch);
  },
  getNotes: async (bookId: string) => {
    return await noteServiceImpl.getNotes(bookId);
  },
  createNote: async (bookId: string, contenu: string) => {
    return await noteServiceImpl.createNote(bookId, contenu);
  },
  deleteNote: async (bookId: string, noteId: string) => {
    return await noteServiceImpl.deleteNote(bookId, noteId);
  },
};
