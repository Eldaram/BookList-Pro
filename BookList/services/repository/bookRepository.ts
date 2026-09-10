import { booksApi } from '../api/booksApi';
import { Book, BookFilters, BookInput, PaginatedBooks } from '../../domain/book';

/**
 * Repository encapsulating booksApi and domain data access.
 * Serves as the single point of contact for the application when performing book operations.
 * Designed to support offline mutation queuing, caching, and persistence.
 */
class BookRepository {
  async getBooks(filters: BookFilters = {}): Promise<PaginatedBooks> {
    return booksApi.getBooks(filters);
  }

  async getBookById(id: string): Promise<Book> {
    return booksApi.getBookById(id);
  }

  async createBook(input: BookInput): Promise<Book> {
    return booksApi.createBook(input);
  }

  async updateBook(id: string, input: BookInput, expectedVersion?: number): Promise<Book> {
    return booksApi.updateBook(id, input, expectedVersion);
  }

  async patchBook(id: string, patch: Partial<BookInput>): Promise<Book> {
    return booksApi.patchBook(id, patch);
  }

  async deleteBook(id: string): Promise<void> {
    return booksApi.deleteBook(id);
  }
}

export const bookRepository = new BookRepository();
