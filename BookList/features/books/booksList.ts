import { bookRepository } from "../../services/repository/bookRepository";
import { BookFilters, BookInput } from "../../domain/book";

export const booksList = {
  getBooks: async (filters?: BookFilters) => {
    return await bookRepository.getBooks(filters);
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
};
