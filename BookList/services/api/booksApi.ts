import { httpClient } from './httpClient';
import { bookSchema, paginatedBooksSchema } from './schemas';
import { Book, BookFilters, BookInput, PaginatedBooks } from '../../domain/book';

class BooksApi {
  async getBooks(filters: BookFilters = {}): Promise<PaginatedBooks> {
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.append('page', String(filters.page));
    if (filters.limit !== undefined) params.append('limit', String(filters.limit));
    if (filters.q) params.append('q', filters.q);
    if (filters.status) params.append('status', filters.status);
    if (filters.favori !== undefined) params.append('favori', String(filters.favori));
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);

    const queryString = params.toString();
    const endpoint = `/books${queryString ? `?${queryString}` : ''}`;

    return httpClient.request<PaginatedBooks>(endpoint, {
      method: 'GET',
      schema: paginatedBooksSchema,
    });
  }

  async getBookById(id: string): Promise<Book> {
    return httpClient.request<Book>(`/books/${id}`, {
      method: 'GET',
      schema: bookSchema,
    });
  }

  async createBook(input: BookInput): Promise<Book> {
    return httpClient.request<Book>('/books', {
      method: 'POST',
      body: input,
      schema: bookSchema,
    });
  }

  async updateBook(id: string, input: BookInput, expectedVersion?: number): Promise<Book> {
    const headers: Record<string, string> = {};
    if (expectedVersion !== undefined) {
      headers['If-Match'] = String(expectedVersion);
    }

    return httpClient.request<Book>(`/books/${id}`, {
      method: 'PUT',
      headers,
      body: input,
      schema: bookSchema,
    });
  }

  async patchBook(id: string, patch: Partial<BookInput>): Promise<Book> {
    return httpClient.request<Book>(`/books/${id}`, {
      method: 'PATCH',
      body: patch,
      schema: bookSchema,
    });
  }

  async deleteBook(id: string): Promise<void> {
    return httpClient.request<void>(`/books/${id}`, {
      method: 'DELETE',
    });
  }
}

export const booksApi = new BooksApi();
