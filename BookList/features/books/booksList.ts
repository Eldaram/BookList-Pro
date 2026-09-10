import { bookRepository } from "../../services/servicesImpl/bookServiceImpl";
import { BookInput } from "../../domain/book";

export const booksList = {
  getBooks: async () => {
    return await bookRepository.getBooks();
  },
  getBookById: async (id: string) => {
    return await bookRepository.getBookById(id);
  },
  createBook: async (input: BookInput) => {
    return await bookRepository.createBook(input);
  },
  updateBook: async (
    id: string,
    input: BookInput,
    expectedVersion?: number,
  ) => {
    return await bookRepository.updateBook(id, input, expectedVersion);
  },
  deleteBook: async (id: string) => {
    return await bookRepository.deleteBook(id);
  },
};
