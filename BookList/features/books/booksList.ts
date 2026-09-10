import { bookServiceImpl } from "../../services/servicesImpl/bookServiceImpl";
import { BookInput } from "../../domain/book";

export const booksList = {
  getBooks: async () => {
    return await bookServiceImpl.getBooks();
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
    return await bookRepository.patchBook(id, patch);
  },
};
