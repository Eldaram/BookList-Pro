import { bookRepository } from '../../services/repository/bookRepository';

export const booksList = {
  getBooks: async () => {
    return await bookRepository.getBooks();
  },
};

